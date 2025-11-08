import React, { useState, useEffect } from 'react';
import SHeader from './SHeader';
import ProductGrid from './ProductGrid';
import Footer from './Footer';
import ProductModal from './ProductModal';
import Cart from './Cart';
import MessageModal from './MessageModal';
import './Shop.css';
import { useSearchParams } from 'react-router-dom';
import LoginModal from '../HomePage/Login';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState({
    light: '',
    watering: '',
    careLevel: '',
    indoorOutdoor: '',
    petSafe: '',
    type: '',
    skinType: '',
    material: '',
    size: '',
    form: '',
    useCase: '',
    natural: '',
    system: ''
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [wishlist, setWishlist] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch wishlist on mount
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) return;
    fetch(`http://localhost:5000/get_wishlist?userId=${uid}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlist(data);
        }
      })
      .catch(err => console.error("Wishlist fetch error", err));
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/products', { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  // Handle filter changes and apply filters
  const handleFilterChange = () => {
    const q = searchParams.get('q');
    let currentFiltered = [...products];

    // Apply search query filter
    if (q) {
      const lowerCaseSearchQuery = q.toLowerCase();
      currentFiltered = currentFiltered.filter(p =>
        p.name.toLowerCase().includes(lowerCaseSearchQuery)
      );
    }

    // Apply category filter
    if (category) {
      currentFiltered = currentFiltered.filter(p => p.category === category);
    }

    // Apply dynamic filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (key === 'petSafe' || key === 'natural') {
          currentFiltered = currentFiltered.filter(p => p.filters?.[key] === (filters[key] === 'true'));
        } else if (key === 'skinType') {
          currentFiltered = currentFiltered.filter(p => p.filters?.[key]?.includes(filters[key]));
        } else {
          currentFiltered = currentFiltered.filter(p => p.filters?.[key] === filters[key]);
        }
      }
    });

    setFilteredProducts(currentFiltered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [category, filters, products, searchParams]);

  const addToCart = (product, quantity = 1) => {
    const currentUserEmail = localStorage.getItem("userEmail");
    const currentUserId = localStorage.getItem("userId");
    setUserEmail(currentUserEmail);
    setUserId(currentUserId);

    if (!currentUserEmail || !currentUserId) {
      setPendingCartItem({ product, quantity });
      setIsMessageOpen(true);
      return;
    }
    if (!product._id) {
      console.error('Product ID is missing:', product);
      alert('Error: Product ID is missing');
      return;
    }
    const payload = {
      userId: currentUserId,
      email: currentUserEmail,
      product_id: product._id,
      quantity
    };
    fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || 'Failed to add to cart'); });
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error('Error from server:', data.error);
          alert(`Error: ${data.error}`);
          return;
        }
        alert(`${quantity} ${product.name}(s) added to cart!`);
      })
      .catch(error => {
        console.error('Error adding to cart:', error.message);
        alert(`Error adding to cart: ${error.message}`);
      });
  };

  const handleLoginSuccess = () => {
    if (pendingCartItem) {
      addToCart(pendingCartItem.product, pendingCartItem.quantity);
      setPendingCartItem(null);
    }
  };

  const handleMessageProceed = () => {
    setIsMessageOpen(false);
    setIsLoginOpen(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      plant: 'Plants',
      seed: 'Seeds',
      skincare: 'Skincare',
      accessory: 'Accessories',
      medicine: 'Medicines'
    };
    return labels[category] || category;
  };

  // Group products by category for All Products view
  const groupProductsByCategory = () => {
    return products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  };

  const categoryGroups = groupProductsByCategory();

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchParams({});
    setFilters({
      light: '',
      watering: '',
      careLevel: '',
      indoorOutdoor: '',
      petSafe: '',
      type: '',
      skinType: '',
      material: '',
      size: '',
      form: '',
      useCase: '',
      natural: '',
      system: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const currentSearchQuery = searchParams.get('q');

  return (
    <div className="shop-page">
      <SHeader />
      <div className="shop-content">
        <main className="main-content">
          <div className="product-section">
            <div className="product-section-header">
              <div className="header-left">
                <button className="shamburger" onClick={toggleSidebar}>
                  <span className="shamburger-line"></span>
                  <span className="shamburger-line"></span>
                  <span className="shamburger-line"></span>
                </button>
                <h2>
                  {currentSearchQuery
                    ? `Search Results for "${currentSearchQuery}"`
                    : (category ? getCategoryLabel(category) : 'Our Products')}
                </h2>
              </div>
              <nav className="product-nav">
                <button onClick={() => handleCategoryChange('')}>All Products</button>
                <button onClick={() => handleCategoryChange('plant')}>Plants</button>
                <button onClick={() => handleCategoryChange('seed')}>Seeds</button>
                <button onClick={() => handleCategoryChange('skincare')}>Skincare</button>
                <button onClick={() => handleCategoryChange('accessory')}>Accessories</button>
                <button onClick={() => handleCategoryChange('medicine')}>Medicines</button>
              </nav>
            </div>
            <div className="product-section-content">
              <aside className={`shop-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <h3>Filters</h3>
                {currentSearchQuery && (
                  <div className="filter-group">
                    <button className="clear-search-btn" onClick={() => setSearchParams({})}>
                      Clear Search
                    </button>
                  </div>
                )}
                <div className="filter-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} onBlur={handleFilterChange}>
                    <option value="">All Categories</option>
                    <option value="plant">Plants</option>
                    <option value="seed">Seeds</option>
                    <option value="skincare">Skincare</option>
                    <option value="accessory">Accessories</option>
                    <option value="medicine">Medicines</option>
                  </select>
                </div>
                {category === 'plant' && (
                  <>
                    <div className="filter-group">
                      <label>Light</label>
                      <select value={filters.light} onChange={(e) => setFilters({ ...filters, light: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Bright Indirect">Bright Indirect</option>
                        <option value="Low">Low</option>
                        <option value="Direct">Direct</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Watering</label>
                      <select value={filters.watering} onChange={(e) => setFilters({ ...filters, watering: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Care Level</label>
                      <select value={filters.careLevel} onChange={(e) => setFilters({ ...filters, careLevel: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Indoor/Outdoor</label>
                      <select value={filters.indoorOutdoor} onChange={(e) => setFilters({ ...filters, indoorOutdoor: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Pet Safe</label>
                      <select value={filters.petSafe} onChange={(e) => setFilters({ ...filters, petSafe: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </>
                )}
                {category === 'seed' && (
                  <>
                    <div className="filter-group">
                      <label>Type</label>
                      <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Medicinal">Medicinal</option>
                        <option value="Vegetable">Vegetable</option>
                        <option value="Flower">Flower</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Indoor/Outdoor</label>
                      <select value={filters.indoorOutdoor} onChange={(e) => setFilters({ ...filters, indoorOutdoor: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Care Level</label>
                      <select value={filters.careLevel} onChange={(e) => setFilters({ ...filters, careLevel: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </>
                )}
                {category === 'skincare' && (
                  <>
                    <div className="filter-group">
                      <label>Skin Type</label>
                      <select value={filters.skinType} onChange={(e) => setFilters({ ...filters, skinType: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="All">All</option>
                        <option value="Dry">Dry</option>
                        <option value="Oily">Oily</option>
                        <option value="Sensitive">Sensitive</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Natural</label>
                      <select value={filters.natural} onChange={(e) => setFilters({ ...filters, natural: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </>
                )}
                {category === 'accessory' && (
                  <>
                    <div className="filter-group">
                      <label>Material</label>
                      <select value={filters.material} onChange={(e) => setFilters({ ...filters, material: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Ceramic">Ceramic</option>
                        <option value="Plastic">Plastic</option>
                        <option value="Metal">Metal</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Size</label>
                      <select value={filters.size} onChange={(e) => setFilters({ ...filters, size: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Indoor/Outdoor</label>
                      <select value={filters.indoorOutdoor} onChange={(e) => setFilters({ ...filters, indoorOutdoor: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                  </>
                )}
                {category === 'medicine' && (
                  <>
                    <div className="filter-group">
                      <label>Form</label>
                      <select value={filters.form} onChange={(e) => setFilters({ ...filters, form: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Powder">Powder</option>
                        <option value="Liquid">Liquid</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Use Case</label>
                      <select value={filters.useCase} onChange={(e) => setFilters({ ...filters, useCase: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Stress Relief">Stress Relief</option>
                        <option value="Immune Support">Immune Support</option>
                        <option value="Energy Boost">Energy Boost</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Natural</label>
                      <select value={filters.natural} onChange={(e) => setFilters({ ...filters, natural: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>System</label>
                      <select value={filters.system} onChange={(e) => setFilters({ ...filters, system: e.target.value })} onBlur={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Nervous">Nervous</option>
                        <option value="Immune">Immune</option>
                        <option value="Digestive">Digestive</option>
                      </select>
                    </div>
                  </>
                )}
              </aside>
              <div className="product-grid-container">
                {currentSearchQuery || category ? (
                  <ProductGrid
                    products={filteredProducts}
                    addToCart={addToCart}
                    onProductClick={handleProductClick}
                    wishlist={wishlist}
                    setWishlist={setWishlist}
                  />
                ) : (
                  <div className="all-products-view">
                    {Object.entries(categoryGroups).map(([categoryKey, products]) => (
                      <div key={categoryKey} className="category-section">
                        <div className="category-header">
                          <h3>{getCategoryLabel(categoryKey)}</h3>
                          <button
                            className="explore-button"
                            onClick={() => handleCategoryChange(categoryKey)}
                          >
                            Explore More
                          </button>
                        </div>
                        <ProductGrid
                          products={products.slice(0, 5)}
                          addToCart={addToCart}
                          onProductClick={handleProductClick}
                          wishlist={wishlist}
                          setWishlist={setWishlist}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          addToCart={addToCart}
          closeModal={closeProductModal}
        />
      )}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={(success) => {
          setIsLoginOpen(false);
          if (!success && pendingCartItem) {
            setPendingCartItem(null);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        onProceed={handleMessageProceed}
      />
    </div>
  );
};

export default Shop;