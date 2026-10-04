import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";import { useNavigate } from "react-router-dom";
import "./Records.css";

import { api } from "../lib/api";
import RecordEdit from "./RecordEdit";
import RecordDelete from "./RecordDelete";
import { hasRole } from "../lib/auth.JS";
import RecordsPDFExport from "./RecordsPDFExport";

export default function Records() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [activeDropdown, setActiveDropdown] = useState(null);
const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [pdfExportModal, setPdfExportModal] = useState(false);

  // Summary data state
 const [summaryData, setSummaryData] = useState({
    totalFiles: 0,
    filesIn: 0,
    filesOut: 0,
    todaysOutFiles: 0,
    todaysInFiles: 0,
    recentFiles: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

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
    fileOutDate: "",
    fileInDate: "",
    status: "",
    remarks: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 25;

  const handleAddNew = () => {
    navigate("/home");
  };

  const handleExportPDF = () => {
    setPdfExportModal(true);
  };

  const handleClosePDFExport = () => {
    setPdfExportModal(false);
  };

  // Fetch summary data
  const fetchSummaryData = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const response = await api.get("/file/summary");
      setSummaryData(response.data);
    } catch (err) {
      console.error("Error fetching summary data:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch filtered data from backend
  const fetchFilteredData = useCallback(async (page = 1, currentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', itemsPerPage);
      
      // Add filters to query params - only add non-empty values
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value.toString().trim());
        }
      });

      const response = await api.get(`/file/filtered?${queryParams.toString()}`);
      
      if (response.data) {
        setData(response.data.data || []);
        const totalCount = response.data.totalCount || 0;
        setTotalRecords(totalCount);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      } else {
        setData([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
      
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error("Error fetching filtered data:", err);
      setData([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Fetch summary once on mount.
  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  // Single source of truth for loading records: fetch immediately on first
  // mount, then debounce every subsequent filter change so typing fires just
  // ONE request (not one per keystroke, and not a duplicate immediate call).
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      fetchFilteredData(1, filters);
      return;
    }

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchFilteredData(1, filters);
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [filters, fetchFilteredData]);

  // Handle page changes
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchFilteredData(page, filters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
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
    };
    setFilters(resetFilters);
    setCurrentPage(1);
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
    // Update the record in the current data
    setData(prevData => 
      prevData.map(item => 
        item.id === updatedRecord.id ? updatedRecord : item
      )
    );
    setEditModal({ isOpen: false, record: null });
    // Refresh summary data
    fetchSummaryData();
  };

  const handleDeleteConfirm = (recordId) => {
    // Remove the record from current data
    setData(prevData => prevData.filter(item => item.id !== recordId));
    setDeleteModal({ isOpen: false, record: null });
    
    // If the current page becomes empty and it's not the first page, go to previous page
    if (data.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchFilteredData(currentPage - 1, filters);
    } else {
      // Otherwise, refetch current page data to get accurate count
      fetchFilteredData(currentPage, filters);
    }
    
    // Refresh summary data
    fetchSummaryData();
  };

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, record: null });
  };

  const handleCloseDelete = () => {
    setDeleteModal({ isOpen: false, record: null });
  };

 const toggleDropdown = (rowId, event) => {
    if (activeDropdown === rowId) {
      setActiveDropdown(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 160,
    });
    setActiveDropdown(rowId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  // Summary Cards Component
const SummaryCards = () => (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>
        <div className="card-content">
          <h3>Total Files</h3>
          <span className="card-number">
            {summaryLoading ? "..." : summaryData.totalFiles.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </div>
        <div className="card-content">
          <h3>Files In</h3>
          <span className="card-number">
            {summaryLoading ? "..." : summaryData.filesIn.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H5V11H19V13Z"/>
          </svg>
        </div>
        <div className="card-content">
          <h3>Files Out</h3>
          <span className="card-number">
            {summaryLoading ? "..." : summaryData.filesOut.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
          </svg>
        </div>
        <div className="card-content">
          <h3>Today's Out</h3>
          <span className="card-number">
            {summaryLoading ? "..." : summaryData.todaysOutFiles.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
          </svg>
        </div>
        <div className="card-content">
          <h3>Today's In</h3>
          <span className="card-number">
            {summaryLoading ? "..." : summaryData.todaysInFiles.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"/>
          </svg>
        </div>
        <div className="card-content">
          <h3>Recent Files</h3>
          <span className="card-number">
            {summaryLoading ? "..." : summaryData.recentFiles.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  // Loading state for initial load
  if (loading && data.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="system-title">File Management System</h1>
              <h2 className="page-title">Files Record Management</h2>
            </div>
            <div className="header-buttons">
              <button className="add-file-btn" onClick={handleAddNew}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Add File
              </button>
              <button className="export-pdf-btn" onClick={handleExportPDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <SummaryCards />
          <div className="loading-container">
            <p>Loading records...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for initial load
  if (error && data.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="system-title">File Management System</h1>
              <h2 className="page-title">Files Record Management</h2>
            </div>
            <div className="header-buttons">
              <button className="add-file-btn" onClick={handleAddNew}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Add File
              </button>
              <button className="export-pdf-btn" onClick={handleExportPDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <SummaryCards />
          <div className="error-container">
            <p>Error loading records: {error}</p>
            <button 
              onClick={() => fetchFilteredData(currentPage, filters)} 
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="dashboard-page">
        <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="system-title">FECHS - File Management System</h1>
          </div>
          <div className="header-buttons">
            <button className="add-file-btn" onClick={handleAddNew}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              Add File
            </button>
            <button className="export-pdf-btn" onClick={handleExportPDF}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Export PDF
            </button>
            </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <SummaryCards />
        
        <div className="table-container">
          <div className="filter-bar">
            <div className="filter-row-grid">
              <input type="text" placeholder="Plot No" value={filters.plotNo} onChange={(e) => setFilters({ ...filters, plotNo: e.target.value })} />
              <input type="text" placeholder="Street No" value={filters.stNo} onChange={(e) => setFilters({ ...filters, stNo: e.target.value })} />
              <select value={filters.phase} onChange={(e) => setFilters({ ...filters, phase: e.target.value })}>
                <option value="">Phase</option>
                <option value="JG-I">JG-I</option>
                <option value="JG-II">JG-II</option>
                <option value="KT">KT</option>
                <option value="KT Ext">KT Ext</option>
                <option value="Kahuta Road">Kahuta Road</option>
                <option value="NAEHS">NAEHS</option>
              </select>
              <input type="text" placeholder="From" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
              <input type="text" placeholder="To" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
              <select value={filters.purpose} onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
                <option value="">Purpose</option>
                <option value="ndc">NDC</option>
                <option value="transfer">Transfer</option>
                <option value="demarcation">Demarcation</option>
                <option value="legal">Legal</option>
                <option value="accounts">Accounts</option>
                <option value="posession">Posession</option>
                <option value="map">Map</option>
                <option value="completion">Completion</option>
                <option value="water connection">Water Connection</option>
                <option value="noc/nec">NOC/NEC</option>
                <option value="noc iesco">NOC IESCO</option>
                <option value="review">Review</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="filter-row-grid">
              <input type="text" placeholder="Carrier" value={filters.carrier} onChange={(e) => setFilters({ ...filters, carrier: e.target.value })} />
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Status</option>
                <option value="In">In</option>
                <option value="Out">Out</option>
              </select>
              <input type="date" value={filters.fileOutDate} onChange={(e) => setFilters({ ...filters, fileOutDate: e.target.value })} />
              <input type="date" value={filters.fileInDate} onChange={(e) => setFilters({ ...filters, fileInDate: e.target.value })} />
              <input type="text" placeholder="Remarks" value={filters.remarks} onChange={(e) => setFilters({ ...filters, remarks: e.target.value })} />
              <button className="clear-filters" onClick={handleReset} title="Clear All Filters">Clear</button>
            </div>
          </div>

          <table className="records-table">
            <thead>
              <tr className="header-row">
                <th>Plot No</th>
                <th>Street No</th>
                <th>Phase</th>
                <th>From</th>
                <th>Carrier</th>
                <th>To</th>
                <th>Purpose</th>
                <th>Out Date</th>
                <th>In Date</th>
                <th>Remarks</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="data-row">
                    <td>{row.plotNo}</td>
                    <td>{row.stNo}</td>
                    <td>{row.phase}</td>
                    <td>{row.from}</td>
                    <td>{row.carrier}</td>
                    <td>{row.to}</td>
                    <td>{row.purpose}</td>
                    <td>
  {new Date(row.fileOutDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  }{" "} 
  {`(${new Date(row.createdAt).toLocaleString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})})`}
</td>
<td>
  {row.fileInDate
    ? <>
        {new Date(row.fileInDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}{" "}
        {`(${new Date(row.fileInDate).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })})`}
      </>
    : "-"}
</td>
                    <td>{row.remarks}</td>
                    <td>
                     <span className={`status-badge status-${(row.status || "").toLowerCase()}`}>
  {row.status}
</span>
                    </td>
                    <td className="action-cell">
                      <div className="action-dropdown">
                        <button 
                          className="action-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(row.id, e);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                          </svg>
                        </button>
                       {activeDropdown === row.id && createPortal(
                          <div 
                            className="action-menu"
                            style={{ top: dropdownPos.top, left: dropdownPos.left }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              className="action-item edit-btn"
                              onClick={() => handleEdit(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                              Edit
                            </button>
                            {hasRole('Admin') && (
                              <button 
                                className="action-item delete-btn"
                                onClick={() => handleDelete(row)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                                Delete
                              </button>
                            )}
                          </div>,
                          document.body
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-data">
                    <div className="no-data-message">
                      <span>📋</span>
                      <p>No matching records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {loading && (
            <div className="table-loading">
              <p>Loading...</p>
            </div>
          )}
        </div>

        <div className="table-footer">
          <div className="records-info">
            <span className="total-count">
              Showing {data.length} of {totalRecords} records 
              {totalPages > 0 && ` (Page ${currentPage} of ${totalPages})`}
            </span>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="nav-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                ‹ Prev
              </button>
              
              {renderPaginationButtons()}
              
              <button 
                className="nav-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
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

      <RecordsPDFExport
        isOpen={pdfExportModal}
        onClose={handleClosePDFExport}
        filters={filters}
      />
    </div>
  );
}
