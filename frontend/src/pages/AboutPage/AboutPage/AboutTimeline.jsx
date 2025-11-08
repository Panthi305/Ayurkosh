import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf, FaSeedling, FaTree, FaFlask } from "react-icons/fa";
import "./AboutPage.css";

const milestones = [
  {
    year: "2010",
    event: "VedaVana founded with a mission to preserve herbal knowledge.",
    icon: <FaLeaf />,
    details:
      "What started as a dream in 2010 became a movement to reconnect with nature’s forgotten wisdom. We began by collaborating with rural botanists and Ayurvedic scholars to collect ancient plant-based practices, many of which were undocumented. This foundation laid the groundwork for future digital innovation.",
  },
  
  {
    year: "2017",
    event: "Reached 50,000 community members.",
    icon: <FaTree />,
    details:
      "Our growing tribe of herbalists, wellness seekers, and nature enthusiasts hit 50,000. We launched workshops, storytelling sessions, and community planting programs across 9 Indian states, leading to increased local engagement and cross-cultural botanical exchange.",
  },
  {
    year: "2022",
    event: "Introduced certified herbal products range.",
    icon: <FaFlask />,
    details:
      "In 2022, we launched an exclusive herbal product range — scientifically validated and crafted under Ayurvedic principles. From stress-relief teas to skincare oils, each product was created with ethical sourcing, eco-packaging, and clinical testing to ensure efficacy and sustainability.",
  },
];

const AboutTimeline = () => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  return (
    
    <section className="veda-timeline-section">
      <div className="veda-timeline-heading">Our Journey</div>
      <div className="veda-timeline-line"></div>

      <div className="veda-timeline-container">
        {milestones.map((m, index) => (
          <motion.div
            key={index}
            className="veda-timeline-item"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="veda-timeline-dot">{m.icon}</div>
            <div className="veda-timeline-card">
              <div className="veda-timeline-year">{m.year}</div>
              <div className="veda-timeline-event">{m.event}</div>
              <div className="veda-timeline-summary">
                {m.details.slice(0, 120)}...
              </div>
              <button
                className="veda-timeline-more-btn"
                onClick={() => setSelectedMilestone(m)}
              >
                Read More
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            className="veda-timeline-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMilestone(null)}
          >
            <motion.div
              className="veda-timeline-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="veda-modal-close"
                onClick={() => setSelectedMilestone(null)}
              >
                &times;
              </button>
              <h3 className="veda-modal-title">{selectedMilestone.year}</h3>
              <p>{selectedMilestone.details}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AboutTimeline;
