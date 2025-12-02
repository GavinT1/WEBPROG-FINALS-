const User = require('../Models/user.model.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const API_URL = "http://localhost:3000/api/auth";

// Helper to generate token
const generateToken = (userId) => {
    return jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.register = async (req, res) => {
    try {
        // 1. Get all the new fields from the frontend
        const { 
            username, 
            firstName, 
            lastName, 
            email, 
            password, 
            address, 
            phoneNumber 
        } = req.body;

        // 2. Check if user exists (by Email OR Username)
        let user = await User.findOne({ 
            $or: [{ email: email }, { username: username }] 
        });

        if (user) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create new user
         user = new User({
          username,
          firstName,
        lastName,
          email,
          passwordHash: hashedPassword,
          phoneNumber,
   

      addresses: [{ 
        label: 'Home', 
        address: address, // The street address from the form
        city: 'City', // Placeholder since register form only has one field
        isDefault: true 
    }]
});

        await user.save();

        // 4. Generate Token & Return User Data immediately 
        // (This logs them in automatically after registering)
        const token = generateToken(user.id);

        res.status(201).json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error(error.message); 
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        // 1. Accept 'guestCart' from the frontend request
        const { email, password, guestCart } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // --- 2. CART MERGE LOGIC ---
        // If the user has a guest cart, merge it into the database cart
        if (guestCart && Array.isArray(guestCart) && guestCart.length > 0) {
            
            for (const guestItem of guestCart) {
                // Find if this product+variant already exists in the User's DB cart
                const existingItem = user.cart.find(dbItem => 
                    dbItem.product.toString() === guestItem.id && 
                    dbItem.variantId === (guestItem.variant || 'Standard')
                );

                if (existingItem) {
                    // If exists, just add the quantity
                    existingItem.quantity += guestItem.quantity;
                } else {
                    // If not, push the new item
                    user.cart.push({
                        product: guestItem.id,
                        variantId: guestItem.variant || 'Standard',
                        quantity: guestItem.quantity
                    });
                }
            }
            await user.save(); // Save the merged cart to MongoDB
        }
        // ---------------------------

        // ... (existing login logic above) ...

        // 1. POPULATE THE CART
        await user.populate({
            path: 'cart.product',
            model: 'Product'
        });

        const token = generateToken(user._id);

        // 2. FORMAT CART (Exactly like cart.controller.js)
        const formattedCart = user.cart.map(item => {
            if (!item.product) return null; // Skip if product deleted

            // Find the specific variant to get the correct price
            const variant = item.product.variants?.find(v => v._id.toString() === item.variantId);

            return {
                id: item.product._id,       // Product ID
                name: item.product.name,
                price: variant ? variant.price : item.product.price,
                imageUrl: item.product.imageUrl,
                variant: item.variantId,    // <--- CRITICAL for Deleting!
                quantity: item.quantity
            };
        }).filter(Boolean);

        // 3. SEND RESPONSE
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
                phoneNumber: user.phoneNumber,
                cart: formattedCart // <--- Send the clean, formatted cart
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- NEW FUNCTION: REQUIRED FOR FRONTEND PERSISTENCE ---
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- EXISTING PASSWORD FUNCTIONS ---

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'Link has been sent to your email!' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`; // Updated to point to Frontend port
        const message = `
          <h1>Reset Password has been requested</h1>
          <p>Please go to this link to reset your password:</p>
          <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
          <p>It will expire in 15 minutes.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            html: message
        });

        res.status(200).json({ message: 'Link has been sent to your email!' });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error.message); 
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
         resetPasswordToken: token, 
         resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.passwordHash = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        
        const user = await User.findById(req.user.id);

       
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Replace old list with new list from frontend
        user.addresses = req.body.addresses; 
        
        await user.save();
        
        res.status(200).json({ success: true, addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};