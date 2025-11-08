import React, { useState, useEffect } from "react";
import {
  FaLeaf,
  FaSeedling,
  FaHandHoldingHeart,
  FaRecycle,
  FaGlobeAmericas,
} from "react-icons/fa";
import "./AboutPage.css";

const missionData = [
  {
    icon: <FaLeaf />,
    title: "Our Mission",
    brief: "Empowering communities with authentic herbal wisdom.",
    detail:
      "We aim to reconnect people with nature by sharing ancient botanical knowledge through ethically sourced, sustainable products.",
  },
  {
    icon: <FaSeedling />,
    title: "Our Vision",
    brief: "Nature and science united for holistic health.",
    detail:
      "We envision a world where traditional plant-based healing and modern wellness practices coexist in harmony for better living.",
  },
  {
    icon: <FaHandHoldingHeart />,
    title: "Our Values",
    brief: "Integrity, sustainability, and empathy.",
    detail:
      "Every decision we make centers around people and planet. Our values guide us in preserving ancient practices and fostering global well-being.",
  },

];

function AboutMission() {
  const [activeCard, setActiveCard] = useState(null);

  // ✅ Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setActiveCard(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <section className="about-mission">
      <div className="animated-bg"></div>

      <div className="about-mission-heading" data-aos="fade-down">
        <h1>Our Roots & Aspirations</h1>
        <p>Blending age-old wisdom with modern purpose.</p>
      </div>

      <div className="about-mission-container">
        {missionData.map((item, index) => (
          <div
            key={index}
            className="mission-card"
            data-aos="fade-up"
            onClick={() => setActiveCard(item)}
          >
            <div className="mission-icon">{item.icon}</div>
            <h2>{item.title}</h2>
            <p>{item.brief}</p>
          </div>
        ))}
      </div>

   {activeCard && (
  <div className="mission-modal-overlay">
    <div className="mission-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setActiveCard(null)}>
        &times;
      </button>
      <h2 className="modal-title">{activeCard.title}</h2>
      <div className="modal-content-scroll">
        <p>{activeCard.detail}</p>
      </div>
    </div>
  </div>
)}



    </section>
  );
}

export default AboutMission;
