import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./College.css";

const CollegeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchCollegeProfile();
  }, [id]);

  const fetchCollegeProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/college/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch college profile");
      }

      const data = await response.json();
      setCollege(data.college);
      setEditForm(data.college);
    } catch (error) {
      console.error("Profile error:", error);
      setError(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(college); // Reset form
    }
    setIsEditing(!isEditing);
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
      const response = await fetch(`http://localhost:5000/api/college/profile/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setCollege(data.college);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update profile");
    }
  };

  const getInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="college-profile-loading">
        <div className="college-loading-spinner"></div>
        <p>Loading college profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="college-profile-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="college-back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="college-profile-container">
      {/* Header Section */}
      <div className="college-profile-header">
        <div className="college-header-content">
          <button onClick={() => navigate(-1)} className="college-back-button">
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <div className="college-profile-title">
            <h1>College Profile</h1>
          </div>
          <div className="college-edit-section">
            <button
              onClick={handleEditToggle}
              className={`college-edit-btn ${isEditing ? "editing" : ""}`}
            >
              <i className={`fas ${isEditing ? "fa-times" : "fa-edit"}`}></i>
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="college-profile-content">
        <form onSubmit={handleSaveProfile} className="college-profile-form">
          {/* Basic Information Card */}
          <div className="college-profile-card">
            <div className="college-card-header">
              <div className="college-avatar-section">
                <div 
                  className="college-avatar"
                  data-letter={college.name?.charAt(0) || "C"}
                >
                  {getInitials(college.name)}
                </div>
                <div className="college-header-info">
                  <h2 className="college-header-name">{college.name}</h2>
                  <p className="college-header-code">Code: {college.code}</p>
                  <p className="college-header-type">{college.type}</p>
                </div>
              </div>
            </div>

            <div className="college-card-content">
              <div className="college-info-grid">
                <div className="college-info-group">
                  <label>College Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <span>{college.name || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>College Code</label>
                  <span>{college.code || "Not specified"}</span>
                </div>

                <div className="college-info-group">
                  <label>Email</label>
                  <span>{college.email || "Not specified"}</span>
                </div>

                <div className="college-info-group">
                  <label>Contact Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="contactNumber"
                      value={editForm.contactNumber || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.contactNumber || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>College Type</label>
                  {isEditing ? (
                    <select
                      name="type"
                      value={editForm.type || ""}
                      onChange={handleInputChange}
                    >
                      <option value="Engineering College">Engineering College</option>
                      <option value="Medical College">Medical College</option>
                      <option value="Arts College">Arts College</option>
                      <option value="Science College">Science College</option>
                      <option value="Commerce College">Commerce College</option>
                      <option value="Law College">Law College</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{college.type || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={editForm.website || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>
                      {college.website ? (
                        <a href={college.website} target="_blank" rel="noopener noreferrer">
                          {college.website}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>Institute</label>
                  <span>{college.institute?.name || "Not specified"}</span>
                </div>

                <div className="college-info-group">
                  <label>Status</label>
                  <span className={`college-status ${college.status?.toLowerCase()}`}>
                    {college.status || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="college-profile-card">
            <div className="college-card-header">
              <h3>Address Information</h3>
            </div>
            <div className="college-card-content">
              <div className="college-info-grid">
                <div className="college-info-group">
                  <label>Address Line 1</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.line1"
                      value={editForm.address?.line1 || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.address?.line1 || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>Address Line 2</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.line2"
                      value={editForm.address?.line2 || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.address?.line2 || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={editForm.address?.city || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.address?.city || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={editForm.address?.state || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.address?.state || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={editForm.address?.country || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.address?.country || "Not specified"}</span>
                  )}
                </div>

                <div className="college-info-group">
                  <label>Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.pincode"
                      value={editForm.address?.pincode || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{college.address?.pincode || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Departments Information Card */}
          <div className="college-profile-card">
            <div className="college-card-header">
              <h3>Departments</h3>
            </div>
            <div className="college-card-content">
              <div className="college-departments-list">
                {college.departments && college.departments.length > 0 ? (
                  college.departments.map((dept, index) => (
                    <div key={index} className="college-department-item">
                      <i className="fas fa-building"></i>
                      <span>{dept.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="college-no-departments">No departments assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="college-form-actions">
              <button type="submit" className="college-save-btn">
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

export default CollegeProfile;
