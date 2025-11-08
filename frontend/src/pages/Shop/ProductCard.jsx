import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product, addToCart, onProductClick, wishlist, setWishlist }) => {
  const userId = localStorage.getItem("userId");
  const isWishlisted = wishlist?.includes(product._id);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!userId) {
      alert("Please log in to use wishlist.");
      return;
    }

    const url = isWishlisted ? "wishlist_remove" : "wishlist_add";
    const payload = { userId, productId: product._id };

    try {
      const res = await fetch(`http://localhost:5000/${url}`, { // ✅ no /api prefix
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (isWishlisted) {
          setWishlist(prev => prev.filter(id => id !== product._id));
        } else {
          setWishlist(prev => [...prev, product._id]);
        }
      } else {
        alert(data.error || "Failed to update wishlist.");
      }
    } catch (err) {
      console.error("Wishlist toggle failed", err);
      alert("Failed to update wishlist.");
    }
  };

  const getStockIndicator = (stock) => {
    if (stock === 0) return <span className="stock-badge out-of-stock">Sold Out</span>;
    if (stock <= 5) return <span className="stock-badge low-stock">Only {stock} left</span>;
    return <span className="stock-badge high-stock">In Stock</span>;
  };

  const getCategoryInfo = (category) => {
    const categoryStyles = {
      plant: { label: 'Plant', bgColor: '#e8f5e9', textColor: '#2e7d32', borderColor: '#c8e6c9' },
      seed: { label: 'Seed', bgColor: '#f1f8e9', textColor: '#7cb342', borderColor: '#dcedc8' },
      skincare: { label: 'Skincare', bgColor: '#e3f2fd', textColor: '#1976d2', borderColor: '#bbdefb' },
      accessory: { label: 'Accessory', bgColor: '#fff3e0', textColor: '#ef6c00', borderColor: '#ffe0b2' },
      medicine: { label: 'Medicine', bgColor: '#f3e5f5', textColor: '#7b1fa2', borderColor: '#e1bee7' }
    };
    return categoryStyles[category] || {
      label: category,
      bgColor: '#f5f5f5',
      textColor: '#616161',
      borderColor: '#e0e0e0'
    };
  };

  const categoryInfo = getCategoryInfo(product.category);

  return (
    <div
      className="product-card"
      onClick={() => onProductClick(product)}
      style={{ borderColor: categoryInfo.borderColor }}
    >
      <div className="image-container">
        <img src={product.image} alt={product.name} />
        {getStockIndicator(product.stock)}

        <button
          className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <h3>{product.name}</h3>
      <div className="price-container">
        <span className="price">₹{product.price}</span>
        <span
          className="category-tag"
          style={{
            backgroundColor: categoryInfo.bgColor,
            color: categoryInfo.textColor
          }}
        >
          {categoryInfo.label}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product, 1);
        }}
        disabled={product.stock === 0}
        className={product.stock === 0 ? 'disabled' : ''}
      >
        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
};

export default ProductCard;
