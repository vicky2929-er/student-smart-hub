import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalEvents: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemHealth: 'Loading...',
    totalActivities: 0,
    platformUptime: 'Loading...',
    dataSync: 'Loading...'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination and filtering states
  const [collegesPage, setCollegesPage] = useState(1);
  const [collegesSearch, setCollegesSearch] = useState('');
  const [collegesFilter, setCollegesFilter] = useState('');
  const [totalCollegesPages, setTotalCollegesPages] = useState(1);

  // Modal states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    permissions: ['full_access'],
    status: 'Active'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [collegesPage, collegesSearch, collegesFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchSystemAlerts(),
        fetchPendingInstitutions()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await superAdminService.getDashboardStats();
      setStats({
        totalColleges: response.metrics?.institutes || 0,
        totalStudents: response.metrics?.activeStudents || 0,
        totalFaculty: 0, // Will be calculated from institutes
        totalEvents: response.metrics?.activitiesLogged || 0,
        activeUsers: response.metrics?.activeStudents || 0,
        pendingApprovals: response.metrics?.pendingApprovals || 0,
        systemHealth: 'Good',
        totalActivities: response.metrics?.activitiesLogged || 0,
        platformUptime: '99.9%',
        dataSync: 'Synced'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default values on error
      setStats({
        totalColleges: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalEvents: 0,
        activeUsers: 0,
        pendingApprovals: 0,
        systemHealth: 'Error',
        totalActivities: 0,
        platformUptime: 'Unknown',
        dataSync: 'Error'
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await superAdminService.getRecentActivities(5);
      setRecentActivities(response.activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await superAdminService.getAllColleges(
        collegesPage,
        10, // increased limit for better overview
        collegesSearch,
        collegesFilter
      );
      setColleges(response.colleges || []);
      setTotalCollegesPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setColleges([]);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const response = await superAdminService.getSystemAlerts();
      setSystemAlerts(response.alerts || []);
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      setSystemAlerts([]);
    }
  };

  const fetchPendingInstitutions = async () => {
    try {
      const response = await superAdminService.getPendingInstitutions();
      setPendingInstitutions(response.institutions || []);
    } catch (error) {
      console.error('Error fetching pending institutions:', error);
      setPendingInstitutions([]);
    }
  };

  const StatCard = ({ icon, title, value, change }) => (
    <div className="superadmin-stat-card">
      <div className="superadmin-stat-icon">
        <i className={icon}></i>
      </div>
      <div className="superadmin-stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && <small className="superadmin-stat-change">{change}</small>}
      </div>
    </div>
  );

  const QuickActionCard = ({ icon, title, description, onClick }) => (
    <div className="superadmin-action-card" onClick={onClick}>
      <div className="superadmin-action-icon">
        <i className={icon}></i>
      </div>
      <div className="superadmin-action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleCollegeAction = async (action, collegeId, data = null) => {
    try {
      switch (action) {
        case 'approve':
          await superAdminService.approveCollege(collegeId);
          break;
        case 'reject':
          await superAdminService.rejectCollege(collegeId, data?.reason || 'No reason provided');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this institute?')) {
            await superAdminService.deleteCollege(collegeId);
          } else {
            return;
          }
          break;
        default:
          return;
      }
      // Refresh colleges list after action
      await fetchColleges();
      await fetchStats(); // Update stats as well
      await fetchPendingInstitutions(); // Update pending institutions
    } catch (error) {
      console.error(`Error ${action}ing institute:`, error);
      alert(`Failed to ${action} institute. Please try again.`);
    }
  };

  const handleReviewClick = (institution) => {
    setSelectedInstitution(institution);
    setReviewAction(null);
    setRejectionComment('');
    setShowReviewModal(true);
  };

  const handleReviewAction = async (action) => {
    if (action === 'reject' && !rejectionComment.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      if (action === 'approve') {
        await superAdminService.approveCollege(selectedInstitution.id);
      } else if (action === 'reject') {
        await superAdminService.rejectCollege(selectedInstitution.id, rejectionComment);
      }
      
      // Close modal and refresh data
      setShowReviewModal(false);
      setSelectedInstitution(null);
      setRejectionComment('');
      await fetchColleges();
      await fetchStats();
      await fetchPendingInstitutions();
    } catch (error) {
      console.error(`Error ${action}ing institute:`, error);
      alert(`Failed to ${action} institute. Please try again.`);
    }
  };

  const handleDirectReject = (institution) => {
    setSelectedInstitution(institution);
    setReviewAction('reject');
    setRejectionComment('');
    setShowReviewModal(true);
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setRefreshing(true);
      await superAdminService.addAdmin({
        name: {
          first: adminFormData.firstName,
          last: adminFormData.lastName
        },
        email: adminFormData.email,
        password: adminFormData.password,
        contactNumber: adminFormData.contactNumber,
        permissions: adminFormData.permissions,
        status: adminFormData.status
      });
      
      alert('Admin added successfully!');
      setShowAdminModal(false);
      setAdminFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        contactNumber: '',
        permissions: ['full_access'],
        status: 'Active'
      });
      setRefreshing(false);
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Failed to add admin. Please try again.');
      setRefreshing(false);
    }
  };

  const handleQuickAction = async (actionType) => {
    try {
      switch (actionType) {
        case 'analytics':
          // Navigate to analytics page
          window.location.href = '/superadmin/analytics';
          break;
        case 'add-institute':
          // Navigate to institute registration page
          window.location.href = '/institute-registration';
          break;
        case 'manage-admins':
          // Show admin modal
          setShowAdminModal(true);
          break;
        default:
          console.log(`Action: ${actionType}`);
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      alert(`Failed to perform ${actionType}. Please try again.`);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="superadmin-loading-container">
        <div className="superadmin-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superadmin-error-container">
        <div className="superadmin-error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button className="superadmin-btn-primary" onClick={handleRefresh}>
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      {/* Review Modal */}
      {showReviewModal && selectedInstitution && (
        <div className="superadmin-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="superadmin-modal-content superadmin-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h2>Review Institution Application</h2>
              <button 
                className="superadmin-modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="superadmin-review-content">
              {/* Institution Header */}
              <div className="superadmin-review-header">
                <div className="superadmin-institution-avatar-large">
                  {selectedInstitution.avatar || selectedInstitution.name?.substring(0, 2).toUpperCase() || 'II'}
                </div>
                <div className="superadmin-review-title-section">
                  <h3>{selectedInstitution.name || 'Institution Name'}</h3>
                  <p className="superadmin-institution-type">{selectedInstitution.type || 'Educational Institution'}</p>
                  <span className={`superadmin-status-badge ${selectedInstitution.reviewStatus || 'under-review'}`}>
                    {selectedInstitution.reviewStatus === 'under-review' ? 'UNDER REVIEW' :
                     selectedInstitution.reviewStatus === 'documentation-pending' ? 'DOCUMENTATION PENDING' :
                     selectedInstitution.reviewStatus === 'final-review' ? 'FINAL REVIEW' : 'UNDER REVIEW'}
                  </span>
                </div>
              </div>

              {/* Institution Details */}
              <div className="superadmin-review-details">
                <div className="superadmin-review-section">
                  <h4><i className="fas fa-info-circle"></i> Basic Information</h4>
                  <div className="superadmin-detail-grid">
                    <div className="superadmin-detail-item">
                      <label>Institution Name:</label>
                      <span>{selectedInstitution.name || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Institution Type:</label>
                      <span>{selectedInstitution.type || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Location:</label>
                      <span>{selectedInstitution.location || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Contact Email:</label>
                      <span>{selectedInstitution.contact || selectedInstitution.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="superadmin-review-section">
                  <h4><i className="fas fa-users"></i> Statistics</h4>
                  <div className="superadmin-detail-grid">
                    <div className="superadmin-detail-item">
                      <label>Total Students:</label>
                      <span>{selectedInstitution.students || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Faculty Members:</label>
                      <span>{selectedInstitution.faculty || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Departments:</label>
                      <span>{selectedInstitution.departments || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Established:</label>
                      <span>{selectedInstitution.established || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="superadmin-review-section">
                  <h4><i className="fas fa-clock"></i> Application Details</h4>
                  <div className="superadmin-detail-grid">
                    <div className="superadmin-detail-item">
                      <label>Application Date:</label>
                      <span>{selectedInstitution.requested || selectedInstitution.submittedTime || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Application ID:</label>
                      <span>{selectedInstitution.id || 'N/A'}</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Documents Status:</label>
                      <span className="superadmin-status-text complete">Complete</span>
                    </div>
                    <div className="superadmin-detail-item">
                      <label>Verification Status:</label>
                      <span className="superadmin-status-text pending">Pending Review</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Comment Section */}
                {(reviewAction === 'reject' || rejectionComment) && (
                  <div className="superadmin-review-section">
                    <h4><i className="fas fa-comment"></i> Rejection Reason</h4>
                    <textarea
                      className="superadmin-rejection-textarea"
                      placeholder="Please provide a detailed reason for rejection..."
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                      rows="4"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="superadmin-modal-actions superadmin-review-actions">
              <button 
                type="button" 
                className="superadmin-btn-secondary"
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="superadmin-btn-success"
                onClick={() => handleReviewAction('approve')}
              >
                <i className="fas fa-check"></i> Approve
              </button>
              <button 
                type="button" 
                className="superadmin-btn-danger"
                onClick={() => {
                  if (reviewAction !== 'reject') {
                    setReviewAction('reject');
                  } else {
                    handleReviewAction('reject');
                  }
                }}
              >
                <i className="fas fa-times"></i> 
                {reviewAction === 'reject' ? 'Confirm Reject' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="superadmin-modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="superadmin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <h2>Add New Admin</h2>
              <button 
                className="superadmin-modal-close"
                onClick={() => setShowAdminModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAdminFormSubmit} className="superadmin-admin-form">
              <div className="superadmin-form-row">
                <div className="superadmin-form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={adminFormData.firstName}
                    onChange={handleAdminFormChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="superadmin-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={adminFormData.lastName}
                    onChange={handleAdminFormChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="superadmin-form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={adminFormData.email}
                  onChange={handleAdminFormChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="superadmin-form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={adminFormData.password}
                  onChange={handleAdminFormChange}
                  required
                  placeholder="Enter password"
                  minLength="6"
                />
              </div>

              <div className="superadmin-form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={adminFormData.contactNumber}
                  onChange={handleAdminFormChange}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="superadmin-form-row">
                <div className="superadmin-form-group">
                  <label htmlFor="permissions">Permissions</label>
                  <select
                    id="permissions"
                    name="permissions"
                    value={adminFormData.permissions[0]}
                    onChange={(e) => setAdminFormData(prev => ({
                      ...prev,
                      permissions: [e.target.value]
                    }))}
                  >
                    <option value="full_access">Full Access</option>
                    <option value="limited_access">Limited Access</option>
                    <option value="read_only">Read Only</option>
                  </select>
                </div>
                <div className="superadmin-form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={adminFormData.status}
                    onChange={handleAdminFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="superadmin-modal-actions">
                <button 
                  type="button" 
                  className="superadmin-btn-secondary"
                  onClick={() => setShowAdminModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="superadmin-btn-primary"
                  disabled={refreshing}
                >
                  {refreshing ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="superadmin-dashboard-header">
        <div className="superadmin-header-content">
          <h1 className="superadmin-dashboard-title">SuperAdmin Dashboard</h1>
          <p className="superadmin-dashboard-subtitle">
            Comprehensive system management and oversight
          </p>
          <div className="superadmin-header-actions">
            <button 
              className="superadmin-btn-primary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button className="superadmin-btn-secondary">
              <i className="fas fa-download"></i>
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - 5 Cards Layout */}
      <div className="superadmin-stats-grid">
        <StatCard
          icon="fas fa-university"
          title="Total Institutes"
          value={stats.totalColleges}
        />
        <StatCard
          icon="fas fa-user-graduate"
          title="Total Students"
          value={stats.totalStudents}
        />
        <StatCard
          icon="fas fa-chalkboard-teacher"
          title="Total Faculty"
          value={stats.totalFaculty}
        />
        <StatCard
          icon="fas fa-calendar-alt"
          title="Active Events"
          value={stats.totalEvents}
        />
        <StatCard
          icon="fas fa-clock"
          title="Pending Approvals"
          value={stats.pendingApprovals}
        />
      </div>

      <div className="superadmin-dashboard-content">
        {/* Quick Actions */}
        <div className="superadmin-dashboard-section">
          <div className="superadmin-section-header">
            <h2 className="superadmin-section-title">
              <i className="fas fa-tachometer-alt"></i>
              Quick Management
            </h2>
            <p>Perform common administrative tasks</p>
          </div>
          <div className="superadmin-quick-actions-grid">
            <QuickActionCard
              icon="fas fa-plus"
              title="Add New Institute"
              description="Register a new educational institution"
              onClick={() => handleQuickAction('add-institute')}
            />
            <QuickActionCard
              icon="fas fa-user-shield"
              title="Manage Admins"
              description="Add or modify admin privileges"
              onClick={() => handleQuickAction('manage-admins')}
            />

            <QuickActionCard
              icon="fas fa-chart-line"
              title="Analytics"
              description="View detailed system analytics"
              onClick={() => handleQuickAction('analytics')}
            />
          </div>
        </div>

        {/* Pending Institution Approvals Section */}
        <div className="superadmin-dashboard-section">
          <div className="superadmin-section-header">
            <h2 className="superadmin-section-title">
              Pending Institution Approvals
            </h2>
          </div>
          <div className="superadmin-pending-institutions">
            {pendingInstitutions.length > 0 ? (
              <div className="superadmin-pending-cards-grid">
                {pendingInstitutions.map(institution => (
                  <div key={institution.id} className="superadmin-pending-card">
                    <div className="superadmin-card-header">
                      <div className="superadmin-institution-avatar">
                        {institution.avatar || institution.name?.substring(0, 2).toUpperCase() || 'II'}
                      </div>
                      <div className="superadmin-card-title-section">
                        <h3 className="superadmin-institution-name">
                          {institution.name || 'Indian Institute of Science, Bangalore'}
                        </h3>
                        <p className="superadmin-institution-type">
                          {institution.type || 'Technical University'}
                        </p>
                      </div>
                      <div className="superadmin-pending-status">
                        <span className={`superadmin-status-badge ${institution.reviewStatus || 'under-review'}`}>
                          {institution.reviewStatus === 'under-review' ? 'UNDER REVIEW' :
                           institution.reviewStatus === 'documentation-pending' ? 'DOCUMENTATION PENDING' :
                           institution.reviewStatus === 'final-review' ? 'FINAL REVIEW' : 'UNDER REVIEW'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="superadmin-card-body">
                      <div className="superadmin-institution-details">
                        <div className="superadmin-detail-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{institution.location || 'Bangalore, Karnataka'}</span>
                        </div>
                        <div className="superadmin-detail-item">
                          <i className="fas fa-envelope"></i>
                          <span>{institution.contact || institution.email || 'admin@iisc.ac.in'}</span>
                        </div>
                        <div className="superadmin-detail-item">
                          <i className="fas fa-users"></i>
                          <span>{institution.students || '12,000'} Students</span>
                        </div>
                        <div className="superadmin-detail-item">
                          <i className="fas fa-clock"></i>
                          <span>Requested {institution.requested || institution.submittedTime || '2 days ago'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="superadmin-card-actions">
                      <button 
                        className="superadmin-action-btn approve"
                        onClick={() => handleCollegeAction('approve', institution.id)}
                      >
                        <i className="fas fa-check"></i>
                        Approve
                      </button>
                      <button 
                        className="superadmin-action-btn reject"
                        onClick={() => handleDirectReject(institution)}
                      >
                        <i className="fas fa-times"></i>
                        Reject
                      </button>
                      <button 
                        className="superadmin-action-btn review"
                        onClick={() => handleReviewClick(institution)}
                      >
                        <i className="fas fa-eye"></i>
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="superadmin-no-pending">
                <div className="superadmin-no-data-content">
                  <i className="fas fa-check-circle"></i>
                  <h3>No Pending Approvals</h3>
                  <p>All institution registration requests have been processed</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="superadmin-main-content-grid">
          {/* Institutes Management */}
          <div className="superadmin-colleges-section">
            <div className="superadmin-section-header">
              <h2 className="superadmin-section-title">
                <i className="fas fa-university"></i>
                Institutes Overview
              </h2>
              <div className="superadmin-section-actions">
                <input
                  type="text"
                  placeholder="Search institutes..."
                  value={collegesSearch}
                  onChange={(e) => setCollegesSearch(e.target.value)}
                  className="superadmin-search-input"
                />
                <select
                  value={collegesFilter}
                  onChange={(e) => setCollegesFilter(e.target.value)}
                  className="superadmin-filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <button 
                  className="superadmin-btn-primary"
                  onClick={() => handleQuickAction('add-institute')}
                >
                  <i className="fas fa-plus"></i> Add Institute
                </button>
              </div>
            </div>
            <div className="superadmin-colleges-table">
              <table>
                <thead>
                  <tr>
                    <th>Institute Name</th>
                    <th>Students</th>
                    <th>Faculty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.length > 0 ? colleges.map(college => (
                    <tr key={college.id}>
                      <td>
                        <div className="superadmin-college-info">
                          <strong>{college.name}</strong>
                          <small>{college.type} • {college.location}</small>
                          <small>Code: {college.code}</small>
                        </div>
                      </td>
                      <td>
                        <div className="superadmin-count-display">
                          <span className="count-number">{college.students.toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="superadmin-count-display">
                          <span className="count-number">{college.faculty.toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`superadmin-status ${college.status.toLowerCase()}`}>
                          <i className="fas fa-circle"></i>
                          {college.status}
                        </span>
                      </td>
                      <td>
                        <div className="superadmin-action-buttons">
                          <button 
                            className="superadmin-btn-icon view" 
                            title="View Details"
                            onClick={() => console.log('View institute:', college.id)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="superadmin-btn-icon edit" 
                            title="Edit Institute"
                            onClick={() => console.log('Edit institute:', college.id)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="superadmin-btn-icon analytics" 
                            title="View Analytics"
                            onClick={() => console.log('Analytics for:', college.id)}
                          >
                            <i className="fas fa-chart-bar"></i>
                          </button>
                          <button 
                            className="superadmin-btn-icon danger" 
                            title="Suspend Institute"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to suspend ${college.name}?`)) {
                                handleCollegeAction('suspend', college.id);
                              }
                            }}
                          >
                            <i className="fas fa-ban"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="superadmin-no-data">
                        <div className="superadmin-no-data-content">
                          <i className="fas fa-university"></i>
                          <p>No institutes found</p>
                          <small>Try adjusting your search or filter criteria</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activities & System Alerts */}
          <div className="superadmin-dashboard-sidebar">
            {/* System Alerts */}
            <div className="superadmin-alerts-section">
              <div className="superadmin-section-header">
                <h3 className="superadmin-section-title">
                  <i className="fas fa-bell"></i>
                  System Alerts
                </h3>
              </div>
              <div className="superadmin-alerts-list">
                {systemAlerts.length > 0 ? systemAlerts.map(alert => (
                  <div key={alert.id} className={`superadmin-alert-item ${alert.type || 'info'}`}>
                    <div className="superadmin-alert-icon">
                      <i className={`fas ${
                        alert.type === 'error' ? 'fa-exclamation-circle' :
                        alert.type === 'warning' ? 'fa-exclamation-triangle' :
                        'fa-info-circle'
                      }`}></i>
                    </div>
                    <div className="superadmin-alert-content">
                      <p>{alert.message || 'No message available'}</p>
                      <small>{alert.time || 'Unknown time'}</small>
                    </div>
                  </div>
                )) : (
                  <div className="superadmin-no-data-content">
                    <i className="fas fa-check-circle"></i>
                    <p>No system alerts</p>
                    <small>All systems are running normally</small>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="superadmin-activities-section">
              <div className="superadmin-section-header">
                <h3 className="superadmin-section-title">
                  <i className="fas fa-clipboard-list"></i>
                  Recent Activities
                </h3>
              </div>
              <div className="superadmin-activities-list">
                {recentActivities.length > 0 ? recentActivities.map(activity => (
                  <div key={activity.id} className="superadmin-activity-item">
                    <div className={`superadmin-activity-icon ${activity.type || 'system'}`}>
                      {(activity.type === 'college' || !activity.type) && <i className="fas fa-university"></i>}
                      {activity.type === 'system' && <i className="fas fa-server"></i>}
                      {activity.type === 'support' && <i className="fas fa-exclamation-triangle"></i>}
                      {activity.type === 'event' && <i className="fas fa-calendar-alt"></i>}
                      {activity.type === 'profile' && <i className="fas fa-users"></i>}
                    </div>
                    <div className="superadmin-activity-content">
                      <p>{activity.action || 'Unknown activity'}</p>
                      {activity.college && <small>Institute: {activity.college}</small>}
                      {activity.user && <small>User: {activity.user}</small>}
                      {activity.event && <small>Event: {activity.event}</small>}
                      {activity.faculty && <small>Faculty: {activity.faculty}</small>}
                      <small className="superadmin-activity-time">{activity.time || 'Unknown time'}</small>
                    </div>
                  </div>
                )) : (
                  <div className="superadmin-no-data-content">
                    <i className="fas fa-history"></i>
                    <p>No recent activities</p>
                    <small>Activities will appear here as they occur</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
