const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Correct image mapping
const imageMap = {
  'Black Pepper': '/images/black-pepper.jpg',
  'Black Pepper (500g)': '/images/black-pepper.jpg',
  'Cinnamon Sticks': '/images/cinnamon.jpg',
  'Green Cardamom': '/images/cardamom.jpg',
  'Turmeric Powder': '/images/turmeric.jpg',
  'Dried Ginger': '/images/ginger.jpg',
  'Coffee Powder': '/images/coffee.jpg',
  'Coffee Powder (1kg)': '/images/coffee.jpg'
};

const fixImagePaths = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products in database`);

    let updatedCount = 0;
    
    for (const product of products) {
      const correctImage = imageMap[product.name];
      
      if (correctImage && product.image !== correctImage) {
        console.log(`\n📝 Updating ${product.name}:`);
        console.log(`   Old: ${product.image}`);
        console.log(`   New: ${correctImage}`);
        
        product.image = correctImage;
        await product.save();
        updatedCount++;
      } else if (correctImage) {
        console.log(`✓ ${product.name} already has correct image path`);
      } else {
        console.log(`⚠️  No mapping found for: ${product.name}`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} product image paths`);
    
    // Display all products with their current image paths
    console.log('\n📋 Current product images:');
    const allProducts = await Product.find({});
    allProducts.forEach(p => {
      console.log(`   ${p.name}: ${p.image}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    process.exit(1);
  }
};

fixImagePaths();
