import { useState } from "react";
import "./RecordDelete.css";
import { api } from "../lib/api";

export default function RecordDelete({ record, isOpen, onClose, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "", show: false });

  const showMessage = (type, text) => {
    setMessage({ type, text, show: true });
    setTimeout(() => {
      setMessage({ type: "", text: "", show: false });
    }, 4000);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // API call to delete record
      await api.delete(`file/delete/${record.id}`);
      
      // Show success message
      showMessage("success", "Record deleted successfully!");
      
      // Wait a moment for user to see the message
      setTimeout(() => {
        // Call parent delete function
        onDelete(record.id);
        
        // Close modal
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error deleting record:", error);
      
      // Show specific error message based on response
      let errorMessage = "Failed to delete record. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "Record not found. It may have already been deleted.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete this record.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Check your connection and try again.";
      }
      
      showMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setMessage({ type: "", text: "", show: false });
    onClose();
  };

  // Check if user typed DELETE to confirm
  const isConfirmed = confirmText === "DELETE";

  if (!isOpen || !record) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-container">
        <div className="delete-modal-content">
          {/* Message Toast */}
          {message.show && (
            <div className={`message-toast ${message.type}`}>
              <div className="message-content">
                {message.type === "success" ? (
                  <svg className="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg className="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
                <span className="message-text">{message.text}</span>
              </div>
              <div className="message-progress">
                <div className="progress-bar"></div>
              </div>
            </div>
          )}

          {/* Warning Icon */}
          <div className="warning-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>

          {/* Title */}
          <h2 className="delete-title">Delete Record</h2>

          {/* Description */}
          <p className="delete-description">
            Are you sure you want to permanently delete this record? This action cannot be undone.
          </p>

          {/* Record Details */}
          {/* <div className="record-details">
            <div className="detail-item">
              <span className="detail-label">Plot No:</span>
              <span className="detail-value">{record.plotNo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phase:</span>
              <span className="detail-value">{record.phase}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">From:</span>
              <span className="detail-value">{record.from}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">To:</span>
              <span className="detail-value">{record.to}</span>
            </div>
          </div> */}

          {/* Confirmation Input */}
          <div className="confirmation-section">
            <label htmlFor="confirmText" className="confirm-label">
              Type <strong>SECRET PASSWORD</strong> to confirm:
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type PASSWORD here"
              className="confirm-input"
              autoComplete="off"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="delete-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-delete"
              onClick={handleDelete}
              disabled={loading || !isConfirmed}
            >
              {loading ? (
                <span className="loading-content">
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                      <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                    </path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                <span className="delete-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Delete Permanently
                </span>
              )}
            </button>
          </div>

          {/* Close Button */}
          <button 
            className="close-btn" 
            onClick={handleClose} 
            disabled={loading}
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}