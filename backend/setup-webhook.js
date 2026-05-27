require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Webhook = require('./models/Webhook');

async function setupWebhook() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    // Check if webhook already exists
    const existingWebhook = await Webhook.findOne({ isActive: true });
    
    if (existingWebhook) {
      console.log('⚠️  An active webhook already exists:');
      console.log(`   Name: ${existingWebhook.name}`);
      console.log(`   Secret: ${existingWebhook.secret}`);
      console.log(`   Delivery URL: ${existingWebhook.deliveryUrl}`);
      console.log('\nIf you want to create a new one, please deactivate the existing webhook first.');
      return;
    }

    // Generate a secure random secret (32 bytes = 64 hex characters)
    const secret = crypto.randomBytes(32).toString('hex');

    // Create webhook configuration
    const webhook = new Webhook({
      name: 'NimbusPost Tracking',
      deliveryUrl: 'https://coorgmasala.com/api/webhooks/receive/nimbuspost',
      secret: secret,
      isActive: true
    });

    await webhook.save();

    console.log('='.repeat(70));
    console.log('✅ WEBHOOK CONFIGURATION CREATED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`\nWebhook ID:   ${webhook._id}`);
    console.log(`Name:         ${webhook.name}`);
    console.log(`Delivery URL: ${webhook.deliveryUrl}`);
    console.log(`Active:       ${webhook.isActive ? 'YES' : 'NO'}`);
    console.log(`Created:      ${webhook.createdAt}`);
    console.log('\n' + '='.repeat(70));
    console.log('🔑 SECRET KEY FOR NIMBUSPOST');
    console.log('='.repeat(70));
    console.log(`\n${secret}`);
    console.log('\n' + '='.repeat(70));
    console.log('📋 NIMBUSPOST CONFIGURATION INSTRUCTIONS');
    console.log('='.repeat(70));
    console.log('\n1. Log in to your NimbusPost dashboard');
    console.log('2. Navigate to Settings > Webhooks');
    console.log('3. Create a new webhook with these details:');
    console.log(`   - Webhook URL: ${webhook.deliveryUrl}`);
    console.log(`   - Secret Key: ${secret}`);
    console.log('   - Events: Select shipment tracking events');
    console.log('4. Save the configuration');
    console.log('\n⚠️  IMPORTANT: Save this secret key securely!');
    console.log('   You will need it to configure NimbusPost.');
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
setupWebhook();
