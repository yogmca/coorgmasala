import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import './App.css';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container">
              <p>&copy; 2024 Coorg Spices. All rights reserved.</p>
              <p>Premium Indian spices from the heart of Coorg</p>
            </div>
          </footer>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
