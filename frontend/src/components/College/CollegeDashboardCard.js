import React from "react";
import { useNavigate } from "react-router-dom";
import "./College.css";

const CollegeDashboardCard = ({ college }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/college/dashboard/${college._id}`);
  };

  const getInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="college-dashboard-card">
      <div className="college-dashboard-card-header">
        <div className="college-dashboard-avatar">
          {getInitials(college.name)}
        </div>
        <div className="college-dashboard-info">
          <h3 className="college-dashboard-name">{college.name}</h3>
          <p className="college-dashboard-code">Code: {college.code}</p>
          <p className="college-dashboard-type">{college.type}</p>
        </div>
      </div>
      
      <div className="college-dashboard-card-body">
        <div className="college-dashboard-stats">
          <div className="college-dashboard-stat">
            <span className="college-dashboard-stat-label">Departments</span>
            <span className="college-dashboard-stat-value">
              {college.departments?.length || 0}
            </span>
          </div>
          <div className="college-dashboard-stat">
            <span className="college-dashboard-stat-label">Status</span>
            <span className={`college-dashboard-status ${college.status?.toLowerCase()}`}>
              {college.status}
            </span>
          </div>
        </div>
        
        <div className="college-dashboard-contact">
          <p><i className="fas fa-envelope"></i> {college.email}</p>
          {college.contactNumber && (
            <p><i className="fas fa-phone"></i> {college.contactNumber}</p>
          )}
          {college.website && (
            <p>
              <i className="fas fa-globe"></i> 
              <a href={college.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            </p>
          )}
        </div>
      </div>
      
      <div className="college-dashboard-card-footer">
        <button 
          onClick={handleViewProfile}
          className="college-dashboard-view-btn"
        >
          <i className="fas fa-eye"></i>
          View Profile
        </button>
      </div>
    </div>
  );
};

export default CollegeDashboardCard;
