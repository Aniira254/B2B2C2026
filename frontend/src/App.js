import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SalesRepDashboard from './components/SalesRepDashboard';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderPlacement from './components/OrderPlacement';
import OrderHistory from './components/OrderHistory';
import Profile from './components/Profile';
import Announcements from './components/Announcements';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Navbar />
            <div className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/sales-rep-dashboard"
                  element={
                    <PrivateRoute>
                      <SalesRepDashboard />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/products"
                  element={
                    <PrivateRoute>
                      <ProductList />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/products/on-sale"
                  element={
                    <PrivateRoute>
                      <ProductList specialSection="on-sale" />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/products/new-arrivals"
                  element={
                    <PrivateRoute>
                      <ProductList specialSection="new-arrivals" />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/products/special-offers"
                  element={
                    <PrivateRoute>
                      <ProductList specialSection="special-offers" />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/cart"
                  element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <OrderPlacement />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <OrderHistory />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/announcements"
                  element={
                    <PrivateRoute>
                      <Announcements />
                    </PrivateRoute>
                  }
                />
                
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
