import { useEffect, useState } from "react";
import "./ShippingInfo.css";
import React from "react";

const ShippingInfo = ({ onBack, onContinue }) => {
  // ✅ Read correct keys from localStorage as set during login
  const storedUserId = localStorage.getItem("userId") || "";
  const email = localStorage.getItem("userEmail") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    shippingOption: "standard",
  });

  // Fetch saved shipping info or user profile
  useEffect(() => {
    if (storedUserId) {
      fetch(`http://localhost:5000/shopping-info/${storedUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setFormData((prev) => ({ ...prev, ...data }));
          }
        })
        .catch((err) =>
          console.error("Error fetching shipping info:", err)
        );
    }
  }, [storedUserId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinue = () => {
    if (!storedUserId || !email) {
      alert("Error: User credentials not found in localStorage");
      return;
    }

    const payload = {
      userId: storedUserId,
      email,
      ...formData,
    };

    fetch("http://localhost:5000/shopping-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          onContinue(formData); // continue to payment
        } else {
          alert(data.error);
        }
      })
      .catch((err) =>
        console.error("Error saving shipping info:", err)
      );
  };

  return (
    <div className="shipping-container">
      <h2 className="shipping-title">Shipping Information</h2>

      <form className="shipping-form" onSubmit={(e) => e.preventDefault()}>
        <label>Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />

        <label>Address *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="shipping-row">
          <div>
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Postal Code *</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="shipping-options-title">Shipping Options</h3>
        <div className="shipping-option">
          <input
            type="radio"
            id="standard"
            name="shippingOption"
            value="standard"
            checked={formData.shippingOption === "standard"}
            onChange={handleChange}
          />
          <label htmlFor="standard">
            Standard Shipping - FREE (5-7 business days)
          </label>
        </div>

        <div className="shipping-option">
          <input
            type="radio"
            id="express"
            name="shippingOption"
            value="express"
            checked={formData.shippingOption === "express"}
            onChange={handleChange}
          />
          <label htmlFor="express">
            Express Shipping - ₹500 (2-3 business days)
          </label>
        </div>

        <div className="shipping-buttons">
          <button type="button" className="back-btn" onClick={onBack}>
            Back to Cart
          </button>
          <button
            type="button"
            className="continue-btn"
            onClick={handleContinue}
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingInfo;
