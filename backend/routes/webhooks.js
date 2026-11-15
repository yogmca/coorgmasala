const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Webhook = require('../models/Webhook');
const WebhookPayload = require('../models/WebhookPayload');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Helper function to verify HMAC signature
const verifyWebhookSignature = (payload, signature, secret) => {
  if (!secret) {
    // If no secret is configured, skip verification
    return true;
  }
  
  const payloadString = JSON.stringify(payload);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('base64');
  
  return hash === signature;
};

// Helper function to map NimbusPost status to order status
const mapNimbusStatusToOrderStatus = (nimbusStatus) => {
  const statusMap = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'in transit': 'shipped',
    'out for delivery': 'out_for_delivery',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
    'rto': 'cancelled'
  };
  
  return statusMap[nimbusStatus.toLowerCase()] || 'processing';
};

// ============================================
// WEBHOOK MANAGEMENT ROUTES (Admin only)
// ============================================

// GET all webhooks
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const webhooks = await Webhook.find().sort({ createdAt: -1 });
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single webhook by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const webhook = await Webhook.findById(req.params.id);
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.json(webhook);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE new webhook
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { name, deliveryUrl, secret } = req.body;

    // Validate required fields
    if (!name || !deliveryUrl) {
      return res.status(400).json({ 
        message: 'Name and Delivery URL are required' 
      });
    }

    // Validate URL format
    try {
      new URL(deliveryUrl);
    } catch (err) {
      return res.status(400).json({ 
        message: 'Invalid Delivery URL format' 
      });
    }

    const webhook = new Webhook({
      name,
      deliveryUrl,
      secret: secret || ''
    });

    await webhook.save();
    res.status(201).json({ 
      message: 'Webhook created successfully', 
      webhook 
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE webhook
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { name, deliveryUrl, secret, isActive } = req.body;

    // Validate URL format if provided
    if (deliveryUrl) {
      try {
        new URL(deliveryUrl);
      } catch (err) {
        return res.status(400).json({ 
          message: 'Invalid Delivery URL format' 
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (deliveryUrl !== undefined) updateData.deliveryUrl = deliveryUrl;
    if (secret !== undefined) updateData.secret = secret;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();

    const webhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    res.json({ 
      message: 'Webhook updated successfully', 
      webhook 
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE webhook
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const webhook = await Webhook.findByIdAndDelete(req.params.id);

    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// WEBHOOK PAYLOAD HISTORY (Admin only)
// ============================================

// GET all webhook payloads with filtering
router.get('/payloads', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { awbNumber, orderId, processed, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (awbNumber) filter.awbNumber = awbNumber;
    if (orderId) filter.orderId = orderId;
    if (processed !== undefined) filter.processed = processed === 'true';

    const payloads = await WebhookPayload.find(filter)
      .sort({ receivedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('orderId', 'orderId orderStatus')
      .populate('webhookId', 'name');

    const total = await WebhookPayload.countDocuments(filter);

    res.json({
      payloads,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching webhook payloads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET webhook configuration for NimbusPost setup
router.get('/nimbuspost-config', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const webhook = await Webhook.findOne({ isActive: true });

    if (!webhook) {
      return res.status(404).json({
        message: 'No active webhook configuration found. Please create one first.'
      });
    }

    // Get the base URL from environment or construct it
    const baseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const webhookUrl = `${baseUrl}/api/webhooks/receive/nimbuspost`;

    res.json({
      message: 'Provide these details to NimbusPost',
      configuration: {
        name: webhook.name,
        deliveryUrl: webhookUrl,
        secret: webhook.secret || '(No secret configured - signature verification disabled)',
        webhookEndpoint: webhookUrl,
        testEndpoint: `${baseUrl}/api/webhooks/receive/nimbuspost/test`
      },
      instructions: [
        '1. Copy the Delivery URL and provide it to NimbusPost',
        '2. Copy the Secret and provide it to NimbusPost (if configured)',
        '3. NimbusPost will send webhook payloads to the Delivery URL',
        '4. Each payload will be verified using HMAC-SHA256 if secret is configured',
        '5. Test the endpoint using the Test Endpoint URL'
      ]
    });
  } catch (error) {
    console.error('Error fetching NimbusPost config:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// WEBHOOK RECEIVER ENDPOINT (Public - for NimbusPost)
// ============================================

// POST - Receive webhook from NimbusPost
router.post('/receive/nimbuspost', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-hmac-sha256'];

    console.log('Received NimbusPost webhook:', {
      payload,
      signature,
      headers: req.headers
    });

    // Parse event time
    let eventTime = new Date();
    if (payload.event_time) {
      eventTime = new Date(payload.event_time);
    }

    // Initialize variables for payload record
    let webhookConfig = null;
    let signatureVerified = false;
    let order = null;
    let processingError = '';
    let processed = false;

    try {
      // Validate payload structure
      if (!payload.awb_number) {
        throw new Error('Invalid payload: awb_number is required');
      }

      // Get the first active webhook configuration for verification
      webhookConfig = await Webhook.findOne({ isActive: true });
      
      // Verify signature if webhook has a secret configured
      if (webhookConfig && webhookConfig.secret && signature) {
        const isValid = verifyWebhookSignature(payload, signature, webhookConfig.secret);
        
        if (!isValid) {
          console.error('Webhook signature verification failed');
          throw new Error('Invalid webhook signature');
        }
        
        signatureVerified = true;
        console.log('Webhook signature verified successfully');
      }

      // Find order by AWB number
      order = await Order.findOne({
        'deliveryInfo.awbNumber': payload.awb_number
      });

      if (order) {
        // Create webhook event record for order
        const webhookEvent = {
          awbNumber: payload.awb_number,
          status: payload.status || '',
          eventTime: eventTime,
          location: payload.location || '',
          message: payload.message || '',
          rtoAwb: payload.rto_awb || '',
          receivedAt: new Date(),
          rawPayload: payload
        };

        // Add to webhookEvents array
        order.webhookEvents.push(webhookEvent);

        // Update delivery info with latest status
        order.deliveryInfo.currentStatus = payload.status || '';
        order.deliveryInfo.currentLocation = payload.location || '';
        order.deliveryInfo.lastEventTime = eventTime;
        
        if (payload.rto_awb) {
          order.deliveryInfo.rtoAwb = payload.rto_awb;
        }

        // Update notes with latest message
        if (payload.message) {
          const timestamp = eventTime.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          const newNote = `[${timestamp}] ${payload.location ? payload.location + ': ' : ''}${payload.message}`;
          
          if (order.deliveryInfo.notes) {
            order.deliveryInfo.notes = `${newNote}\n${order.deliveryInfo.notes}`;
          } else {
            order.deliveryInfo.notes = newNote;
          }
        }

        // Map NimbusPost status to order status
        const mappedStatus = mapNimbusStatusToOrderStatus(payload.status || '');
        order.orderStatus = mappedStatus;

        // Update specific delivery timestamps
        if (mappedStatus === 'shipped' && !order.deliveryInfo.shippedAt) {
          order.deliveryInfo.shippedAt = eventTime;
        }
        
        if (mappedStatus === 'delivered' && !order.deliveryInfo.deliveredAt) {
          order.deliveryInfo.deliveredAt = eventTime;
          order.deliveryDate = eventTime;
        }

        // Save the updated order
        await order.save();
        processed = true;

        console.log(`Order ${order.orderId} updated successfully with webhook data`);
      } else {
        console.log(`No order found with AWB number: ${payload.awb_number}`);
        processingError = 'No matching order found';
      }

    } catch (err) {
      processingError = err.message;
      console.error('Error processing webhook:', err);
    }

    // Save webhook payload to database for auditing
    const webhookPayloadRecord = new WebhookPayload({
      webhookId: webhookConfig ? webhookConfig._id : null,
      orderId: order ? order._id : null,
      awbNumber: payload.awb_number || '',
      status: payload.status || '',
      eventTime: eventTime,
      location: payload.location || '',
      message: payload.message || '',
      rtoAwb: payload.rto_awb || '',
      signature: signature || '',
      signatureVerified: signatureVerified,
      rawPayload: payload,
      rawHeaders: req.headers,
      processed: processed,
      processingError: processingError
    });

    await webhookPayloadRecord.save();

    // Return appropriate response
    if (processingError && processingError.includes('Invalid webhook signature')) {
      return res.status(401).json({
        message: 'Invalid webhook signature'
      });
    }

    if (processingError && processingError.includes('awb_number is required')) {
      return res.status(400).json({
        message: 'Invalid payload: awb_number is required'
      });
    }

    if (!order) {
      return res.status(200).json({
        message: 'Webhook received but no matching order found',
        awb_number: payload.awb_number
      });
    }

    res.status(200).json({
      message: 'Webhook processed successfully',
      orderId: order.orderId,
      status: order.orderStatus
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

// GET - Test endpoint to verify webhook is accessible
router.get('/receive/nimbuspost/test', (req, res) => {
  res.json({ 
    message: 'NimbusPost webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
