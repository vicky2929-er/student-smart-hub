import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { facultyService } from "../../services/authService";
import BulkStudentUpload from "./BulkStudentUpload";
import "./Faculty.css";

const FacultyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    eventType: "Academic",
    targetAudience: "All",
    maxParticipants: "",
    registrationRequired: false,
    registrationDeadline: "",
    tags: [],
  });

  const [studentForm, setStudentForm] = useState({
    "name.first": "",
    "name.last": "",
    email: "",
    studentID: "",
    dob: "",
    gender: "",
    contactNumber: "",
    "address.line1": "",
    "address.line2": "",
    "address.city": "",
    "address.state": "",
    "address.country": "",
    "address.pincode": "",
    enrollmentYear: new Date().getFullYear(),
    batch: new Date().getFullYear().toString(),
    gpa: "",
    attendance: "",
    skills: "",
    password: "",
    status: "Active",
  });

  useEffect(() => {
    // If user is logged in as faculty and trying to access wrong dashboard, redirect to their own
    if (
      currentUser &&
      currentUser.role === "faculty" &&
      currentUser._id !== id
    ) {
      navigate(`/faculty/dashboard/${currentUser._id}`);
      return;
    }
    fetchDashboardData();
    fetchUpcomingEvents();
  }, [id, currentUser]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/events/faculty/${id}`,
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

      // Additional security check: Ensure current user can access this faculty dashboard
      if (
        currentUser &&
        currentUser.role === "faculty" &&
        currentUser._id !== id
      ) {
        setError("Access denied. You can only access your own dashboard.");
        return;
      }

      const response = await facultyService.getFacultyDashboard(id);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      if (error.response?.status === 403) {
        setError("Access denied. You can only access your own dashboard.");
      } else if (error.response?.status === 401) {
        setError("Please log in to access your dashboard.");
        navigate("/login");
      } else {
        setError(
          error.response?.data?.error || "Failed to load dashboard data"
        );
      }
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const handleReviewAchievement = (achievementId, studentId) => {
    navigate(`/faculty/review/${id}/${achievementId}/${studentId}`);
  };

  const handleEventInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventForm,
        maxParticipants: eventForm.maxParticipants
          ? parseInt(eventForm.maxParticipants)
          : null,
      };

      console.log("Creating event with data:", eventData);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/events/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(eventData),
        }
      );

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (response.ok) {
        setShowEventForm(false);
        setEventForm({
          title: "",
          description: "",
          eventDate: "",
          eventTime: "",
          venue: "",
          eventType: "Academic",
          targetAudience: "All",
          maxParticipants: "",
          registrationRequired: false,
          registrationDeadline: "",
          tags: [],
        });
        fetchUpcomingEvents(); // Refresh events
        alert("Event created successfully!");
      } else {
        console.error("Event creation failed:", data);
        const errorMessage = data.details
          ? `${data.error}: ${
              Array.isArray(data.details)
                ? data.details.join(", ")
                : data.details
            }`
          : data.error || "Failed to create event";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert(`Network error: ${error.message || "Failed to create event"}`);
    }
  };

  const handleBulkUploadSuccess = (count) => {
    alert(`Successfully uploaded ${count} students!`);
    fetchDashboardData(); // Refresh dashboard data to update student count
  };

  const handleBulkUploadClose = () => {
    setShowBulkUpload(false);
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
        // Parse skills as comma-separated if provided
        skills: studentForm.skills
          ? studentForm.skills
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
      };

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3030/api"
        }/bulk-students/single-student`,
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
        // Reset form
        setStudentForm({
          "name.first": "",
          "name.last": "",
          email: "",
          studentID: "",
          dob: "",
          gender: "",
          contactNumber: "",
          "address.line1": "",
          "address.line2": "",
          "address.city": "",
          "address.state": "",
          "address.country": "",
          "address.pincode": "",
          enrollmentYear: new Date().getFullYear(),
          batch: new Date().getFullYear().toString(),
          gpa: "",
          attendance: "",
          skills: "",
          password: "",
          status: "Active",
        });
        fetchDashboardData(); // Refresh dashboard data
      } else {
        alert(data.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student");
    }
  };

  const handleAddStudentClose = () => {
    setShowAddStudent(false);
  };

  if (loading) {
    return (
      <div className="faculty-dashboard">
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
      <div className="faculty-dashboard">
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

  if (!dashboardData || !dashboardData.faculty) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Faculty Not Found</h2>
            <p>The requested faculty data could not be found.</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { faculty, stats, pendingReviews, recentActivities, studentStats } =
    dashboardData;
  const facultyFirstName = faculty?.name?.first || "Faculty";
  const facultyLastName = faculty?.name?.last || "";
  const fullName = `${facultyFirstName} ${facultyLastName}`.trim();

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>
            Welcome back, {faculty?.designation} {facultyFirstName}!
          </h1>
          <p>
            <span>
              {faculty?.department?.name || "Department not specified"}
            </span>
            {" • "}
            <span>{faculty?.designation || "Faculty"}</span>
            {faculty?.facultyID && (
              <>
                <br />
                {" • "}
                <span style={{ whiteSpace: "nowrap" }}>
                  Faculty&nbsp;ID:&nbsp;{faculty.facultyID}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Students</div>
              <div className="stat-number">{stats?.totalStudents || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Pending Reviews</div>
              <div className="stat-number">{stats?.pendingReviews || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Approved This Month</div>
              <div className="stat-number">{stats?.approvedThisMonth || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Reviewed</div>
              <div className="stat-number">{stats?.totalReviewed || 0}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="action-btn add-student"
            onClick={() => setShowAddStudent(true)}
          >
            <i className="fas fa-user-plus"></i>
            Add Single Student
          </button>
          <button
            className="action-btn bulk-upload"
            onClick={() => setShowBulkUpload(true)}
          >
            <i className="fas fa-file-excel"></i>
            Bulk Upload Students
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Pending Reviews */}
          <div className="content-card reviews-card">
            <div className="card-header">
              <h2>Pending Reviews</h2>
              <button
                className="add-new-btn"
                onClick={() => navigate(`/faculty/reviews/${id}`)}
              >
                View All
              </button>
            </div>
            <div className="activities-list">
              {pendingReviews && pendingReviews.length > 0 ? (
                pendingReviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="activity-content">
                      <h3>
                        {review.achievement?.title || "Untitled Achievement"}
                      </h3>
                      <p>
                        {review.student?.name?.first}{" "}
                        {review.student?.name?.last} •{" "}
                        {review.achievement?.type || "General"} •{" "}
                        {formatDate(review.achievement?.uploadedAt)}
                      </p>
                    </div>
                    <span className="activity-status status-pending">
                      Review
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-clipboard-check"></i>
                  </div>
                  <h3>No Pending Reviews</h3>
                  <p>All student achievements have been reviewed!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar">
            {/* Upcoming Events */}
            <div className="content-card events-card">
              <div className="card-header">
                <h2>Upcoming Events</h2>
                <button
                  className="add-new-btn"
                  onClick={() => setShowEventForm(true)}
                >
                  <i className="fas fa-plus"></i>
                  Add Event
                </button>
              </div>
              <div className="events-list">
                {loadingEvents ? (
                  <div className="loading-events">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading events...</span>
                  </div>
                ) : upcomingEvents && upcomingEvents.length > 0 ? (
                  <>
                    {upcomingEvents.slice(0, 2).map((event, index) => (
                      <div key={event._id} className="event-item">
                        <div className="event-indicator"></div>
                        <div className="event-content">
                          <h3>{event.title}</h3>
                          <p>
                            <i className="fas fa-calendar"></i>
                            {formatEventDate(event.eventDate)}
                            {event.eventTime && ` • ${event.eventTime}`}
                          </p>
                          <p>
                            <i className="fas fa-map-marker-alt"></i>
                            {event.venue}
                          </p>
                          <span className="event-type">{event.eventType}</span>
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length > 2 && (
                      <div className="show-more-container">
                        <button
                          className="show-more-btn"
                          onClick={() => navigate("/faculty/events")}
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
                      <p>Create an event to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventForm && (
        <div className="modal-overlay" onClick={() => setShowEventForm(false)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header sticky-modal-header">
              <h2>Create New Event</h2>
              <button
                className="close-btn"
                onClick={() => setShowEventForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body-scroll">
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Event Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventInputChange}
                    required
                    placeholder="Enter event title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventType">Event Type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={eventForm.eventType}
                    onChange={handleEventInputChange}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Competition">Competition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventInputChange}
                  required
                  rows="3"
                  placeholder="Enter event description"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eventDate">Event Date *</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={eventForm.eventDate}
                    onChange={handleEventInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventTime">Event Time</label>
                  <input
                    type="time"
                    id="eventTime"
                    name="eventTime"
                    value={eventForm.eventTime}
                    onChange={handleEventInputChange}
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={eventForm.venue}
                  onChange={handleEventInputChange}
                  required
                  placeholder="Enter event venue"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetAudience">Target Audience</label>
                  <select
                    id="targetAudience"
                    name="targetAudience"
                    value={eventForm.targetAudience}
                    onChange={handleEventInputChange}
                  >
                    <option value="All">All</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={eventForm.maxParticipants}
                    onChange={handleEventInputChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="registrationRequired"
                    checked={eventForm.registrationRequired}
                    onChange={handleEventInputChange}
                  />
                  Registration Required
                </label>
              </div>

              {eventForm.registrationRequired && (
                <div className="form-group">
                  <label htmlFor="registrationDeadline">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={eventForm.registrationDeadline}
                    onChange={handleEventInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    max={eventForm.eventDate}
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEventForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-plus"></i>
                  Create Event
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Student Upload Modal */}
      {showBulkUpload && (
        <BulkStudentUpload
          onClose={handleBulkUploadClose}
          onSuccess={handleBulkUploadSuccess}
        />
      )}

      {/* Single Student Form Modal */}
      {showAddStudent && (
        <div
          className="modal-overlay"
          onClick={handleAddStudentClose}
        >
          <div
            className=" student-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header sticky-modal-header">
              <h2>Add New Student</h2>
              <button className="close-btn" onClick={handleAddStudentClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body-scroll">
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
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={studentForm.dob}
                      onChange={handleStudentInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={studentForm.gender}
                      onChange={handleStudentInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
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

              {/* Academic Information */}
              <div className="form-section">
                <h3>Academic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="enrollmentYear">Enrollment Year</label>
                    <input
                      type="number"
                      id="enrollmentYear"
                      name="enrollmentYear"
                      value={studentForm.enrollmentYear}
                      onChange={handleStudentInputChange}
                      placeholder="Enter enrollment year"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="batch">Batch</label>
                    <input
                      type="text"
                      id="batch"
                      name="batch"
                      value={studentForm.batch}
                      onChange={handleStudentInputChange}
                      placeholder="Enter batch (e.g., 2023-2027)"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gpa">GPA</label>
                    <input
                      type="number"
                      id="gpa"
                      name="gpa"
                      value={studentForm.gpa}
                      onChange={handleStudentInputChange}
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="Enter GPA (0-10)"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="attendance">Attendance (%)</label>
                    <input
                      type="number"
                      id="attendance"
                      name="attendance"
                      value={studentForm.attendance}
                      onChange={handleStudentInputChange}
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Enter attendance percentage"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={studentForm.skills}
                    onChange={handleStudentInputChange}
                    placeholder="Enter skills separated by commas (e.g., JavaScript, Python, React)"
                  />
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
                      placeholder="Leave empty to auto-generate (studentID@123)"
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
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleAddStudentClose}
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
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
