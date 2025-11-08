import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();
  const sentences = [
    "Welcome to VedaVana",
    "Discover Nature's Healing Power",
    "Learn About Medicinal Plants",
    "Join Our Herbal Community"
  ];
  const [currentSentence, setCurrentSentence] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1200 });
  }, []);

  useEffect(() => {
    const current = sentences[currentSentence];
    let typingSpeed = isDeleting ? 50 : 100;

    const type = () => {
      if (!isDeleting) {
        setDisplayedText(current.substring(0, displayedText.length + 1));
        if (displayedText.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayedText(current.substring(0, displayedText.length - 1));
        if (displayedText.length === 0) {
          setIsDeleting(false);
          setCurrentSentence((prev) => (prev + 1) % sentences.length);
        }
      }
    };

    const timer = setTimeout(type, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentSentence]);

  return (
    <section className="hero">
      <video autoPlay muted loop className="hero-video">
        <source src="/videos/v11.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <div className="hero-content">
        <h1 data-aos="fade-down">{displayedText}<span className="cursor">|</span></h1>
        <p data-aos="fade-up">
          Explore the wisdom of ancient herbal knowledge.
        </p>
        <button
          className="explore-btn"
          onClick={() => {
            localStorage.removeItem("searchResult");
            navigate("/search-result");
          }}
        >
          Get Started
        </button>
      </div>
    </section>
  );
}

export default HeroSection;
