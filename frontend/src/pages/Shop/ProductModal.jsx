import React, { useState } from 'react';
import './ProductModal.css';

const ProductModal = ({ product, addToCart, closeModal }) => {
  const [quantity, setQuantity] = useState(1);

  const getStockLevel = (stock) => {
    if (stock === 0) return { text: "Out of Stock", className: "out-of-stock" };
    if (stock <= 5) return { text: `Only ${stock} Left!`, className: "low-stock" };
    if (stock <= 15) return { text: `In Stock (${stock})`, className: "medium-stock" };
    return { text: "In Stock", className: "high-stock" };
  };

  const stockInfo = getStockLevel(product.stock);

  const handleAddToCart = () => {
    console.log('Add to cart clicked in ProductModal:', { product, quantity });
    addToCart(product, quantity); // Use addToCart from Shop.jsx
  };

  return (
    <div className="product-modal-overlay" onClick={closeModal}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={closeModal}>
          ×
        </button>
        <div className="modal-content">
          <div className="modal-image-container">
            <img src={product.image} alt={product.name} />
            <div className={`stock-indicator ${stockInfo.className}`}>
              {stockInfo.text}
            </div>
          </div>
          <div className="modal-details">
            <div className="product-header">
              <h2>{product.name}</h2>
              <p className="price">₹{product.price}</p>
            </div>
            <div className="category-tag">
              {product.category}
            </div>
            <p className="description">{product.description}</p>
            <div className="specifications">
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-label">Care Level:</span>
                  <span className="spec-value">{product.careLevel}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Light Requirements:</span>
                  <span className="spec-value">{product.lightRequirements}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Watering Needs:</span>
                  <span className="spec-value">{product.wateringNeeds}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Height:</span>
                  <span className="spec-value">{product.height} cm</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Stock:</span>
                  <span className={`spec-value ${stockInfo.className}`}>
                    {product.stock} units available
                  </span>
                </div>
              </div>
            </div>
            <div className="quantity-controls">
              <button 
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity < product.stock ? quantity + 1 : quantity)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <div className="modal-buttons">
              <button 
                className="cancel-button"
                onClick={closeModal}
              >
                Continue Shopping
              </button>
              <button 
                className={`add-to-cart-button ${stockInfo.className === 'out-of-stock' ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? `Add ${quantity} to Cart` : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;