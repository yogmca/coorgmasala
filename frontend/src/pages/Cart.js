import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleCheckout = () => {
    if (cart?.items?.length > 0) {
      navigate('/checkout');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-content">
          <h2>Your cart is empty</h2>
          <p>Add some delicious spices to get started!</p>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => {
              // Skip items with null or undefined product
              if (!item.product) {
                return null;
              }
              
              return (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.product.image || 'https://via.placeholder.com/100x100?text=Product'}
                      alt={item.product.name || 'Product'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=' + (item.product.name || 'Product');
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3>{item.product.name || 'Unknown Product'}</h3>
                    <p className="item-weight">
                      {item.product.weight} {item.product.unit}
                    </p>
                    <p className="item-price">₹{item.price} each</p>
                  </div>
                  <div className="item-quantity">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-total">
                    <p className="subtotal">₹{item.price * item.quantity}</p>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            <Link to="/" className="continue-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
