import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'
const Header = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>AyurKosh</h1>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/library">Library</Link></li>
        <li><Link to="/shop">Shop</Link></li>
      </ul>
    </nav>
  );
};

export default Header;