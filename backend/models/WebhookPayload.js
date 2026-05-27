const mongoose = require('mongoose');

const webhookPayloadSchema = new mongoose.Schema({
  webhookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Webhook',
    description: 'Reference to the webhook configuration'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    description: 'Reference to the order if found'
  },
  awbNumber: {
    type: String,
    required: true,
    index: true,
    description: 'AWB tracking number from NimbusPost'
  },
  status: {
    type: String,
    required: true,
    description: 'Delivery status from NimbusPost'
  },
  eventTime: {
    type: Date,
    required: true,
    description: 'Event timestamp from NimbusPost'
  },
  location: {
    type: String,
    default: '',
    description: 'Current location of the shipment'
  },
  message: {
    type: String,
    default: '',
    description: 'Status message from NimbusPost'
  },
  rtoAwb: {
    type: String,
    default: '',
    description: 'RTO AWB number if applicable'
  },
  signature: {
    type: String,
    default: '',
    description: 'HMAC signature received in headers'
  },
  signatureVerified: {
    type: Boolean,
    default: false,
    description: 'Whether the signature was verified successfully'
  },
  rawPayload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    description: 'Complete raw payload from NimbusPost'
  },
  rawHeaders: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Request headers received'
  },
  processed: {
    type: Boolean,
    default: false,
    description: 'Whether the webhook was processed successfully'
  },
  processingError: {
    type: String,
    default: '',
    description: 'Error message if processing failed'
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true,
    description: 'When the webhook was received'
  }
}, {
  timestamps: true
});

// Index for efficient querying
webhookPayloadSchema.index({ awbNumber: 1, receivedAt: -1 });
webhookPayloadSchema.index({ orderId: 1, receivedAt: -1 });
webhookPayloadSchema.index({ processed: 1, receivedAt: -1 });

module.exports = mongoose.model('WebhookPayload', webhookPayloadSchema);
