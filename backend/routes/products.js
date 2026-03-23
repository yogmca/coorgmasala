const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, inStock } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    let products;
    try {
      products = await Product.find(filter).sort({ createdAt: -1 });
      
      // Replace external image URLs with local paths
      products = products.map(product => {
        const productObj = product.toObject ? product.toObject() : product;
        
        // Map product names to local image paths
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
        
        if (imageMap[productObj.name]) {
          productObj.image = imageMap[productObj.name];
        }
        
        return productObj;
      });
    } catch (dbError) {
      // Fallback to JSON file if MongoDB fails
      console.log('MongoDB query failed, using fallback JSON data');
      const jsonPath = path.join(__dirname, '../products-data.json');
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      products = JSON.parse(jsonData);
      
      // Apply filters to JSON data
      if (category) {
        products = products.filter(p => p.category === category);
      }
      if (inStock !== undefined) {
        products = products.filter(p => p.inStock === (inStock === 'true'));
      }
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new product (Admin only - add auth middleware in production)
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update product (Admin only - add auth middleware in production)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete product (Admin only - add auth middleware in production)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
