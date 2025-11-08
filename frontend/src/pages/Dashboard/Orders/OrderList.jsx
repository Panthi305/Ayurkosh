import { useCallback, useEffect, useState } from "react";
import "./OrderList.css";
import React from "react";

const OrderList = ({
    cartItems: initialCartItems,
    onContinue,
    onUpdateCart,
    appliedDiscount,
    setAppliedDiscount,
    appliedCoupon,
    setAppliedCoupon,
}) => {
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [couponCode, setCouponCode] = useState("");
    const [couponSuggestions, setCouponSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    const userId = localStorage.getItem("userId") || "";
    const email = localStorage.getItem("userEmail") || "";

    const checkAuth = useCallback(() => {
        if (!userId || !email) {
            setError("Please log in to manage your orders.");
            return false;
        }
        return true;
    }, [userId, email]);

    const calculateSubtotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${userId}`, {
                credentials: "include",
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to fetch orders");
            }
            const data = await response.json();
            setCartItems(data.orders || []);
            onUpdateCart(data.orders || []);
            setError(null);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError(error.message);
        }
    };

    const handleQuantityChange = async (productId, delta) => {
        if (!checkAuth()) return;
        if (!productId) {
            setError("Invalid product ID");
            return;
        }

        const item = cartItems.find((i) => i.product_id === productId);
        if (!item) {
            setError("Item not found in orders");
            return;
        }

        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
            handleRemoveItem(productId);
            return;
        }

        if (delta > 0 && newQuantity - item.quantity > item.stock) {
            setError(`Cannot add more; only ${item.stock} items in stock`);
            return;
        }

        const payload = {
            userId,
            email,
            product_id: productId,
            quantity: newQuantity,
        };

        try {
            const res = await fetch("http://localhost:5000/api/orders/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || "Failed to update quantity");
            }

            await fetchOrders();
            setError(null);
            setSuccessMessage("Quantity updated successfully");
        } catch (error) {
            console.error("Error updating quantity:", error);
            setError(error.message);
        }
    };

const handleRemoveItem = async (productId) => {
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("userEmail");

  if (!userId || !email) {
    alert("User not logged in");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/orders/remove", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, email, product_id: productId }),
});

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to remove item");

    alert("Item removed successfully");
    await fetchOrders(); // refresh order list
  } catch (error) {
    alert("Error removing item: " + error.message);
  }
};

    const fetchCouponSuggestions = async () => {
        if (!checkAuth() || isFetchingSuggestions) return;
        setIsFetchingSuggestions(true);
        try {
            const subtotal = calculateSubtotal();
            const res = await fetch(
                `http://localhost:5000/api/coupons/suggestions?userEmail=${encodeURIComponent(
                    email
                )}&orderTotal=${subtotal}`,
                { credentials: "include" }
            );
            if (!res.ok) {
                const text = await res.text();
                console.error("Suggestions response:", text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            const data = await res.json();
            setCouponSuggestions(data);
            setError(null);
        } catch (error) {
            console.error("Error fetching suggestions:", error.message);
            setError("Failed to load coupon suggestions. Please try again.");
        } finally {
            setIsFetchingSuggestions(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!checkAuth() || !couponCode) {
            setError("Please enter a coupon code");
            return;
        }
        try {
            const subtotal = calculateSubtotal();
            const res = await fetch("http://localhost:5000/api/coupons/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, userId, userEmail: email, orderTotal: subtotal }),
                credentials: "include",
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || "Failed to apply coupon");
            }
            const data = await res.json();
            setAppliedDiscount(data.discount);
            setAppliedCoupon(data.coupon);
            setSuccessMessage(data.message);
            setError(null);
            setCouponCode("");
        } catch (error) {
            console.error("Error applying coupon:", error);
            setError(error.message);
            setAppliedDiscount(0);
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedDiscount(0);
        setAppliedCoupon(null);
        setSuccessMessage("Coupon removed");
        setError(null);
    };

    const handleCheckout = () => {
        if (!checkAuth() || cartItems.length === 0) {
            setError("Cannot proceed with an empty order or without logging in");
            return;
        }
        setError(null);
        setSuccessMessage("Proceeding to shipping...");
        setTimeout(() => {
            onContinue({ appliedCoupon, discount: appliedDiscount });
        }, 1000);
    };

    useEffect(() => {
        setCartItems(initialCartItems);
        fetchCouponSuggestions();
    }, [JSON.stringify(initialCartItems)]); // stabilize dependency

    return (
        <div className="order-list-container">
            <h2 className="order-list-title">Review Your Order</h2>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="order-items">
                {cartItems.length === 0 ? (
                    <p>Your order is empty.</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.product_id} className="order-item">
                            <div className="order-item-details">
                                <img src={item.image} alt={item.name} className="order-item-image" />
                                <div className="order-item-info">
                                    <p>{item.name}</p>
                                    <p>SKU: {item.product_id}</p>
                                    <p>₹{item.price.toFixed(2)}</p>
                                    
                                </div>
                            </div>
                            <div className="order-item-quantity">
                                <button
                                    className={`quantity-btn ${item.quantity === 1 ? "delete" : ""}`}
                                    onClick={() =>
                                        item.quantity === 1
                                            ? handleRemoveItem(item.product_id)
                                            : handleQuantityChange(item.product_id, -1)
                                    }
                                >
                                    {item.quantity === 1 ? "×" : "-"}
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    className="quantity-btn"
                                    onClick={() => handleQuantityChange(item.product_id, 1)}
                                    disabled={item.quantity >= item.stock}
                                >
                                    +
                                </button>
                                <p className="order-item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cartItems.length > 0 && (
                <>
                    <div className="coupon-section">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            className="coupon-input"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <button className="apply-btn" onClick={handleApplyCoupon}>
                            Apply
                        </button>
                        {appliedCoupon && (
                            <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                                Remove Coupon
                            </button>
                        )}
                    </div>

                    {appliedCoupon && (
                        <p className="applied-coupon">
                            Applied: {appliedCoupon.code} (
                            {appliedCoupon.discountType === "percentage"
                                ? `${appliedCoupon.discountValue}%`
                                : `₹${appliedCoupon.discountValue}`}
                            ) - Discount: ₹{appliedDiscount.toFixed(2)}
                        </p>
                    )}

                    <div className="coupon-suggestions">
                        <h3>Suggested Coupons</h3>
                        {couponSuggestions.length > 0 ? (
                            <ul>
                                {couponSuggestions.map((c) => (
                                    <li key={c.code}>
                                        {c.code} -{" "}
                                        {c.discountType === "percentage"
                                            ? `${c.discountValue}% off`
                                            : `₹${c.discountValue} off`}{" "}
                                        (Min: ₹{c.minOrderAmount}, Expires: {new Date(c.expirationDate).toLocaleDateString()})
                                        <button className="use-coupon-btn" onClick={() => setCouponCode(c.code)}>
                                            Use
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No suggestions available.</p>
                        )}
                    </div>
                    <button className="continue-btn" onClick={handleCheckout}>
                        Proceed to Checkout
                    </button>
                </>
            )}
        </div>
    );
};

export default OrderList;
