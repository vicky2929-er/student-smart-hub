import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { departmentService } from "../../services/authService";
import "./Department.css";

const DepartmentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
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
    // If user is logged in as department and trying to access wrong dashboard, redirect to their own
    if (
      currentUser &&
      currentUser.role === "department" &&
      currentUser._id !== id
    ) {
      navigate(`/department/dashboard/${currentUser._id}`);
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
        }/events/department/${id}`,
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

      // Additional security check: Ensure current user can access this department dashboard
      if (
        currentUser &&
        currentUser.role === "department" &&
        currentUser._id !== id
      ) {
        setError("Access denied. You can only access your own dashboard.");
        return;
      }

      const response = await departmentService.getDepartmentDashboard(id);
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
        // Reset form
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
        fetchDashboardData(); // Refresh dashboard data
      } else {
        alert(data.error || "Failed to add faculty");
      }
    } catch (error) {
      console.error("Error adding faculty:", error);
      alert("Failed to add faculty");
    }
  };

  const handleAddFacultyClose = () => {
    setShowAddFaculty(false);
  };

  if (loading) {
    return (
      <div className="department-dashboard">
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
      <div className="department-dashboard">
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

  if (!dashboardData || !dashboardData.department) {
    return (
      <div className="department-dashboard">
        <div className="dashboard-content">
          <div className="no-data-container">
            <div className="no-data-icon">
              <i className="fas fa-building"></i>
            </div>
            <h2>Department Not Found</h2>
            <p>The requested department data could not be found.</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { department, stats, facultyList } = dashboardData;
  const departmentName = department?.name || "Department";

  return (
    <div className="department-dashboard">
      {/* Welcome Section - Full Width Centered */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>
            Welcome to {departmentName}
            {departmentName &&
            !departmentName.toLowerCase().includes("engineering")
              ? " and Engineering"
              : ""}
          </h1>
          <p>
            <span>Department Code: {department?.code || "N/A"}</span>
            {" • "}
            <span>Contact: {department?.contactNumber || "Not specified"}</span>
            {department?.hod ? (
              <>
                <br />
                {" • "}
                <span>
                  HOD: {department.hod.name?.first} {department.hod.name?.last}
                </span>
              </>
            ) : (
              <>
                <br />
                {" • "}
                <span>HOD: Not assigned</span>
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
              <div className="stat-label">Total Faculty</div>
              <div className="stat-number">{stats?.totalFaculty || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Students</div>
              <div className="stat-number">{stats?.totalStudents || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Events This Month</div>
              <div className="stat-number">{stats?.eventsThisMonth || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Active Programs</div>
              <div className="stat-number">{stats?.activePrograms || 0}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="action-btn add-faculty"
            onClick={() => setShowAddFaculty(true)}
          >
            <i className="fas fa-user-plus"></i>
            Add Faculty
          </button>
          <button
            className="action-btn manage-students"
            onClick={() => navigate(`/department/students/${id}`)}
          >
            <i className="fas fa-users-cog"></i>
            Manage Students
          </button>
          <button
            className="action-btn reports"
            onClick={() => navigate(`/department/reports/${id}`)}
          >
            <i className="fas fa-chart-bar"></i>
            View Reports
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Faculty List */}
          <div className="content-card faculty-card">
            <div className="card-header">
              <h2>Faculty Members</h2>
              <button
                className="add-new-btn"
                onClick={() => navigate(`/department/faculty/${id}`)}
              >
                View All
              </button>
            </div>
            <div className="faculty-list">
              {facultyList && facultyList.length > 0 ? (
                facultyList.slice(0, 5).map((faculty, index) => (
                  <div key={index} className="faculty-item">
                    <div className="faculty-avatar">
                      <img
                        src={
                          faculty.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            faculty.name?.first || "F"
                          )}+${encodeURIComponent(
                            faculty.name?.last || "L"
                          )}&background=284b63&color=fff&size=40`
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
                    <div className="faculty-content">
                      <h3>
                        {faculty.name?.first} {faculty.name?.last}
                      </h3>
                      <p>
                        {faculty.designation || "Faculty"} •{" "}
                        {faculty.specialization || "General"}
                      </p>
                      <p className="faculty-contact">
                        <i className="fas fa-envelope"></i>
                        {faculty.email}
                      </p>
                    </div>
                    <span
                      className={`faculty-status status-${(
                        faculty.status || "active"
                      )?.toLowerCase()}`}
                    >
                      {faculty.status || "Active"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <h3>No Faculty Members</h3>
                  <p>Add faculty members to start managing your department.</p>
                  <button
                    className="cta-btn"
                    onClick={() => setShowAddFaculty(true)}
                  >
                    <i className="fas fa-plus"></i>
                    Add Your First Faculty
                  </button>
                </div>
              )}
            </div>
          </div>

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
                  {upcomingEvents.slice(0, 3).map((event, index) => (
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
                  {upcomingEvents.length > 3 && (
                    <div className="show-more-container">
                      <button
                        className="show-more-btn"
                        onClick={() => navigate("/department/events")}
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

      {/* Event Creation Modal */}
      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-content event-modal">
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button
                className="close-btn"
                onClick={() => setShowEventForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
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
                  <span className="checkmark"></span>
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
      )}

      {/* Add Faculty Modal */}
      {showAddFaculty && (
        <div className="modal-overlay">
          <div className="modal-content faculty-modal">
            <div className="modal-header">
              <h2>Add New Faculty</h2>
              <button className="close-btn" onClick={handleAddFacultyClose}>
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
                    placeholder="Enter qualifications separated by commas (e.g., PhD Computer Science, M.Tech)"
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
                      placeholder="Leave empty to auto-generate (facultyID@123)"
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
                  onClick={handleAddFacultyClose}
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
    </div>
  );
};

export default DepartmentDashboard;
