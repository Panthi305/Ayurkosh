import React, { useState } from "react";
import "./ReviewOrder.css";

const ReviewOrder = ({ cartItems, shippingInfo, paymentMethod, onBack, onPlaceOrder }) => {
    const [agree, setAgree] = useState(false);

    // If paymentMethod was passed as object, extract the actual method string
    const methodLabel = typeof paymentMethod === "object"
        ? paymentMethod.paymentMethod
        : paymentMethod;

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0;
    const tax = +(subtotal * 0.08).toFixed(2); // Example 8% tax
    const total = (subtotal + shipping + tax).toFixed(2);

    // In ReviewOrder.jsx
    const handlePlaceOrder = async () => {
        const userId = localStorage.getItem("userId");
        const email = localStorage.getItem("userEmail");

        try {
            const res = await fetch("https://ayurkosh-backend.onrender.com/api/orders/place", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, email, shippingInfo })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to place order");

            alert("✅ Order placed successfully!");
            onPlaceOrder();
        } catch (err) {
            alert(err.message);
        }
    };


    return (
        <div className="review-container">
            {/* Left Section */}
            <div className="review-main">
                <h2 className="review-title">Review Your Order</h2>

                {/* Order Items */}
                <div className="review-section">
                    <h3>Order Items</h3>
                    {cartItems.map((item, index) => (
                        <div key={index} className="review-item">
                            <div className="item-details">
                                <img src={item.image || "/placeholder.png"} alt={item.name} />
                                <div>
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-qty">Qty: {item.quantity}</div>
                                </div>
                            </div>
                            <div className="item-price">
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Shipping Address */}
                <div className="review-section">
                    <h3>Shipping Address</h3>
                    <div className="review-box">
                        <div>{shippingInfo?.fullName}</div>
                        <div>{shippingInfo?.address}</div>
                        <div>
                            {shippingInfo?.city}, {shippingInfo?.postalCode}
                        </div>
                        {/* country optional */}
                        {shippingInfo?.country && <div>{shippingInfo.country}</div>}
                        <div className="shipping-method">
                            Standard Shipping (5–7 days)
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="review-section">
                    <h3>Payment Method</h3>
                    <div className="review-box">{methodLabel}</div>
                </div>

                {/* Order Summary */}
                <div className="review-section">
                    <h3>Order Summary</h3>
                    <div className="review-box">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>₹{shipping.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <strong>Total</strong>
                            <strong>₹{total}</strong>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="review-terms">
                    <label>
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                        />{" "}
                        I agree to the <a href="#">Terms and Conditions</a> and{" "}
                        <a href="#">Privacy Policy</a>
                    </label>
                </div>

                {/* Buttons */}
                <div className="review-buttons">
                    <button className="back-btn" onClick={onBack}>Back to Payment</button>
                    <button
                        className="place-btn"
                        onClick={handlePlaceOrder}
                        disabled={!agree}
                    >
                        Place Order
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ReviewOrder;
