import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf, FaTree, FaFlask } from "react-icons/fa";

const milestones = [
  {
    year: "2010",
    event: "VedaVana founded with a mission to preserve herbal knowledge.",
    icon: <FaLeaf size={30} color="#3d5a2a" />,
    details:
      "What started as a dream in 2010 became a movement to reconnect with nature’s forgotten wisdom. We began by collaborating with rural botanists and Ayurvedic scholars to collect ancient plant-based practices, many of which were undocumented.",
  },
  {
    year: "2017",
    event: "Reached 50,000 community members.",
    icon: <FaTree size={30} color="#3d5a2a" />,
    details:
      "Our growing tribe of herbalists, wellness seekers, and nature enthusiasts hit 50,000. We launched workshops, storytelling sessions, and community planting programs across 9 Indian states.",
  },
  {
    year: "2022",
    event: "Introduced certified herbal products range.",
    icon: <FaFlask size={30} color="#3d5a2a" />,
    details:
      "We launched an exclusive herbal product range — scientifically validated and crafted under Ayurvedic principles. From teas to skincare oils, each product was created with ethical sourcing and eco-packaging.",
  },
];

export default function AboutJourney() {
  const [current, setCurrent] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Auto shuffle milestones every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % milestones.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const milestone = milestones[current];

  return (
    <section
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #eaf4e1, #d2e6c5)",
      }}
    >
      {/* Left Image */}
      <div
        style={{
          flex: "1",
          backgroundImage:
            "url('https://png.pngtree.com/png-clipart/20241127/original/pngtree-close-to-banana-leaves-png-image_17335408.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Right Content */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "50px",
        }}
      >
        <motion.div
          key={milestone.year}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ marginBottom: "15px" }}>{milestone.icon}</div>
          <h2
            style={{
              fontSize: "2.5rem",
              color: "#2f4f25",
              marginBottom: "10px",
            }}
          >
            {milestone.year}
          </h2>
          <h3
            style={{
              fontSize: "1.4rem",
              color: "#3d5a2a",
              marginBottom: "15px",
            }}
          >
            {milestone.event}
          </h3>
          <p style={{ color: "#4a5b38", fontSize: "1rem", lineHeight: "1.6" }}>
            {milestone.details.slice(0, 120)}...
          </p>
          <button
            onClick={() => setSelectedMilestone(milestone)}
            style={{
              marginTop: "20px",
              background: "#5d7a42",
              color: "#fff",
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseOver={(e) => (e.target.style.background = "#4c6635")}
            onMouseOut={(e) => (e.target.style.background = "#5d7a42")}
          >
            Read More
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                maxWidth: "600px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                textAlign: "center",
                position: "relative",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#3d5a2a",
                }}
                onClick={() => setSelectedMilestone(null)}
              >
                &times;
              </button>
              <h3
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "10px",
                  color: "#3d5a2a",
                }}
              >
                {selectedMilestone.year}
              </h3>
              <p style={{ color: "#4a5b38" }}>{selectedMilestone.details}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
