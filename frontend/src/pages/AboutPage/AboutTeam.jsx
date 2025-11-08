import React, { useState, useEffect, useRef } from "react";

const TeamCarousel = () => {
  const team = [
    {
      name: "Milonee Sharma",
      role: "CEO & Founder",
      img: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Ravi Mehta",
      role: "Operations Head",
      img: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      name: "Kritika Rao",
      role: "Lead Designer",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Samar Khurana",
      role: "Marketing Manager",
      img: "https://randomuser.me/api/portraits/men/34.jpg",
    },
  ];

  const fullText =
    "We bring nature's healing power to your doorstep, with a team dedicated to blending ancient wisdom and modern expertise.";

  const [current, setCurrent] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [typingStarted, setTypingStarted] = useState(false);
  const leftRef = useRef(null);

  // Scroll observer to trigger typing when left content is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTypingStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (leftRef.current) {
      observer.observe(leftRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typing effect triggered on scroll in view
  useEffect(() => {
    if (!typingStarted) return;

    let index = 0;
    setTypedText("");
    const typingInterval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(typingInterval);
    }, 40);

    return () => clearInterval(typingInterval);
  }, [typingStarted]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + team.length) % team.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % team.length);
  };

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #dae6caff,#a6b88d)",
      color: "#053d2f",
      padding: "60px 80px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxSizing: "border-box",
    },
    left: {
      flex: "0.5",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingRight: "40px",
      opacity: typingStarted ? 1 : 0,
      transform: typingStarted ? "none" : "translateY(30px)",
      transition: "opacity 1s ease, transform 1s ease",
    },
    heading: {
      fontSize: "3.6rem",
      fontWeight: "900",
      marginBottom: "20px",
      letterSpacing: "3px",
      background: "linear-gradient(90deg, #4a7023, #7aad4f)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      userSelect: "none",
    },
    description: {
      fontSize: "1.1rem",
      lineHeight: "1.7",
      marginTop: "10px",
      minHeight: "60px",
      color: "#075c48",
      fontWeight: "500",
      fontStyle: "italic",
      userSelect: "text",
      whiteSpace: "normal",
      wordBreak: "break-word",
    },
    extraContent: {
      marginTop: "20px",
      fontSize: "1rem",
      color: "#075c48",
      fontWeight: "400",
      lineHeight: "1.5",
      userSelect: "text",
    },
    right: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "90px", // moved carousel higher (was 60)
    },
    carousel: {
      display: "flex",
      gap: "20px",
      transition: "transform 0.5s ease-in-out",
    },
    card: (isCenter) => ({
      width: "250px",
      height: "350px",
      borderRadius: "10px",
      overflow: "hidden",
      background: "#fff",
      color: "#000",
      textAlign: "center",
      transform: isCenter ? "scale(1.08)" : "scale(0.9)",
      opacity: isCenter ? 1 : 0.6,
      transition: "all 0.5s ease",
      boxShadow: isCenter
        ? "0 12px 30px rgba(0,0,0,0.25)"
        : "0 4px 12px rgba(0,0,0,0.1)",
      cursor: isCenter ? "pointer" : "default",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }),
    img: {
      width: "100%",
      height: "80%",
      objectFit: "cover",
    },
    name: {
      fontWeight: "700",
      margin: "10px 0 4px",
      fontSize: "1.1rem",
      userSelect: "none",
    },
    role: {
      fontSize: "0.9rem",
      color: "#555",
      userSelect: "none",
    },
    buttons: {
      marginTop: "35px",
      display: "flex",
      gap: "20px",
    },
    btn: {
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      border: "none",
      background: "#fff",
      color: "#075c48",
      fontSize: "1.2rem",
      cursor: "pointer",
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      userSelect: "none",
      transition: "background 0.3s ease",
    },
  };

  const getVisibleMembers = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(team[(current + i) % team.length]);
    }
    return visible;
  };

  const visibleMembers = getVisibleMembers();

  return (
    <div style={styles.container}>
      {/* LEFT CONTENT */}
      <div style={styles.left} ref={leftRef}>
        <h1
    style={{
      color: "#3c4a1a",
      fontSize: "2.5rem",
      fontWeight: "bold",
    }}
  >
    Our Team
  </h1>
        <p style={styles.description}>{typedText}</p>
        <p style={styles.extraContent}>
          With decades of combined experience, we pride ourselves on innovation,
          integrity, and impact. Every member of our team is committed to
          delivering world-class solutions while staying rooted in sustainability
          and authenticity.
        </p>
      </div>

      {/* RIGHT CAROUSEL */}
      <div style={styles.right}>
        <div style={styles.carousel}>
          {visibleMembers.map((member, idx) => (
            <div
              key={idx}
              style={styles.card(idx === 1)} // middle one highlighted
            >
              <img src={member.img} alt={member.name} style={styles.img} />
              <p style={styles.name}>{member.name}</p>
              <p style={styles.role}>{member.role}</p>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div style={styles.buttons}>
          <button
            style={styles.btn}
            onClick={prevSlide}
            aria-label="Previous team member"
          >
            &#8592;
          </button>
          <button
            style={styles.btn}
            onClick={nextSlide}
            aria-label="Next team member"
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCarousel;
