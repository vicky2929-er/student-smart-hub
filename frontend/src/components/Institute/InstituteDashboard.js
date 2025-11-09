import React, { useState, useEffect } from 'react';
import './InstituteDashboard.css'; 
import { useParams, useNavigate } from "react-router-dom";
import { instituteService } from "../../services/authService";
import "./InstituteDashboard.css";

const InstituteDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [collegeFormData, setCollegeFormData] = useState({
    name: '',
    code: '',
    email: '',
    password: '',
    contactNumber: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    },
    website: '',
    type: 'Other'
  });

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const handleAddCollegeClick = () => {
    setShowAddCollegeModal(true);
  };

  const handleBulkUploadClick = () => {
    setShowBulkUploadModal(true);
  };

  const handleCloseBulkUploadModal = () => {
    setShowBulkUploadModal(false);
    setSelectedFile(null);
    setDragOver(false);
    setUploading(false);
    // Clear the hidden file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3030/api"}/bulk-colleges/download-template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'college_bulk_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleInstituteHeaderClick = () => {
    navigate(`/institute/profile/${id}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select an Excel file (.xlsx or .xls)');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return false;
    }
    
    return true;
  };

  const handleUploadColleges = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3030/api"}/bulk-colleges/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Successfully uploaded ${result.count} colleges!`);
        handleCloseBulkUploadModal();
        fetchDashboardData(); // Refresh dashboard data
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

const handleCloseModal = () => {
    setShowAddCollegeModal(false);
    setCollegeFormData({
      name: '',
      code: '',
      email: '',
      password: '',
      contactNumber: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
      },
      website: '',
      type: 'Other'
    });
  };

const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setCollegeFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCollegeFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

