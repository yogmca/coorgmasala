const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ product: productId });

    // Calculate rating distribution
    const mongoose = require('mongoose');
    const ratingDistribution = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach(r => {
      distribution[r._id] = r.count;
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

// GET /api/reviews/my-reviews - Get current user's reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId })
      .populate('product', 'name image price')
      .sort('-createdAt');

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your reviews'
    });
  }
});

// GET /api/reviews/can-review/:productId - Check if user can review a product
router.get('/can-review/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const User = require('../models/User');
    const currentUser = await User.findById(req.userId).select('email');

    // Find delivered orders containing this product for this user
    // Match by user ID or by customer email (for legacy orders without user field)
    const orderQuery = {
      orderStatus: 'delivered',
      'items.product': productId
    };
    if (currentUser && currentUser.email) {
      orderQuery.$or = [
        { user: req.userId },
        { 'customerInfo.email': currentUser.email }
      ];
    } else {
      orderQuery.user = req.userId;
    }

    const deliveredOrders = await Order.find(orderQuery).select('_id orderId user');

    // Backfill: link any legacy orders (matched by email but missing user field) to this user
    const legacyOrders = deliveredOrders.filter(o => !o.user);
    if (legacyOrders.length > 0) {
      await Order.updateMany(
        { _id: { $in: legacyOrders.map(o => o._id) } },
        { $set: { user: req.userId } }
      );
    }

    // Find existing reviews by this user for this product
    const existingReviews = await Review.find({
      user: req.userId,
      product: productId
    }).select('order');

    const reviewedOrderIds = existingReviews.map(r => r.order.toString());

    // Filter orders that haven't been reviewed yet
    const reviewableOrders = deliveredOrders.filter(
      order => !reviewedOrderIds.includes(order._id.toString())
    );

    res.json({
      success: true,
      canReview: reviewableOrders.length > 0,
      reviewableOrders: reviewableOrders,
      existingReviewCount: existingReviews.length
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check review eligibility'
    });
  }
});

// POST /api/reviews - Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;

    // Validate required fields
    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, Order ID, rating, and comment are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Verify the order exists, belongs to the user, is delivered, and contains the product
    // Match by user ID or by customer email (for legacy orders without user field)
    const User = require('../models/User');
    const currentUser = await User.findById(req.userId).select('email');

    const orderQuery = {
      _id: orderId,
      orderStatus: 'delivered',
      'items.product': productId
    };
    if (currentUser && currentUser.email) {
      orderQuery.$or = [
        { user: req.userId },
        { 'customerInfo.email': currentUser.email }
      ];
    } else {
      orderQuery.user = req.userId;
    }

    const order = await Order.findOne(orderQuery);

    if (!order) {
      return res.status(403).json({
        success: false,
        error: 'You can only review products from your delivered orders'
      });
    }

    // Backfill: link legacy order to this user if not already linked
    if (!order.user) {
      order.user = req.userId;
      await order.save();
    }

    // Check if user already reviewed this product for this order
    const existingReview = await Review.findOne({
      product: productId,
      user: req.userId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product for this order'
      });
    }

    // Create the review
    const review = new Review({
      product: productId,
      user: req.userId,
      order: orderId,
      rating,
      title: title || '',
      comment
    });

    await review.save();

    // Populate user info before returning
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product for this order'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to submit review'
    });
  }
});

// PUT /api/reviews/:reviewId - Update own review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Ensure the review belongs to the user
    if (review.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own reviews'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    review.isEdited = true;
    review.editedBy = 'user';
    review.editedAt = new Date();

    await review.save();
    await review.populate('user', 'name');

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
});

// DELETE /api/reviews/:reviewId - Delete own review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Ensure the review belongs to the user
    if (review.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/reviews/admin/all - Get all reviews (admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, rating, sort = '-createdAt' } = req.query;

    const filter = {};
    if (productId) filter.product = productId;
    if (rating) filter.rating = parseInt(rating);

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name image price')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

// PUT /api/reviews/admin/:reviewId - Admin edit/update a review
router.put('/admin/:reviewId', adminAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    review.isEdited = true;
    review.editedBy = 'admin';
    review.editedAt = new Date();

    await review.save();
    await review.populate('user', 'name email');
    await review.populate('product', 'name image price');

    res.json({
      success: true,
      data: review,
      message: 'Review updated by admin successfully'
    });
  } catch (error) {
    console.error('Error admin updating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
});

// DELETE /api/reviews/admin/:reviewId - Admin delete a review
router.delete('/admin/:reviewId', adminAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted by admin successfully'
    });
  } catch (error) {
    console.error('Error admin deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

module.exports = router;
