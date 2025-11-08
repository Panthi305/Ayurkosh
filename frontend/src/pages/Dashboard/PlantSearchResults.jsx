// src/components/PlantSearchResults.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSearch, FaLeaf, FaMedal } from "react-icons/fa";
import "./PlantSearchResults.css";

const PlantSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialQuery = location.state?.query || "";
  const initialResults = location.state?.results || [];

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return alert("Please enter your preferences");

    try {
      const res = await axios.post("https://ayurkosh-backend.onrender.com/api/search_plants", {
        query,
        top_k: 10, // now always fetching 10
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching plant results");
    }
  };

  const getMedal = (rank) => {
    if (rank === 1) return <FaMedal className="medal gold" title="1st Place" />;
    if (rank === 2) return <FaMedal className="medal silver" title="2nd Place" />;
    if (rank === 3) return <FaMedal className="medal bronze" title="3rd Place" />;
    return <span className="rank-badge">{rank}</span>;
  };

  return (
    <div className="plant-search-results-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <h2 className="title">🌿 Find Your Perfect Plant</h2>

      {/* Search Form */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g., vibrant flowers, low-maintenance..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">
          <FaSearch /> Search
        </button>
      </form>

      {/* Results */}
      {results.length > 0 ? (
        <div className="plant-results-grid">
          {results
            .slice(0, 10)
            .sort((a, b) => b.score - a.score) // rank by score
            .map((plant, index) => (
              <div key={index} className="plant-card">
                <div className="plant-rank">{getMedal(index + 1)}</div>
                <h3>{plant.common_name}</h3>
                <p className="botanical-name">
                  <FaLeaf /> {plant.botanical_name}
                </p>
                <p className="summary">{plant.summary}</p>
                {plant.medicinal_uses?.length > 0 && (
                  <p className="uses">
                    <strong>Uses:</strong> {plant.medicinal_uses.join(", ")}
                  </p>
                )}
                {plant.medicinal_properties?.length > 0 && (
                  <p className="properties">
                    <strong>Properties:</strong>{" "}
                    {plant.medicinal_properties.join(", ")}
                  </p>
                )}
                <div className="score">
                  <span>Score: {plant.score}</span>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${Math.min(plant.score * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="no-results">No results found. Try a different query.</p>
      )}
    </div>
  );
};

export default PlantSearchResults;
