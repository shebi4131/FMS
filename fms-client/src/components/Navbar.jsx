import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { hasRole } from "../lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isLoggedIn");
    sessionStorage.clear();
    setOpen(false);
    navigate("/login");
  };

  const handleUserManagement = () => {
    setOpen(false);
    navigate("/usermanagement");
  }

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleRecords = () => {
    navigate("/records");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">FMS</h1>
      </div>

      <div className="nav-right">
        <div
          className="profile-container"
          ref={dropdownRef}
          onClick={() => setOpen(!open)}
        >
          <FaUserCircle className="profile-icon" />
          {open && (
            <div className="dropdown-menu">
              {hasRole('Admin') ?
              <button className="dropdown-item" onClick={handleUserManagement}>
                User Management
              </button>
              : null}
              <button className="dropdown-item" onClick={handleProfile}>
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