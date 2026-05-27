const mongoose = require('./backend/node_modules/mongoose');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

const webhookSchema = new mongoose.Schema({
  name: String,
  deliveryUrl: String,
  secret: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const Webhook = mongoose.model('Webhook', webhookSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices')
  .then(async () => {
    console.log('\n✅ Connected to MongoDB\n');
    
    const webhook = await Webhook.findOne({ isActive: true });
    
    if (webhook) {
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║           NIMBUSPOST WEBHOOK CONFIGURATION                     ║');
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ Name:', webhook.name.padEnd(55), '║');
      console.log('║ Delivery URL:', webhook.deliveryUrl.padEnd(48), '║');
      console.log('║ Secret Key:', (webhook.secret || '(Not configured)').padEnd(50), '║');
      console.log('║ Status:', (webhook.isActive ? '✅ Active' : '❌ Inactive').padEnd(54), '║');
      console.log('║ Created:', new Date(webhook.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).padEnd(51), '║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('\n📋 PRODUCTION API ENDPOINTS:\n');
      console.log('1. Webhook Receiver (for NimbusPost):');
      console.log('   POST https://coorgmasala.com/api/webhooks/receive/nimbuspost');
      console.log('   Headers: x-hmac-sha256: <signature>\n');
      
      console.log('2. View All Webhook Payloads (Admin):');
      console.log('   GET https://coorgmasala.com/api/webhooks/payloads');
      console.log('   Headers: Authorization: Bearer <admin_token>\n');
      
      console.log('3. Filter Webhook Payloads:');
      console.log('   GET https://coorgmasala.com/api/webhooks/payloads?awbNumber=<AWB>');
      console.log('   GET https://coorgmasala.com/api/webhooks/payloads?orderId=<ORDER_ID>');
      console.log('   GET https://coorgmasala.com/api/webhooks/payloads?processed=true');
      console.log('   Headers: Authorization: Bearer <admin_token>\n');
      
      console.log('4. Get NimbusPost Configuration (Admin):');
      console.log('   GET https://coorgmasala.com/api/webhooks/nimbuspost-config');
      console.log('   Headers: Authorization: Bearer <admin_token>\n');
      
      console.log('5. Test Webhook Endpoint:');
      console.log('   GET https://coorgmasala.com/api/webhooks/receive/nimbuspost/test\n');
      
      if (webhook.secret) {
        console.log('🔐 HMAC-SHA256 Signature Verification: ENABLED');
        console.log('   Secret Key:', webhook.secret);
      } else {
        console.log('⚠️  HMAC-SHA256 Signature Verification: DISABLED');
        console.log('   (No secret key configured)');
      }
      console.log('\n');
    } else {
      console.log('⚠️  No active webhook configuration found in database');
      console.log('\n📝 To create a webhook configuration, use the Admin Panel or API:\n');
      console.log('POST https://coorgmasala.com/api/webhooks');
      console.log('Headers: Authorization: Bearer <admin_token>');
      console.log('Body: {');
      console.log('  "name": "Nimbuspost Tracking",');
      console.log('  "deliveryUrl": "https://coorgmasala.com/api/webhooks/receive/nimbuspost",');
      console.log('  "secret": "your_secret_key_here"');
      console.log('}\n');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
