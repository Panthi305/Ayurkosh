import React, { useEffect, useState, useRef } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import Features from "./Features";
import About from "./About";
import Footer from "./Footer";
import Testimonials from "./Testimonials";
import BackToTop from "./BackToTop";
import FaqSection from "./FaqSection";
import Loader from "./Loader";
import "./HomePage.css";

function HomePage() {
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ Scroll to top on mount to prevent auto scroll to other sections
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });
        });
    }, []);

    // ✅ Simulate loading delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 4100);
        return () => clearTimeout(timer);
    }, []);

    // ✅ Detect scroll for header styling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ✅ Show loader initially
    if (loading) {
        return <Loader />;
    }

    return (
        <div className="homepage">
            <Header scrolled={scrolled} />
            <HeroSection />
            <Features />
            <About />
            <Testimonials />
            <FaqSection />
            <BackToTop />
            <Footer />
        </div>
    );
}

export default HomePage;