const handleSubmitCollege = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting college data:', {
        ...collegeFormData,
        institute: id
      });
      
      const response = await instituteService.addCollege({
        ...collegeFormData,
        institute: id
      });
      
      console.log('API Response:', response);
      
      if (response.data) {
        alert('College added successfully!');
        handleCloseModal();
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response) {
        alert(`Error: ${error.response.data.message || error.response.statusText}`);
      } else {
        alert('Network error. Please check your connection.');
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await instituteService.getInstituteDashboard(id);
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching institute dashboard:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="institute-dashboard-loading">
        <div className="institute-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="institute-dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="institute-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="institute-dashboard-error">
        <h2>No Data Available</h2>
        <p>Unable to load dashboard data</p>
      </div>
    );
  }

  const { institute, statistics, colleges, departments, recentEvents, upcomingEvents, achievementStats } = dashboardData;

  return (
    <div className="institute-dashboard-container">
      {/* Header Section */}
      <div className="institute-dashboard-header" >
        <div className="institute-header-content">
          <h1 className="institute-dashboard-title">
            {institute.name || 'Tech Institute of Excellence'}
          </h1>
          <p className="institute-dashboard-subtitle">
            {institute.type || 'University'} • {institute.code || 'TIE'}
          </p>
          <div className="institute-status-badge">
            <span className="institute-status-indicator"></span>
            {institute.status === 'active' ? 'ACTIVE' : (institute.status || 'ACTIVE').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="institute-stats-grid">
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.totalColleges}</h3>
            <p className="institute-stat-label">Colleges</p>
          </div>
        </div>
        
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.0075 15.6173 19 15.3901" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C17.0013 3.35715 17.7 4.17 17.7 5.5C17.7 6.83 17.0013 7.64285 16 7.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.totalFaculty}</h3>
            <p className="institute-stat-label">Faculty Members</p>
          </div>
        </div>
        
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.0075 15.6173 19 15.3901" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C17.0013 3.35715 17.7 4.17 17.7 5.5C17.7 6.83 17.0013 7.64285 16 7.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.totalStudents}</h3>
            <p className="institute-stat-label">Students</p>
          </div>
        </div>
        
        <div className="institute-stat-card">
          <div className="institute-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="institute-stat-content">
            <h3 className="institute-stat-number">{statistics.upcomingEvents}</h3>
            <p className="institute-stat-label">Events</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Quick Management and College Overview */}
      <div className="institute-main-content-grid">
        {/* Quick Management Section */}
        <div className="institute-quick-management">
          <div className="institute-section-header">
            <h2 className="institute-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Quick Management
            </h2>
          </div>
          
          <div className="institute-management-grid">
            <div className="institute-management-card" onClick={() => navigate(`/institute/manage-colleges/${id}`)}>
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Manage Colleges</h3>
                <p className="institute-management-subtitle">{statistics.totalColleges} colleges</p>
              </div>
            </div>
            
            <div className="institute-management-card" onClick={handleAddCollegeClick}>
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Add College</h3>
                <p className="institute-management-subtitle">Create new college</p>
              </div>
            </div>
            
            <div className="institute-management-card" onClick={handleBulkUploadClick}>
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V10C21 8.89543 20.1046 8 19 8H13L11 6H5C3.89543 6 3 6.89543 3 8V7Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 11L12 16M9.5 13.5L14.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Bulk Upload</h3>
                <p className="institute-management-subtitle">Upload multiple colleges</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 21L16 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M4 13C4 11.8954 4.89543 11 6 11H8C9.10457 11 10 11.8954 10 13V14H4V13Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Manage Faculty</h3>
                <p className="institute-management-subtitle">{statistics.totalFaculty} active</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M21 21V19C21 17.3431 19.6569 16 18 16H17" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Manage Students</h3>
                <p className="institute-management-subtitle">{statistics.totalStudents} active</p>
              </div>
            </div>
            
            <div className="institute-management-card">
              <div className="institute-management-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="institute-management-content">
                <h3 className="institute-management-title">Generate Report</h3>
                <p className="institute-management-subtitle">Analytics & Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* College Overview Section */}
        <div className="institute-college-overview">
          <div className="institute-section-header">
            <h2 className="institute-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              College Overview
            </h2>
          </div>
          
          <div className="institute-college-list">
            {colleges.slice(0, 2).map((college) => (
              <div key={college._id} className="institute-college-card">
                <div className="institute-college-header">
                  <h3 className="institute-college-name">{college.name}</h3>
                  <p className="institute-college-type">{college.type}</p>
                </div>
                <div className="institute-college-stats">
                  <div className="institute-college-stat">
                    <span className="institute-college-stat-number">{college.departmentCount}</span>
                    <span className="institute-college-stat-label">Departments</span>
                  </div>
                  <div className="institute-college-stat">
                    <span className="institute-college-stat-number">{college.facultyCount}</span>
                    <span className="institute-college-stat-label">Faculty</span>
                  </div>
                  <div className="institute-college-stat">
                    <span className="institute-college-stat-number">{college.studentCount}</span>
                    <span className="institute-college-stat-label">Students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {colleges.length > 2 && (
            <div className="institute-show-more">
              <button 
                className="institute-show-more-btn"
                onClick={() => navigate(`/institute/manage-colleges/${id}`)}
              >
                Show More Colleges ({colleges.length} total)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="institute-events-section">
        <div className="institute-section-header">
          <h2 className="institute-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Upcoming Events
          </h2>
          <button className="institute-add-event-btn">+ Add Event</button>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="institute-events-list">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event._id} className="institute-event-card">
                <div className="institute-event-date">
                  <span className="institute-event-day">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="institute-event-month">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="institute-event-details">
                  <h4 className="institute-event-title">{event.title}</h4>
                  <p className="institute-event-info">
                    {event.type} • {event.location}
                  </p>
                  <p className="institute-event-organizer">
                    Organized by: {event.organizer?.name || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="institute-no-events">
            <div className="institute-no-events-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="institute-no-events-title">No upcoming events</h3>
            <p className="institute-no-events-text">Create your first event to get started</p>
          </div>
        )}
      </div>

      {/* Add College Modal */}
      {showAddCollegeModal && (
        <div className="institute-modal-overlay" onClick={handleCloseModal}>
          <div className="institute-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="institute-modal-header">
              <h2 className="institute-modal-title">Add New College</h2>
              <button className="institute-modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <form className="institute-college-form" onSubmit={handleSubmitCollege}>
              <div className="institute-form-grid">
                <div className="institute-form-group">
                  <label className="institute-form-label">College Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={collegeFormData.name}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    required
                    placeholder="Enter college name"
                  />
                </div>

              <div className="institute-form-group">
                <label className="institute-form-label">College Code *</label>
                <input
                  type="text"
                  name="code"
                  value={collegeFormData.code}
                  onChange={handleFormChange}
                  className="institute-form-input"
                  required
                  placeholder="Enter college code (e.g., TECH001)"
                  style={{textTransform: 'uppercase'}}
                />
              </div>

              <div className="institute-form-group">
                <label className="institute-form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={collegeFormData.email}
                  onChange={handleFormChange}
                  className="institute-form-input"
                  required
                  placeholder="Enter college email"
                />
              </div>

              <div className="institute-form-group">
                <label className="institute-form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={collegeFormData.password}
                  onChange={handleFormChange}
                  className="institute-form-input"
                  required
                  placeholder="Enter password"
                />
              </div>

              <div className="institute-form-group">
                <label className="institute-form-label">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={collegeFormData.contactNumber}
                  onChange={handleFormChange}
                  className="institute-form-input"
                  placeholder="Enter contact number"
                />
              </div>

              <div className="institute-form-group">
                <label className="institute-form-label">College Type</label>
                <select
                  name="type"
                  value={collegeFormData.type}
                  onChange={handleFormChange}
                  className="institute-form-select"
                >
                  <option value="Engineering College">Engineering College</option>
                  <option value="Medical College">Medical College</option>
                  <option value="Arts College">Arts College</option>
                  <option value="Science College">Science College</option>
                  <option value="Commerce College">Commerce College</option>
                  <option value="Law College">Law College</option>
                  <option value="Other">Other</option>
                </select>
                </div>

                <div className="institute-form-group institute-form-group-full">
                <label className="institute-form-label">Website</label>
                <input
                  type="url"
                  name="website"
                  value={collegeFormData.website}
                  onChange={handleFormChange}
                  className="institute-form-input"
                  placeholder="Enter website URL"
                />
                </div>
              </div>

              <div className="institute-form-section">
              <h3 className="institute-form-section-title">Address</h3>
                <div className="institute-form-grid">
                  <div className="institute-form-group">
                  <label className="institute-form-label">Address Line 1</label>
                  <input
                    type="text"
                    name="address.line1"
                    value={collegeFormData.address.line1}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    placeholder="Enter address line 1"
                  />
                </div>

                <div className="institute-form-group">
                  <label className="institute-form-label">Address Line 2</label>
                  <input
                    type="text"
                    name="address.line2"
                    value={collegeFormData.address.line2}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    placeholder="Enter address line 2"
                  />
                </div>

                <div className="institute-form-group">
                  <label className="institute-form-label">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={collegeFormData.address.city}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    placeholder="Enter city"
                  />
                </div>

                <div className="institute-form-group">
                  <label className="institute-form-label">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={collegeFormData.address.state}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    placeholder="Enter state"
                  />
                </div>

                <div className="institute-form-group">
                  <label className="institute-form-label">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={collegeFormData.address.country}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    placeholder="Enter country"
                  />
                </div>

                <div className="institute-form-group">
                  <label className="institute-form-label">Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={collegeFormData.address.pincode}
                    onChange={handleFormChange}
                    className="institute-form-input"
                    placeholder="Enter pincode"
                  />
                  </div>
                </div>
              </div>

              <div className="institute-form-actions">
              <button type="button" className="institute-btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="submit" className="institute-btn-primary">
                Add College
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="institute-modal-overlay" onClick={handleCloseBulkUploadModal}>
          <div className="institute-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="institute-modal-header">
              <h2 className="institute-modal-title">Bulk Upload Colleges</h2>
              <button className="institute-modal-close" onClick={handleCloseBulkUploadModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ marginTop: 0, color: '#284B63', fontSize: '16px', fontWeight: '600' }}>Instructions:</h3>
                <ul style={{ paddingLeft: '20px', margin: '0', color: '#4B5563', fontSize: '14px', lineHeight: '1.6' }}>
                  <li style={{ marginBottom: '6px' }}>Download the Excel template and fill in college details</li>
                  <li style={{ marginBottom: '6px' }}><strong>Required columns:</strong> name, code, email</li>
                  <li style={{ marginBottom: '6px' }}><strong>Optional columns:</strong> password, institute (ObjectId if not logged in as institute), contactNumber, line1, line2, city, state, country, pincode, website, type, status</li>
                  <li style={{ marginBottom: '6px' }}>If no password is provided, default will be <strong>CODE@123</strong></li>
                  <li style={{ marginBottom: '6px' }}><strong>Type:</strong> "Engineering College", "Medical College", "Arts College", etc.</li>
                  <li style={{ marginBottom: '6px' }}><strong>Status:</strong> "Active" or "Inactive"</li>
                  <li style={{ marginBottom: '6px' }}>Maximum file size: 5MB</li>
                </ul>
                
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button 
                  onClick={handleDownloadTemplate}
                  style={{
                    backgroundColor: '#284B63',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1E3A4A'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#284B63'}
                  >
                    Download Excel Template
                  </button>
                </div>
              </div>
              
              <div 
                style={{ 
                  border: `2px dashed ${dragOver ? '#284B63' : '#D1D5DB'}`, 
                  borderRadius: '8px', 
                  padding: '32px', 
                  textAlign: 'center',
                  backgroundColor: dragOver ? '#F0F4F8' : (selectedFile ? '#E8F5E8' : '#F9FAFB'),
                  marginBottom: '20px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  transform: dragOver ? 'translateY(-2px)' : 'translateY(0px)',
                  position: 'relative'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                {!selectedFile && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px', color: '#6B7280' }}>
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {selectedFile ? (
                  <div>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px', color: '#10B981' }}>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p style={{ margin: '8px 0', color: '#10B981', fontSize: '16px', fontWeight: '500' }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ margin: '4px 0', color: '#6B7280', fontSize: '14px' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '8px 0', color: '#4B5563', fontSize: '16px', fontWeight: '500' }}>
                      {dragOver ? 'Drop file here' : 'Drop Excel file here or click to browse'}
                    </p>
                  </div>
                )}
                
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={handleCloseBulkUploadModal}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    color: '#4B5563',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadColleges}
                  disabled={!selectedFile || uploading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: (!selectedFile || uploading) ? '#9CA3AF' : '#284B63',
                    color: 'white',
                    cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                    opacity: (!selectedFile || uploading) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = '#1E3A4A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = '#284B63';
                    }
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Colleges'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;
