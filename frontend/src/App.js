import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Export from './pages/Export';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="/order/:orderId" element={<OrderDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/export" element={<Export />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </main>
              <footer className="footer">
                <div className="container">
                  <p>&copy; 2024 Coorg Masala & Coffee. All rights reserved.</p>
                  <p>Premium organic Indian spices and authentic Coorg coffee - Exporting to Germany, Europe, USA, Dubai & Worldwide</p>
                  <p>
                    <a href="/export" style={{ color: '#fff', marginRight: '15px' }}>Export Information</a>
                    <a href="/contact" style={{ color: '#fff', marginRight: '15px' }}>Contact Us</a>
                    <a href="/about" style={{ color: '#fff' }}>About Us</a>
                  </p>
                </div>
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
