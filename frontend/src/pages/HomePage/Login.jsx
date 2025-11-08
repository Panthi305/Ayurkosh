import Lottie from "lottie-react";
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import a3Json from "../../assets/a4.json";
import "./Login.css";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [activeForm, setActiveForm] = useState("login");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [agree, setAgree] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please fill in all fields.");
            console.log("Login failed: Missing email or password");
            return;
        }
        try {
            const res = await fetch("https://ayurkosh-backend.onrender.com/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            console.log("Login response:", data);
            if (!res.ok) {
                setError(data.error || "Login failed.");
                console.log("Login failed, status:", res.status, "message:", data.error);
                return;
            }
            if (!data.userId || !data.email) {
                setError("Invalid response from server: Missing userId or email.");
                console.log("Invalid login response:", data);
                return;
            }
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userId", data.userId);
            console.log("Stored in localStorage:", { userEmail: data.email, userId: data.userId });
            alert("Login successful!");
            if (onLoginSuccess) onLoginSuccess();
            onClose(true);
        } catch (err) {
            setError("Error connecting to server. Please try again.");
            console.error("Login error:", err.message);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!fullName || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            console.log("Signup failed: Missing fields");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            console.log("Signup failed: Passwords do not match");
            return;
        }
        if (!agree) {
            setError("You must agree to the Terms & Privacy Policy.");
            console.log("Signup failed: Terms not agreed");
            return;
        }
        try {
            const res = await fetch("https://ayurkosh-backend.onrender.com/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fullName, email, password }),
            });
            const data = await res.json();
            console.log("Signup response:", data);
            if (!res.ok) {
                setError(data.error || "Signup failed.");
                console.log("Signup failed, status:", res.status, "message:", data.error);
                return;
            }
            if (!data.userId || !data.email) {
                setError("Invalid response from server: Missing userId or email.");
                console.log("Invalid signup response:", data);
                return;
            }
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userId", data.userId);
            console.log("Stored in localStorage:", { userEmail: data.email, userId: data.userId });
            alert("Signup successful! You are now logged in.");
            if (onLoginSuccess) onLoginSuccess();
            onClose(true);
        } catch (err) {
            setError("Error connecting to server. Please try again.");
            console.error("Signup error:", err.message);
        }
    };

    const switchForm = (form) => {
        setActiveForm(form);
        setError("");
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgree(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={() => onClose(false)}>
                    ×
                </button>
                <div className="modal-body">
                    <div className="form-section">
                        {activeForm === "login" ? (
                            <form onSubmit={handleLoginSubmit}>
                                <h2>Login</h2>
                                <div className="form-group">
                                    <label htmlFor="login-email">Email</label>
                                    <input
                                        type="email"
                                        id="login-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="login-password">Password</label>
                                    <input
                                        type="password"
                                        id="login-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                {error && <p className="error">{error}</p>}
                                <button type="submit" className="login-button">
                                    Login
                                </button>
                                <p className="toggle-link">
                                    Don't have an account?{" "}
                                    <span onClick={() => switchForm("signup")}>Signup</span>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleSignupSubmit}>
                                <h2>Signup</h2>
                                <div className="form-group">
                                    <label htmlFor="signup-name">Full Name</label>
                                    <input
                                        type="text"
                                        id="signup-name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="signup-email">Email</label>
                                    <input
                                        type="email"
                                        id="signup-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="signup-password">Password</label>
                                    <input
                                        type="password"
                                        id="signup-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="signup-confirm">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="signup-confirm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="signup-agree"
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                        required
                                    />
                                    <label htmlFor="signup-agree">
                                        I agree to the <Link to="/terms-and-conditions">Terms & Privacy Policy</Link>
                                    </label>
                                </div>
                                {error && <p className="error">{error}</p>}
                                <button type="submit" className="login-button">
                                    Signup
                                </button>
                                <p className="toggle-link">
                                    Already have an account?{" "}
                                    <span onClick={() => switchForm("login")}>Login</span>
                                </p>
                            </form>
                        )}
                    </div>
                    <div className="sidebar-section">
                        <Lottie
                            animationData={a3Json}
                            loop
                            style={{ height: 400, width: 350 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;