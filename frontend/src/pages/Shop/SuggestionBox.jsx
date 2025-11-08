import React from 'react';
import './SuggestionBox.css';

const SuggestionBox = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <ul className="suggestion-box">
      {suggestions.map((product) => (
        <li
          key={product._id}
          className="suggestion-item"
          onClick={() => onSuggestionClick(product)}
        >
          <img src={product.image} alt={product.name} className="suggestion-image" />
          <div className="suggestion-details">
            <span className="suggestion-name">{product.name}</span>
            <span className="suggestion-category">{product.category}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SuggestionBox;