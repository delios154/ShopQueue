const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customer: {
    name: String,
    phone: String,
    email: String
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  waitTimeRating: {
    type: Number,
    min: 1,
    max: 5
  },
  comments: String,
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});

feedbackSchema.index({ shop: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);