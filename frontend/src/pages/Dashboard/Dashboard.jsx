import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";
import DashboardView from "./DashboardView.jsx";
import Orders from "./Orders/Orders.jsx";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState(location.state?.activeView || "dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [userId, setUserId] = useState(null); // ✅ ADD THIS
  const [user, setUser] = useState({
    name: "Ayurkosh User",
    email: "",
    avatar: "https://via.placeholder.com/150?text=AU",
    location: "New Delhi, India",
    bio: "Plant enthusiast since 2020"
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    const email = localStorage.getItem("userEmail");
    const storedUserId = localStorage.getItem("userId"); // ✅

    if (!email || !storedUserId) {
      navigate("/");
    } else {
      setUserId(storedUserId); // ✅ store userId in state
      setUser((prev) => ({
        ...prev,
        email: email
      }));
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);


  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
  }, [location.state]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/");
    window.location.reload();
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView user={user} />;
      case "orders":
        return <Orders />;
      case "contact":
        return <ContactHelp />;
      case "settings":
        return (
          <div className="settings-view">
            <h2>Settings</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Location:</strong> {user.location}</p>
            <p><strong>Bio:</strong> {user.bio}</p>
          </div>
        );
      default:
        return <DashboardView user={user} />;
    }
  };

  return (
    <div className="dashboard-container">
      {!isMobile && (

        <Sidebar
          userId={userId}                 // ✅ Now Sidebar will get it
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          handleLogout={handleLogout}
        />

      )}
      <main
        className={`dashboard-content ${!isMobile && (isSidebarOpen ? "with-sidebar-open" : "with-sidebar-collapsed")}`}
      >
        {renderActiveView()}
      </main>
      {isMobile && (
        <BottomNav
          activeView={activeView}
          setActiveView={setActiveView}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Dashboard;