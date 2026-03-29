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

const fixAllImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products in database\n`);

    let updatedCount = 0;
    
    for (const product of products) {
      const correctImage = imageMap[product.name];
      
      // Check if image path is incorrect
      const needsUpdate = correctImage && (
        product.image !== correctImage ||
        product.image.includes('getty') ||
        product.image.includes('placeholder') ||
        product.image.includes('via.placeholder') ||
        /\/images\/\d+-getty/.test(product.image)
      );
      
      if (needsUpdate) {
        console.log(`📝 Updating ${product.name}:`);
        console.log(`   Old: ${product.image}`);
        console.log(`   New: ${correctImage}`);
        
        product.image = correctImage;
        await product.save();
        updatedCount++;
      } else if (correctImage) {
        console.log(`✓ ${product.name}: ${product.image}`);
      } else {
        console.log(`⚠️  No mapping found for: ${product.name} (current: ${product.image})`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} product image paths`);
    
    // Display all products with their current image paths
    console.log('\n📋 Final product images:');
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

fixAllImages();
