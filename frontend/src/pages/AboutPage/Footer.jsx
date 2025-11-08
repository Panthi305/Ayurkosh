import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/library">Library</Link></li>
            <li><Link to="/shop">Shop</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: info@ayurkosh.com</p>
          <p>Phone: +91-123-456-7890</p>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <p>Stay connected for updates</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 AyurKosh. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;