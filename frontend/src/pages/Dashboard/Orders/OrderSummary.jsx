import React from "react";
import "./OrderSummary.css";

const OrderSummary = ({ cartItems, appliedDiscount = 0 }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;

  // Calculate total after discount (ensure discount doesn't exceed subtotal)
  const discount = appliedDiscount > subtotal ? subtotal : appliedDiscount;
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="summary-box">
      <h2 className="summary-title">Order Summary</h2>
      <div className="summary-items">
        {cartItems.map((item) => (
          <div key={item.order_id} className="summary-item">
            <img src={item.image} alt={item.name} className="summary-item-image" />
            <div className="summary-item-info">
              <p className="summary-item-name">{item.name}</p>
              <p className="summary-item-sku">SKU: {item.order_id}</p>
              <p className="summary-item-qty">Qty: {item.quantity}</p>
            </div>
            <p className="summary-item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="summary-totals">
        <div className="total-line">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="total-line">
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>
        <div className="total-line">
          <span>Tax</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="total-line">
          <span>Discount</span>
          <span>-₹{discount.toFixed(2)}</span>
        </div>
        <div className="total-line grand-total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
