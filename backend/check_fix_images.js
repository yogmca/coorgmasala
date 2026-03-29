const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

// Map product names to correct image paths
const imageMapping = {
  'Black Pepper': '/images/black-pepper.jpg',
  'Green Cardamom': '/images/cardamom.jpg',
  'Cinnamon Sticks': '/images/cinnamon.jpg',
  'Coffee Powder': '/images/coffee.jpg',
  'Dried Ginger': '/images/ginger.jpg',
  'Turmeric Powder': '/images/turmeric.jpg'
};

async function checkAndFixImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updatedCount = 0;

    for (const product of products) {
      console.log(`\n📝 Product: ${product.name}`);
      console.log(`   Current image: ${product.image}`);
      
      // Find matching image
      let newImage = null;
      for (const [key, imagePath] of Object.entries(imageMapping)) {
        if (product.name.includes(key)) {
          newImage = imagePath;
          break;
        }
      }

      if (newImage) {
        if (product.image !== newImage) {
          console.log(`   ✏️  Updating to: ${newImage}`);
          await Product.updateOne(
            { _id: product._id },
            { $set: { image: newImage } }
          );
          updatedCount++;
        } else {
          console.log(`   ✅ Already correct`);
        }
      } else {
        console.log(`   ⚠️  No matching image found - keeping: ${product.image}`);
      }
    }

    console.log(`\n\n🎉 Update complete!`);
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Total: ${products.length} products`);

    // Verify the changes
    console.log('\n\n🔍 Verifying changes...\n');
    const verifyProducts = await Product.find({});
    for (const product of verifyProducts) {
      console.log(`${product.name}: ${product.image}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixImages();
