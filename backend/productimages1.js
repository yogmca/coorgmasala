const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const imageMapping = {
  'Black Pepper': '/images/black-pepper.jpg',
  'Green Cardamom': '/images/cardamom.jpg',
  'Cinnamon Sticks': '/images/cinnamon.jpg',
  'Coffee Powder': '/images/coffee.jpg',
  'Dried Ginger': '/images/ginger.jpg',
  'Turmeric Powder': '/images/turmeric.jpg'
};

async function fixProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log('Found ' + products.length + ' products');

    for (const product of products) {
      let newImage = null;
      
      for (const key in imageMapping) {
        if (product.name.includes(key)) {
          newImage = imageMapping[key];
          break;
        }
      }

      if (newImage && product.image !== newImage) {
        console.log('Updating ' + product.name + ': ' + product.image + ' -> ' + newImage);
        product.image = newImage;
        await product.save();
      } else if (!newImage) {
        console.log('No matching image found for: ' + product.name);
      } else {
        console.log(product.name + ' already has correct image');
      }
    }

    console.log('\n✅ Product images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing product images:', error);
    process.exit(1);
  }
}

fixProductImages();
