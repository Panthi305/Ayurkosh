import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AboutHero from "./AboutHero";
import AboutMission from "./AboutMission";
import AboutTeam from "./AboutTeam";
import AboutTimeline from "./AboutTimeline";
import "./AboutPage.css";

function AboutPage() {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <main>
            <AboutHero />
            <AboutMission />
            <AboutTeam />
            <AboutTimeline />
        </main>
    );
}

export default AboutPage;
