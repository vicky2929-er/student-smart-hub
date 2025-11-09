import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Department.css";

const DepartmentStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditStudent, setShowEditStudent] = useState(false);

  const [studentForm, setStudentForm] = useState({
    "name.first": "",
    "name.last": "",
    email: "",
    studentID: "",
    batch: "",
    enrollmentYear: "",
    contactNumber: "",
    "address.line1": "",
    "address.line2": "",
    "address.city": "",
    "address.state": "",
    "address.country": "",
    "address.pincode": "",
    guardianName: "",
    guardianContact: "",
    password: "",
    status: "Active",
  });

  useEffect(() => {
    fetchStudentsList();
  }, [id]);

  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching students for department:", id);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/students/${id}`,
        {
          credentials: "include",
        }
      );

      console.log("Students API response status:", response.status);

      const data = await response.json();
      console.log("Students API response data:", data);

      if (response.ok) {
        setStudentsList(data.students || []);
      } else {
        setError(data.error || "Failed to fetch students list");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students list");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        ...studentForm,
        department: id, // Add department ID
        enrollmentYear: parseInt(studentForm.enrollmentYear),
      };

      console.log("Adding student with data:", formData);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/add-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Student added successfully!");
        setShowAddStudent(false);
        setStudentForm({
          "name.first": "",
          "name.last": "",
          email: "",
          studentID: "",
          batch: "",
          enrollmentYear: "",
          contactNumber: "",
          "address.line1": "",
          "address.line2": "",
          "address.city": "",
          "address.state": "",
          "address.country": "",
          "address.pincode": "",
          guardianName: "",
          guardianContact: "",
          password: "",
          status: "Active",
        });
        fetchStudentsList(); // Refresh students list
      } else {
        alert(data.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      alert("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkUploadFile);

    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/bulk-upload-students`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully uploaded ${data.successCount} students!`);
        setShowBulkUpload(false);
        setBulkUploadFile(null);
        fetchStudentsList();
      } else {
        alert(data.error || "Failed to upload students");
      }
    } catch (error) {
      console.error("Error uploading students:", error);
      alert("Failed to upload students");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3030/api"
          }/department/students/${studentId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          alert("Student deleted successfully!");
          fetchStudentsList();
        } else {
          alert(data.error || "Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student");
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      "name.first": student.name?.first || "",
      "name.last": student.name?.last || "",
      email: student.email || "",
      studentID: student.studentID || "",
      batch: student.batch || "",
      enrollmentYear: student.enrollmentYear || "",
      contactNumber: student.contactNumber || "",
      "address.line1": student.address?.line1 || "",
      "address.line2": student.address?.line2 || "",
      "address.city": student.address?.city || "",
      "address.state": student.address?.state || "",
      "address.country": student.address?.country || "",
      "address.pincode": student.address?.pincode || "",
      guardianName: student.guardianName || "",
      guardianContact: student.guardianContact || "",
      password: "",
      status: student.status || "Active",
    });
    setShowEditStudent(true);
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        ...studentForm,
        enrollmentYear: parseInt(studentForm.enrollmentYear),
      };

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/students/${editingStudent._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Student updated successfully!");
        setShowEditStudent(false);
        setEditingStudent(null);
        setStudentForm({
          "name.first": "",
          "name.last": "",
          email: "",
          studentID: "",
          batch: "",
          enrollmentYear: "",
          contactNumber: "",
          "address.line1": "",
          "address.line2": "",
          "address.city": "",
          "address.state": "",
          "address.country": "",
          "address.pincode": "",
          guardianName: "",
          guardianContact: "",
          password: "",
          status: "Active",
        });
        fetchStudentsList(); // Refresh students list
      } else {
        alert(data.error || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student");
    }
  };

  const handleEditStudentClose = () => {
    setShowEditStudent(false);
    setEditingStudent(null);
    setStudentForm({
      "name.first": "",
      "name.last": "",
      email: "",
      studentID: "",
      batch: "",
      enrollmentYear: "",
      contactNumber: "",
      "address.line1": "",
      "address.line2": "",
      "address.city": "",
      "address.state": "",
      "address.country": "",
      "address.pincode": "",
      guardianName: "",
      guardianContact: "",
      password: "",
      status: "Active",
    });
  };

  const filteredAndSortedStudents = studentsList
    .filter((student) => {
      const matchesSearch =
        `${student.name?.first} ${student.name?.last}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.batch || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch = !filterBatch || student.batch === filterBatch;
      const matchesStatus = !filterStatus || student.status === filterStatus;

      return matchesSearch && matchesBatch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = `${a.name?.first} ${a.name?.last}`.toLowerCase();
          bValue = `${b.name?.first} ${b.name?.last}`.toLowerCase();
          break;
        case "batch":
          aValue = a.batch || "";
          bValue = b.batch || "";
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "enrollmentYear":
          aValue = parseInt(a.enrollmentYear) || 0;
          bValue = parseInt(b.enrollmentYear) || 0;
          break;
        case "gpa":
          aValue = parseFloat(a.gpa) || 0;
          bValue = parseFloat(b.gpa) || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const uniqueBatches = [
    ...new Set(studentsList.map((s) => s.batch).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="department-students">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading students list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-students">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Error Loading Students</h2>
          <p>{error}</p>
          <button onClick={fetchStudentsList} className="retry-btn">
            <i className="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="department-students">
      <div className="students-header">
        <div className="header-top">
          <button
            className="back-btn"
            onClick={() => navigate(`/department/dashboard/${id}`)}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <h1>Student Management</h1>
          <div className="header-actions">
            <button
              className="bulk-upload-btn"
              onClick={() => setShowBulkUpload(true)}
            >
              <i className="fas fa-upload"></i>
              Bulk Upload
            </button>
            <button
              className="add-student-btn"
              onClick={() => setShowAddStudent(true)}
            >
              <i className="fas fa-user-plus"></i>
              Add Student
            </button>
          </div>
        </div>

        <div className="students-controls">
          <div className="search-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search students by name, email, ID, or batch..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="filter-section">
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {uniqueBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="students-stats">
        <div className="stat-item">
          <span className="stat-number">{studentsList.length}</span>
          <span className="stat-label">Total Students</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {studentsList.filter((s) => s.status === "Active").length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {filteredAndSortedStudents.length}
          </span>
          <span className="stat-label">Filtered Results</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{uniqueBatches.length}</span>
          <span className="stat-label">Batches</span>
        </div>
      </div>

      <div className="students-list-container">
        <div className="students-list">
          {filteredAndSortedStudents.map((student) => (
            <div key={student._id} className="student-card">
              <div className="student-card-header">
                <div className="student-info">
                  <div className="student-avatar">
                    <img
                      src={
                        student.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          student.name?.first || "S"
                        )}+${encodeURIComponent(
                          student.name?.last || "T"
                        )}&background=e67e22&color=fff&size=50`
                      }
                      alt={`${student.name?.first} ${student.name?.last}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                    <i
                      className="fas fa-user-graduate"
                      style={{ display: "none" }}
                    ></i>
                  </div>
                  <div className="student-details">
                    <h3 className="student-name">
                      {student.name?.first} {student.name?.last}
                    </h3>
                    <span className="student-id">{student.studentID}</span>
                    <div className="student-batch">
                      <span className="batch">
                        {student.batch || "Not assigned"}
                      </span>
                      <span
                        className={`status status-${student.status?.toLowerCase()}`}
                      >
                        {student.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="student-actions">
                  <button
                    className="view-btn"
                    title="View Profile"
                    onClick={() => navigate(`/students/profile/${student._id}`)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="edit-btn"
                    title="Edit Student"
                    onClick={() => handleEditStudent(student)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete-btn"
                    title="Delete Student"
                    onClick={() => handleDeleteStudent(student._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="student-card-body">
                <div className="student-meta">
                  <div className="meta-item">
                    <i className="fas fa-envelope"></i>
                    <span>{student.email}</span>
                  </div>
                  {student.contactNumber && (
                    <div className="meta-item">
                      <i className="fas fa-phone"></i>
                      <span>{student.contactNumber}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <i className="fas fa-calendar"></i>
                    <span>Enrolled: {student.enrollmentYear}</span>
                  </div>
                  {student.gpa && (
                    <div className="meta-item">
                      <i className="fas fa-chart-line"></i>
                      <span>GPA: {student.gpa.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedStudents.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h3>No Students Found</h3>
            <p>
              {searchTerm || filterBatch || filterStatus
                ? "No students match your search criteria."
                : "No students have been added yet."}
            </p>
            {!searchTerm && !filterBatch && !filterStatus && (
              <div className="cta-buttons">
                <button
                  className="add-first-btn"
                  onClick={() => setShowAddStudent(true)}
                >
                  <i className="fas fa-plus"></i>
                  Add Your First Student
                </button>
                <button
                  className="bulk-upload-first-btn"
                  onClick={() => setShowBulkUpload(true)}
                >
                  <i className="fas fa-upload"></i>
                  Bulk Upload Students
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="modal-overlay">
          <div className="modal-content student-modal">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddStudent(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddStudentSubmit} className="student-form">
              {/* Required Fields */}
              <div className="form-section">
                <h3>Required Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name.first">First Name *</label>
                    <input
                      type="text"
                      id="name.first"
                      name="name.first"
                      value={studentForm["name.first"]}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="name.last">Last Name *</label>
                    <input
                      type="text"
                      id="name.last"
                      name="name.last"
                      value={studentForm["name.last"]}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={studentForm.email}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="studentID">Student ID *</label>
                    <input
                      type="text"
                      id="studentID"
                      name="studentID"
                      value={studentForm.studentID}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter student ID"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="batch">Batch</label>
                    <input
                      type="text"
                      id="batch"
                      name="batch"
                      value={studentForm.batch}
                      onChange={handleStudentInputChange}
                      placeholder="e.g., 2021-2025"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="enrollmentYear">Enrollment Year *</label>
                    <input
                      type="number"
                      id="enrollmentYear"
                      name="enrollmentYear"
                      value={studentForm.enrollmentYear}
                      onChange={handleStudentInputChange}
                      required
                      min="2000"
                      max="2030"
                      placeholder="Enter enrollment year"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contactNumber">Contact Number</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={studentForm.contactNumber}
                      onChange={handleStudentInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="guardianName">Guardian Name</label>
                    <input
                      type="text"
                      id="guardianName"
                      name="guardianName"
                      value={studentForm.guardianName}
                      onChange={handleStudentInputChange}
                      placeholder="Enter guardian name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="guardianContact">Guardian Contact</label>
                  <input
                    type="tel"
                    id="guardianContact"
                    name="guardianContact"
                    value={studentForm.guardianContact}
                    onChange={handleStudentInputChange}
                    placeholder="Enter guardian contact number"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.line1">Address Line 1</label>
                    <input
                      type="text"
                      id="address.line1"
                      name="address.line1"
                      value={studentForm["address.line1"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.line2">Address Line 2</label>
                    <input
                      type="text"
                      id="address.line2"
                      name="address.line2"
                      value={studentForm["address.line2"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter address line 2"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={studentForm["address.city"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.state">State</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={studentForm["address.state"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.country">Country</label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={studentForm["address.country"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.pincode">PIN Code</label>
                    <input
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      value={studentForm["address.pincode"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="form-section">
                <h3>System Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={studentForm.password}
                      onChange={handleStudentInputChange}
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={studentForm.status}
                      onChange={handleStudentInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddStudent(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-user-plus"></i>
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="modal-overlay">
          <div className="modal-content bulk-upload-modal">
            <div className="modal-header">
              <h2>Bulk Upload Students</h2>
              <button
                className="close-btn"
                onClick={() => setShowBulkUpload(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="bulk-upload-content">
              <div className="upload-instructions">
                <h3>Upload Instructions</h3>
                <ul>
                  <li>Upload a CSV or Excel file with student data</li>
                  <li>
                    Required columns: first_name, last_name, email, student_id,
                    enrollment_year
                  </li>
                  <li>
                    Optional columns: batch, contact_number, guardian_name,
                    guardian_contact
                  </li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>

              <div className="file-upload-section">
                <div className="file-drop-zone">
                  <input
                    type="file"
                    id="bulk-file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setBulkUploadFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="bulk-file" className="file-drop-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>
                      {bulkUploadFile
                        ? `Selected: ${bulkUploadFile.name}`
                        : "Click to select file or drag and drop"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowBulkUpload(false)}
                >
                  Cancel
                </button>
                <button
                  className="submit-btn"
                  onClick={handleBulkUpload}
                  disabled={!bulkUploadFile}
                >
                  <i className="fas fa-upload"></i>
                  Upload Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && editingStudent && (
        <div className="modal-overlay">
          <div className="modal-content student-modal">
            <div className="modal-header">
              <h2>
                Edit Student - {editingStudent.name?.first}{" "}
                {editingStudent.name?.last}
              </h2>
              <button className="close-btn" onClick={handleEditStudentClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditStudentSubmit} className="student-form">
              {/* Required Fields */}
              <div className="form-section">
                <h3>Required Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-name.first">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="edit-student-name.first"
                      name="name.first"
                      value={studentForm["name.first"]}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-name.last">Last Name *</label>
                    <input
                      type="text"
                      id="edit-student-name.last"
                      name="name.last"
                      value={studentForm["name.last"]}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-email">Email *</label>
                    <input
                      type="email"
                      id="edit-student-email"
                      name="email"
                      value={studentForm.email}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-studentID">Student ID *</label>
                    <input
                      type="text"
                      id="edit-student-studentID"
                      name="studentID"
                      value={studentForm.studentID}
                      onChange={handleStudentInputChange}
                      required
                      placeholder="Enter student ID"
                      disabled
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-batch">Batch</label>
                    <input
                      type="text"
                      id="edit-student-batch"
                      name="batch"
                      value={studentForm.batch}
                      onChange={handleStudentInputChange}
                      placeholder="e.g., 2021-2025"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-enrollmentYear">
                      Enrollment Year *
                    </label>
                    <input
                      type="number"
                      id="edit-student-enrollmentYear"
                      name="enrollmentYear"
                      value={studentForm.enrollmentYear}
                      onChange={handleStudentInputChange}
                      required
                      min="2000"
                      max="2030"
                      placeholder="Enter enrollment year"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-contactNumber">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="edit-student-contactNumber"
                      name="contactNumber"
                      value={studentForm.contactNumber}
                      onChange={handleStudentInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-guardianName">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      id="edit-student-guardianName"
                      name="guardianName"
                      value={studentForm.guardianName}
                      onChange={handleStudentInputChange}
                      placeholder="Enter guardian name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-student-guardianContact">
                    Guardian Contact
                  </label>
                  <input
                    type="tel"
                    id="edit-student-guardianContact"
                    name="guardianContact"
                    value={studentForm.guardianContact}
                    onChange={handleStudentInputChange}
                    placeholder="Enter guardian contact number"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-address.line1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      id="edit-student-address.line1"
                      name="address.line1"
                      value={studentForm["address.line1"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-address.line2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="edit-student-address.line2"
                      name="address.line2"
                      value={studentForm["address.line2"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter address line 2"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-address.city">City</label>
                    <input
                      type="text"
                      id="edit-student-address.city"
                      name="address.city"
                      value={studentForm["address.city"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-address.state">State</label>
                    <input
                      type="text"
                      id="edit-student-address.state"
                      name="address.state"
                      value={studentForm["address.state"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-address.country">
                      Country
                    </label>
                    <input
                      type="text"
                      id="edit-student-address.country"
                      name="address.country"
                      value={studentForm["address.country"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-address.pincode">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      id="edit-student-address.pincode"
                      name="address.pincode"
                      value={studentForm["address.pincode"]}
                      onChange={handleStudentInputChange}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="form-section">
                <h3>System Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-student-password">New Password</label>
                    <input
                      type="password"
                      id="edit-student-password"
                      name="password"
                      value={studentForm.password}
                      onChange={handleStudentInputChange}
                      placeholder="Leave empty to keep current password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-student-status">Status</label>
                    <select
                      id="edit-student-status"
                      name="status"
                      value={studentForm.status}
                      onChange={handleStudentInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleEditStudentClose}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i>
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentStudents;
