import React from 'react';
import './SideBar.css';

const Sidebar = ({ category, setCategory, filters, setFilters, handleFilterChange }) => {
  return (
    <aside className="shop-sidebar">
      <h3>Filters</h3>
      <div className="filter-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} onBlur={handleFilterChange}>
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
  );
};

export default Sidebar;