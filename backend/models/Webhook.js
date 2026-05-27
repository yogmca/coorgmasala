const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    description: 'Used to easily identify webhook'
  },
  deliveryUrl: {
    type: String,
    required: true,
    trim: true,
    description: 'URL where the webhook payload is delivered'
  },
  secret: {
    type: String,
    default: '',
    description: 'The Secret Key generates a hash of the delivered webhook and is provided in the request headers. No hash generated if left blank.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
webhookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Webhook', webhookSchema);
