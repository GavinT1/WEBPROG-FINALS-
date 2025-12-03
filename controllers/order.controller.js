const Order = require('../Models/order.model.js');
const User = require('../Models/user.model.js');
const Product = require('../Models/product.model.js');

exports.createOrder = async (req, res) => {
    try {
        const {shippingAddress, paymentMethod} = req.body;

        const user = await User.findById(req.user.id).populate({
            path: 'cart.product',
            model: 'Product',
        });

        if(!user|| user.cart.length === 0){
            return  res.status(400).json({ message: 'Cart is empty' });
        }
        let totalPrice = 0;
        const orderItems = [];

        for(const cartItem of user.cart){
            
            if (!cartItem.product) {
                return res.status(404).json({ 
                    message: `A product in your cart was not found (it may have been deleted). Please clear your cart and try again.` 
                });
            }
            
            const variant = cartItem.product.variants.find(v => v._id.toString() === cartItem.variantId);
            if(!variant){
                return res.status(404).json({ message: `Variant ${cartItem.variantId} not found for product ${cartItem.product.name}` });
            }

            if(variant.stock < cartItem.quantity){
                return res.status(400).json({ message: `Insufficient stock for variant ${variant.name}` });
            }
            orderItems.push({
                name: `${cartItem.product.name} - ${variant.name}`,
                quantity: cartItem.quantity,
                price: variant.price,
                product: cartItem.product._id,
                variantId: cartItem.variantId,
            });
            totalPrice += variant.price * cartItem.quantity;
        }
        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();
        
        user.cart = [];
        await user.save();

        console.log("========================================");
        console.log(`📲 SMS SERVICE: Sending text to ${shippingAddress.phoneNumber}...`);
        console.log(`💬 MESSAGE: "Success! Order #${createdOrder._id} confirmed. Total: $${totalPrice}"`);
        console.log("========================================");

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// order.controller.js

// --- ADD THIS FUNCTION ---
exports.getMyOrders = async (req, res) => {
    try {
        // 1. Find orders for the logged-in user
        // 2. Sort by newest first (createdAt: -1)
        // 3. Populate product details (so we get the image if needed)
        const orders = await Order.find({ user: req.user.id })
            .populate({
                path: 'orderItems.product',
                model: 'Product',
                select: 'imageUrl' // We just need the image
            })
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Get My Orders Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if(order){
            if (req.user.isAdmin || order.user._id.toString()=== req.user.id){
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// admin 

exports.getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find({}).populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
    
    if(order){
        order.isPaid = true;
        order.paidAt = Date.now();

        order.paymentStatus = 'paid';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    }else {
        res.status(404).json({ message: 'Order not found' });
    }
} catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
}
};

exports.updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            order.orderStatus = 'completed';

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        }else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.fakePayOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString()!== req.user.id) return res.status(401).json({ message: 'Not authorized to pay for this order' });
        if(order.isPaid) return res.status(400).json({ message: 'Order is already paid' });

        // 1. Get Details
        const {cardNumber, expiryDate, cvc, nameOnCard} = req.body;

        // 2. Validate Presence
        if(!cardNumber || !expiryDate || !cvc || !nameOnCard){
            return res.status(400).json({ message: 'All payment fields are required' });
        }

        // 3. Validate Card Number
        const cleanCardNumber = cardNumber.replace(/\s+/g, '');
        if(cleanCardNumber.length !== 16 || isNaN(cleanCardNumber)){
            return res.status(400).json({ message: 'Invalid card number (Must Be 16 Digits)' });
        }

        // 4. Validate CVC
        if(cvc.length !== 3 || isNaN(cvc)){
            return res.status(400).json({ message: 'Invalid CVC (Must Be 3 Digits)' });
        }

        // 5. Success Logic
        order.isPaid= true;
        order.paidAt= Date.now();

        order.paymentStatus= 'paid';
        order.paymentMethod= 'Credit Card';

        const updatedOrder = await order.save();
        
        // Fixed: Use backticks for template literal
        console.log(`Payment processed successfully ending with ${cleanCardNumber.slice(-4)} for #${order._id}.`);
        
        res.json(updatedOrder);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};