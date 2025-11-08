import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./SearchResult.css";

// Utility function for debouncing
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const SearchResult = () => {
    const [query, setQuery] = useState("");
    const [plant, setPlant] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");
    const [viewMode, setViewMode] = useState("grid");
    const [expandedSections, setExpandedSections] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false); // ✅ NEW - track save state
    const userId = localStorage.getItem("userId"); // ✅ from login


    // Debounced fetchSuggestions
    const fetchSuggestions = useCallback(
        debounce(async (input) => {
            if (!input.trim()) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`http://localhost:5000/api/suggest-plants?query=${encodeURIComponent(input)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("Suggestion error:", err);
                setSuggestions([]);
            }
        }, 300), // 300ms debounce delay
        []
    );

    useEffect(() => {
        const stored = localStorage.getItem("searchResult");
        if (stored) {
            try {
                setPlant(JSON.parse(stored));
                document.body.style.background = "var(--cream-green)";
            } catch (err) {
                console.error("Failed to parse stored plant data:", err);
                setError("Failed to load stored data.");
            }
        }
    }, []);


    useEffect(() => {
        const checkSaved = async () => {
            if (userId && plant?.common_name) {
                try {
                    const res = await fetch(`http://localhost:5000/get_saved_plants?userId=${userId}`);
                    if (res.ok) {
                        const savedList = await res.json();
                        const exists = savedList.some(p => p.common_name === plant.common_name);
                        setIsSaved(exists);
                    }
                } catch (err) {
                    console.error("Error checking saved status:", err);
                }
            }
        };
        checkSaved();
    }, [plant, userId]);


    const recordSearch = async (plantData) => {
        try {
            await fetch("http://localhost:5000/record_search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, plant: plantData })
            });
        } catch (err) {
            console.error("Error recording search history:", err);
        }
    };


    const handleToggleSavePlant = async () => {
        if (!userId) {
            alert("You must be logged in to save plants.");
            return;
        }
        const url = isSaved ? "unsave_plant" : "save_plant";
        const payload = isSaved
            ? { userId, common_name: plant.common_name }
            : { userId, plant: plant };

        try {
            const res = await fetch(`http://localhost:5000/${url}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setIsSaved(!isSaved);
            } else {
                alert(data.error || "Action failed");
            }
        } catch (err) {
            console.error("Save/Unsave error:", err);
        }
    };
    const handleDownloadPDF = async (commonName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/generate-pdf?name=${encodeURIComponent(commonName)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/pdf",
                },
            });
            if (!response.ok) throw new Error("Failed to generate PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${commonName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            setError("Failed to download PDF. Please try again.");
        }
    };

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) {
            setError("Please enter a valid plant name.");
            setSuggestions([]);
            return;
        }
        setLoading(true);
        setError(null);
        setPlant(null);
        setSuggestions([]); // Clear suggestions on search

        try {
            const res = await fetch(`http://localhost:5000/api/search-plant?name=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) {
                throw new Error(res.status === 404 ? "No plant found for this name." : "Server error occurred.");
            }
            const data = await res.json();
            if (!data || Object.keys(data).length === 0) {
                throw new Error("No plant data returned.");
            }
            localStorage.setItem("searchResult", JSON.stringify(data));
            setPlant(data);
            setActiveTab("summary");
            setExpandedSections({});
            setCurrentImageIndex(0);
            document.body.style.background = "var(--cream-green)";
            if (userId) {
                recordSearch(data);
            }
        } catch (err) {
            console.error("Search error:", err);
            setError(err.message || "Failed to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = useCallback((section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    }, []);

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? plant.images.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex + 1) % plant.images.length
        );
    };

    const InfoTable = React.memo(({ items, title }) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="info-table-container">
                {title && <h3 className="table-title">{title}</h3>}
                <table className="info-table">
                    <tbody>
                        {items.map((item, index) => {
                            if (!item.value || (Array.isArray(item.value) && item.value.length === 0) || (typeof item.value === "object" && Object.keys(item.value).length === 0)) {
                                return null;
                            }

                            const formatValue = () => {
                                if (typeof item.value === "object" && item.value !== null) {
                                    if (Array.isArray(item.value)) {
                                        return item.value.join(", ");
                                    }
                                    return Object.entries(item.value)
                                        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                                        .join(", ");
                                }
                                return String(item.value);
                            };

                            return (
                                <tr key={`${item.label}-${index}`}>
                                    <th>{item.label}</th>
                                    <td>{formatValue()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    });

    const CollapsibleSection = React.memo(({ label, content, sectionKey }) => {
        const isExpanded = expandedSections[sectionKey] || false;

        return (
            <div className="collapsible-section">
                <button
                    className="collapsible-toggle"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isExpanded}
                >
                    <span>{label}</span>
                    <motion.span
                        className="toggle-icon"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isExpanded ? "−" : "+"}
                    </motion.span>
                </button>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="collapsible-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <p>{content}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    });

    const RatingDisplay = React.memo(({ rating, label }) => {
        if (!rating) return null;
        return (
            <div className="rating">
                <div className="stars">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span
                            key={`star-${label}-${i}`}
                            className={`star ${i < rating ? "filled" : ""}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <span>{label}</span>
            </div>
        );
    });

    const SectionContent = React.memo(({ section }) => {
        if (!plant) return <div className="section-content">No data available.</div>;

        const sections = {
            summary: [
                {
                    type: "table",
                    title: "Summary",
                    items: [
                        { label: "Overview", value: plant?.summary || "No summary available" },
                        { label: "Genus", value: plant?.genus },
                        { label: "Flowering Season", value: plant?.flowering_season },
                        { label: "Fruiting Season", value: plant?.fruiting_season },
                        { label: "Conservation Status", value: plant?.conservation_status },
                        { label: "Featured", value: plant?.featured ? "Yes" : "No" },
                    ],
                },
            ],
            cultivation: [
                {
                    type: "table",
                    title: "Cultivation Details",
                    items: [
                        { label: "Sun Exposure", value: plant?.sun_exposure },
                        { label: "Soil Type", value: plant?.soil_type },
                        { label: "Water Needs", value: plant?.water_needs },
                        { label: "Temperature Range", value: plant?.temperature_range },
                        { label: "Harvesting Time", value: plant?.harvesting_time },
                        { label: "Propagation Methods", value: plant?.propagation_methods },
                    ],
                },
                { type: "collapsible", label: "Care Tips", value: plant?.care_tips, key: "care_tips" },
                {
                    type: "collapsible",
                    label: "Additional Details",
                    value: plant?.cultivation_details,
                    key: "cultivation_details",
                },
            ],
            medicinal: [
                {
                    type: "table",
                    title: "Medicinal Information",
                    items: [
                        { label: "Medicinal Uses", value: plant?.medicinal_uses },
                        { label: "Medicinal Properties", value: plant?.medicinal_properties },
                        { label: "Edible Parts", value: plant?.edible_parts },
                        { label: "Edible Uses", value: plant?.edible_uses },
                        { label: "Other Uses", value: plant?.other_uses },
                        { label: "Usage Parts", value: plant?.usage_parts },
                    ],
                },
                {
                    type: "collapsible",
                    label: "Medicinal Description",
                    value: plant?.medicinal_description,
                    key: "medicinal_description",
                },
                {
                    type: "collapsible",
                    label: "Edible Description",
                    value: plant?.edible_parts_description,
                    key: "edible_description",
                },
            ],
            botanical: [
                {
                    type: "table",
                    title: "Botanical Characteristics",
                    items: [
                        { label: "Plant Type", value: plant?.plant_type },
                        { label: "Leaf Type", value: plant?.leaf_type },
                        { label: "Habit", value: plant?.habit },
                        { label: "USDA Hardiness Zone", value: plant?.usda_hardiness_zone },
                        { label: "Physical Characteristics", value: plant?.physical_characteristics },
                    ],
                },
            ],
            hazards: [
                {
                    type: "table",
                    title: "Hazards & Storage",
                    items: [
                        { label: "Known Hazards", value: plant?.known_hazards || "No known hazards recorded" },
                        { label: "Storage", value: plant?.storage },
                        { label: "Weed Potential", value: plant?.weed_potential },
                    ],
                },
            ],
            distribution: [
                {
                    type: "table",
                    title: "Distribution",
                    items: [
                        { label: "Native Range", value: plant?.native_range || "No distribution information available" },
                        { label: "Language Names", value: plant?.language_local_names },
                        { label: "Other Names", value: plant?.other_names },
                        { label: "Traditional Systems", value: plant?.traditional_systems },
                        { label: "Search Tags", value: plant?.search_tags },
                        { label: "Slug", value: plant?.slug },
                    ],
                },
            ],
        };

        return (
            <div className="section-content">
                {sections[section]?.map((item, index) => (
                    <div key={`${item.label || `table-${index}`}`} className="section-item">
                        {item.type === "table" ? (
                            <InfoTable title={item.title} items={item.items} />
                        ) : (
                            <CollapsibleSection
                                label={item.label}
                                content={item.value}
                                sectionKey={item.key}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    });

    return (
        <div className="plant-encyclopedia">
            <header className="encyclopedia-header">
                <div className="header-container">
                    <button
                        className="nav-back"
                        onClick={() => navigate(-1)}
                        aria-label="Go Back"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <div className="search-module">
                        <div className={`search-container ${loading ? "searching" : ""}`}>
                            <input
                                type="text"
                                placeholder="Search botanical specimens..."
                                value={query}
                                onChange={(e) => {
                                    const input = e.target.value;
                                    setQuery(input);
                                    fetchSuggestions(input);
                                }}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                aria-label="Search for a plant"
                            />
                            {suggestions.length > 0 && (
                                <ul className="suggestion-list" role="listbox" aria-label="Plant suggestions">
                                    {suggestions.map((s, i) => (
                                        <li
                                            key={i}
                                            role="option"
                                            aria-selected={false}
                                            tabIndex={0}
                                            onClick={() => {
                                                setQuery(s.common_name);
                                                setSuggestions([]);
                                                handleSearch(s.common_name);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    setQuery(s.common_name);
                                                    setSuggestions([]);
                                                    handleSearch(s.common_name);
                                                }
                                            }}
                                        >
                                            <span className="suggestion-common-name">{s.common_name}</span>
                                            <span className="suggestion-botanical-name">{s.botanical_name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button onClick={() => handleSearch()} aria-label="Search">
                                {loading ? (
                                    <div className="clock-spinner"></div>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                        <path d="M19 19l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="view-toggle">
                        <button
                            className={viewMode === "grid" ? "active" : ""}
                            onClick={() => setViewMode("grid")}
                            aria-pressed={viewMode === "grid"}
                        >
                            Grid View
                        </button>
                        <button
                            className={viewMode === "journal" ? "active" : ""}
                            onClick={() => setViewMode("journal")}
                            aria-pressed={viewMode === "journal"}
                        >
                            Journal View
                        </button>
                    </div>
                </div>
            </header>

            <main className="encyclopedia-content">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {error}
                        </motion.div>
                    )}
                    {loading && (
                        <motion.div
                            className="loading-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="loading-animation">
                                <div className="clock-spinner"></div>
                                <p>Loading botanical data...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && !error && plant && (
                    <div className={`plant-dossier ${viewMode}`}>
                        <section className="specimen-hero">
                            <div
                                className="save-icon-container"
                                onClick={handleToggleSavePlant}
                                role="button"
                                tabIndex={0}
                                aria-label={isSaved ? "Remove from saved plants" : "Save plant to collection"}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") handleToggleSavePlant();
                                }}
                            >
                                <svg
                                    className={`save-icon ${isSaved ? "saved" : ""}`}
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
                                </svg>
                            </div>
                            <div className="hero-text">
                                <div className="taxonomy">
                                    <span className="family">{plant.family}</span>
                                    <h1>{plant.common_name || "Unknown Plant"}</h1>
                                    <p className="binomial">{plant.botanical_name || "Not available"}</p>
                                </div>
                                <div className="ratings-container">
                                    {plant.eligibility_rating && (
                                        <RatingDisplay label="Eligibility Rating" rating={plant.eligibility_rating} />
                                    )}
                                    {plant.medical_rating && (
                                        <RatingDisplay label="Medical Rating" rating={plant.medical_rating} />
                                    )}
                                    {plant.other_uses_rating && (
                                        <RatingDisplay label="Other Uses Rating" rating={plant.other_uses_rating} />
                                    )}
                                </div>
                                <button
                                    className="download-pdf-btn"
                                    onClick={() => handleDownloadPDF(plant.common_name)}
                                    disabled={loading || !plant.common_name}
                                    aria-label="Download plant information as PDF"
                                >
                                    Download as PDF
                                </button>
                            </div>
                            {plant.images?.length > 0 && (
                                <div className="hero-visual">
                                    <div className="carousel">
                                        {plant.images[currentImageIndex] &&
                                            /\.(jpe?g|png|gif|webp|svg|bmp|ico|cms)$/i.test(plant.images[currentImageIndex]) && (
                                                <img
                                                    src={plant.images[currentImageIndex]}
                                                    alt={`${plant.common_name || "Plant"} Image ${currentImageIndex + 1}`}
                                                    loading="lazy" />
                                            )}
                                        {plant.images.length > 1 && (
                                            <div className="carousel-controls">
                                                <button
                                                    className="carousel-button prev"
                                                    onClick={handlePrevImage}
                                                    aria-label="Previous Image"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="carousel-button next"
                                                    onClick={handleNextImage}
                                                    aria-label="Next Image"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        <nav className="dossier-tabs" role="tablist">
                            {["summary", "cultivation", "medicinal", "botanical", "hazards", "distribution"].map((tab) => (
                                <button
                                    key={tab}
                                    className={activeTab === tab ? "active" : ""}
                                    onClick={() => setActiveTab(tab)}
                                    aria-selected={activeTab === tab}
                                    role="tab"
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>

                        <div className="tab-content" role="tabpanel">
                            <SectionContent section={activeTab} />
                        </div>
                    </div>
                )}

                {!loading && !error && !plant && (
                    <div className="empty-state-wrapper">
                        <div className="empty-illustration">
                            <img
                                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80"
                                alt="Botanical Illustration"
                            />
                        </div>
                        <h2 className="empty-state-h2">Botanical Explorer</h2>
                        <p className="empty-state-p">
                            Discover the beauty, uses, and secrets of plants around the world.
                        </p>
                        <button
                            className="explore-btn"
                            onClick={() =>
                                document.querySelector(".search-container input")?.focus()
                            }
                        >
                            Start Exploring
                        </button>
                    </div>

                )}
            </main>

            <div className="botanical-elements">
                <div className="floating-leaf leaf-1"></div>
                <div className="floating-leaf leaf-2"></div>
                <div className="floating-leaf leaf-3"></div>
            </div>
            {plant && plant.where_grown_in_india && (
                <div className="map-container">
                    <h3>Where It's Grown (Heatmap)</h3>
                    <iframe
                        src={`http://localhost:5000/api/state-heatmap?name=${encodeURIComponent(plant.common_name)}`}
                        title="State Heatmap"
                        style={{ width: "100%", height: "500px", border: "none", borderRadius: "12px", marginTop: "1rem" }}
                    />
                </div>
            )}
        </div>
    );
};

export default SearchResult;