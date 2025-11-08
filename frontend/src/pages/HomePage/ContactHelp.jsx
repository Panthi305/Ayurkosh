import React, { useState } from 'react';
import './ContactHelp.css';
import Footer from './Footer';
import Navbar from './Navbar';

const ContactHelp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setSubmitStatus("error");
    }

    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(""), 4000);
  };


  return (
    <div className="contact-page">
      <Navbar />
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Connect With Nature’s Wisdom</h1>
          <p>Our herbal experts are here to guide you on your wellness journey</p>
          <div className="hero-leaf-illustration" aria-hidden="true" />
        </div>
      </section>

      <div className="container">
        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info" aria-label="Contact Information">
            <div className="info-card" tabIndex={0}>
              <div className="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="info-content">
                <h3>Direct Line</h3>
                <p>+1 (555) 123-4567</p>
                <span>Mon-Fri: 9AM-6PM EST</span>
              </div>
            </div>

            <div className="info-card" tabIndex={0}>
              <div className="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="info-content">
                <h3>Email Us</h3>
                <p>contact@herbalessence.com</p>
                <span>Response within 24 hours</span>
              </div>
            </div>

            <div className="info-card" tabIndex={0}>
              <div className="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <circle cx="15" cy="11" r="3" />
                </svg>
              </div>
              <div className="info-content">
                <h3>Visit Us</h3>
                <p>123 Botanical Gardens Way<br />Green Valley, CA 90210</p>
                <span>By appointment only</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container" aria-label="Contact form">
            <div className="form-header">
              <h2>Send Us a Message</h2>
              <p>Have questions about our herbal products? We're here to help.</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name *"
                    aria-required="true"
                    aria-label="Full Name"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address *"
                    aria-required="true"
                    aria-label="Email Address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    aria-label="Phone Number"
                  />
                </div>

                <div className="form-group">
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-label="Select Inquiry Type"
                  >
                    <option value="">Select Inquiry Type *</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="bulk-order">Bulk Orders</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="partnership">Partnership</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Your Message *"
                  aria-required="true"
                  aria-label="Your Message"
                ></textarea>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="spinner"
                      viewBox="0 0 50 50"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="5"
                      ></circle>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="success-message" role="alert">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Message sent successfully! We'll respond within 24 hours.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactHelp;
