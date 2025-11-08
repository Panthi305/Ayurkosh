// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import Shop from "./pages/Shop/Shop";
import AboutPage from "./pages/AboutPage/AboutPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import SearchResult from "./pages/SearchResult";
import GardenView from "./pages/3-D_Garden/GardenView";
import Orders from './pages/Dashboard/Orders/Orders';
import SavedPlants from './pages/Dashboard/SavedPlants';
import WishlistPage from './pages/Dashboard/WishlistPage';
import PlantSearchResults from "./pages/Dashboard/PlantSearchResults";
import ContactHelp from "./pages/HomePage/ContactHelp";
import ChatBox from "./pages/HomePage/ChatBox";
import LoginModal from "./pages/HomePage/Login";
import "./App.css"
// ✅ Remove Header from Layout
const Layout = ({ children }) => {
  return <div>{children}</div>;
};

function App() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);


  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginModal />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/chatbot" element={<ChatBox />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search-result" element={<SearchResult />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/garden" element={<GardenView />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/saved-plants" element={<SavedPlants />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact" element={<ContactHelp />} />
          <Route path="/plant-search-results" element={<PlantSearchResults />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;