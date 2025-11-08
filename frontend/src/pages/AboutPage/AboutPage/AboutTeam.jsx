import React from "react";
import "./AboutPage.css";

const teamMembers = [
  {
    name: "Milonee",
    role: "Founder",
    desc: "Visionary",
    image: "https://img.freepik.com/premium-photo/young-girl-hr-3d-character-young-working-girl-cartoon-character-professional-girl-character_1002350-2147.jpg?w=2000",
  },
  {
    name: "Ravi",
    role: "UI/UX Lead",
    desc: "Aesthetic",
    image: "https://i.pinimg.com/736x/f7/6b/df/f76bdf3a9bb1ada121d3e627bf01b524.jpg",
  },
  {
    name: "Kritika",
    role: "Backend Dev",
    desc: "Reliable",
    image: "https://static.vecteezy.com/system/resources/previews/030/690/466/non_2x/office-worker-2d-cartoon-illustraton-on-white-background-h-free-photo.jpg",
  },
  {
    name: "Samar",
    role: "Marketing",
    desc: "Connector",
    image: "https://png.pngtree.com/png-clipart/20231016/original/pngtree-businessman-pointing-at-camera-3d-render-businessman-character-illustration-png-image_13321558.png",
  },
 
];

function AboutTeam() {
  return (
    <section className="about-team-pro about-hero ">
      <div className="team-floating-bg"></div>

      <h2 data-aos="fade-up" className="team-title text-white">Our Core Team</h2>

      <div className="team-grid-pro">
        {teamMembers.map((member, i) => (
          <div
            className="team-glass-card"
            key={i}
            data-aos="fade-up"
            data-aos-delay={i * 150}
          >
            <div className="team-img-wrap">
              <img src={member.image} alt={member.name} />
              <span className="tag">{member.desc}</span>
            </div>
            <div className="team-details">
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutTeam;
