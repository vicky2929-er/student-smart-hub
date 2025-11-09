import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instituteService } from '../../services/authService';
import './ManageColleges.css';

const ManageColleges = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    email: '',
    contactNumber: '',
    website: '',
    type: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    }
  });

  useEffect(() => {
    fetchColleges();
  }, [id]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await instituteService.getCollegesByInstitute(id);
      setColleges(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setError('Failed to load colleges. Please try again.');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (college) => {
    setSelectedCollege(college);
    setEditFormData({
      name: college.name,
      code: college.code,
      email: college.email,
      contactNumber: college.contactNumber || '',
      website: college.website || '',
      type: college.type,
      address: {
        line1: college.address?.line1 || '',
        line2: college.address?.line2 || '',
        city: college.address?.city || '',
        state: college.address?.state || '',
        country: college.address?.country || '',
        pincode: college.address?.pincode || ''
      }
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (college) => {
    setCollegeToDelete(college);
    setShowDeleteModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await instituteService.updateCollege(selectedCollege._id, editFormData);
      alert('College updated successfully!');
      setShowEditModal(false);
      fetchColleges();
    } catch (error) {
      console.error('Error updating college:', error);
      alert('Failed to update college. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await instituteService.deleteCollege(collegeToDelete._id);
      alert('College deleted successfully!');
      setShowDeleteModal(false);
      fetchColleges();
    } catch (error) {
      console.error('Error deleting college:', error);
      alert('Failed to delete college. Please try again.');
    }
  };

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || college.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const collegeTypes = [...new Set(colleges.map(college => college.type))];

  if (loading) {
    return (
      <div className="manage-colleges-loading">
        <div className="manage-colleges-spinner"></div>
        <p>Loading colleges...</p>
      </div>
    );
  }

  if (error && colleges.length === 0) {
    return (
      <div className="manage-colleges-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchColleges} className="manage-colleges-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="manage-colleges-container">
      {/* Header */}
      <div className="manage-colleges-header">
        <div className="manage-colleges-header-content">
          <button 
            className="manage-colleges-back-btn"
            onClick={() => navigate(`/institute/dashboard/${id}`)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <h1 className="manage-colleges-title">Manage Colleges</h1>
          <p className="manage-colleges-subtitle">{colleges.length} colleges under your institute</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="manage-colleges-controls">
        <div className="manage-colleges-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="Search colleges by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="manage-colleges-search-input"
          />
        </div>
        <div className="manage-colleges-filter">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="manage-colleges-filter-select"
          >
            <option value="all">All Types</option>
            {collegeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="manage-colleges-grid">
        {filteredColleges.map(college => (
          <div key={college._id} className="manage-college-card">
            <div className="manage-college-card-header">
              <div className="manage-college-info">
                <h3 className="manage-college-name">{college.name}</h3>
                <p className="manage-college-code">{college.code}</p>
                <span className={`manage-college-status ${college.status}`}>
                  {college.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
              <div className="manage-college-type">
                <span className="manage-college-type-badge">{college.type}</span>
              </div>
            </div>

            <div className="manage-college-stats">
              <div className="manage-college-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{college.departmentCount || 0} Departments</span>
              </div>
              <div className="manage-college-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{college.facultyCount || 0} Faculty</span>
              </div>
              <div className="manage-college-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{college.studentCount || 0} Students</span>
              </div>
            </div>

            <div className="manage-college-details">
              <div className="manage-college-contact">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{college.email}</span>
              </div>
              {college.address && (
                <div className="manage-college-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{college.address.city}, {college.address.state}</span>
                </div>
              )}
            </div>

            <div className="manage-college-actions">
              <button 
                className="manage-college-edit-btn"
                onClick={() => handleEditClick(college)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Edit
              </button>
              <button 
                className="manage-college-delete-btn"
                onClick={() => handleDeleteClick(college)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredColleges.length === 0 && (
        <div className="manage-colleges-empty">
          <div className="manage-colleges-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3>No colleges found</h3>
          <p>No colleges match your search criteria</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="manage-colleges-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="manage-colleges-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="manage-colleges-modal-header">
              <h2>Edit College</h2>
              <button 
                className="manage-colleges-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <form className="manage-colleges-edit-form" onSubmit={handleEditSubmit}>
              <div className="manage-colleges-form-grid">
                <div className="manage-colleges-form-group">
                  <label>College Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="manage-colleges-form-group">
                  <label>College Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={editFormData.code}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="manage-colleges-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="manage-colleges-form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editFormData.contactNumber}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="manage-colleges-form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={editFormData.website}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="manage-colleges-form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditFormChange}
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
              </div>

              <div className="manage-colleges-form-section">
                <h3>Address</h3>
                <div className="manage-colleges-form-grid">
                  <div className="manage-colleges-form-group">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      name="address.line1"
                      value={editFormData.address.line1}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="manage-colleges-form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="address.line2"
                      value={editFormData.address.line2}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="manage-colleges-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={editFormData.address.city}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="manage-colleges-form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={editFormData.address.state}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="manage-colleges-form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={editFormData.address.country}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="manage-colleges-form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={editFormData.address.pincode}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="manage-colleges-form-actions">
                <button 
                  type="button" 
                  className="manage-colleges-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="manage-colleges-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="manage-colleges-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="manage-colleges-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="manage-colleges-delete-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Delete College</h3>
            <p>Are you sure you want to delete <strong>{collegeToDelete?.name}</strong>?</p>
            <p className="manage-colleges-delete-warning">This action cannot be undone.</p>
            <div className="manage-colleges-delete-actions">
              <button 
                className="manage-colleges-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="manage-colleges-confirm-delete-btn"
                onClick={handleDeleteConfirm}
              >
                Delete College
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageColleges;
