import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({
  products,
  addToCart,
  onProductClick,
  wishlist,
  setWishlist
}) => {
  return (
    <div className="product-grid">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            addToCart={addToCart}
            onProductClick={onProductClick}
            wishlist={wishlist}
            setWishlist={setWishlist}
          />
        ))
      ) : (
        <p className="no-products">No products found.</p>
      )}
    </div>
  );
};

export default ProductGrid;
