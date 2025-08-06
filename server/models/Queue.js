const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  maxCapacity: {
    type: Number,
    default: 50
  },
  currentNumber: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedServiceTime: {
    type: Number,
    default: 15
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Queue', queueSchema);