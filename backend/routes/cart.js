const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ sessionId: req.params.sessionId })
      .populate('items.product');
    
    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        sessionId: req.params.sessionId,
        items: []
      });
    } else {
      // Filter out items where product is null (deleted products)
      const validItems = cart.items.filter(item => item.product !== null);
      
      // If items were filtered out, update the cart
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add item to cart - validate product only (cart managed client-side)
router.post('/:sessionId/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    // Return product details for client-side cart management
    res.json({
      success: true,
      message: 'Product validated',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          description: product.description,
          category: product.category,
          weight: product.weight,
          unit: product.unit,
          inStock: product.inStock,
          ratings: product.ratings
        },
        quantity
      }
    });
  } catch (error) {
    console.error('Error validating product:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update item quantity in cart
router.put('/:sessionId/items/:productId', async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Validate stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        error: 'Requested quantity exceeds available stock'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed

    cart.calculateTotals();
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/:sessionId/items/:productId', async (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    cart.calculateTotals();
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear cart
router.delete('/:sessionId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = [];
    cart.calculateTotals();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Checkout - convert cart to order
router.post('/:sessionId/checkout', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { customerInfo, shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ sessionId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${item.product.name}`
        });
      }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    // Return checkout data (order will be created via orders route)
    res.json({
      success: true,
      data: {
        items: orderItems,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
