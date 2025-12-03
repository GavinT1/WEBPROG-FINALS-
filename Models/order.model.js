const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    variantId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [OrderItemSchema],
    shippingAddress: {
        name: { type: String, required: true },          // Full name / label
        street: { type: String, required: true },        // Address line
        city: { type: String, required: true },
        zip: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: "Not Specified" },

    orderStatus: { type: String, required: true, enum:['pending', 'processing', 'completed', 'cancelled'], default: 'processing' },
    paymentStatus: { type: String, required:true, enum:['pending', 'paid', 'failed'], default: 'pending' },

    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);