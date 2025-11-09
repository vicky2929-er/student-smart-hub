import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { dashboardService } from "../../services/authService";
import "./Dashboard.css";

const Dashboard = () => {
  const { role } = useParams();
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboard(role);
      setDashboardData(response.data);
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="alert alert-danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        {/* Welcome Section */}
        <div className="dashboard-card welcome-section">
          <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
          <p>Welcome to your administrative dashboard.</p>
        </div>

        <div className="dashboard-card">
          <h2>Dashboard Overview</h2>
          <p>Role: {dashboardData?.dashboardType}</p>
          <p>User: {dashboardData?.user?.name}</p>
          <p>Email: {dashboardData?.user?.email}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn">View Reports</button>
              <button className="action-btn">Manage Users</button>
              <button className="action-btn">Settings</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <p>No recent activity to display.</p>
          </div>

          <div className="dashboard-card">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Total Items</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
