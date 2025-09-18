import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    plotNo: "",
    stNo: "",
    phase: "",
    from: "",
    carrier: "",
    to: "",
    purpose: "",
    date: "",
    status: "In",
    remarks: ""
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post("file/create", form);
      setMessage("File entered successfully!");
      setForm({
        plotNo: "",
        stNo: "",
        phase: "",
        from: "",
        carrier: "",
        to: "",
        purpose: "",
        date: "",
        status: "In",
        remarks: ""
      });

      navigate("/records");
    } catch (error) {
      setMessage(JSON.stringify(error.response?.data) || "File entrance failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <Navbar />
      <div className="home-body">
        <div className="home-content">
          <div className="card form-card">
            <div className="card-header">
              <div className="header-content">
                <div className="header-text">
                  <h2 className="card-title">
                    <span className="title-icon">📁</span>
                    File Entry Form
                  </h2>
                  <p className="card-subtitle">Enter file tracking information</p>
                </div>
                <button
                  className="view-records-btn"
                  onClick={() => navigate("/records")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                  View Records
                </button>
              </div>
            </div>

            <form className="filein-form" onSubmit={handleSubmit}>
              {/* Property Information */}
              <div className="form-section">
                <h3 className="section-title">Property Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Plot No <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="plotNo"
                      value={form.plotNo}
                      onChange={handleChange}
                      placeholder="Enter plot number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Street No <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="stNo"
                      value={form.stNo}
                      onChange={handleChange}
                      placeholder="Enter street number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Phase <span className="required">*</span>
                    </label>
                    <select
                      name="phase"
                      value={form.phase}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Phase</option>
                      <option value="JG-I">JG-I</option>
                      <option value="JG-II">JG-II</option>
                      <option value="KT">KT</option>
                      <option value="NAEHS">NAEHS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* File Movement Information */}
              <div className="form-section">
                <h3 className="section-title">File Movement Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      From <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="from"
                      value={form.from}
                      onChange={handleChange}
                      placeholder="Enter sender name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Carrier</label>
                    <input
                      type="text"
                      name="carrier"
                      value={form.carrier}
                      onChange={handleChange}
                      placeholder="Enter carrier name"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      To <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="to"
                      value={form.to}
                      onChange={handleChange}
                      placeholder="Enter receiver name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Purpose and Status */}
              <div className="form-section">
                <h3 className="section-title">Purpose & Status</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Purpose <span className="required">*</span>
                    </label>
                    <select
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Purpose</option>
                      <option value="ndc">NDC</option>
                      <option value="transfer">Transfer</option>
                      <option value="demarcation">Demarcation</option>
                      <option value="legal">Legal</option>
                      <option value="accounts">Accounts</option>
                      <option value="review">Review</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Status <span className="required">*</span>
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="In">In</option>
                      <option value="Out">Out</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="form-section">
                <h3 className="section-title">Additional Information</h3>
                <div className="form-row full-width">
                  <div className="form-group full-width">
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Enter any additional remarks or notes"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  <span className="btn-icon">💾</span>
                  {loading ? "Entering..." : "Save Files"}
                </button>
              </div>
              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
