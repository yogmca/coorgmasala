require('dotenv').config();
const mongoose = require('mongoose');
const Webhook = require('./models/Webhook');

async function getWebhookSecret() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    // Find all webhooks
    const allWebhooks = await Webhook.find();
    
    if (allWebhooks.length === 0) {
      console.log('❌ No webhooks found in the database.');
      console.log('\nYou need to create a webhook configuration first.');
      console.log('You can do this through the Admin Panel or by running a setup script.');
      return;
    }

    console.log('='.repeat(70));
    console.log('WEBHOOK CONFIGURATIONS');
    console.log('='.repeat(70));

    allWebhooks.forEach((webhook, index) => {
      console.log(`\n[${index + 1}] Webhook: ${webhook.name}`);
      console.log('-'.repeat(70));
      console.log(`ID:           ${webhook._id}`);
      console.log(`Active:       ${webhook.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`Delivery URL: ${webhook.deliveryUrl}`);
      console.log(`Secret:       ${webhook.secret || '(No secret configured)'}`);
      console.log(`Created:      ${webhook.createdAt}`);
      console.log(`Updated:      ${webhook.updatedAt}`);
    });

    // Find the active webhook
    const activeWebhook = await Webhook.findOne({ isActive: true });
    
    if (activeWebhook) {
      console.log('\n' + '='.repeat(70));
      console.log('🔑 ACTIVE WEBHOOK SECRET (for NimbusPost configuration)');
      console.log('='.repeat(70));
      console.log(`\nWebhook Name: ${activeWebhook.name}`);
      console.log(`Secret Key:   ${activeWebhook.secret || '(No secret configured - signature verification disabled)'}`);
      console.log(`\nWebhook URL:  https://coorgmasala.com/api/webhooks/receive/nimbuspost`);
      console.log('\n📋 Copy the Secret Key above and provide it to NimbusPost');
      console.log('   for HMAC-SHA256 signature verification.');
    } else {
      console.log('\n' + '='.repeat(70));
      console.log('⚠️  WARNING: No active webhook found!');
      console.log('='.repeat(70));
      console.log('\nPlease activate one of the webhooks above or create a new one.');
    }

    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

// Run the script
getWebhookSecret();
