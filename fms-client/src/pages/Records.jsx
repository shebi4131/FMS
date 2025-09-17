import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Records.css";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import RecordEdit from "./RecordEdit";
import RecordDelete from "./RecordDelete";
import { hasRole } from "../lib/auth.JS";

export default function Records() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleAddNew = () => {
    navigate("/home");
  };

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, record: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null });

  const [filters, setFilters] = useState({
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

  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/file/all");
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on filters
  useEffect(() => {
    const filtered = data.filter((row) =>
      (filters.plotNo ? row.plotNo.toLowerCase().includes(filters.plotNo.toLowerCase()) : true) &&
      (filters.stNo ? row.stNo.toLowerCase().includes(filters.stNo.toLowerCase()) : true) &&
      (filters.phase ? row.phase.toLowerCase().includes(filters.phase.toLowerCase()) : true) &&
      (filters.from ? row.from.toLowerCase().includes(filters.from.toLowerCase()) : true) &&
      (filters.carrier ? row.carrier.toLowerCase().includes(filters.carrier.toLowerCase()) : true) &&
      (filters.to ? row.to.toLowerCase().includes(filters.to.toLowerCase()) : true) &&
      (filters.purpose ? row.purpose.toLowerCase().includes(filters.purpose.toLowerCase()) : true) &&
      (filters.date ? row.date.includes(filters.date) : true) &&
      (filters.status ? row.status.toLowerCase().includes(filters.status.toLowerCase()) : true) &&
      (filters.remarks ? row.remarks.toLowerCase().includes(filters.remarks.toLowerCase()) : true)
    );
    
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [filters, data]);

  const handleReset = () => {
    setFilters({
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
  };

  // Modal handlers
  const handleEdit = (row) => {
    setEditModal({ isOpen: true, record: row });
    setActiveDropdown(null);
  };

  const handleDelete = (row) => {
    setDeleteModal({ isOpen: true, record: row });
    setActiveDropdown(null);
  };

  const handleEditUpdate = (updatedRecord) => {
    // Update the record in the data array
    setData(prevData => 
      prevData.map(item => 
        item.id === updatedRecord.id ? updatedRecord : item
      )
    );
    setEditModal({ isOpen: false, record: null });
  };

  const handleDeleteConfirm = (recordId) => {
    // Remove the record from the data array
    setData(prevData => prevData.filter(item => item.id !== recordId));
    setDeleteModal({ isOpen: false, record: null });
  };

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, record: null });
  };

  const handleCloseDelete = () => {
    setDeleteModal({ isOpen: false, record: null });
  };

  const toggleDropdown = (rowId) => {
    setActiveDropdown(activeDropdown === rowId ? null : rowId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  // Loading state
  if (loading) {
    return (
      <div className="records-container">
        <Navbar />
        <div className="records-card">
          <div className="card-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="system-title">File Management System</h1>
                <h2 className="page-title">Files Record Management</h2>
              </div>
              <button className="add-file-btn" onClick={handleAddNew}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Add File
              </button>
            </div>
          </div>
          <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading records...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="records-container">
        <Navbar />
        <div className="records-card">
          <div className="card-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="system-title">File Management System</h1>
                <h2 className="page-title">Files Record Management</h2>
              </div>
              <button className="add-file-btn" onClick={handleAddNew}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Add File
              </button>
            </div>
          </div>
          <div className="error-container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
            <p>Error loading records: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="records-container">
      <Navbar />
      <div className="records-card">
        <div className="card-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="system-title">File Management System</h1>
              <h2 className="page-title">Files Record Management</h2>
            </div>
            <button className="add-file-btn" onClick={handleAddNew}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              Add File
            </button>
          </div>
        </div>
      
        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr className="header-row">
                <th>#</th>
                <th>Plot No</th>
                <th>Street No</th>
                <th>Phase</th>
                <th>From</th>
                <th>Carrier</th>
                <th>To</th>
                <th>Purpose</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Status</th>
                {hasRole('Admin') || hasRole('Manager') ? <th>Action</th> : null}
              </tr>
              
              <tr className="filter-row">
                <td className="filter-cell">
                  <button className="clear-filters" onClick={handleReset} title="Clear All Filters">
                    ✕
                  </button>
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="Plot No" 
                    value={filters.plotNo} 
                    onChange={(e) => setFilters({ ...filters, plotNo: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="Street No" 
                    value={filters.stNo} 
                    onChange={(e) => setFilters({ ...filters, stNo: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <select 
                    value={filters.phase} 
                    onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="JG-I">JG-I</option>
                    <option value="JG-II">JG-II</option>
                    <option value="KT">KT</option>
                    <option value="NAEHS">NAEHS</option>
                  </select>
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="From" 
                    value={filters.from} 
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="Carrier" 
                    value={filters.carrier} 
                    onChange={(e) => setFilters({ ...filters, carrier: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="To" 
                    value={filters.to} 
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="Purpose" 
                    value={filters.purpose} 
                    onChange={(e) => setFilters({ ...filters, purpose: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <input 
                    type="date" 
                    value={filters.date} 
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <input 
                    type="text" 
                    placeholder="Remarks" 
                    value={filters.remarks} 
                    onChange={(e) => setFilters({ ...filters, remarks: e.target.value })} 
                  />
                </td>
                <td className="filter-cell">
                  <select 
                    value={filters.status} 
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">Status</option>
                    <option value="In">In</option>
                    <option value="Out">Out</option>
                  </select>
                </td>
                
              </tr>
            </thead>

            <tbody>
              {currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <tr key={row.id} className="data-row">
                    <td>{startIndex + index + 1}</td>
                    <td><span className="plot-number">{row.plotNo}</span></td>
                    <td>{row.stNo}</td>
                    <td><span className={`phase-badge phase-${row.phase.toLowerCase().replace('-', '')}`}>{row.phase}</span></td>
                    <td>{row.from}</td>
                    <td>{row.carrier}</td>
                    <td>{row.to}</td>
                    <td>{row.purpose}</td>
                    <td>{new Date(row.date).toLocaleString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}</td>
                    <td><span className="remarks-text">{row.remarks}</span></td>
                    <td>
                      <span className={`status-badge status-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                      {hasRole('Admin') || hasRole('Manager') ?
                    <td className="action-cell">
                      <div className="action-dropdown">
                        <button 
                          className="action-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(row.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                          </svg>
                        </button>
                        {activeDropdown === row.id && (
                          <div className="action-menu">
                            <button 
                              className="action-item edit-btn"
                              onClick={() => handleEdit(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                              Edit
                            </button>
                            <button 
                              className="action-item delete-btn"
                              onClick={() => handleDelete(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="no-data">
                    <div className="no-data-message">
                      <span>📋</span>
                      <p>No matching records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="records-info">
            <span className="total-count">
              Showing {currentData.length} of {filteredData.length} records
            </span>
            {filteredData.length !== data.length && (
              <span className="filter-info">
                (filtered from {data.length} total records)
              </span>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="nav-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹ Prev
              </button>
              
              {renderPaginationButtons()}
              
              <button 
                className="nav-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Components */}
      <RecordEdit
        record={editModal.record}
        isOpen={editModal.isOpen}
        onClose={handleCloseEdit}
        onUpdate={handleEditUpdate}
      />

      <RecordDelete
        record={deleteModal.record}
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDelete}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}