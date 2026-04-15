import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';
import './ReviewSection.css';

const StarRating = ({ rating, onRate, interactive = false, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={`star-rating star-rating-${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hoverRating || rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewForm = ({ productId, onSubmit, onCancel, existingReview = null, reviewableOrders = [] }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [selectedOrder, setSelectedOrder] = useState(existingReview?.order || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }
    if (!existingReview && !selectedOrder) {
      setError('Please select an order');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        await reviewAPI.update(existingReview._id, { rating, title, comment });
      } else {
        await reviewAPI.create({
          productId,
          orderId: selectedOrder,
          rating,
          title,
          comment
        });
      }
      onSubmit();
    } catch (err) {
      setError(err.message || err.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h4>

      {!existingReview && reviewableOrders.length > 0 && (
        <div className="form-group">
          <label>Select Order:</label>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            required
          >
            <option value="">-- Select an order --</option>
            {reviewableOrders.map(order => (
              <option key={order._id} value={order._id}>
                Order #{order.orderId}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Rating:</label>
        <StarRating rating={rating} onRate={setRating} interactive={true} size="large" />
        {rating > 0 && (
          <span className="rating-text">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      <div className="form-group">
        <label>Title (optional):</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your review"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Your Review:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          maxLength={1000}
          required
        />
        <small>{comment.length}/1000</small>
      </div>

      {error && <div className="review-error">{error}</div>}

      <div className="review-form-actions">
        <button type="submit" className="btn-submit-review" disabled={submitting}>
          {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
        <button type="button" className="btn-cancel-review" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const ReviewSection = ({ productId, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewableOrders, setReviewableOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(productId, { page, limit: 5 });
      setReviews(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setRatingDistribution(response.data.ratingDistribution);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  const checkCanReview = useCallback(async () => {
    if (!user) return;
    try {
      const response = await reviewAPI.canReview(productId);
      setCanReview(response.data.canReview);
      setReviewableOrders(response.data.reviewableOrders);
    } catch (err) {
      console.error('Error checking review eligibility:', err);
    }
  }, [productId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    checkCanReview();
  }, [checkCanReview]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
    checkCanReview();
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewAPI.delete(reviewId);
      fetchReviews();
      checkCanReview();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  const averageRating = totalReviews > 0
    ? (Object.entries(ratingDistribution).reduce((sum, [star, count]) => sum + (star * count), 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <div className="review-section">
      <div
        className="review-section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="review-summary-inline">
          <StarRating rating={Math.round(averageRating)} size="small" />
          <span className="review-count-inline">
            {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <span className={`expand-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="review-section-body">
          {/* Rating Summary */}
          {totalReviews > 0 && (
            <div className="rating-summary">
              <div className="rating-overview">
                <div className="rating-big-number">{averageRating}</div>
                <StarRating rating={Math.round(averageRating)} size="medium" />
                <div className="total-reviews">{totalReviews} reviews</div>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="rating-bar-row">
                    <span className="bar-label">{star}★</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: totalReviews > 0 ? `${(ratingDistribution[star] / totalReviews) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="bar-count">{ratingDistribution[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write Review Button */}
          {user && canReview && !showForm && (
            <button
              className="btn-write-review"
              onClick={() => { setEditingReview(null); setShowForm(true); }}
            >
              ✍️ Write a Review
            </button>
          )}

          {!user && (
            <p className="login-to-review">
              <a href="/login">Log in</a> to write a review (only for purchased products)
            </p>
          )}

          {/* Review Form */}
          {showForm && (
            <ReviewForm
              productId={productId}
              onSubmit={handleReviewSubmitted}
              onCancel={() => { setShowForm(false); setEditingReview(null); }}
              existingReview={editingReview}
              reviewableOrders={reviewableOrders}
            />
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="reviews-loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-card-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <StarRating rating={review.rating} size="small" />
                  </div>
                  {review.title && <h5 className="review-title">{review.title}</h5>}
                  <p className="review-comment">{review.comment}</p>
                  {review.isEdited && (
                    <span className="edited-badge">
                      (edited{review.editedBy === 'admin' ? ' by admin' : ''})
                    </span>
                  )}
                  {user && (review.user?._id === (user._id || user.id)) && (
                    <div className="review-actions">
                      <button
                        className="btn-edit-review"
                        onClick={() => handleEditReview(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete-review"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="review-pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
