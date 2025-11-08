// BottomNav.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaTachometerAlt,
  FaBoxOpen,
  FaSignOutAlt,
} from "react-icons/fa";
import "./BottomNav.css";

const BottomNav = ({ activeView, setActiveView, handleLogout }) => {
  const navigate = useNavigate();

  const navItems = [
    {
      key: "home",
      icon: <FaHome />,
      label: "Home",
      onClick: () => navigate("/")  // same as Sidebar
    },
    {
      key: "dashboard",
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      onClick: () => setActiveView("dashboard")
    },
    {
      key: "orders",
      icon: <FaBoxOpen />,
      label: "Orders",
      onClick: () => setActiveView("orders")
    },
    {
      key: "logout",
      icon: <FaSignOutAlt />,
      label: "Logout",
      onClick: handleLogout
    }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(({ key, icon, label, onClick }) => (
        <div
          key={key}
          className={`nav-item ${activeView === key ? "active" : ""}`}
          onClick={onClick}
        >
          {icon}
          <span className="nav-label">{label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;
