import React, { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Later replace with API call
    const fetchUser = async () => {
      // Simulate API response
      const mockUser = {
        username: "Shoaib",
        email: "shoaib@example.com",
        password: "********", // don’t show real password
      };
      setUser(mockUser);
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="avatar"
            className="profile-avatar"
          />
          <h2>{user.username}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-details">
          <h3>Account Details</h3>
          <div className="detail-row">
            <span className="detail-label">Username:</span>
            <span className="detail-value">{user.username}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Password:</span>
            <span className="detail-value">{user.password}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
