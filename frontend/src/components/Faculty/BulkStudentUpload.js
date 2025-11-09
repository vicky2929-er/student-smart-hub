import React, { useState } from "react";
import "./Faculty.css";

const BulkStudentUpload = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      const fileType = selectedFile.type;
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (allowedTypes.includes(fileType)) {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please select a valid Excel file (.xls or .xlsx)");
        setFile(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/bulk-students/download-template`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "student_bulk_upload_template.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("Failed to download template");
      }
    } catch (error) {
      console.error("Template download error:", error);
      setError("Failed to download template");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/bulk-students/bulk-upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        if (data.summary.successful > 0 && onSuccess) {
          onSuccess(data.summary.successful);
        }
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResults(null);
    setError("");
  };

  if (results) {
    return (
      <div className="bulk-upload-modal">
        <div className="bulk-upload-content">
          <div className="bulk-upload-header">
            <h2>Upload Results</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="upload-results">
            <div className="results-summary">
              <div className="summary-item success">
                <i className="fas fa-check-circle"></i>
                <span>Successful: {results.summary.successful}</span>
              </div>
              <div className="summary-item error">
                <i className="fas fa-exclamation-circle"></i>
                <span>Errors: {results.summary.errors}</span>
              </div>
              <div className="summary-item duplicate">
                <i className="fas fa-copy"></i>
                <span>Duplicates: {results.summary.duplicates}</span>
              </div>
            </div>

            {results.results.success.length > 0 && (
              <div className="success-list">
                <h3>Successfully Added Students:</h3>
                <div className="students-list">
                  {results.results.success.map((student, index) => (
                    <div key={index} className="student-item success">
                      <i className="fas fa-user-check"></i>
                      <span>
                        {student.name} ({student.rollNumber})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.results.errors.length > 0 && (
              <div className="error-list">
                <h3>Errors:</h3>
                <div className="error-items">
                  {results.results.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>
                        Row {error.row}: {error.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.results.duplicates.length > 0 && (
              <div className="duplicate-list">
                <h3>Duplicate Students (Skipped):</h3>
                <div className="duplicate-items">
                  {results.results.duplicates.map((duplicate, index) => (
                    <div key={index} className="duplicate-item">
                      <i className="fas fa-copy"></i>
                      <span>
                        Row {duplicate.row}: {duplicate.existing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="upload-actions">
            <button className="btn secondary" onClick={resetUpload}>
              Upload Another File
            </button>
            <button className="btn primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-upload-overlay" onClick={onClose}>
  <div
    className="bulk-upload-content"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header (sticky, not scrollable) */}
    <div className="bulk-upload-header">
      <h2>Bulk Student Upload</h2>
      <button className="close-btn" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>

    {/* Scrollable body */}
    <div className="bulk-upload-body">
      <div className="upload-instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Download the Excel template and fill in student details</li>
          <li>
            <strong>Required columns:</strong> name.first, name.last, email,
            studentID
          </li>
          <li>
            <strong>Optional columns:</strong> dob, gender, contactNumber,
            address fields (address.line1, address.city, etc.),
            enrollmentYear, batch, gpa, attendance, skills, password, status
          </li>
          <li>If no password is provided, default will be studentID@123</li>
          <li>
            <strong>Skills:</strong> Enter as comma-separated values (e.g.,
            "JavaScript, Python, React")
          </li>
          <li>
            <strong>Date format:</strong> Use YYYY-MM-DD format for dates
          </li>
          <li>
            The template includes an Instructions sheet with detailed field
            descriptions
          </li>
          <li>Maximum file size: 5MB</li>
          <li>
            <strong>Note:</strong> Department and coordinator will be
            automatically assigned based on your faculty profile
          </li>
        </ul>
      </div>

      <div className="template-download">
        <button className="btn secondary" onClick={downloadTemplate}>
          <i className="fas fa-download"></i>
          Download Excel Template
        </button>
      </div>

      <div
        className={`file-drop-zone ${dragOver ? "drag-over" : ""} ${
          file ? "has-file" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {file ? (
          <div className="file-selected">
            <i className="fas fa-file-excel"></i>
            <span>{file.name}</span>
            <button
              className="remove-file"
              onClick={() => setFile(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="drop-zone-content">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Drop Excel file here or click to browse</p>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileInputChange}
              className="file-input"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}
    </div>

    {/* Actions (sticky bottom, not scrollable) */}
    <div className="upload-actions">
      <button className="btn secondary" onClick={onClose}>
        Cancel
      </button>
      <button
        className="btn primary"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Uploading...
          </>
        ) : (
          <>
            <i className="fas fa-upload"></i>
            Upload Students
          </>
        )}
      </button>
    </div>
  </div>
</div>

  );
};

export default BulkStudentUpload;
