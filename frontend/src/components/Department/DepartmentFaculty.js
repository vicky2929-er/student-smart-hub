import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { departmentService } from "../../services/authService";
import "./Department.css";

const DepartmentFaculty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [showEditFaculty, setShowEditFaculty] = useState(false);

  const [facultyForm, setFacultyForm] = useState({
    "name.first": "",
    "name.last": "",
    email: "",
    facultyID: "",
    designation: "Assistant Professor",
    specialization: "",
    contactNumber: "",
    "address.line1": "",
    "address.line2": "",
    "address.city": "",
    "address.state": "",
    "address.country": "",
    "address.pincode": "",
    experience: "",
    qualifications: "",
    password: "",
    status: "Active",
  });

  useEffect(() => {
    fetchFacultyList();
  }, [id]);

  const fetchFacultyList = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/faculty/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFacultyList(data.faculty || []);
      } else {
        setError(data.error || "Failed to fetch faculty list");
      }
    } catch (error) {
      console.error("Error fetching faculty:", error);
      setError("Failed to load faculty list");
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

  const handleFacultyInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFacultySubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        ...facultyForm,
        department: id, // Add department ID
        qualifications: facultyForm.qualifications
          ? facultyForm.qualifications
              .split(",")
              .map((q) => q.trim())
              .filter((q) => q)
          : [],
      };

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/add-faculty`,
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
        alert("Faculty added successfully!");
        setShowAddFaculty(false);
        setFacultyForm({
          "name.first": "",
          "name.last": "",
          email: "",
          facultyID: "",
          designation: "Assistant Professor",
          specialization: "",
          contactNumber: "",
          "address.line1": "",
          "address.line2": "",
          "address.city": "",
          "address.state": "",
          "address.country": "",
          "address.pincode": "",
          experience: "",
          qualifications: "",
          password: "",
          status: "Active",
        });
        fetchFacultyList(); // Refresh faculty list
      } else {
        alert(data.error || "Failed to add faculty");
      }
    } catch (error) {
      console.error("Error adding faculty:", error);
      alert("Failed to add faculty");
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (
      window.confirm("Are you sure you want to delete this faculty member?")
    ) {
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3030/api"
          }/department/faculty/${facultyId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          alert("Faculty deleted successfully!");
          fetchFacultyList();
        } else {
          alert(data.error || "Failed to delete faculty");
        }
      } catch (error) {
        console.error("Error deleting faculty:", error);
        alert("Failed to delete faculty");
      }
    }
  };

  const handleEditFaculty = (faculty) => {
    setEditingFaculty(faculty);
    setFacultyForm({
      "name.first": faculty.name?.first || "",
      "name.last": faculty.name?.last || "",
      email: faculty.email || "",
      facultyID: faculty.facultyID || "",
      designation: faculty.designation || "Assistant Professor",
      specialization: faculty.specialization || "",
      contactNumber: faculty.contactNumber || "",
      "address.line1": faculty.address?.line1 || "",
      "address.line2": faculty.address?.line2 || "",
      "address.city": faculty.address?.city || "",
      "address.state": faculty.address?.state || "",
      "address.country": faculty.address?.country || "",
      "address.pincode": faculty.address?.pincode || "",
      experience: faculty.experience || "",
      qualifications: Array.isArray(faculty.qualifications)
        ? faculty.qualifications.join(", ")
        : "",
      password: "",
      status: faculty.status || "Active",
    });
    setShowEditFaculty(true);
  };

  const handleEditFacultySubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        ...facultyForm,
        qualifications: facultyForm.qualifications
          ? facultyForm.qualifications
              .split(",")
              .map((q) => q.trim())
              .filter((q) => q)
          : [],
      };

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/department/faculty/${editingFaculty._id}`,
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
        alert("Faculty updated successfully!");
        setShowEditFaculty(false);
        setEditingFaculty(null);
        setFacultyForm({
          "name.first": "",
          "name.last": "",
          email: "",
          facultyID: "",
          designation: "Assistant Professor",
          specialization: "",
          contactNumber: "",
          "address.line1": "",
          "address.line2": "",
          "address.city": "",
          "address.state": "",
          "address.country": "",
          "address.pincode": "",
          experience: "",
          qualifications: "",
          password: "",
          status: "Active",
        });
        fetchFacultyList(); // Refresh faculty list
      } else {
        alert(data.error || "Failed to update faculty");
      }
    } catch (error) {
      console.error("Error updating faculty:", error);
      alert("Failed to update faculty");
    }
  };

  const handleEditFacultyClose = () => {
    setShowEditFaculty(false);
    setEditingFaculty(null);
    setFacultyForm({
      "name.first": "",
      "name.last": "",
      email: "",
      facultyID: "",
      designation: "Assistant Professor",
      specialization: "",
      contactNumber: "",
      "address.line1": "",
      "address.line2": "",
      "address.city": "",
      "address.state": "",
      "address.country": "",
      "address.pincode": "",
      experience: "",
      qualifications: "",
      password: "",
      status: "Active",
    });
  };

  const filteredAndSortedFaculty = facultyList
    .filter((faculty) => {
      const matchesSearch =
        `${faculty.name?.first} ${faculty.name?.last}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.facultyID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (faculty.specialization || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesDesignation =
        !filterDesignation || faculty.designation === filterDesignation;
      const matchesStatus = !filterStatus || faculty.status === filterStatus;

      return matchesSearch && matchesDesignation && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = `${a.name?.first} ${a.name?.last}`.toLowerCase();
          bValue = `${b.name?.first} ${b.name?.last}`.toLowerCase();
          break;
        case "designation":
          aValue = a.designation.toLowerCase();
          bValue = b.designation.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "experience":
          aValue = parseInt(a.experience) || 0;
          bValue = parseInt(b.experience) || 0;
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

  if (loading) {
    return (
      <div className="department-faculty">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading faculty list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-faculty">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Error Loading Faculty</h2>
          <p>{error}</p>
          <button onClick={fetchFacultyList} className="retry-btn">
            <i className="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="department-faculty">
      <div className="faculty-header">
        <div className="header-top">
          <button
            className="back-btn"
            onClick={() => navigate(`/department/dashboard/${id}`)}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <h1>Faculty Management</h1>
          <button
            className="add-faculty-btn"
            onClick={() => setShowAddFaculty(true)}
          >
            <i className="fas fa-user-plus"></i>
            Add Faculty
          </button>
        </div>

        <div className="faculty-controls">
          <div className="search-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search faculty by name, email, ID, or specialization..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="filter-section">
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
            >
              <option value="">All Designations</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
              <option value="Head of Department">Head of Department</option>
              <option value="Dean">Dean</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Visiting Faculty">Visiting Faculty</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="faculty-stats">
        <div className="stat-item">
          <span className="stat-number">{facultyList.length}</span>
          <span className="stat-label">Total Faculty</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {facultyList.filter((f) => f.status === "Active").length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredAndSortedFaculty.length}</span>
          <span className="stat-label">Filtered Results</span>
        </div>
      </div>

      <div className="faculty-list-container">
        <div className="faculty-list">
          {filteredAndSortedFaculty.map((faculty) => (
            <div key={faculty._id} className="faculty-card">
              <div className="faculty-card-header">
                <div className="faculty-info">
                  <div className="faculty-avatar">
                    <img
                      src={
                        faculty.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          faculty.name?.first || "F"
                        )}+${encodeURIComponent(
                          faculty.name?.last || "L"
                        )}&background=284b63&color=fff&size=50`
                      }
                      alt={`${faculty.name?.first} ${faculty.name?.last}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                    <i
                      className="fas fa-user-tie"
                      style={{ display: "none" }}
                    ></i>
                  </div>
                  <div className="faculty-details">
                    <h3 className="faculty-name">
                      {faculty.name?.first} {faculty.name?.last}
                    </h3>
                    <span className="faculty-id">{faculty.facultyID}</span>
                    <div className="faculty-designation">
                      <span className="designation">{faculty.designation}</span>
                      <span
                        className={`status status-${faculty.status?.toLowerCase()}`}
                      >
                        {faculty.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="faculty-actions">
                  <button
                    className="edit-btn"
                    title="Edit Faculty"
                    onClick={() => handleEditFaculty(faculty)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="delete-btn"
                    title="Delete Faculty"
                    onClick={() => handleDeleteFaculty(faculty._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="faculty-card-body">
                <div className="faculty-meta">
                  <div className="meta-item">
                    <i className="fas fa-envelope"></i>
                    <span>{faculty.email}</span>
                  </div>
                  {faculty.contactNumber && (
                    <div className="meta-item">
                      <i className="fas fa-phone"></i>
                      <span>{faculty.contactNumber}</span>
                    </div>
                  )}
                  {faculty.specialization && (
                    <div className="meta-item">
                      <i className="fas fa-graduation-cap"></i>
                      <span>{faculty.specialization}</span>
                    </div>
                  )}
                  {faculty.experience && (
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      <span>{faculty.experience} years experience</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedFaculty.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <h3>No Faculty Found</h3>
            <p>
              {searchTerm || filterDesignation || filterStatus
                ? "No faculty members match your search criteria."
                : "No faculty members have been added yet."}
            </p>
            {!searchTerm && !filterDesignation && !filterStatus && (
              <button
                className="add-first-btn"
                onClick={() => setShowAddFaculty(true)}
              >
                <i className="fas fa-plus"></i>
                Add Your First Faculty
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Faculty Modal */}
      {showAddFaculty && (
        <div className="modal-overlay">
          <div className="modal-content faculty-modal">
            <div className="modal-header">
              <h2>Add New Faculty</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddFaculty(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddFacultySubmit} className="faculty-form">
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
                      value={facultyForm["name.first"]}
                      onChange={handleFacultyInputChange}
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
                      value={facultyForm["name.last"]}
                      onChange={handleFacultyInputChange}
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
                      value={facultyForm.email}
                      onChange={handleFacultyInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="facultyID">Faculty ID *</label>
                    <input
                      type="text"
                      id="facultyID"
                      name="facultyID"
                      value={facultyForm.facultyID}
                      onChange={handleFacultyInputChange}
                      required
                      placeholder="Enter faculty ID"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="form-section">
                <h3>Professional Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="designation">Designation</label>
                    <select
                      id="designation"
                      name="designation"
                      value={facultyForm.designation}
                      onChange={handleFacultyInputChange}
                    >
                      <option value="Assistant Professor">
                        Assistant Professor
                      </option>
                      <option value="Associate Professor">
                        Associate Professor
                      </option>
                      <option value="Professor">Professor</option>
                      <option value="Head of Department">
                        Head of Department
                      </option>
                      <option value="Dean">Dean</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Visiting Faculty">Visiting Faculty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={facultyForm.specialization}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter specialization"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={facultyForm.experience}
                      onChange={handleFacultyInputChange}
                      min="0"
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contactNumber">Contact Number</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={facultyForm.contactNumber}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="qualifications">Qualifications</label>
                  <input
                    type="text"
                    id="qualifications"
                    name="qualifications"
                    value={facultyForm.qualifications}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter qualifications separated by commas"
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
                      value={facultyForm["address.line1"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.line2">Address Line 2</label>
                    <input
                      type="text"
                      id="address.line2"
                      name="address.line2"
                      value={facultyForm["address.line2"]}
                      onChange={handleFacultyInputChange}
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
                      value={facultyForm["address.city"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.state">State</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={facultyForm["address.state"]}
                      onChange={handleFacultyInputChange}
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
                      value={facultyForm["address.country"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.pincode">PIN Code</label>
                    <input
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      value={facultyForm["address.pincode"]}
                      onChange={handleFacultyInputChange}
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
                      value={facultyForm.password}
                      onChange={handleFacultyInputChange}
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={facultyForm.status}
                      onChange={handleFacultyInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddFaculty(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-user-plus"></i>
                  Add Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {showEditFaculty && editingFaculty && (
        <div className="modal-overlay">
          <div className="modal-content faculty-modal">
            <div className="modal-header">
              <h2>
                Edit Faculty - {editingFaculty.name?.first}{" "}
                {editingFaculty.name?.last}
              </h2>
              <button className="close-btn" onClick={handleEditFacultyClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditFacultySubmit} className="faculty-form">
              {/* Required Fields */}
              <div className="form-section">
                <h3>Required Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-name.first">First Name *</label>
                    <input
                      type="text"
                      id="edit-name.first"
                      name="name.first"
                      value={facultyForm["name.first"]}
                      onChange={handleFacultyInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-name.last">Last Name *</label>
                    <input
                      type="text"
                      id="edit-name.last"
                      name="name.last"
                      value={facultyForm["name.last"]}
                      onChange={handleFacultyInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-email">Email *</label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={facultyForm.email}
                      onChange={handleFacultyInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-facultyID">Faculty ID *</label>
                    <input
                      type="text"
                      id="edit-facultyID"
                      name="facultyID"
                      value={facultyForm.facultyID}
                      onChange={handleFacultyInputChange}
                      required
                      placeholder="Enter faculty ID"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="form-section">
                <h3>Professional Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-designation">Designation</label>
                    <select
                      id="edit-designation"
                      name="designation"
                      value={facultyForm.designation}
                      onChange={handleFacultyInputChange}
                    >
                      <option value="Assistant Professor">
                        Assistant Professor
                      </option>
                      <option value="Associate Professor">
                        Associate Professor
                      </option>
                      <option value="Professor">Professor</option>
                      <option value="Head of Department">
                        Head of Department
                      </option>
                      <option value="Dean">Dean</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Visiting Faculty">Visiting Faculty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-specialization">Specialization</label>
                    <input
                      type="text"
                      id="edit-specialization"
                      name="specialization"
                      value={facultyForm.specialization}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter specialization"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-experience">Experience (Years)</label>
                    <input
                      type="number"
                      id="edit-experience"
                      name="experience"
                      value={facultyForm.experience}
                      onChange={handleFacultyInputChange}
                      min="0"
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-contactNumber">Contact Number</label>
                    <input
                      type="tel"
                      id="edit-contactNumber"
                      name="contactNumber"
                      value={facultyForm.contactNumber}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-qualifications">Qualifications</label>
                  <input
                    type="text"
                    id="edit-qualifications"
                    name="qualifications"
                    value={facultyForm.qualifications}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter qualifications separated by commas"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-address.line1">Address Line 1</label>
                    <input
                      type="text"
                      id="edit-address.line1"
                      name="address.line1"
                      value={facultyForm["address.line1"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-address.line2">Address Line 2</label>
                    <input
                      type="text"
                      id="edit-address.line2"
                      name="address.line2"
                      value={facultyForm["address.line2"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter address line 2"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-address.city">City</label>
                    <input
                      type="text"
                      id="edit-address.city"
                      name="address.city"
                      value={facultyForm["address.city"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-address.state">State</label>
                    <input
                      type="text"
                      id="edit-address.state"
                      name="address.state"
                      value={facultyForm["address.state"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-address.country">Country</label>
                    <input
                      type="text"
                      id="edit-address.country"
                      name="address.country"
                      value={facultyForm["address.country"]}
                      onChange={handleFacultyInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-address.pincode">PIN Code</label>
                    <input
                      type="text"
                      id="edit-address.pincode"
                      name="address.pincode"
                      value={facultyForm["address.pincode"]}
                      onChange={handleFacultyInputChange}
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
                    <label htmlFor="edit-password">New Password</label>
                    <input
                      type="password"
                      id="edit-password"
                      name="password"
                      value={facultyForm.password}
                      onChange={handleFacultyInputChange}
                      placeholder="Leave empty to keep current password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-status">Status</label>
                    <select
                      id="edit-status"
                      name="status"
                      value={facultyForm.status}
                      onChange={handleFacultyInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleEditFacultyClose}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i>
                  Update Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentFaculty;
