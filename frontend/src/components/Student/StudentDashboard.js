import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { studentService } from "../../services/authService";
import "./Student.css";

const StudentDashboard = () =>{
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deletingAchievement, setDeletingAchievement] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    duration: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      await fetchDashboardData();
      await fetchUpcomingEvents();
    };
    fetchData();
  }, [id]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/events/student/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUpcomingEvents(data.events || []);
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await studentService.getStudentDashboard(id);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const formatEventDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "Course":
      case "Certification":
        return "fas fa-certificate";
      case "Internship":
        return "fas fa-briefcase";
      case "Competition":
      case "Hackathon":
        return "fas fa-trophy";
      case "Workshop":
      case "Conference":
        return "fas fa-chalkboard-teacher";
      case "CommunityService":
        return "fas fa-hands-helping";
      case "Leadership":
        return "fas fa-users-cog";
      default:
        return "fas fa-star";
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#10b981"; // Green
    if (percentage >= 60) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const handleNavigate = (path) => {
    navigate(`/students/${path}/${id}`);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const handleCloseModal = () => {
    setShowActivityModal(false);
    setSelectedActivity(null);
  };

  const handleProjectModalClose = () => {
    setShowProjectModal(false);
    setProjectForm({
      title: '',
      description: '',
      technologies: '',
      link: '',
      duration: ''
    });
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await studentService.addProject(id, projectForm);
      if (response.success) {
        alert('Project added successfully!');
        handleProjectModalClose();
        // Refresh dashboard data to show new project
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error adding project:', error);
      alert(error.response?.data?.error || 'Failed to add project');
    }
  };

  // Delete achievement function
  const handleDeleteAchievement = async (achievementId) => {
    if (!window.confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
      return;
    }

    setDeletingAchievement(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/students/${id}/achievement/${achievementId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh dashboard data to reflect the deletion
        await fetchDashboardData();
        setShowActivityModal(false);
        setSelectedActivity(null);
        alert('Achievement deleted successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete achievement');
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert(error.message || 'Failed to delete achievement');
    } finally {
      setDeletingAchievement(false);
    }
  };

  // Check if current user is viewing their own dashboard
  const isOwnDashboard = currentUser && currentUser._id === id;
  // Check if current user is faculty viewing student dashboard
  const isFacultyViewing = currentUser && currentUser.role === "faculty";

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.student) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Student Not Found</h2>
            <p>The requested student data could not be found.</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { student, stats, recentActivities } = dashboardData;
  const studentFirstName = student?.name?.first || "Student";

  return (
    <div className="student-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>
            {isFacultyViewing
              ? `${studentFirstName}'s Profile`
              : `Welcome back, ${studentFirstName}!`}
          </h1>
          <div className="student-info-subtitle">
            <span>
              {student?.department?.name || "Department not specified"} •{" "}
              {student?.year || new Date().getFullYear()} • Roll No:{" "}
              {student?.studentID || "Not assigned"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Certifications</div>
              <div className="stat-number">{stats?.certifications || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Internships</div>
              <div className="stat-number">{stats?.internships || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Competitions</div>
              <div className="stat-number">{stats?.competitions || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Workshops</div>
              <div className="stat-number">{stats?.workshops || 0}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Recent Activities */}
          <div className="content-card activities-card">
            <div className="card-header">
              <h2>Recent Activities</h2>
              {isOwnDashboard && !isFacultyViewing && (
                <button
                  className="add-new-btn"
                  onClick={() => handleNavigate("upload")}
                >
                  + Add New
                </button>
              )}
            </div>
            <div className="activities-list">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="activity-item clickable-activity"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="activity-icon">
                      <i className={getActivityIcon(activity.type)}></i>
                    </div>
                    <div className="activity-content">
                      <h3>{activity.title || "Untitled Activity"}</h3>
                      <p>
                        {activity.type || "General"} •{" "}
                        {formatDate(activity.uploadedAt)}
                      </p>
                    </div>
                    <span
                      className={`activity-status status-${(
                        activity.status || "pending"
                      )?.toLowerCase()}`}
                    >
                      {activity.status || "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-inbox"></i>
                  </div>
                  <h3>No Activities Yet</h3>
                  <p>
                    {isOwnDashboard && !isFacultyViewing
                      ? "Start building your portfolio by uploading your first achievement!"
                      : "This student hasn't uploaded any activities yet."}
                  </p>
                  {isOwnDashboard && !isFacultyViewing && (
                    <button
                      className="cta-btn"
                      onClick={() => handleNavigate("upload")}
                    >
                      <i className="fas fa-plus"></i>
                      Add Your First Activity
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar">
            {/* Academic Progress */}
            <div className="content-card progress-card">
              <h2>Academic Progress</h2>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Overall GPA</span>
                  <span className="progress-value">
                    {student?.gpa
                      ? `${parseFloat(student.gpa).toFixed(2)}/10`
                      : "Not Available"}
                  </span>
                </div>
                {student?.gpa ? (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(student.gpa / 10) * 100}%`,
                        backgroundColor: getProgressColor(
                          (student.gpa / 10) * 100
                        ),
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="no-data-bar">No GPA data available</div>
                )}
              </div>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Attendance</span>
                  <span className="progress-value">
                    {student?.attendance
                      ? `${parseFloat(student.attendance).toFixed(1)}%`
                      : "Not Available"}
                  </span>
                </div>
                {student?.attendance ? (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${student.attendance}%`,
                        backgroundColor: getProgressColor(student.attendance),
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className="no-data-bar">
                    No attendance data available
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="content-card events-card">
              <h2>Upcoming Events</h2>
              <div className="events-list">
                {loadingEvents ? (
                  <div className="loading-events">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading events...</span>
                  </div>
                ) : upcomingEvents && upcomingEvents.length > 0 ? (
                  <>
                    {upcomingEvents.slice(0, 2).map((event, index) => (
                      <div key={event._id || index} className="event-item">
                        <div className="event-indicator"></div>
                        <div className="event-content">
                          <h3>{event.title}</h3>
                          <p>
                            <i className="fas fa-calendar"></i>
                            {formatEventDate(event.eventDate)}
                            {event.eventTime && ` • ${event.eventTime}`}
                          </p>
                          {event.venue && (
                            <p>
                              <i className="fas fa-map-marker-alt"></i>
                              {event.venue}
                            </p>
                          )}
                          {event.eventType && (
                            <span className="event-type">
                              {event.eventType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length > 2 && (
                      <div className="show-more-container">
                        <button
                          className="show-more-btn"
                          onClick={() => navigate("/student/events")}
                        >
                          <i className="fas fa-calendar-plus"></i>
                          Show More Events
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-events">
                    <div className="event-indicator"></div>
                    <div className="event-content">
                      <h3>No upcoming events</h3>
                      <p>Check back later for new events</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
          <div className="content-card projects-card">
            <div className="card-header">
              <h2>My Projects</h2>
              {isOwnDashboard && !isFacultyViewing && (
                <button
                  className="add-new-btn"
                  onClick={() => setShowProjectModal(true)}
                >
                  + Add Project
                </button>
              )}
            </div>
            <div className="projects-list">
              {dashboardData?.student?.projects && dashboardData.student.projects.length > 0 ? (
                dashboardData.student.projects.map((project, index) => (
                  <div key={index} className="project-item">
                    <div className="project-header">
                      <h3 className="project-title">{project.title}</h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-external-link"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="project-description">{project.description}</p>
                    )}
                    {project.technologies && (
                      <div className="project-technologies">
                        <span className="tech-label">Technologies:</span>
                        <div className="tech-tags">
                          {project.technologies.split(',').map((tech, i) => (
                            <span key={i} className="tech-tag">{tech.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.duration && (
                      <div className="project-duration">
                        <i className="fas fa-clock"></i>
                        <span>{project.duration}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-code"></i>
                  </div>
                  <h3>No Projects Yet</h3>
                  <p>
                    {isOwnDashboard && !isFacultyViewing
                      ? "Start showcasing your work by adding your first project!"
                      : "This student hasn't added any projects yet."}
                  </p>
                  {isOwnDashboard && !isFacultyViewing && (
                    <button
                      className="cta-btn"
                      onClick={() => setShowProjectModal(true)}
                    >
                      <i className="fas fa-plus"></i>
                      Add Your First Project
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={handleProjectModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Project</h2>
              <button className="modal-close" onClick={handleProjectModalClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-form">
              <form onSubmit={handleProjectSubmit}>
                <div className="form-group">
                <label htmlFor="title">Project Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={projectForm.title}
                  onChange={handleProjectInputChange}
                  required
                  placeholder="Enter project title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectInputChange}
                  rows="4"
                  placeholder="Describe your project..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="technologies">Technologies Used</label>
                <input
                  type="text"
                  id="technologies"
                  name="technologies"
                  value={projectForm.technologies}
                  onChange={handleProjectInputChange}
                  placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="link">Project Link</label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={projectForm.link}
                  onChange={handleProjectInputChange}
                  placeholder="https://github.com/username/project or live demo URL"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={projectForm.duration}
                  onChange={handleProjectInputChange}
                  placeholder="e.g., 2 months, Jan 2024 - Mar 2024"
                />
              </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleProjectModalClose}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-plus"></i>
                    Add Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Activity Preview Modal */}
      {showActivityModal && selectedActivity && (
        <div className="activity-modal-overlay" onClick={handleCloseModal}>
          <div className="activity-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="activity-modal-header">
              <h2 className="activity-modal-title">Activity Details</h2>
              <button className="activity-modal-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="activity-modal-body">
              <div className="activity-modal-main">
                <div className="activity-modal-icon">
                  <i className={getActivityIcon(selectedActivity.type)}></i>
                </div>
                <div className="activity-modal-info">
                  <h3 className="activity-title">{selectedActivity.title || "Untitled Activity"}</h3>
                  <div className="activity-meta">
                    <span className="activity-type">
                      <i className="fas fa-tag"></i>
                      {selectedActivity.type || "General"}
                    </span>
                    <span className="activity-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(selectedActivity.uploadedAt)}
                    </span>
                    <span className={`activity-status-badge status-${(selectedActivity.status || "pending")?.toLowerCase()}`}>
                      <i className="fas fa-circle"></i>
                      {selectedActivity.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="activity-details-grid">
                {selectedActivity.description && (
                  <div className="activity-detail-item">
                    <label>Description</label>
                    <p>{selectedActivity.description}</p>
                  </div>
                )}
                
                {selectedActivity.organization && (
                  <div className="activity-detail-item">
                    <label>Organization</label>
                    <p>{selectedActivity.organization}</p>
                  </div>
                )}
                
                {selectedActivity.duration && (
                  <div className="activity-detail-item">
                    <label>Duration</label>
                    <p>{selectedActivity.duration}</p>
                  </div>
                )}
                
                {selectedActivity.skills && selectedActivity.skills.length > 0 && (
                  <div className="activity-detail-item">
                    <label>Skills</label>
                    <div className="skills-tags">
                      {selectedActivity.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedActivity.achievements && selectedActivity.achievements.length > 0 && (
                  <div className="activity-detail-item">
                    <label>Achievements</label>
                    <ul className="achievements-list">
                      {selectedActivity.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedActivity.fileUrl && (
                  <div className="activity-detail-item">
                    <label>Certificate / Achievement Image</label>
                    <div className="certificate-section">
                      <div className="certificate-image-preview">
                        <img 
                          src={selectedActivity.fileUrl} 
                          alt="Achievement File"
                          className="certificate-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="certificate-fallback" style={{display: 'none'}}>
                          <i className="fas fa-file-image"></i>
                          <span>Image not available</span>
                        </div>
                      </div>
                      <a 
                        href={selectedActivity.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="certificate-link"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View Full Size
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedActivity.feedback && (
                <div className="activity-feedback">
                  <h4>Faculty Feedback</h4>
                  <div className="feedback-content">
                    <p>{selectedActivity.feedback}</p>
                    {selectedActivity.feedbackBy && (
                      <div className="feedback-author">
                        - {selectedActivity.feedbackBy.name || "Faculty"}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Modal Footer with Actions */}
              {isOwnDashboard && (
                <div className="activity-modal-footer">
                  <button 
                    className="btn-danger delete-achievement-btn"
                    onClick={() => handleDeleteAchievement(selectedActivity._id)}
                    disabled={deletingAchievement}
                  >
                    {deletingAchievement ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash"></i>
                        Delete Achievement
                      </>
                    )}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowActivityModal(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
