import React from 'react';
import './Footer.css'
const Footer = () => {
  return (
    <footer className="shop-footer">
      <p>© 2025 Plant Haven. All rights reserved.</p>
      <p>Contact: support@planthaven.com | +91-9876543210</p>
      <div className="footer-links">
        <a href="/about">About Us</a> | <a href="/contact">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;