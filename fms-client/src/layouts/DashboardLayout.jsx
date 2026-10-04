import React from "react";
import Navbar from "../components/Navbar";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
