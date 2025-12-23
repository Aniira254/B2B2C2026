import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const handleQuantityChange = (productId, change) => {
    const item = cart.find((item) => item.productId === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <FaShoppingCart />
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <button onClick={clearCart} className="btn btn-secondary">
          Clear Cart
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="item-image">
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>

              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">${item.price.toFixed(2)} each</p>
              </div>

              <div className="item-quantity">
                <button
                  onClick={() => handleQuantityChange(item.productId, -1)}
                  className="btn-quantity"
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.productId, 1)}
                  className="btn-quantity"
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>

              <div className="item-total">
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>

              <button
                onClick={() => removeFromCart(item.productId)}
                className="btn-remove"
                aria-label="Remove item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal ({cart.length} items)</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>

          <button onClick={handleCheckout} className="btn btn-checkout">
            Proceed to Checkout
          </button>

          <button
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
