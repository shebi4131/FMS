import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaHome, FaFileAlt, FaBook, FaUsersCog } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { hasRole } from "../lib/auth";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isLoggedIn");
    sessionStorage.clear();
    setProfileOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Add File", icon: <FaHome />, path: "/home" },
    { label: "Records", icon: <FaFileAlt />, path: "/records" },
    { label: "Record Room Register", icon: <FaBook />, path: "/register" },
    ...(hasRole("Admin")
      ? [{ label: "User Management", icon: <FaUsersCog />, path: "/usermanagement" }]
      : []),
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">FMS</h1>
        <div className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-menu-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="nav-right">
        <div className="profile-container" ref={dropdownRef} onClick={() => setProfileOpen(!profileOpen)}>
          <FaUserCircle className="profile-icon" />
          {profileOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                Profile
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
