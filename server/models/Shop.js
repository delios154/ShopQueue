const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['barbershop', 'salon', 'tailor', 'repair', 'clinic', 'dental', 'cafe', 'other']
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String,
    close: String,
    closed: {
      type: Boolean,
      default: false
    }
  }],
  services: [{
    name: String,
    duration: Number,
    price: Number,
    description: String
  }],
  branding: {
    logo: String,
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1F2937'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'standard', 'pro'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    expiresAt: Date
  },
  settings: {
    allowWalkIns: {
      type: Boolean,
      default: true
    },
    maxAdvanceBookingDays: {
      type: Number,
      default: 30
    },
    notificationSettings: {
      sms: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);