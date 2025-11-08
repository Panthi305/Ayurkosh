import React, { useState, useEffect } from "react";
import OrderList from "./OrderList";
import ShippingInfo from "./ShippingInfo";
import OrderSummary from "./OrderSummary";
import PaymentInfo from "./PaymentInfo";
import ReviewOrder from "./ReviewOrder";
import "./Orders.css";

const Orders = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const steps = [
    { label: "Order", icon: "🛒" }, // Changed "Cart" to "Order" for clarity
    { label: "Shipping", icon: "📦" },
    { label: "Payment", icon: "💳" },
    { label: "Review", icon: "🔍" },
    { label: "Confirmation", icon: "✅" },
  ];

  useEffect(() => {
    if (!userId) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${userId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch orders.");
        }
        const data = await response.json();
        setCartItems(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleUpdateCart = (updatedCart) => {
    setCartItems(updatedCart); // Update parent state
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-message">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-wrapper">
        <h1 className="orders-title">Checkout</h1>
        {/* Stepper */}
        <div className="orders-steps">
          <div
            className="progress-line"
            style={{
              width: `${(activeStep / (steps.length - 1)) * 100}%`,
            }}
          ></div>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index < activeStep
                ? "completed"
                : index === activeStep
                  ? "active"
                  : ""
                }`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
        {/* Main Content */}
        <div className="orders-content">
          <div className="orders-main">
            {activeStep === 0 && (
              <OrderList
                cartItems={cartItems}
                onContinue={() => setActiveStep(1)}
                onUpdateCart={handleUpdateCart}
                appliedDiscount={appliedDiscount}
                setAppliedDiscount={setAppliedDiscount}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
              />

            )}
            {activeStep === 1 && (
              <ShippingInfo
                onBack={() => setActiveStep(0)}
                onContinue={(data) => {
                  setShippingInfo(data);
                  setActiveStep(2);
                }}
              />
            )}
            {activeStep === 2 && (
  <PaymentInfo
    onBack={() => setActiveStep(1)}
    onContinue={(paymentData) => {
      setPaymentMethod(paymentData);
      setActiveStep(3);
    }}
  />
)}
            {activeStep === 3 && (
              <ReviewOrder
                cartItems={cartItems}
                shippingInfo={shippingInfo}
                paymentMethod={paymentMethod}
                onBack={() => setActiveStep(2)}
                onPlaceOrder={() => setActiveStep(4)}
              />
            )}
            {activeStep === 4 && (
              <div>
                <h2>✅ Order Confirmed!</h2>
                <p>Thank you for your purchase.</p>
              </div>
            )}
          </div>
          <div className="orders-summary">
            <OrderSummary cartItems={cartItems} appliedDiscount={appliedDiscount} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;