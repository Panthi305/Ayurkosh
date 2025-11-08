import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaHeartBroken } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./WishlistPage.css";

const WishlistPage = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError("Please log in to view your wishlist.");
            return;
        }

        const fetchWishlist = async () => {
            try {
                const res = await fetch(
                    `https://ayurkosh-backend.onrender.com/get_wishlist_details?userId=${userId}`
                );
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setWishlistProducts(data);
                    setError(null);
                } else {
                    setWishlistProducts([]);
                    setError("No products found in wishlist.");
                }
            } catch (err) {
                console.error("Error fetching wishlist:", err);
                setError("Failed to load wishlist. Please try again.");
            }
        };

        fetchWishlist();
    }, [userId]);

    const handleCardClick = (prod) => {
        navigate("/shop", { state: { openProduct: prod } });
    };

    const removeFromWishlist = async (productId, e) => {
        e.stopPropagation(); // Prevent card click navigation
        if (!userId) {
            alert("Please log in to use wishlist.");
            return;
        }

        try {
            const res = await fetch("https://ayurkosh-backend.onrender.com/wishlist_remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, productId }),
            });

            const data = await res.json();
            if (res.ok) {
                setWishlistProducts((prev) =>
                    prev.filter((item) => item._id !== productId)
                );
            } else {
                alert(data.error || "Failed to remove from wishlist.");
            }
        } catch (err) {
            console.error("Remove from wishlist failed", err);
            alert("Failed to update wishlist.");
        }
    };

    return (
        <div className="wishlist-container">
            {/* Header */}
            <header className="wishlist-header">
                <button
                    className="back-btn"
                    onClick={() => {
                        if (window.history.state && window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate("/dashboard");
                        }
                    }}
                    aria-label="Go back"
                >
                    <FaArrowLeft /> Back
                </button>

                <div className="header-content">
                    <h1>My Wishlist</h1>
                    <p className="subtitle">
                        Products you’ve marked for future purchase
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="wishlist-main">
                {error ? (
                    <div className="error-state">
                        <FaHeartBroken size={40} />
                        <p>{error}</p>
                    </div>
                ) : wishlistProducts.length === 0 ? (
                    <div className="empty-state">
                        <FaHeartBroken className="empty-icon" size={48} />
                        <h3>No products in wishlist</h3>
                        <p>Browse our store to start adding your favourites.</p>
                        <button
                            className="explore-btn"
                            onClick={() => navigate("/shop")}
                            aria-label="Browse shop"
                        >
                            Browse Shop
                        </button>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="wishlist-grid">
                            {wishlistProducts.map((prod) => (
                                <motion.div
                                    key={prod._id}
                                    className="wishlist-card"
                                    role="button"
                                    tabIndex={0}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => handleCardClick(prod)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            handleCardClick(prod);
                                        }
                                    }}
                                >
                                    <div className="wishlist-image-container">
                                        {prod.image ? (
                                            <img
                                                src={prod.image}
                                                alt={prod.name || "Wishlist product"}
                                                className="wishlist-image"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="image-placeholder">No Image</div>
                                        )}
                                        <button
                                            className="remove-wishlist-btn"
                                            onClick={(e) => removeFromWishlist(prod._id, e)}
                                            aria-label={`Remove ${prod.name || "product"} from wishlist`}
                                            title="Remove from wishlist"
                                        >
                                            <FaHeartBroken />
                                        </button>
                                    </div>

                                    <div className="wishlist-info">
                                        <h3>{prod.name || "Unknown Product"}</h3>
                                        <p className="wishlist-category">
                                            {prod.category || "Unknown Category"}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default WishlistPage;
