import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = ({ isOpen, onClose, refreshCart }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const userEmail = localStorage.getItem("userEmail");
  const userId = localStorage.getItem("userId");

  console.log('Cart component rendered, isOpen:', isOpen, 'userId:', userId, 'userEmail:', userEmail);

  useEffect(() => {
    console.log('useEffect triggered, isOpen:', isOpen, 'userId:', userId);
    if (!isOpen || !userEmail || !userId) {
      console.log('Skipping fetch: Cart not open or user not logged in');
      setLoading(false);
      setCart([]);
      return;
    }
    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/cart/${userId}`, { credentials: 'include' });
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Failed to fetch cart';
          if (contentType && contentType.includes('application/json')) {
            const err = await response.json();
            errorMessage = err.error || errorMessage;
          } else {
            errorMessage = `Server returned ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        console.log('Cart fetched:', data);
        setCart(data.cart || []);
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart:', error.message);
        setError(error.message);
        setCart([]);
        setLoading(false);
      }
    };
    fetchCart();
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, userEmail, userId, refreshCart]);

  const updateQuantity = async (productId, quantity) => {
    if (!productId) {
      console.error('Product ID is missing');
      setError('Product ID is missing');
      return;
    }
    const payload = { userId: userId, email: userEmail, product_id: productId, quantity };
    console.log('Updating quantity, payload:', payload);

    try {
      if (quantity < 1) {
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: userEmail, product_id: productId }),
          credentials: 'include',
        });
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Failed to remove item';
          if (contentType && contentType.includes('application/json')) {
            const err = await response.json();
            errorMessage = err.error || errorMessage;
          } else {
            errorMessage = `Server returned ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        console.log('Item removed:', data);
        setCart(cart.filter(item => item._id !== productId));
        setSuccessMessage('Item removed from cart');
        setError(null);
      } else {
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Failed to update cart';
          if (contentType && contentType.includes('application/json')) {
            const err = await response.json();
            errorMessage = err.error || errorMessage;
          } else {
            errorMessage = `Server returned ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        if (data.error) {
          console.error('Error from server:', data.error);
          setError(data.error);
          return;
        }
        console.log('Cart updated:', data);
        setCart(cart.map(item =>
          item._id === productId ? { ...item, quantity } : item
        ));
        setError(null);
      }
    } catch (error) {
      console.error('Error updating/removing item:', error.message);
      setError(error.message);
    }
  };

  const handleCheckout = async () => {
    if (!userEmail || !userId || cart.length === 0) {
      setError('Cannot proceed to checkout. Ensure you are logged in and your cart is not empty.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: userEmail }),
        credentials: 'include',
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to complete checkout';
        if (contentType && contentType.includes('application/json')) {
          const err = await response.json();
          errorMessage = err.error || errorMessage;
        } else {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Checkout successful:', data);
      setCart([]);
      setSuccessMessage('Purchase completed successfully! Redirecting to orders...');
      setTimeout(() => {
        onClose();
        navigate('/dashboard', { state: { activeView: 'orders' } });
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error.message);
      setError(error.message);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  if (!isOpen) {
    console.log('Cart not rendered, isOpen is false');
    return null;
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button className="close-button" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p className="loading">Loading...</p>
      ) : cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="shop-now-button" onClick={onClose}>Shop Now</button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">₹{item.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={!userEmail || !userId}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock || !userEmail || !userId}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: ₹{calculateTotal()}</h3>
            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={!userEmail || !userId || cart.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;