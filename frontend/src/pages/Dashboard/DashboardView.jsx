import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  FaArrowLeft,
  FaCamera,
  FaCog,
  FaEdit,
  FaHeart,
  FaLeaf, FaList,
  FaLock,
  FaQuestionCircle,
  FaSave,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DashboardView.css";

const DashboardView = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [plantPreferences, setPlantPreferences] = useState("");

  const [showAccountPage, setShowAccountPage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);


  const navigate = useNavigate();
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) {
      navigate("/login");
      return;
    }
    setUserId(uid);

    fetchUserProfile(uid);
  }, [navigate]);
  const fetchUserProfile = async (uid) => {
    try {
      const res = await axios.get("https://ayurkosh-backend.onrender.com/get_user_profile", {
        params: { userId: uid }
      });
      if (res.data && !res.data.error) {
        const profile = res.data;
        setUserName(profile.fullName || "");
        setUsername(profile.username || "");
        setUserEmail(profile.email || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setPostalCode(profile.postalCode || "");
        setProfileImage(profile.profileImage || "");
        setPlantPreferences(profile.plantPreferences || "");
      } else {
        console.error("Profile fetch error:", res.data.error);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // ✅ Fetch both histories
  useEffect(() => {
    if (!userId) return;

    const fetchHistories = async () => {
      try {
        const [plantRes, productRes] = await Promise.all([
          axios.get(`https://ayurkosh-backend.onrender.com/get_search_history`, { params: { userId } }),
          axios.get(`https://ayurkosh-backend.onrender.com/get_product_search_history`, { params: { userId } }) // you'll make sure backend exists
        ]);

        const plantHistory = Array.isArray(plantRes.data)
          ? plantRes.data.map(entry => ({
            type: "search",
            item: entry.plant?.common_name || "Unknown Plant",
            searched_at: entry.searched_at
          }))
          : [];

        const productHistory = Array.isArray(productRes.data)
          ? productRes.data.map(entry => ({
            type: "product",
            item: entry.product?.name || "Unknown Product",
            searched_at: entry.searched_at
          }))
          : [];

        // Merge + sort new → old
        const merged = [...plantHistory, ...productHistory].sort(
          (a, b) => new Date(b.searched_at) - new Date(a.searched_at)
        );

        // Add "time ago" display
        const withTimeAgo = merged.map(e => ({
          ...e,
          time: formatTimeAgo(e.searched_at)
        }));

        setRecentActivity(withTimeAgo);
      } catch (err) {
        console.error("Error fetching histories", err);
      }
    };

    fetchHistories();
  }, [userId]);

  const [analyticsData, setAnalyticsData] = useState({
    totalSearches: 24,
    savedPlants: 12,
    lastActivity: "2 hours ago",
  });


  const calculateProfileCompletion = () => {
    let completed = 0;
    const totalFields = 8; // fullName, username, email, phone, address, city, postalCode, profileImage
    if (userName && userName !== "Guest") completed++;
    if (username) completed++;
    if (userEmail) completed++;
    if (phone) completed++;
    if (address) completed++;
    if (city) completed++;
    if (postalCode) completed++;
    if (profileImage) completed++;
    return Math.round((completed / totalFields) * 100);
  };

  const incompleteFields = () => {
    const missing = [];
    if (!userName || userName === "Guest") missing.push("Full Name");
    if (!username) missing.push("Display Name");
    if (!userEmail) missing.push("Email");
    if (!phone) missing.push("Phone Number");
    if (!address) missing.push("Address");
    if (!city) missing.push("City");
    if (!postalCode) missing.push("Postal Code");
    if (!profileImage) missing.push("Profile Picture");
    return missing;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Add new state

  // Update function
  const handleFindMyPerfectPlant = async (e) => {
    e.preventDefault();
    if (!plantPreferences.trim()) {
      alert("Please enter your preferences");
      return;
    }
    try {
      const res = await axios.post("https://ayurkosh-backend.onrender.com/api/search_plants", {
        query: plantPreferences,
        top_k: 10
      });

      // Navigate to new results page
      navigate("/plant-search-results", {
        state: { query: plantPreferences, results: res.data }
      });

    } catch (err) {
      console.error(err);
      alert("Error fetching plant results");
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Example: When saving the profile, refresh profile from backend instead of localStorage
  const handleSaveProfile = async () => {
    try {
      const payload = { userId };
      if (userName) payload.fullName = userName;
      if (username) payload.username = username;
      if (userEmail) payload.email = userEmail;
      if (phone) payload.phone = phone;
      if (address) payload.address = address;
      if (city) payload.city = city;
      if (postalCode) payload.postalCode = postalCode;
      if (profileImage) payload.profileImage = profileImage;

      if (isChangingPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const res = await axios.put("https://ayurkosh-backend.onrender.com/update_profile", payload);
      if (res.data.message) {
        alert("Profile updated successfully!");
        setShowAccountPage(false);
        setIsChangingPassword(false);
        fetchUserProfile(userId); // ✅ refresh with latest data from DB
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error updating profile");
    }
  };



  const handleQuickAction = (action) => {
    switch (action) {
      case "saved":
        alert("Opening saved plants...");
        break;
      case "categories":
        navigate("/shop"); // ✅ Now linking to shop
        break;
      case "search":
        localStorage.removeItem("searchResult");
        navigate("/search-result");
        break;
      case "wishlist":
        alert("Opening wishlist...");
        break;
      default:
        break;
    }
  };


  const getActivityIcon = (type) => {
    switch (type) {
      case "search": return <FaSearch className="plant-activity-icon" />;
      case "view": return <FaLeaf className="plant-activity-icon" />;
      case "save": return <FaHeart className="plant-activity-icon" />;
      default: return <FaList className="plant-activity-icon" />;
    }
  };

  const profileImageClicked = () => {
    console.log("Profile image clicked!");
    // Navigate to profile page, open modal, etc.
  };



  return (
    <div className="plant-dashboard-container">
      {/* HEADER */}
      <header className="plant-header">
        <div className="plant-header-content">

          {/* Profile Image First */}
          <div className="plant-account-menu">
            <button
              className="plant-account-button"
              onClick={() => setIsImagePreviewOpen(true)}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="plant-profile-image" />
              ) : (
                <FaUserCircle className="plant-account-icon" />
              )}
            </button>
          </div>

          {/* Welcome Text */}
          <div className="plant-header-text">
            <h1 className="plant-welcome-title">Welcome, {username || userName}</h1>
            <p className="plant-welcome-subtitle">Discover your curated plant journey</p>
          </div>

          {/* Combined Profile Completion + Button */}
          <div
            className="plant-profile-status-card"
            onClick={() => setShowAccountPage(true)}
            title="Click to view and update your profile"
          >
            <div className="plant-profile-status-left">
              <div className="plant-completion-label">
                <FaUserCircle /> Profile Completion
              </div>
              <div className="plant-progress-bar-container">
                <div
                  className="plant-progress-bar"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
              <span className="plant-completion-text">
                {calculateProfileCompletion()}% Complete
              </span>
            </div>

            <button
              className="plant-update-profile-header-btn slim"
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering the whole card click
                setShowAccountPage(true);
              }}
            >
              <FaEdit /> Update
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="plant-dashboard-main">
        <section className="plant-quick-actions-section">
          <h2 className="plant-section-title">Quick Actions</h2>
          <div className="plant-quick-actions-grid">
            <button
              onClick={() => navigate("/saved-plants")}
              className="plant-quick-action-tile"
            >
              <FaHeart className="plant-quick-action-icon" />
              <span>Saved Plants</span>
            </button>
            <button onClick={() => handleQuickAction("categories")} className="plant-quick-action-tile">
              <FaLeaf className="plant-quick-action-icon" /><span>Explore Categories</span>
            </button>
            <button onClick={() => handleQuickAction("search")} className="plant-quick-action-tile">
              <FaSearch className="plant-quick-action-icon" /><span>New Search</span>
            </button>
            <button
              onClick={() => navigate("/wishlist")}
              className="plant-quick-action-tile"
            >
              <FaList className="plant-quick-action-icon" /><span>Wishlist</span>
            </button>

          </div>
        </section>

        <div className="plant-content-grid">
          <section className="plant-recommendations-section">
            <div className="plant-recommendations-card">
              <h2 className="plant-card-title">Find Your Perfect Plant</h2>
              <p className="plant-card-subtitle">Let our AI curate plants tailored to your unique style and environment.</p>
              <form onSubmit={handleFindMyPerfectPlant}>
                <div className="plant-form-group">
                  <label htmlFor="plant-preferences" className="plant-form-label">Your Preferences</label>
                  <textarea
                    id="plant-preferences"
                    className="plant-form-textarea"
                    placeholder="e.g., vibrant flowers, low-maintenance..."
                    value={plantPreferences}
                    onChange={(e) => setPlantPreferences(e.target.value)}
                  />
                </div>
                <button type="submit" className="plant-find-button">Find My Plant</button>
              </form>
            </div>
          </section>

          <section className="plant-activity-section">
            <div className="plant-activity-card">
              <h2 className="plant-section-title">Recent Activity</h2>
              <div className="plant-activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="plant-activity-item">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="plant-activity-text">{activity.item}</p>
                      <p className="plant-activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ACCOUNT MODAL */}
      {showAccountPage && (
        <div className="plant-account-page-overlay">
          <div className="plant-account-page-content">
            <button className="plant-close-account-page" onClick={() => setShowAccountPage(false)}>
              <FaTimes />
            </button>
            <h2 className="plant-account-page-title">Account Details</h2>

            {incompleteFields().length > 0 && (
              <div className="missing-fields-alert">
                Incomplete: {incompleteFields().join(", ")}
              </div>
            )}

            <div className="plant-profile-image-section">
              <div className="plant-profile-image-container">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="plant-profile-image-large" />
                ) : (
                  <div className="plant-profile-placeholder">
                    <FaUserCircle className="plant-profile-placeholder-icon" />
                  </div>
                )}
                <label className="plant-profile-upload-button">
                  <FaCamera />
                  <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: "none" }} />
                </label>
              </div>
            </div>

            <div className="plant-form-group">
              <label className="plant-form-label">Full Name</label>
              <input className="plant-form-input" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="plant-form-group">
              <label className="plant-form-label">Display Name</label>
              <input className="plant-form-input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="plant-form-group">
              <label className="plant-form-label">Email Address</label>
              <input className="plant-form-input" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
            </div>
            <div className="plant-form-group">
              <label className="plant-form-label">Phone Number</label>
              <input className="plant-form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="plant-form-group">
              <label className="plant-form-label">Address</label>
              <input className="plant-form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="plant-form-group">
              <label className="plant-form-label">City</label>
              <input className="plant-form-input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="plant-form-group">
              <label className="plant-form-label">Postal Code</label>
              <input className="plant-form-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>

            <div className="password-section">
              <button className="toggle-password-btn" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                <FaLock /> {isChangingPassword ? "Cancel Password Change" : "Change Password"}
              </button>
              {isChangingPassword && (
                <>
                  <div className="plant-form-group">
                    <label className="plant-form-label">Current Password</label>
                    <input type="password" className="plant-form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="plant-form-group">
                    <label className="plant-form-label">New Password</label>
                    <input type="password" className="plant-form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="plant-form-group">
                    <label className="plant-form-label">Confirm New Password</label>
                    <input type="password" className="plant-form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="plant-account-actions">
              <button className="plant-save-account-button" onClick={handleSaveProfile}><FaSave /> Save</button>
              <button className="plant-cancel-button" onClick={() => setShowAccountPage(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isImagePreviewOpen && profileImage && (
        <div className="image-preview-overlay" onClick={() => setIsImagePreviewOpen(false)}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <img src={profileImage} alt="Profile Preview" className="image-preview" />
            <button className="close-preview-btn" onClick={() => setIsImagePreviewOpen(false)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;