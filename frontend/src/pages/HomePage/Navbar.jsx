import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import LoginModal from "./Login";

function Navbar({ scrolled, onContactClick }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const navRef = useRef();
    const hamburgerRef = useRef();
    const searchRef = useRef();
    const navigate = useNavigate();
    const debounceTimeout = useRef(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        setIsLoggedIn(!!storedEmail);
        setIsAuthReady(true);
    }, []);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuOpen &&
                navRef.current &&
                !navRef.current.contains(event.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
            if (
                isSearchOpen &&
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setIsSearchOpen(false);
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen, isSearchOpen]);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    const openLogin = () => {
        setIsLoginOpen(true);
        closeMenu();
    };

    const closeLogin = (loggedIn) => {
        setIsLoginOpen(false);
        if (loggedIn) {
            setIsLoggedIn(true);
            navigate("/dashboard");
        }
    };

    const userId = localStorage.getItem("userId");

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        setIsLoggedIn(false);
        closeMenu();
        window.location.reload();
    };

    const handleSearch = async (query = searchQuery) => {
        if (!query.trim()) {
            alert("Please enter a valid plant name.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/search-plant?name=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("searchResult", JSON.stringify(data));
                if (userId) {
                    recordSearch(data);
                }
                navigate("/search-result");
                setIsSearchOpen(false);
                setSuggestions([]);
            } else {
                alert(data.error || "Plant not found");
            }
        } catch (err) {
            console.error("Error during search:", err);
            alert("Failed to search. Try again.");
        }
    };

    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/suggest-plants?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            setSuggestions([]);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 300); // 300ms debounce
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.common_name);
        handleSearch(suggestion.common_name);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setSearchQuery("");
            setSuggestions([]);
        }
    };

    return (
        <>
            <header className={`nheader ${isSearchOpen ? "search-open" : ""}`}>
                <div className="logo">
                    <img src="/logo5.png" alt="Ayurkosh Logo" className="logo-icon" />
                </div>

                {isAuthReady && (
                    <nav ref={navRef} className={`nav ${menuOpen ? "open" : ""}`}>
                        <div className="nav-right">
                            <a href="/" onClick={(e) => { e.preventDefault(); closeMenu(); navigate("/"); }}>Home</a>
                            <a href="/about" onClick={(e) => { e.preventDefault(); closeMenu(); navigate("/about"); }}>About</a>
                            <a href="/shop" onClick={(e) => { e.preventDefault(); closeMenu(); navigate("/shop"); }}>Shop</a>
                            <a href="/contact" onClick={(e) => { e.preventDefault(); closeMenu(); navigate("/contact"); }}>Contact</a>
                            <div
                                className="nav-auth-icon"
                                onClick={() => {
                                    if (isLoggedIn) {
                                        navigate("/dashboard");
                                    } else {
                                        openLogin();
                                    }
                                }}
                            >
                                <FaUserCircle size={26} />
                            </div>
                            <div
                                className="search-icon-container"
                                onClick={toggleSearch}
                            >
                                <FaSearch size={20} />
                            </div>
                        </div>
                    </nav>
                )}

                <div className="hamburger" onClick={toggleMenu} ref={hamburgerRef}>
                    {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </div>
            </header>

            {isLoginOpen && <LoginModal isOpen={true} onClose={closeLogin} />}

            {isSearchOpen && (
                <div className="expanded-search" ref={searchRef}>
                    <div className="search-input-container">
                        <input
                            type="text"
                            className="expanded-search-input"
                            placeholder="Search plants..."
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button className="expanded-search-button" onClick={() => handleSearch()}>
                            <FaSearch className="search-icon" />
                        </button>
                        {suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.common_name} ({suggestion.botanical_name})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;