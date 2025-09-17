import { useState, useEffect } from "react";
import "./RecordEdit.css";
import { api } from "../lib/api";

export default function RecordEdit({ record, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    plotNo: "",
    stNo: "",
    phase: "",
    from: "",
    carrier: "",
    to: "",
    purpose: "",
    date: "",
    status: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        plotNo: record.plotNo || "",
        stNo: record.stNo || "",
        phase: record.phase || "",
        from: record.from || "",
        carrier: record.carrier || "",
        to: record.to || "",
        purpose: record.purpose || "",
        date: record.date || "",
        status: record.status || "",
        remarks: record.remarks || ""
      });
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.plotNo.trim()) newErrors.plotNo = "Plot No is required";
    if (!formData.stNo.trim()) newErrors.stNo = "Street No is required";
    if (!formData.phase) newErrors.phase = "Phase is required";
    if (!formData.from.trim()) newErrors.from = "From field is required";
    if (!formData.to.trim()) newErrors.to = "To field is required";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.status) newErrors.status = "Status is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // API call to update record
      const response = await api.put(`file/update/${record.id}`, formData);
      
      // Call parent update function
      onUpdate(response.data);
      
      // Close modal
      onClose();
      
      // Show success message
      alert("Record updated successfully!");
      
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      plotNo: "",
      stNo: "",
      phase: "",
      from: "",
      carrier: "",
      to: "",
      purpose: "",
      date: "",
      status: "",
      remarks: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Record</h2>
          <button className="close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="plotNo">Plot No *</label>
              <input
                type="text"
                id="plotNo"
                name="plotNo"
                value={formData.plotNo}
                onChange={handleInputChange}
                className={errors.plotNo ? "error" : ""}
                placeholder="Enter plot number"
              />
              {errors.plotNo && <span className="error-text">{errors.plotNo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="stNo">Street No *</label>
              <input
                type="text"
                id="stNo"
                name="stNo"
                value={formData.stNo}
                onChange={handleInputChange}
                className={errors.stNo ? "error" : ""}
                placeholder="Enter street number"
              />
              {errors.stNo && <span className="error-text">{errors.stNo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phase">Phase *</label>
              <select
                id="phase"
                name="phase"
                value={formData.phase}
                onChange={handleInputChange}
                className={errors.phase ? "error" : ""}
              >
                <option value="">Select Phase</option>
                <option value="JG-I">JG-I</option>
                <option value="JG-II">JG-II</option>
                <option value="KT">KT</option>
                <option value="NAEHS">NAEHS</option>
              </select>
              {errors.phase && <span className="error-text">{errors.phase}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="from">From *</label>
              <input
                type="text"
                id="from"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                className={errors.from ? "error" : ""}
                placeholder="Enter sender"
              />
              {errors.from && <span className="error-text">{errors.from}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="carrier">Carrier</label>
              <input
                type="text"
                id="carrier"
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                placeholder="Enter carrier name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="to">To *</label>
              <input
                type="text"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className={errors.to ? "error" : ""}
                placeholder="Enter recipient"
              />
              {errors.to && <span className="error-text">{errors.to}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose *</label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className={errors.purpose ? "error" : ""}
                placeholder="Enter purpose"
              />
              {errors.purpose && <span className="error-text">{errors.purpose}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? "error" : ""}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={errors.status ? "error" : ""}
              >
                <option value="">Select Status</option>
                <option value="In">In</option>
                <option value="Out">Out</option>
              </select>
              {errors.status && <span className="error-text">{errors.status}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="remarks">Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Enter remarks (optional)"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-update"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                      <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                    </path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}