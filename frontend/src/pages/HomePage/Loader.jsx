import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import Particles from 'react-tsparticles';
import animationData from '../../assets/a1.json';
import './Loader.css';

const Loader = () => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 4000); // 4 seconds loader
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`loader-wrapper ${fadeOut ? 'fade-out' : ''}`}>
            <Particles
                id="tsparticles"
                options={{
                    background: { color: 'transparent' },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 40 },
                        color: { value: ['#a5d6a7', '#c8e6c9', '#e6ee9c', '#fff59d'] },
                        shape: { type: 'circle' },
                        opacity: {
                            value: { min: 0.1, max: 0.4 },
                            animation: { enable: true, speed: 0.3, sync: false },
                        },
                        size: {
                            value: { min: 1, max: 3 },
                            animation: { enable: true, speed: 0.5, minimumValue: 1 },
                        },
                        move: {
                            enable: true,
                            speed: { min: 0.2, max: 0.8 },
                            direction: 'none',
                            random: true,
                            outMode: 'bounce',
                        },
                    },
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: 'bubble' },
                            onClick: { enable: true, mode: 'repulse' },
                        },
                        modes: {
                            bubble: { distance: 80, size: 4, duration: 2, opacity: 0.4 },
                            repulse: { distance: 100, duration: 0.4 },
                        },
                    },
                }}
            />
            <div className="content">
                <div className="animation-container">
                    <svg className="progress-ring" width="250" height="250">
                        <defs>
                            <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#66bb6a" />
                                <stop offset="100%" stopColor="#388e3c" />
                            </linearGradient>
                        </defs>
                        <circle
                            className="progress-ring__circle"
                            stroke="url(#gradientStroke)"
                            strokeWidth="6"
                            fill="transparent"
                            r="105"
                            cx="110"
                            cy="110"
                        />
                    </svg>
                    <Lottie
                        animationData={animationData}
                        loop={false}
                        className="lottie-animation"
                    />
                </div>
                <h1 className="loader-text">
                    {['A', 'y', 'u', 'r', 'k', 'o', 's', 'h'].map((letter, index) => (
                        <span
                            key={index}
                            className="gradient-text"
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            {letter}
                        </span>
                    ))}
                </h1>
            </div>
        </div>
    );
};

export default Loader;
