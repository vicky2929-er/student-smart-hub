import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instituteService } from '../../services/authService';
import './InstituteProfile.css';

const InstituteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instituteData, setInstituteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchInstituteProfile();
  }, [id]);

  const fetchInstituteProfile = async () => {
    try {
      setLoading(true);
      const response = await instituteService.getInstituteProfile(id);
      setInstituteData(response.data);
      setEditFormData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching institute profile:", error);
      setError("Failed to load institute profile");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate(`/institute/dashboard/${id}`);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditFormData({ ...instituteData });
    }
  };

  const handleInputChange = (e) => {
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

  const handleSaveChanges = async () => {
    try {
      const response = await instituteService.updateInstituteProfile(id, editFormData);
      setInstituteData(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="institute-profile-loading">
        <div className="institute-profile-spinner"></div>
        <p>Loading institute profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="institute-profile-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchInstituteProfile} className="institute-profile-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!instituteData) {
    return (
      <div className="institute-profile-error">
        <h2>No Data Available</h2>
        <p>Unable to load institute profile</p>
      </div>
    );
  }

  return (
    <div className="institute-profile-container">
      {/* Header Section */}
      <div className="institute-profile-header">
        <button onClick={handleBackToDashboard} className="institute-profile-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        
        <div className="institute-profile-header-content">
          <h1 className="institute-profile-title">Institute Profile</h1>
          <p className="institute-profile-subtitle">Manage your institute information</p>
        </div>

        <button onClick={handleEditToggle} className="institute-profile-edit-btn">
          {isEditing ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Profile Content */}
      <div className="institute-profile-content">
        {/* Basic Information Card */}
        <div className="institute-profile-card">
          <div className="institute-profile-card-header">
            <h2 className="institute-profile-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Basic Information
            </h2>
          </div>
          
          <div className="institute-profile-card-content">
            <div className="institute-profile-form-grid">
              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Institute Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.name || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Institute Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="code"
                    value={editFormData.code || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.code || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Type</label>
                {isEditing ? (
                  <select
                    name="type"
                    value={editFormData.type || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-select"
                  >
                    <option value="University">University</option>
                    <option value="Institute">Institute</option>
                    <option value="College">College</option>
                    <option value="School">School</option>
                  </select>
                ) : (
                  <p className="institute-profile-form-value">{instituteData.type || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={editFormData.status || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <div className="institute-profile-status-badge">
                    <span className={`institute-profile-status-indicator ${instituteData.status === 'active' ? 'active' : 'inactive'}`}></span>
                    {instituteData.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                )}
              </div>

              <div className="institute-profile-form-group institute-profile-form-group-full">
                <label className="institute-profile-form-label">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-textarea"
                    rows="3"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.description || 'No description available'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="institute-profile-card">
          <div className="institute-profile-card-header">
            <h2 className="institute-profile-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V19.92C22 20.52 21.39 21 20.77 21C9.28 21 0 11.72 0 0.28C0 -0.34 0.48 -0.92 1.08 -0.92H4.08C4.68 -0.92 5.16 -0.34 5.16 0.28C5.16 2.56 5.58 4.76 6.38 6.8C6.54 7.24 6.42 7.76 6.06 8.12L4.12 10.06C6.58 14.58 10.42 18.42 14.94 20.88L16.88 18.94C17.24 18.58 17.76 18.46 18.2 18.62C20.24 19.42 22.44 19.84 24.72 19.84C25.34 19.84 25.92 20.32 25.92 20.92V23.92C25.92 24.52 25.34 25 24.72 25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Contact Information
            </h2>
          </div>
          
          <div className="institute-profile-card-content">
            <div className="institute-profile-form-grid">
              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.email || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Contact Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editFormData.contactNumber || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.contactNumber || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group institute-profile-form-group-full">
                <label className="institute-profile-form-label">Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={editFormData.website || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">
                    {instituteData.website ? (
                      <a href={instituteData.website} target="_blank" rel="noopener noreferrer" className="institute-profile-link">
                        {instituteData.website}
                      </a>
                    ) : 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information Card */}
        <div className="institute-profile-card">
          <div className="institute-profile-card-header">
            <h2 className="institute-profile-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Address Information
            </h2>
          </div>
          
          <div className="institute-profile-card-content">
            <div className="institute-profile-form-grid">
              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Address Line 1</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.line1"
                    value={editFormData.address?.line1 || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.address?.line1 || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Address Line 2</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.line2"
                    value={editFormData.address?.line2 || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.address?.line2 || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={editFormData.address?.city || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.address?.city || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.state"
                    value={editFormData.address?.state || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.address?.state || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.country"
                    value={editFormData.address?.country || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.address?.country || 'N/A'}</p>
                )}
              </div>

              <div className="institute-profile-form-group">
                <label className="institute-profile-form-label">Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.pincode"
                    value={editFormData.address?.pincode || ''}
                    onChange={handleInputChange}
                    className="institute-profile-form-input"
                  />
                ) : (
                  <p className="institute-profile-form-value">{instituteData.address?.pincode || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="institute-profile-actions">
            <button onClick={handleSaveChanges} className="institute-profile-save-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteProfile;
