import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { studentService } from "../../services/authService";
import "./Student.css";

const StudentUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    file: null,
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Check if faculty is trying to access student upload page
    if (currentUser && currentUser.role === "faculty") {
      // Redirect faculty back to student dashboard (view-only)
      navigate(`/students/dashboard/${id}`);
      return;
    }

    // Check if student is viewing their own upload page
    if (currentUser && currentUser._id !== id) {
      // Redirect to their own dashboard if trying to access another student's upload
      navigate(`/students/dashboard/${currentUser._id}`);
      return;
    }

    fetchStudentData();
  }, [id, currentUser, navigate]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError("");
      // For upload page, we just need basic student info for validation
      const response = await studentService.getStudentDashboard(id);
      setStudent(response.data.student);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError(error.response?.data?.error || "Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({
        ...prev,
        file: e.dataTransfer.files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
  uploadData.append("description", formData.description);

      if (formData.file) {
        uploadData.append("certificate", formData.file);
      }

      const response = await studentService.uploadAchievement(id, uploadData);

      setSuccess("Activity uploaded successfully! It's now pending approval.");

      // Reset form
      setFormData({
        description: "",
        file: null,
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/students/dashboard/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error.response?.data?.error ||
          "Failed to upload activity. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All entered data will be lost."
      )
    ) {
      navigate(`/students/dashboard/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading upload form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Upload Form</h2>
            <p>{error}</p>
            <button onClick={fetchStudentData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-content">
        <div className="upload-form-container">
          <div className="upload-form-card">
            <div className="form-header">
              <h1>Upload New Activity</h1>
              <p>
                Add your achievements, certifications, and activities to your
                portfolio
              </p>
              {student && (
                <p className="student-info">
                  Uploading for: {student.name.first} {student.name.last} (
                  {student.studentID})
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="upload-form">
              {/* Removed: ACTIVITY CATEGORY, DATE COMPLETED, ACTIVITY TITLE, ORGANIZATION/INSTITUTION, INSTITUTE/ADMIN EMAIL */}

              <div className="form-group">
                <label htmlFor="description">DESCRIPTION *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your achievement, skills gained, or project details..."
                  rows={4}
                  required
                  disabled={submitting}
                  maxLength={1000}
                />
                <small className="char-count">
                  {formData.description.length}/1000 characters
                </small>
              </div>

              <div className="form-group">
                <label>UPLOAD CERTIFICATE/DOCUMENT</label>
                <div
                  className={`file-upload-area ${
                    dragActive ? "drag-active" : ""
                  } ${submitting ? "disabled" : ""}`}
                  onDragEnter={!submitting ? handleDrag : undefined}
                  onDragLeave={!submitting ? handleDrag : undefined}
                  onDragOver={!submitting ? handleDrag : undefined}
                  onDrop={!submitting ? handleDrop : undefined}
                >
                  <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <div className="upload-text">
                    <p>
                      Drag and drop your file here, or{" "}
                      <label htmlFor="file-input" className="browse-link">
                        browse
                      </label>
                    </p>
                    <p className="file-info">PDF, JPG, PNG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    disabled={submitting}
                  />
                </div>
                {formData.file && (
                  <div className="selected-file">
                    <i className="fas fa-file"></i>
                    <span>{formData.file.name}</span>
                    <span className="file-size">
                      ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    {!submitting && (
                      <button
                        type="button"
                        className="remove-file"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, file: null }))
                        }
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i>
                      Submit for Approval
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentUpload;
