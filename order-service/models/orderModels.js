const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  deliveryAddress:{
    type:[String],
    required:true
  },
  totalPrice: Number,
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Dispatched', 'Delivered'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
