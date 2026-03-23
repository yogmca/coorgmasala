const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const updateProductImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Update each product with local image paths
    const updates = [
      { name: 'Black Pepper', image: '/images/black-pepper.jpg' },
      { name: 'Black Pepper (500g)', image: '/images/black-pepper.jpg' },
      { name: 'Cinnamon Sticks', image: '/images/cinnamon.jpg' },
      { name: 'Green Cardamom', image: '/images/cardamom.jpg' },
      { name: 'Turmeric Powder', image: '/images/turmeric.jpg' },
      { name: 'Dried Ginger', image: '/images/ginger.jpg' },
      { name: 'Coffee Powder', image: '/images/coffee.jpg' },
      { name: 'Coffee Powder (1kg)', image: '/images/coffee.jpg' }
    ];

    for (const update of updates) {
      const result = await Product.updateOne(
        { name: update.name },
        { $set: { image: update.image } }
      );
      console.log(`Updated ${update.name}: ${result.modifiedCount} document(s) modified`);
    }

    console.log('\n✅ All product images updated to use local paths');
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
};

updateProductImages();
