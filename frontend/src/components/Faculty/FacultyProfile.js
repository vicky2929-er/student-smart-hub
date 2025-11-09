import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Faculty.css";

const FacultyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchFacultyProfile();
  }, [id]);

  const fetchFacultyProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3030/api"}/faculty/profile/${id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFaculty(data.data.faculty);
        setEditForm(data.data.faculty);
      } else {
        setError(data.error || "Failed to fetch faculty profile");
      }
    } catch (error) {
      console.error("Fetch faculty profile error:", error);
      setError("Failed to load faculty profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({ ...faculty });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:3030/api"}/faculty/profile/${id}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFaculty(data.data.faculty);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Failed to update profile");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "F";
  };

  // Check if current user can edit this profile
  const canEdit = currentUser && currentUser._id === id;

  if (loading) {
    return (
      <div className="faculty-profile">
        <div className="profile-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faculty-profile">
        <div className="profile-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
            <button onClick={fetchFacultyProfile} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="faculty-profile">
        <div className="profile-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Faculty Not Found</h2>
            <p>The requested faculty profile could not be found.</p>
            <button onClick={() => navigate(-1)} className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-profile">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <div className="faculty-profile-title">
            <h1>Faculty Profile</h1></div>
            <div className="edit-btn">
            {canEdit && ( 
              <button
                onClick={handleEditToggle}
                className={`edit-btn ${isEditing ? "editing" : ""}`}
              >
                <i className={`fas ${isEditing ? "fa-times" : "fa-edit"}`}></i>
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <form onSubmit={handleSaveProfile} className="profile-form">
          {/* Basic Information Card */}
          <div className="profile-card">

            <div className="card-content">
              <div className="info-grid">
                <div className="info-group">
                  <label>First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name.first"
                      value={editForm.name?.first || ""}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <span>{faculty.name?.first || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name.last"
                      value={editForm.name?.last || ""}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <span>{faculty.name?.last || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Faculty ID</label>
                  <span>{faculty.facultyID || "Not assigned"}</span>
                </div>

                <div className="info-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ""}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <span>{faculty.email || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Designation</label>
                  {isEditing ? (
                    <select
                      name="designation"
                      value={editForm.designation || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="HOD">HOD</option>
                      <option value="Dean">Dean</option>
                    </select>
                  ) : (
                    <span>{faculty.designation || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Contact Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="contactNumber"
                      value={editForm.contactNumber || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.contactNumber || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={editForm.dob ? editForm.dob.split('T')[0] : ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{formatDate(faculty.dob)}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editForm.gender || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{faculty.gender || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Professional Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-group">
                  <label>Department</label>
                  <span>{faculty.department?.name || "Not specified"}</span>
                </div>


                <div className="info-group">
                  <label>Joining Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="joiningDate"
                      value={editForm.joiningDate ? editForm.joiningDate.split('T')[0] : ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{formatDate(faculty.joiningDate)}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Experience (Years)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="experience"
                      value={editForm.experience || ""}
                      onChange={handleInputChange}
                      min="0"
                    />
                  ) : (
                    <span>{faculty.experience || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group full-width">
                  <label>Qualifications</label>
                  {isEditing ? (
                    <textarea
                      name="qualifications"
                      value={editForm.qualifications || ""}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter qualifications (comma-separated)"
                    />
                  ) : (
                    <span>{faculty.qualifications || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group full-width">
                  <label>Specialization</label>
                  {isEditing ? (
                    <textarea
                      name="specialization"
                      value={editForm.specialization || ""}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter areas of specialization"
                    />
                  ) : (
                    <span>{faculty.specialization || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Address Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-group full-width">
                  <label>Address Line 1</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.line1"
                      value={editForm.address?.line1 || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.address?.line1 || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group full-width">
                  <label>Address Line 2</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.line2"
                      value={editForm.address?.line2 || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.address?.line2 || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={editForm.address?.city || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.address?.city || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={editForm.address?.state || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.address?.state || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={editForm.address?.country || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.address?.country || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Pin Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.pincode"
                      value={editForm.address?.pincode || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{faculty.address?.pincode || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <i className="fas fa-save"></i>
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FacultyProfile;
