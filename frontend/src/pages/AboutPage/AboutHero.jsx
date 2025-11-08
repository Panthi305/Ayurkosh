import React from "react";

function AboutHero() {
  const sectionStyle = {
    height: "100vh",
    backgroundColor: "#e7e3d8", // light beige
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  };

  const stripeStyle = {
    position: "absolute",
    right: "25%",
    top: 0,
    height: "100%",
    width: "100px",
    backgroundColor: "#a6b88d", // muted green stripe
    zIndex: 0,
  };

  const imageStyle = {
    position: "absolute",
    left: "8%",
    bottom: "0",
    height: "85%",
    zIndex: 1,
    animation: "floatLeaf 4s ease-in-out infinite",
  };

  const textContainerStyle = {
    position: "absolute",
    right: "15%",
    top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "Georgia, serif",
    color: "#2b4f2f",
    zIndex: 1,
    textAlign: "left",
    maxWidth: "500px",
  };

  const headingStyle = {
    fontSize: "5rem",
    fontWeight: "normal",
    whiteSpace: "nowrap",
    overflow: "hidden",
    animation: "typing 2s steps(20, end) forwards",
    borderRight: "none",
  };

  const taglineStyle = {
    fontSize: "1.5rem",
    marginTop: "20px",
    opacity: 0,
    animation: "fadeIn 1.5s ease forwards",
    animationDelay: "2.1s",
  };

  const paragraphStyle = {
    fontSize: "1rem",
    marginTop: "15px",
    color: "#3E5C43",
    lineHeight: "1.6",
    opacity: 0,
    animation: "fadeIn 1.5s ease forwards",
    animationDelay: "3s",
  };

  return (
    <section style={sectionStyle}>
      <style>
        {`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes fadeIn {
          to { opacity: 1 }
        }

        @keyframes floatLeaf {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        `}
      </style>

      {/* Green stripe */}
      <div style={stripeStyle}></div>

      {/* Leaf image */}
      <img
        src="https://png.pngtree.com/png-clipart/20241127/original/pngtree-close-to-banana-leaves-png-image_17335408.png"
        alt="Leaf"
        style={imageStyle}
      />

      {/* Text */}
      <div style={textContainerStyle}>
        <h1 style={headingStyle}>Ayurkosh</h1>
        <p style={taglineStyle}>
          Embracing nature's wisdom for modern wellness
        </p>
        <p style={paragraphStyle}>
          At Ayurkosh, we bring you the finest selection of herbal remedies, 
          organic ingredients, and wellness products inspired by centuries 
          of Ayurvedic tradition. Our mission is to reconnect you with 
          nature’s healing power, offering sustainable and holistic 
          solutions for your body, mind, and soul.
        </p>
      </div>
    </section>
  );
}

export default AboutHero;
