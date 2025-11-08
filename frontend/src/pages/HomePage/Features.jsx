import React, { useEffect, useState } from "react";
import { FaRobot, FaSearch, FaShoppingBag, FaChartLine } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Features.css";
import { useNavigate } from "react-router-dom";
import LoginModal from "./Login"; // Import LoginModal

const featuresData = [
  {
    icon: <FaRobot />,
    title: "Ask Our Chatbot",
    description: "Get instant guidance on herbs, remedies, and Ayurvedic lifestyle tips.",
    link: "/chatbot",
  },
  {
    icon: <FaSearch />,
    title: "Find Plants & Uses",
    description: "Search our encyclopedia of herbs and their health benefits.",
    link: "/search-result",
  },
  {
    icon: <FaShoppingBag />,
    title: "Marketplace",
    description: "Buy authentic herbal products curated by certified practitioners.",
    link: "/shop",
  },
  {
    icon: <FaChartLine />,
    title: "Track & Learn",
    description: "Track your progress, take quizzes, and explore research insights.",
    link: "/plant-search-results",
    requiresLogin: true, // Flag to indicate this feature requires login
  },
];

const Features = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [pendingLink, setPendingLink] = useState(null); // Store the link to navigate after login

  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 80 });
  }, []);

  // Check if user is logged in by looking at localStorage
  const isLoggedIn = () => {
    return !!localStorage.getItem("userId") && !!localStorage.getItem("userEmail");
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setIsModalOpen(false); // Close modal
    if (pendingLink) {
      navigate(pendingLink); // Navigate to the pending link
      setPendingLink(null); // Clear pending link
    }
  };

  // Handle feature click
  const handleFeatureClick = (feature) => {
    if (feature.title === "Find Plants & Uses") {
      localStorage.removeItem("searchResult"); // Clear previous search
      navigate(feature.link);
    } else if (feature.title === "Ask Our Chatbot") {
      const faqSection = document.querySelector(".faq-section");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (feature.requiresLogin && !isLoggedIn()) {
      setPendingLink(feature.link); // Store the link to navigate after login
      setIsModalOpen(true); // Open login modal
    } else if (feature.link) {
      navigate(feature.link);
    }
  };

  return (
    <>
      <section className="features-section" id="features">
        <div className="floating-leaves">
          <div className="leaf leaf-1"></div>
          <div className="leaf leaf-2"></div>
          <div className="leaf leaf-3"></div>
        </div>
        <div className="features-container">
          <div className="features-header" data-aos="fade-up">
            <h2 className="features-title">Discover What We Offer</h2>
            <p className="features-desc">
              Experience the best of Ayurveda with our curated digital tools and resources.
            </p>
          </div>
          <div className="features-grid">
            {featuresData.map((feature, idx) => (
              <div
                className="feature-card"
                key={idx}
                data-aos="fade-up"
                data-aos-delay={idx * 120}
              >
                <div className="feature-icon-container">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-underline"></div>
                <button
                  className="feature-cta"
                  onClick={() => handleFeatureClick(feature)}
                >
                  Discover more
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingLink(null); // Clear pending link on modal close
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Features;