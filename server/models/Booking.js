const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  queue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
    required: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String
  },
  service: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'walk_in'],
    default: 'appointment'
  },
  scheduledTime: Date,
  queueNumber: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  estimatedWaitTime: {
    type: Number,
    default: 0
  },
  actualWaitTime: Number,
  serviceStartTime: Date,
  serviceEndTime: Date,
  notes: String,
  notificationsSent: [{
    type: {
      type: String,
      enum: ['sms', 'email']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    message: String
  }]
}, {
  timestamps: true
});

bookingSchema.index({ shop: 1, createdAt: -1 });
bookingSchema.index({ queue: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);