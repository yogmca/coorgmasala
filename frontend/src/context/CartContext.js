import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, productAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Generate or retrieve session ID
  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
    loadCart(id);
  }, []);

  const loadCart = async (id) => {
    try {
      setLoading(true);
      // Load cart from localStorage
      const storedCart = localStorage.getItem(`cart_${id}`);
      if (storedCart) {
        const cartData = JSON.parse(storedCart);
        // Validate cart items with backend
        if (cartData.items && cartData.items.length > 0) {
          const validItems = [];
          for (const item of cartData.items) {
            try {
              // Check if product still exists using the API service
              const response = await productAPI.getById(item.product._id);
              if (response.data && response.data.success) {
                validItems.push(item);
              } else {
                console.warn(`Product ${item.product._id} no longer exists, removing from cart`);
              }
            } catch (err) {
              console.warn(`Failed to validate product ${item.product._id}:`, err.message);
            }
          }
          
          // Update cart with only valid items
          cartData.items = validItems;
          cartData.totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
          cartData.totalAmount = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          // Save cleaned cart back to localStorage
          localStorage.setItem(`cart_${id}`, JSON.stringify(cartData));
          setCart(cartData);
        } else {
          setCart(cartData);
        }
      } else {
        setCart({ items: [], totalItems: 0, totalAmount: 0 });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      // Validate product with backend
      const response = await cartAPI.addItem(sessionId, { productId, quantity });
      
      if (response.data.success) {
        // Get current cart from localStorage
        const storedCart = localStorage.getItem(`cart_${sessionId}`);
        let cartData = storedCart ? JSON.parse(storedCart) : { items: [], totalItems: 0, totalAmount: 0 };
        
        const product = response.data.data.product;
        
        // Check if product already in cart
        const existingItemIndex = cartData.items.findIndex(item => item.product._id === productId);
        
        if (existingItemIndex > -1) {
          // Update quantity
          cartData.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          cartData.items.push({
            product,
            quantity,
            price: product.price
          });
        }
        
        // Recalculate totals
        cartData.totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        cartData.totalAmount = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save to localStorage
        localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cartData));
        
        // Update state
        setCart(cartData);
        
        return { success: true };
      }
      return { success: false, error: 'Failed to validate product' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.message || error.response?.data?.error || 'Failed to add item';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const storedCart = localStorage.getItem(`cart_${sessionId}`);
      let cartData = storedCart ? JSON.parse(storedCart) : { items: [], totalItems: 0, totalAmount: 0 };
      
      const itemIndex = cartData.items.findIndex(item => item.product._id === productId);
      
      if (itemIndex > -1) {
        cartData.items[itemIndex].quantity = quantity;
        
        // Recalculate totals
        cartData.totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        cartData.totalAmount = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save to localStorage
        localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cartData));
        setCart(cartData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating cart:', error);
      const errorMessage = error.message || 'Failed to update item';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const storedCart = localStorage.getItem(`cart_${sessionId}`);
      let cartData = storedCart ? JSON.parse(storedCart) : { items: [], totalItems: 0, totalAmount: 0 };
      
      cartData.items = cartData.items.filter(item => item.product._id !== productId);
      
      // Recalculate totals
      cartData.totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
      cartData.totalAmount = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Save to localStorage
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cartData));
      setCart(cartData);
      
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      const errorMessage = error.message || 'Failed to remove item';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const cartData = { items: [], totalItems: 0, totalAmount: 0 };
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cartData));
      setCart(cartData);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error.message || 'Failed to clear cart';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cart?.totalItems || 0;
  };

  const getCartTotal = () => {
    return cart?.totalAmount || 0;
  };

  const value = {
    cart,
    loading,
    sessionId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    refreshCart: () => loadCart(sessionId)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
