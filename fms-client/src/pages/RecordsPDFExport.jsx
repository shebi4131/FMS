import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { api } from "../lib/api";
import "./RecordsPDFExport.css";

const RecordsPDFExport = ({ isOpen, onClose, filters = {} }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = data.filter((row) =>
      (filters.plotNo ? row.plotNo.toLowerCase().includes(filters.plotNo.toLowerCase()) : true) &&
      (filters.stNo ? row.stNo.toLowerCase().includes(filters.stNo.toLowerCase()) : true) &&
      (filters.phase ? row.phase.toLowerCase().includes(filters.phase.toLowerCase()) : true) &&
      (filters.from ? row.from.toLowerCase().includes(filters.from.toLowerCase()) : true) &&
      (filters.carrier ? row.carrier.toLowerCase().includes(filters.carrier.toLowerCase()) : true) &&
      (filters.to ? row.to.toLowerCase().includes(filters.to.toLowerCase()) : true) &&
      (filters.purpose ? row.purpose.toLowerCase().includes(filters.purpose.toLowerCase()) : true) &&
(filters.fileOutDate ? row.fileOutDate && row.fileOutDate.includes(filters.fileOutDate) : true) &&
      (filters.fileInDate ? row.fileInDate && row.fileInDate.includes(filters.fileInDate) : true) &&
      (filters.status ? row.status.toLowerCase().includes(filters.status.toLowerCase()) : true) &&
      (filters.remarks ? row.remarks.toLowerCase().includes(filters.remarks.toLowerCase()) : true)
    );
    
    setFilteredData(filtered);
  }, [filters, data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/file/all");
      let fetchedData = response.data;

      setData(fetchedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const element = document.getElementById("pdf-export-content");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "potrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgWidthOnPdf = imgWidth * ratio;
      const imgHeightOnPdf = imgHeight * ratio;

      let heightLeft = imgHeightOnPdf;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidthOnPdf, imgHeightOnPdf);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer
      while (heightLeft >= 0) {
        position = heightLeft - imgHeightOnPdf;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidthOnPdf,
          imgHeightOnPdf
        );
        heightLeft -= pdfHeight;
      }

      const fileName = `Records_Export_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Send PDF to email first
      const pdfBase64 = pdf.output("datauristring").split(",")[1];
      await api.post("/file/send-pdf-email", {
        pdfBase64,
        fileName,
      });

      // Download after email is sent
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-export-modal">
      <div className="pdf-export-backdrop" onClick={onClose}></div>
      <div className="pdf-export-container">
        <div className="pdf-export-header">
          <h2>Export Records to PDF</h2>
          <div className="pdf-export-actions">
            <button
              onClick={generatePDF}
              disabled={isGenerating || loading || filteredData.length === 0}
              className="export-btn"
            >
              {isGenerating ? "Exporting..." : "Export "}
            </button>
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </div>

        <div className="pdf-export-content">
          {loading && (
            <div className="loading-state">
              <p>Loading records...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={fetchData} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div id="pdf-export-content" className="pdf-content">
              {/* Header */}
              <div className="pdf-header">
                <h1>File Management System - Records Export</h1>
                <div className="export-info">
                  <p>
                    Generated on:{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>Total Records: {filteredData.length}</p>
                </div>
              </div>

              {/* Applied Filters Info */}
              {Object.keys(filters).some((key) => filters[key]) && (
                <div className="filters-info">
                  <h3>Applied Filters:</h3>
                  <div className="filters-list">
                    {Object.entries(filters).map(
                      ([key, value]) =>
                        value && (
                          <span key={key} className="filter-tag">
                            {key}: {value}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Records Table */}
              <div className="pdf-table-container">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>S#</th>
                      <th>Plot No</th>
                      <th>Street No</th>
                      <th>Phase</th>
                      <th>From</th>
                      <th>Carrier</th>
                      <th>To</th>
                      <th>Purpose</th>
                     <th>Out Date</th>
<th>In Date</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.plotNo}</td>
                        <td>{row.stNo}</td>
                        <td>{row.phase}</td>
                        <td>{row.from}</td>
                        <td>{row.carrier}</td>
                        <td>{row.to}</td>
                        <td>{row.purpose}</td>
                       <td>
  {row.fileOutDate
    ? new Date(row.fileOutDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-"}
</td>
<td>
  {row.fileInDate
    ? new Date(row.fileInDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-"}
</td>
                        <td>{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="pdf-footer">
                <p>File Management System © {new Date().getFullYear()}</p>
                {/* <p>
                  Page generated automatically - Please verify data accuracy
                </p> */}
                <p>Developed by - Shoaib Ahmed Sahi</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsPDFExport;