import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaClipboardList,
  FaUser,
  FaBullhorn,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (!isAuthenticated) {
    return null;
  }

  // Check if user is a sales representative
  const isSalesRep = user?.userType === 'sales_representative';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo" onClick={closeMobileMenu}>
          <FaBox /> B2B2C Store
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to={isSalesRep ? "/sales-rep-dashboard" : "/dashboard"} onClick={closeMobileMenu}>
              <FaHome /> Dashboard
            </Link>
          </li>
          
          {!isSalesRep && (
            <>
              <li>
                <Link to="/products" onClick={closeMobileMenu}>
                  <FaBox /> Products
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={closeMobileMenu} className="cart-link">
                  <FaShoppingCart />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={closeMobileMenu}>
                  <FaClipboardList /> Orders
                </Link>
              </li>
            </>
          )}
          
          <li>
            <Link to="/announcements" onClick={closeMobileMenu}>
              <FaBullhorn /> Announcements
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={closeMobileMenu}>
              <FaUser /> Profile
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>

        {user && (
          <div className="navbar-user">
            <span className="user-name">
              {user.firstName} {user.lastName}
            </span>
            <span className="user-role">
              {isSalesRep ? 'Sales_representative' : user.userType}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
