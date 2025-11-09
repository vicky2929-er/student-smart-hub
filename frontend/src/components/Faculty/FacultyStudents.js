import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facultyService } from "../../services/authService";
import "./FacultyStudents.css";

const FacultyStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getStudents(id);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Students error:", error);
      setError(error.response?.data?.error || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/students/dashboard/${studentId}`);
  };

  const handleViewPortfolio = (studentId) => {
    navigate(`/students/portfolio/${studentId}`);
  };

  const handleEditStudent = (e, student) => {
    e.stopPropagation();
    setEditingStudent(student);
    setEditForm({
      name: {
        first: student.name?.first || "",
        last: student.name?.last || "",
      },
      email: student.email || "",
      studentID: student.studentID || "",
      batch: student.batch || "",
      enrollmentYear: student.enrollmentYear || "",
      contactNumber: student.contactNumber || "",
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianContact: student.guardianContact || "",
      gpa: student.gpa || "",
      attendance: student.attendance || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteStudent = (e, student) => {
    e.stopPropagation();
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await facultyService.editStudent(id, editingStudent._id, editForm);
      setShowEditModal(false);
      setEditingStudent(null);
      setEditForm({});
      await fetchStudents(); // Refresh
    } catch (error) {
      console.error("Edit student error:", error);
      setError(error.response?.data?.error || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await facultyService.deleteStudent(id, studentToDelete._id);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      await fetchStudents(); // Refresh
    } catch (error) {
      console.error("Delete student error:", error);
      setError(error.response?.data?.error || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Filter
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const fullName = `${student.name?.first || ""} ${
      student.name?.last || ""
    }`.toLowerCase();
    const studentId = (student.studentID || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || studentId.includes(searchLower);
  });

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.name?.first || ""} ${a.name?.last || ""}`.localeCompare(
          `${b.name?.first || ""} ${b.name?.last || ""}`
        );
      case "cgpa":
        return (b.cgpa || 0) - (a.cgpa || 0);
      case "achievements":
        return (b.achievementCount || 0) - (a.achievementCount || 0);
      case "recent":
        return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      {/* Welcome */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>My Students</h1>
          <p>Manage and monitor your assigned students</p>
        </div>
      </div>

      {/* Controls */}
      <div className="students-controls">
        <div className="search-and-sort">
          {/* Search */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Sort */}
          <div className="sort-box">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="cgpa">Sort by CGPA</option>
              <option value="achievements">Sort by Achievements</option>
              <option value="recent">Sort by Recent Activity</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="students-summary">
          <span className="student-count">
            {filteredStudents.length === students.length
              ? `${students.length} Student${students.length !== 1 ? "s" : ""}`
              : `${filteredStudents.length} of ${students.length} Student${
                  students.length !== 1 ? "s" : ""
                }`}
          </span>
        </div>
      </div>

      {/* Students Grid */}
      <div className="faculty-student-dashboard-content">
        <div className="faculty-students-container">
          {sortedStudents.length > 0 ? (
            <div className="faculty-students-grid">
              {sortedStudents.map((student) => (
                <div
                  key={student._id}
                  className="faculty-student-card"
                  onClick={() => handleViewStudent(student._id)}
                >
                  <div className="faculty-student-card-header">
                    <div className="faculty-student-avatar">
                      {student.profilePicture ? (
                        <>
                          <img
                            src={student.profilePicture}
                            alt={`${student.name?.first} ${student.name?.last}`}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div
                            className="faculty-student-avatar-fallback"
                            style={{ display: "none" }}
                          >
                            {student.name?.first?.charAt(0) || "S"}
                          </div>
                        </>
                      ) : (
                        <div className="faculty-student-avatar-fallback">
                          {student.name?.first?.charAt(0) || "S"}
                        </div>
                      )}
                    </div>
                    <div className="faculty-student-card-actions">
                      <button
                        className="faculty-card-action-btn faculty-edit-btn"
                        onClick={(e) => handleEditStudent(e, student)}
                        title="Edit Student"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="faculty-card-action-btn faculty-delete-btn"
                        onClick={(e) => handleDeleteStudent(e, student)}
                        title="Delete Student"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="faculty-student-card-body">
                    <h3 className="faculty-student-name">
                      {student.name?.first} {student.name?.last}
                    </h3>
                    <div className="faculty-student-id">
                      ID: {student.studentID}
                    </div>
                    <div className="faculty-student-batch">
                      Batch: {student.batch}
                    </div>
                  </div>

                  <div className="faculty-student-card-stats">
                    <div className="faculty-stat-item">
                      <div className="faculty-stat-value">
                        {student.cgpa ? `${student.cgpa.toFixed(2)}/10` : "N/A"}
                      </div>
                      <div className="faculty-stat-label">CGPA</div>
                    </div>
                    <div className="faculty-stat-item">
                      <div className="faculty-stat-value">
                        {student.pendingReviews || 0}
                      </div>
                      <div className="faculty-stat-label">PENDING</div>
                    </div>
                  </div>

                  <div className="faculty-student-card-footer">
                    <div className="faculty-achievements-badge">
                      <i className="fas fa-trophy"></i>
                      <span>{student.achievementCount || 0} Achievements</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="faculty-empty-state">
              <div className="faculty-empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Students Found</h3>
              <p>
                {searchTerm
                  ? `No students match "${searchTerm}". Try searching with a different name or student ID.`
                  : "No students assigned to you yet"}
              </p>
              {searchTerm && (
                <button
                  className="faculty-cta-btn"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="fas fa-times"></i>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingStudent(null);
              setEditForm({});
            }
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                  setEditForm({});
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              {/* Form Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="name.first"
                    value={editForm.name?.first || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="name.last"
                    value={editForm.name?.last || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="studentID"
                    value={editForm.studentID || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={editForm.batch || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Enrollment Year</label>
                  <input
                    type="number"
                    name="enrollmentYear"
                    value={editForm.enrollmentYear || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editForm.contactNumber || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="gpa"
                    value={editForm.gpa || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={editForm.address || ""}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={editForm.guardianName || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Contact</label>
                  <input
                    type="tel"
                    name="guardianContact"
                    value={editForm.guardianContact || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    setEditForm({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setStudentToDelete(null);
            }
          }}
        >
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Delete Student</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-form">
              <div className="delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {studentToDelete?.name?.first} {studentToDelete?.name?.last}
                  </strong>
                  ?
                </p>
                <p className="warning-text">
                  This action cannot be undone. All student data including
                  achievements will be permanently removed.
                </p>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="delete-confirm-btn"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyStudents;
