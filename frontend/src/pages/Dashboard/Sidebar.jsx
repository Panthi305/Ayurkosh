import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaHome, FaTachometerAlt, FaBoxOpen, FaHeadset, FaSignOutAlt, FaLeaf
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ userId, isSidebarOpen, toggleSidebar, activeView, setActiveView, handleLogout }) => {
    const navigate = useNavigate();

    const [hoveringCollapsed, setHoveringCollapsed] = useState(false);
    const [weatherTemp, setWeatherTemp] = useState(null);
    const [weatherCondition, setWeatherCondition] = useState(null);
    const [city, setCity] = useState(null);
    // Add debug logs to see what's happening
    useEffect(() => {
        if (userId) {
            console.log("Fetching user profile for:", userId);
            fetchUserProfile(userId);
        } else {
            console.warn("No userId provided!");
        }
    }, [userId]);

    useEffect(() => {
        console.log("City updated:", city);
        if (city) {
            fetchWeather(city);
        } else {
            console.warn("City is empty, not fetching weather.");
        }
    }, [city]);

    const fetchUserProfile = async (uid) => {
        try {
            const res = await axios.get("https://ayurkosh-backend.onrender.com/get_user_profile", {
                params: { userId: uid }
            });

            console.log("User profile response:", res.data);

            if (res.data && !res.data.error) {
                const profile = res.data;
                setCity(profile.city || "");
            } else {
                console.error("Profile fetch error:", res.data.error);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
        }
    };

    const fetchWeather = async (cityName) => {
        try {
            console.log("Fetching weather for:", cityName);

            const apiKey = "dcd00eaba186aeed6e8f3241da490fce"; // ✅ Replace with yours
            const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
                params: {
                    q: cityName,
                    units: "metric",
                    appid: apiKey
                }
            });

            console.log("Weather API response:", res.data);

            if (res.data && res.data.main) {
                setWeatherTemp(res.data.main.temp);
                setWeatherCondition(res.data.weather[0].main);
            } else {
                console.warn("No main field in weather data!", res.data);
            }
        } catch (err) {
            console.error("Error fetching weather data:", err);
        }
    };


    const menuItems = [
        {
            name: "Home",
            icon: <FaHome />,
            key: "home",
            onClick: () => navigate("/")
        },
        {
            name: "Dashboard",
            icon: <FaTachometerAlt />,
            key: "dashboard",
            onClick: () => setActiveView("dashboard")
        },
        {
            name: "Orders",
            icon: <FaBoxOpen />,
            key: "orders",
            onClick: () => setActiveView("orders")
        },
    ];

    return (
        <aside
            className={`appSidebar ${isSidebarOpen ? "appSidebar--open" : "appSidebar--collapsed"}`}
            onMouseEnter={() => !isSidebarOpen && setHoveringCollapsed(true)}
            onMouseLeave={() => setHoveringCollapsed(false)}
        >
            {/* Sidebar Header */}
            <div className="appSidebar__header">
                <div
                    className="appSidebar__brand"
                    onMouseEnter={() => !isSidebarOpen && setHoveringCollapsed(true)}
                    onMouseLeave={() => setHoveringCollapsed(false)}
                >
                    {!isSidebarOpen ? (
                        hoveringCollapsed ? (
                            <button className="appSidebar__expandBtn" onClick={toggleSidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="appSidebar__lucideIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                                    <path d="M9 3v18"></path>
                                </svg>
                            </button>
                        ) : (
                            <FaLeaf className="appSidebar__brandIcon" />
                        )
                    ) : (
                        <FaLeaf className="appSidebar__brandIcon" />
                    )}
                </div>

                {isSidebarOpen && (
                    <button className="appSidebar__toggleBtn" onClick={toggleSidebar}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="appSidebar__lucideIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                            <path d="M9 3v18"></path>
                        </svg>
                    </button>
                )}
            </div>

            {/* Menu Items */}
            <ul className="appSidebar__menu">
                {menuItems.map((item) => (
                    <li key={item.key} className={activeView === item.key ? "active" : ""} onClick={item.onClick}>
                        <span className="appSidebar__menuIcon">{item.icon}</span>
                        <span className="appSidebar__menuText">{item.name}</span>
                    </li>
                ))}
            </ul>

            {/* Weather Footer */}
            {isSidebarOpen && (
                <div className="appSidebar__footer">
                    <div className="appSidebar__weather">
                        <span className="temperature">
                            {weatherTemp !== null
                                ? `${weatherCondition === "Rain" ? "🌧️" : "☀️"} ${Math.round(weatherTemp)}°C`
                                : "Loading..."}
                        </span>
                        <span className="location">{city || "Loading..."}</span>
                    </div>
                </div>
            )}

            {/* Logout Button */}
            <div className="appSidebar__logout" onClick={handleLogout}>
                <span className="appSidebar__menuIcon"><FaSignOutAlt /></span>
                <span className="appSidebar__menuText">Logout</span>
            </div>
        </aside>
    );
};

export default Sidebar;
