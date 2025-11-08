import React, { useState, useEffect } from "react";
import { FaLeaf, FaSeedling, FaHandHoldingHeart } from "react-icons/fa";

const missionData = [
  {
    icon: <FaLeaf />,
    title: "Our Mission",
    brief: "Empowering communities with authentic herbal wisdom.",
    detail:
      "We aim to reconnect people with nature by sharing ancient botanical knowledge through ethically sourced, sustainable products.",
    points: [
      "🌿 Promoting eco-friendly herbal products",
      "🌎 Supporting local herbal communities",
      
    ],
  },
  {
    icon: <FaSeedling />,
    title: "Our Vision",
    brief: "Nature and science united for holistic health.",
    detail:
      "We envision a world where traditional plant-based healing and modern wellness practices coexist in harmony for better living.",
    points: [
      "🔬 Combining tradition with modern science",
      "🌱 Cultivating sustainable growth",
      
    ],
  },
  {
    icon: <FaHandHoldingHeart />,
    title: "Our Values",
    brief: "Integrity, sustainability, and empathy.",
    detail:
      "Every decision we make centers around people and planet. Our values guide us in preserving ancient practices and fostering global well-being.",
    points: [
      "🤝 Honesty in all our dealings",
      "♻️ Commitment to sustainability",
      
    ],
  },
];

function AboutMission() {
  const [activeCard, setActiveCard] = useState(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setActiveCard(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(166, 184, 141, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  };

  const modalStyle = {
    background: "#f5f8f1",
    border: "2px solid #a6b88d",
    borderRadius: "8px",
    maxWidth: "700px",
    width: "90%",
    maxHeight: "90vh",
    padding: "40px 30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    animation: "fadeIn 0.3s ease-in-out",
    boxSizing: "border-box",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#a6b88d",
    color: "#fff",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s ease",
  };

  const modalTitleStyle = {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#5d6b48",
    fontWeight: "bold",
  };

  const modalContentScrollStyle = {
    flex: 1,
    overflowY: "auto",
    color: "#4a5938",
    lineHeight: "1.6",
    paddingRight: "10px",
  };

  return (
    <section
      style={{
        backgroundColor: "#a6b88d",
        padding: "40px 20px",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
     <div
  style={{
    textAlign: "center",
    marginBottom: "40px",
    marginTop: "65px",
  }}
>
  <h1
    style={{
      color: "#3c4a1a",
      fontSize: "2.5rem",
      fontWeight: "bold",
    }}
  >
    Our Roots & Aspirations
  </h1>
 <p
  style={{
    color: "#d9e3be",
    fontSize: "1.2rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    borderRight: "3px solid transparent",
    width: "44ch", // updated
    margin: "0 auto",
    animation: "typingDeleting 6s steps(44) infinite", // updated steps
  }}
>
  Blending age-old wisdom with modern purpose.
</p>

<style>
  {`
    @keyframes typingDeleting {
      0% {
        width: 0;
        border-right-color: transparent;
      }
      45% {
        width: 44ch;
        border-right-color: transparent;
      }
      55% {
        width: 44ch;
        border-right-color: transparent;
      }
      100% {
        width: 0;
        border-right-color: transparent;
      }
    }
  `}
</style>

</div>


      <div
        style={{
          display: "flex",
          gap: "30px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {missionData.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#f0f3eb",
              padding: "35px 30px",
              borderRadius: "16px",
              textAlign: "center",
              flex: "1 1 350px",
              maxWidth: "380px",
              minHeight: "280px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => setActiveCard(item)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-8px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div>
              <div style={{ fontSize: "2.8rem", color: "#5d6b48" }}>
                {item.icon}
              </div>
              <h2
                style={{
                  color: "#5d6b48",
                  marginTop: "15px",
                  fontSize: "1.7rem",
                }}
              >
                {item.title}
              </h2>
              <p style={{ color: "#6f7f5c", fontSize: "1.15rem" }}>
                {item.brief}
              </p>
            </div>

            <ul
              style={{
                textAlign: "left",
                marginTop: "20px",
                paddingLeft: "20px",
                color: "#556a3a",
                fontSize: "1rem",
                listStyleType: "disc",
                lineHeight: "1.5",
                userSelect: "none",
              }}
            >
              {item.points.map((point, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {activeCard && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <button
              style={closeButtonStyle}
              onMouseOver={(e) => (e.target.style.background = "#8fa272")}
              onMouseOut={(e) => (e.target.style.background = "#a6b88d")}
              onClick={() => setActiveCard(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 style={modalTitleStyle}>{activeCard.title}</h2>
            <div style={modalContentScrollStyle}>
              <p>{activeCard.detail}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AboutMission;
