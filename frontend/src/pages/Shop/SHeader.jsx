import './SHeader.css';
import React, { useState, useEffect, useRef } from 'react';
import Cart from './Cart';
import LoginModal from '../Homepage/Login';
import MessageModal from './MessageModal';
import SuggestionBox from './SuggestionBox';
import { useNavigate, useLocation } from 'react-router-dom';

const SHeader = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [pendingCartOpen, setPendingCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const searchBarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = localStorage.getItem("userEmail");
  const userId = localStorage.getItem("userId");

  // This effect ensures the search bar is updated if the user navigates back to the shop page
  // with a search query in the URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
  }, [location.search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [searchBarRef]);

  // ✅ Add at top in SHeader.jsx
const recordProductSearch = async (product) => {
  if (!userId) return;
  try {
    await fetch("http://localhost:5000/record_product_search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, product })
    });
  } catch (err) {
    console.error("Error recording product search history", err);
  }
};

const handleSuggestionClick = (product) => {
  setSearchTerm(product.name);
  setIsSuggestionsOpen(false);
  
  // ✅ Save search in DB
  recordProductSearch(product);

  navigate(`/shop?q=${encodeURIComponent(product.name)}`);
};

  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/products/search?q=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSuggestions(data);
      setIsSuggestionsOpen(true);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
  };

  

  const handleSearchSubmit = async (e) => {
  e.preventDefault();
  if (searchTerm.trim()) {
    // Try to get matching products so we store some details
    try {
      const res = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (res.ok) {
        const matches = await res.json();
        if (matches.length > 0) {
          // store first match only (you can choose to store all)
          recordProductSearch(matches[0]);
        } else {
          // store just the query if nothing was found
          recordProductSearch({ name: searchTerm.trim(), category: "unknown" });
        }
      }
    } catch (err) {
      console.error("Product lookup for history failed", err);
    }

    navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
    setIsSuggestionsOpen(false);
  }
};


  const handleCartClick = (e) => {
    e.preventDefault();
    if (!userEmail || !userId) {
      setIsMessageOpen(true);
    } else {
      setIsCartOpen(!isCartOpen);
    }
  };

  const handleMessageProceed = () => {
    setIsMessageOpen(false);
    setIsLoginOpen(true);
    setPendingCartOpen(true);
  };

  const handleLoginSuccess = () => {
    if (pendingCartOpen) {
      setIsCartOpen(true);
      setPendingCartOpen(false);
    }
  };

  return (
    <header className="shop-header">
      <div className="logo">Plant Haven</div>
      <nav className="nav-menu">
        <a href="/">Home</a>
        <a href="#" onClick={handleCartClick}>
          Cart
        </a>
        <a href="/dashboard">My Account</a>
      </nav>
      <form className="search-bar" onSubmit={handleSearchSubmit} ref={searchBarRef}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchTerm.length > 0) {
              setIsSuggestionsOpen(true);
            }
          }}
        />
        <button type="submit">Search</button>
        {isSuggestionsOpen && suggestions.length > 0 && (
          <SuggestionBox
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </form>
      {isCartOpen && userEmail && userId && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={(success) => {
          setIsLoginOpen(false);
          if (!success) {
            setPendingCartOpen(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        onProceed={handleMessageProceed}
      />
    </header>
  );
};

export default SHeader;