import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import ChatBox from "./ChatBox";
import "./FaqSection.css";

const faqData = [
  {
    question: " Do I need to sign up to explore plants?",
    answer:
      " No, you can search and view plant details without login.",
  },
  {
    question: " What extra features do I get after login",
    answer:
      " You get a personalized dashboard, wishlist, perfect time, and access to the shop.",
  },
  {
    question: "Is there a chatbot available?",
    answer:
      "Yes, you can ask herbal queries and view conversation history.",
  },
  {
    question: "Can I access it on mobile?",
    answer:
      "Yes, Ayurkosh is mobile-responsive and works on any device with a modern browser.",
  },
];

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">
          Get answers to our most common questions
        </p>

        <div className="faq-chat-wrapper">
          <div className="faq-column">
            <div className="faq-list">
              {faqData.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <div
                    className={`faq-card ${isActive ? "active" : ""}`}
                    key={index}
                  >
                    <button
                      className="faq-header"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isActive}
                    >
                      <span>{item.question}</span>
                      <motion.span
                        className="faq-toggle-icon"
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isActive ? "−" : "+"}
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="faq-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <p>{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="faq-column">
            <ChatBox />
          </div>
        </div>
      </div>
    </section>
  );
}