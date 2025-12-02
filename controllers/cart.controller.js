const User = require('../Models/user.model');
const Product = require('../Models/product.model');

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'cart.product',
            model: 'Product',
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // --- THE FIX: FORMAT DATA TO MATCH FRONTEND EXPECTATIONS ---
        const formattedCart = user.cart.map(item => {
            if (!item.product) return null; // Skip deleted products

            // Find price for the specific variant
            const variant = item.product.variants?.find(v => v._id.toString() === item.variantId);

            return {
                id: item.product._id,
                name: item.product.name,
                // If variant exists use its price, else use default product price
                price: variant ? variant.price : item.product.price,
                imageUrl: item.product.imageUrl,
                variant: item.variantId,
                quantity: item.quantity
            };
        }).filter(Boolean); // Remove nulls
        // -----------------------------------------------------------

        res.json(formattedCart);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Inside cart.controller.js

exports.addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.body;

        // 1. ATOMIC UPDATE (Fixes the Race Condition)
        // We try to find the item and increment ($inc) it directly in the database.
        // This prevents "lost clicks" when tapping fast.
        let user = await User.findOneAndUpdate(
            { 
                _id: req.user.id, 
                "cart.product": productId, 
                "cart.variantId": variantId 
            },
            { 
                $inc: { "cart.$.quantity": quantity } 
            },
            { new: true } // Return the updated document
        );

        // 2. IF ITEM DOES NOT EXIST, ADD IT
        if (!user) {
            // Check if product exists first
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            
            // Push new item
            user = await User.findByIdAndUpdate(
                req.user.id,
                { 
                    $push: { 
                        cart: { 
                            product: productId, 
                            variantId: variantId, 
                            quantity: quantity 
                        } 
                    } 
                },
                { new: true }
            );
        }

        // 3. Return the updated cart
        res.status(200).json(user.cart);

    } catch (error) {
        console.error("Cart Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { variantId } = req.params;
        
        console.log(`Attempting to remove variantId: ${variantId} for user ${req.user.id}`);

        // 1. ATOMIC REMOVE ($pull)
        // This tells MongoDB: "Go into the cart array and pull out the item with this variantId"
        await User.updateOne(
            { _id: req.user.id },
            { $pull: { cart: { variantId: variantId } } }
        );

        // 2. Return the updated cart so Frontend stays in sync
        const user = await User.findById(req.user.id).populate({
            path: 'cart.product',
            model: 'Product',
        });

        // Format the response exactly like getCart/login
        const formattedCart = user.cart.map(item => {
            if (!item.product) return null;
            const variant = item.product.variants?.find(v => v._id.toString() === item.variantId);
            return {
                id: item.product._id,
                name: item.product.name,
                price: variant ? variant.price : item.product.price,
                imageUrl: item.product.imageUrl,
                variant: item.variantId,
                quantity: item.quantity
            };
        }).filter(Boolean);

        res.json(formattedCart);

    } catch (error) {
        console.error("Remove Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};