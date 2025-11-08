import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-section">
          <h3>About VedaVana</h3>
          <p>
            Explore the harmony of nature and science through herbal wisdom,
            shopping, and learning resources.
          </p>
        </div>

        <div className="footer-section">
          <h3>Navigation</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><a href="/search-result">Search Plants</a></li>
            <li><a href="/wishlist">Wishlist</a></li>
            <li><a href="/orders">Orders</a></li>
            <li><a href="/contact">Contact & Help</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com"><FaFacebookF /></a>
            <a href="https://instagram.com"><FaInstagram /></a>
            <a href="https://twitter.com"><FaTwitter /></a>
            <a href="https://youtube.com"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 VedaVana. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;