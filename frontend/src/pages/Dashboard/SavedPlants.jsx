import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./SavedPlants.css";

const SavedPlant = () => {
    const [savedPlants, setSavedPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    // Fetch saved plants
    const fetchSavedPlants = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/get_saved_plants?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSavedPlants(data);
            }
        } catch (err) {
            console.error("Error fetching saved plants:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPlants();
    }, [userId]);

    // Handle clicking on a plant card
    const handleCardClick = (plant) => {
        localStorage.setItem("searchResult", JSON.stringify(plant));
        navigate("/search-result");
    };

    // Handle unsave plant
    const handleUnsavePlant = async (commonName) => {
        if (!userId) {
            alert("You must be logged in to unsave plants.");
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/unsave_plant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, common_name: commonName }),
            });
            const data = await res.json();
            if (res.ok) {
                // Animate removal
                setSavedPlants((prev) => prev.filter((p) => p.common_name !== commonName));
            } else {
                alert(data.error || "Failed to unsave plant");
            }
        } catch (err) {
            console.error("Unsave error:", err);
        }
    };

    return (
        <div className="saved-plants-container">
            {/* Header Section */}
            <header className="saved-plants-header">
                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                    aria-label="Back to Dashboard"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>

                <div className="header-content">
                    <h1>Your Plant Collection</h1>
                    <p className="subtitle">Plants you've saved for future reference</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="saved-plants-main">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading your plants...</p>
                    </div>
                ) : savedPlants.length === 0 ? (
                    <div className="empty-state">
                        <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3h18v18H3z"></path>
                            <path d="M12 8v4"></path>
                            <path d="M12 16h.01"></path>
                        </svg>
                        <h3>No Saved Plants Yet</h3>
                        <p>Start exploring and save plants to see them here</p>
                        <button
                            className="explore-btn"
                            onClick={() => {
                                localStorage.removeItem("searchResult");
                                navigate("/search-result");
                            }}
                        >
                            Explore Plants
                        </button>

                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="plant-grid">
                            {savedPlants.map((plant, index) => (
                                <motion.div
                                    key={plant.common_name}
                                    className="plant-card"
                                    role="button"
                                    tabIndex={0}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={(e) => {
                                        if (!e.target.closest(".unsave-btn")) {
                                            handleCardClick(plant);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            handleCardClick(plant);
                                        }
                                    }}
                                >
                                    <div className="plant-image-container">
                                        {plant.images?.[0] ? (
                                            <img
                                                src={plant.images[0]}
                                                alt={plant.common_name || "Plant"}
                                                className="plant-image"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="plant-info">
                                        <h3>{plant.common_name || "Unnamed Plant"}</h3>
                                        <p className="botanical-name">{plant.botanical_name || "No botanical name"}</p>
                                    </div>
                                    <button
                                        className="unsave-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnsavePlant(plant.common_name);
                                        }}
                                        aria-label={`Unsave ${plant.common_name}`}
                                    >
                                        <svg
                                            className="save-icon saved"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
                                        </svg>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default SavedPlant;