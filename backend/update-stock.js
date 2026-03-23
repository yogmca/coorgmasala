const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const updateStock = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Update all products with stock values
    const updates = [
      { name: 'Black Pepper', stock: 100 },
      { name: 'Cinnamon Sticks', stock: 80 },
      { name: 'Green Cardamom', stock: 60 },
      { name: 'Turmeric Powder', stock: 150 },
      { name: 'Dried Ginger', stock: 90 },
      { name: 'Coffee Powder', stock: 120 },
      { name: 'Black Pepper (500g)', stock: 50 },
      { name: 'Coffee Powder (1kg)', stock: 40 }
    ];

    for (const update of updates) {
      const product = await Product.findOne({ name: update.name });
      if (product) {
        product.stock = update.stock;
        product.inStock = true;
        await product.save();
        console.log(`Updated ${update.name}: stock set to ${update.stock}`);
      } else {
        console.log(`Product ${update.name} not found`);
      }
    }

    console.log('\n✅ Stock updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating stock:', error);
    process.exit(1);
  }
};

updateStock();
