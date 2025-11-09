import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { studentService } from "../../services/authService";
import "./Student.css";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [coordinator, setCoordinator] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await studentService.getStudentProfile(id);
      setStudent(response.data.student);
      setEditForm(response.data.student);
      
      // Fetch coordinator information if department exists
      if (response.data.student.department) {
        try {
          const coordResponse = await studentService.getCoordinator(response.data.student.department._id || response.data.student.department);
          setCoordinator(coordResponse.data.coordinator);
        } catch (coordError) {
          console.error("Coordinator fetch error:", coordError);
          // Don't set error for coordinator fetch failure
        }
      }
    } catch (error) {
      console.error("Profile error:", error);
      setError(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({ ...student });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await studentService.updateProfile(id, editForm);
      setStudent(response.data.student);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.error || "Failed to update profile");
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "S";
  };

  // Check if current user can edit this profile
  const canEdit = currentUser && currentUser._id === id;

  // Define read-only fields for students
  const readOnlyFields = [
    'studentID', 'email', 'course', 'department', 'year', 'batch', 
    'enrollmentYear', 'gpa', 'attendance'
  ];

  if (loading) {
    return (
      <div className="student-profile">
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
      <div className="student-profile">
        <div className="profile-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
            <button onClick={fetchStudentProfile} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-profile">
        <div className="profile-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Student Not Found</h2>
            <p>The requested student profile could not be found.</p>
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
    <div className="student-profile">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate(-1)} className="back-button">
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
          </div>
          
          <div className="header-center">
            <div className="student-profile-title">
              <h1>Student Profile</h1>
              {coordinator && (
                <div className="coordinator-info">
                  <span className="coordinator-label">Coordinator:</span>
                  <span className="coordinator-name">
                    {coordinator.name?.first} {coordinator.name?.last}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="header-right">
            {canEdit && (
              <button
                onClick={handleEditToggle}
                className={`edit-profile-btn ${isEditing ? "editing" : ""}`}
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
            <div className="card-header">
              <h3>Basic Information</h3>
            </div>
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
                    <span>{student.name?.first || "Not specified"}</span>
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
                    <span>{student.name?.last || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Student ID</label>
                  <span className="readonly-field">{student.studentID || "Not assigned"}</span>
                </div>

                <div className="info-group">
                  <label>Email</label>
                  <span className="readonly-field">{student.email || "Not specified"}</span>
                </div>

                <div className="info-group">
                  <label>Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth ? editForm.dateOfBirth.split('T')[0] : ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{formatDate(student.dateOfBirth)}</span>
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
                    <span>{student.gender || "Not specified"}</span>
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
                    <span>{student.contactNumber || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group full-width">
                  <label>Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={editForm.bio || ""}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <span>{student.bio || "No bio available"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Academic Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-group">
                  <label>Course</label>
                  <span className="readonly-field">{student.course || "Not specified"}</span>
                </div>

                <div className="info-group">
                  <label>Department</label>
                  <span className="readonly-field">{student.department?.name || "Not specified"}</span>
                </div>

                <div className="info-group">
                  <label>Year</label>
                  <span className="readonly-field">{student.year || "Not specified"}</span>
                </div>

                <div className="info-group">
                  <label>Batch</label>
                  <span className="readonly-field">{student.batch || "Not specified"}</span>
                </div>

                <div className="info-group">
                  <label>Enrollment Year</label>
                  <span className="readonly-field">{student.enrollmentYear || "Not specified"}</span>
                </div>

                <div className="info-group">
                  <label>Current CGPA</label>
                  <span className="readonly-field">{student.gpa?.toFixed(2) || "N/A"}</span>
                </div>

                <div className="info-group">
                  <label>Attendance</label>
                  <span className="readonly-field">
                    {student.attendance ? student.attendance.toFixed(2) : "0.00"}%
                  </span>
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
                    <span>{student.address?.line1 || "Not specified"}</span>
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
                    <span>{student.address?.line2 || "Not specified"}</span>
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
                    <span>{student.address?.city || "Not specified"}</span>
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
                    <span>{student.address?.state || "Not specified"}</span>
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
                    <span>{student.address?.country || "Not specified"}</span>
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
                    <span>{student.address?.pincode || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Emergency Contact Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-group">
                  <label>Emergency Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={editForm.emergencyContact?.name || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{student.emergencyContact?.name || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Emergency Contact Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={editForm.emergencyContact?.phone || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{student.emergencyContact?.phone || "Not specified"}</span>
                  )}
                </div>

                <div className="info-group">
                  <label>Relationship</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={editForm.emergencyContact?.relationship || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., Father, Mother, Guardian"
                    />
                  ) : (
                    <span>{student.emergencyContact?.relationship || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Interests Card */}
          <div className="profile-card skills-interests-card">
            <div className="card-header">
              <h3>Skills & Interests</h3>
            </div>
            <div className="card-content">
              <div className="skills-section">
                <div className="skills-category">
                  <div className="skills-label">Technical Skills</div>
                  <div className="skills-tags">
                    {student.skills?.technical?.length > 0 ? (
                      student.skills.technical.map((skill, idx) => (
                        <span key={idx} className="skill-tag technical">{skill}</span>
                      ))
                    ) : (
                      <span className="skill-tag empty">No technical skills</span>
                    )}
                  </div>
                </div>
                <div className="skills-category">
                  <div className="skills-label">Soft Skills</div>
                  <div className="skills-tags">
                    {student.skills?.soft?.length > 0 ? (
                      student.skills.soft.map((skill, idx) => (
                        <span key={idx} className="skill-tag soft">{skill}</span>
                      ))
                    ) : (
                      <span className="skill-tag empty">No soft skills</span>
                    )}
                  </div>
                </div>
                <div className="skills-category">
                  <div className="skills-label">Interests & Hobbies</div>
                  <div className="skills-tags">
                    {student.interests?.length > 0 ? (
                      student.interests.map((interest, idx) => (
                        <span key={idx} className="skill-tag interest">{interest}</span>
                      ))
                    ) : (
                      <span className="skill-tag empty">No interests</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Projects</h3>
            </div>
            <div className="card-content">
              <div className="projects-list">
                {student.projects?.length > 0 ? (
                  student.projects.map((project, index) => (
                    <div key={index} className="project-item">
                      <div className="project-header">
                        <h4>{project.title || "Project Title"}</h4>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="project-tech">
                          <strong>Technologies:</strong>
                          <div className="tech-tags">
                            {project.technologies.split(',').map((tech, i) => (
                              <span key={i} className="tech-tag">{tech.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.duration && (
                        <p className="project-duration">
                          <strong>Duration:</strong> {project.duration}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-code"></i>
                    <p>No projects added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Links Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Social Media Links</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-group">
                  <label>LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="social.linkedin"
                      value={editForm.social?.linkedin || ""}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    <span>
                      {student.social?.linkedin ? (
                        <a href={student.social.linkedin} target="_blank" rel="noopener noreferrer">
                          {student.social.linkedin}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </span>
                  )}
                </div>

                <div className="info-group">
                  <label>GitHub</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="social.github"
                      value={editForm.social?.github || ""}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                    />
                  ) : (
                    <span>
                      {student.social?.github ? (
                        <a href={student.social.github} target="_blank" rel="noopener noreferrer">
                          {student.social.github}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Education Section Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Education Background</h3>
            </div>
            <div className="card-content">
              <div className="education-list">
                {student.education?.length > 0 ? (
                  student.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <div className="education-info">
                        <h4>{edu.degree || "Degree"}</h4>
                        <p className="institution">{edu.institution || "Institution"}</p>
                        <div className="education-meta">
                          <span className="location">{edu.location || "Location"}</span>
                          <span className="year">{edu.year || "Year"}</span>
                          {edu.grade && <span className="grade">Grade: {edu.grade}</span>}
                        </div>
                        {edu.description && (
                          <p className="education-description">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-graduation-cap"></i>
                    <p>No education background added yet</p>
                  </div>
                )}
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

export default StudentProfile;
