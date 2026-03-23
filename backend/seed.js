const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: 'Black Pepper',
    description: 'Premium quality Coorg black pepper, known for its bold flavor and aroma. Rich in antioxidants and perfect for all cuisines.',
    price: 450,
    category: 'spices',
    image: '/images/black-pepper.jpg',
    stock: 100,
    unit: 'grams',
    weight: 100,
    inStock: true,
    ratings: { average: 4.5, count: 45 }
  },
  {
    name: 'Cinnamon Sticks',
    description: 'Authentic Ceylon cinnamon from Coorg plantations. Sweet and aromatic, perfect for desserts and beverages.',
    price: 350,
    category: 'spices',
    image: '/images/cinnamon.jpg',
    stock: 80,
    unit: 'grams',
    weight: 100,
    inStock: true,
    ratings: { average: 4.7, count: 38 }
  },
  {
    name: 'Green Cardamom',
    description: 'Premium green cardamom pods with intense flavor. Essential for Indian sweets, tea, and biryanis.',
    price: 800,
    category: 'spices',
    image: '/images/cardamom.jpg',
    stock: 60,
    unit: 'grams',
    weight: 50,
    inStock: true,
    ratings: { average: 4.8, count: 52 }
  },
  {
    name: 'Turmeric Powder',
    description: 'Pure organic turmeric powder from Coorg. Known for its anti-inflammatory properties and vibrant color.',
    price: 200,
    category: 'spices',
    image: '/images/turmeric.jpg',
    stock: 150,
    unit: 'grams',
    weight: 200,
    inStock: true,
    ratings: { average: 4.6, count: 67 }
  },
  {
    name: 'Dried Ginger',
    description: 'Sun-dried ginger with strong aroma and medicinal properties. Perfect for teas and cooking.',
    price: 300,
    category: 'spices',
    image: '/images/ginger.jpg',
    stock: 90,
    unit: 'grams',
    weight: 100,
    inStock: true,
    ratings: { average: 4.4, count: 31 }
  },
  {
    name: 'Coffee Powder',
    description: 'Freshly ground Coorg coffee powder. Rich, aromatic, and full-bodied flavor from the coffee capital of India.',
    price: 500,
    category: 'coffee',
    image: '/images/coffee.jpg',
    stock: 120,
    unit: 'grams',
    weight: 250,
    inStock: true,
    ratings: { average: 4.9, count: 89 }
  },
  {
    name: 'Black Pepper (500g)',
    description: 'Bulk pack of premium Coorg black pepper. Great value for regular use.',
    price: 2000,
    category: 'spices',
    image: '/images/black-pepper.jpg',
    stock: 50,
    unit: 'grams',
    weight: 500,
    inStock: true,
    ratings: { average: 4.5, count: 23 }
  },
  {
    name: 'Coffee Powder (1kg)',
    description: 'Premium Coorg coffee powder in bulk. Perfect for coffee lovers and families.',
    price: 1800,
    category: 'coffee',
    image: '/images/coffee.jpg',
    stock: 40,
    unit: 'kg',
    weight: 1,
    inStock: true,
    ratings: { average: 4.9, count: 56 }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Try to clear existing products (skip if not supported)
    try {
      await Product.deleteMany({});
      console.log('Cleared existing products');
    } catch (err) {
      console.log('Skipping delete (not supported by this MongoDB instance)');
    }

    // Insert new products
    const insertedProducts = [];
    for (const productData of products) {
      try {
        const existing = await Product.findOne({ name: productData.name });
        if (!existing) {
          const product = await Product.create(productData);
          insertedProducts.push(product);
        } else {
          console.log(`Product "${productData.name}" already exists, skipping...`);
        }
      } catch (err) {
        console.log(`Error inserting ${productData.name}:`, err.message);
      }
    }

    console.log(`\n✅ ${insertedProducts.length} products added successfully`);
    console.log('\nSeeded products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
