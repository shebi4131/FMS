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
    fileOutDate: "",
    fileInDate: "",
    status: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Populate form when record changes or modal opens
  useEffect(() => {
    if (record && isOpen) {
      console.log('Populating form with record:', record); // Debug log
      setFormData({
        plotNo: record.plotNo || "",
        stNo: record.stNo || "",
        phase: record.phase || "",
        from: record.from || "",
        carrier: record.carrier || "",  
        to: record.to || "",
        purpose: record.purpose || "",
        fileOutDate: record.fileOutDate ? formatDateForInput(record.fileOutDate) : "",
        fileInDate: record.fileInDate ? formatDateForInput(record.fileInDate) : "",   // ADD THIS
        status: record.status || "",
        remarks: record.remarks || ""
      });
      setErrors({}); // Clear any previous errors
    }
  }, [record, isOpen]);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  // Show notification function
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000); // Hide after 5 seconds
  };

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
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.fileInDate) newErrors.fileInDate = "File In Date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      // API call to update record
      const response = await api.put(`file/update/${record.id}`, formData);
      
      // Call parent update function
      if (onUpdate) {
        onUpdate(response.data);
      }
      
      // Show success notification
      showNotification('success', 'Record updated successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error updating record:", error);
      const errorMessage = error.response?.data?.message || 'Failed to update record. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data
    setFormData({
      plotNo: "",
      stNo: "",
      phase: "",
      from: "",
      carrier: "",
      to: "",
      purpose: "",
      fileOutDate: "",
      fileInDate: "",
      status: "",
      remarks: ""
    });
    setErrors({});
    setNotification({ show: false, type: '', message: '' });
    onClose();
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </div>
            <span>{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, type: '', message: '' })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Record</h2>
          {/* <button className="close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button> */}
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
                readOnly
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
                readOnly
              />
              {errors.stNo && <span className="error-text">{errors.stNo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phase">Phase *</label>
              <input
                id="phase"
                name="phase"
                value={formData.phase}
                onChange={handleInputChange}
                className={errors.phase ? "error" : ""}
                 readOnly
              />
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
              />
              {errors.purpose && <span className="error-text">{errors.purpose}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fileOutDate">Date Out*</label>
              <input
                type="date"
                id="fileOutDate"
                name="fileOutDate"
                value={formData.fileOutDate}
                onChange={handleInputChange}
                 readOnly
                className={errors.fileOutDate ? "error" : ""}
              />
              {errors.fileOutDate && <span className="error-text">{errors.fileOutDate}</span>}
            </div>


 <div className="form-group">
              <label htmlFor="fileInDate">Date In</label>
              <input
                type="date"
                id="fileInDate"
                name="fileInDate"
                value={formData.fileInDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
              />
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