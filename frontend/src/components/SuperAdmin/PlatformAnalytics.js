import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/authService";
import "./SuperAdmin.css";

const PlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock analytics data - in real app, this would be an API call
      const mockAnalytics = {
        overview: {
          totalInstitutions: 147,
          activeInstitutions: 145,
          pendingInstitutions: 12,
          totalUsers: 2400000,
          totalStudents: 1800000,
          totalFaculty: 45000,
          totalEvents: 1250
        },
        growth: {
          institutions: { current: 147, previous: 139, change: 5.8 },
          users: { current: 2400000, previous: 2100000, change: 14.3 },
          students: { current: 1800000, previous: 1600000, change: 12.5 },
          faculty: { current: 45000, previous: 42000, change: 7.1 }
        },
        distribution: {
          byType: [
            { type: "University", count: 45, percentage: 30.6 },
            { type: "Engineering College", count: 38, percentage: 25.9 },
            { type: "Standalone College", count: 28, percentage: 19.0 },
            { type: "IIT", count: 15, percentage: 10.2 },
            { type: "NIT", count: 12, percentage: 8.2 },
            { type: "Medical College", count: 9, percentage: 6.1 }
          ],
          byState: [
            { state: "Maharashtra", count: 25, percentage: 17.0 },
            { state: "Tamil Nadu", count: 22, percentage: 15.0 },
            { state: "Karnataka", count: 18, percentage: 12.2 },
            { state: "Uttar Pradesh", count: 16, percentage: 10.9 },
            { state: "West Bengal", count: 14, percentage: 9.5 },
            { state: "Others", count: 52, percentage: 35.4 }
          ]
        },
        trends: {
          monthly: [
            { month: "Jan", institutions: 142, users: 2200000 },
            { month: "Feb", institutions: 144, users: 2250000 },
            { month: "Mar", institutions: 145, users: 2300000 },
            { month: "Apr", institutions: 146, users: 2350000 },
            { month: "May", institutions: 147, users: 2400000 }
          ]
        },
        performance: {
          averageResponseTime: "245ms",
          uptime: "99.9%",
          activeUsers: 125000,
          newRegistrations: 8500
        }
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChangeColor = (change) => {
    return change >= 0 ? "#16a34a" : "#ef4444";
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? "↗" : "↘";
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <section className="dashboard-card sa-hero">
          <div className="sa-hero-content">
            <h1>Platform Analytics</h1>
            <p>Comprehensive analytics and insights about the platform performance.</p>
            <div style={{ marginTop: '1rem' }}>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {loading ? (
          <div className="loading-placeholder">Loading analytics...</div>
        ) : analytics && (
          <>
            {/* Overview Cards */}
            <section className="analytics-overview">
              <h3>Platform Overview</h3>
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="overview-header">
                    <span className="overview-title">Total Institutions</span>
                    <span className="overview-icon">🏛️</span>
                  </div>
                  <div className="overview-value">{analytics.overview.totalInstitutions}</div>
                  <div className="overview-change positive">
                    <span>{getChangeIcon(analytics.growth.institutions.change)}</span>
                    <span>{analytics.growth.institutions.change}%</span>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="overview-header">
                    <span className="overview-title">Total Users</span>
                    <span className="overview-icon">👥</span>
                  </div>
                  <div className="overview-value">{formatNumber(analytics.overview.totalUsers)}</div>
                  <div className="overview-change positive">
                    <span>{getChangeIcon(analytics.growth.users.change)}</span>
                    <span>{analytics.growth.users.change}%</span>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="overview-header">
                    <span className="overview-title">Total Students</span>
                    <span className="overview-icon">🎓</span>
                  </div>
                  <div className="overview-value">{formatNumber(analytics.overview.totalStudents)}</div>
                  <div className="overview-change positive">
                    <span>{getChangeIcon(analytics.growth.students.change)}</span>
                    <span>{analytics.growth.students.change}%</span>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="overview-header">
                    <span className="overview-title">Total Faculty</span>
                    <span className="overview-icon">👨‍🏫</span>
                  </div>
                  <div className="overview-value">{formatNumber(analytics.overview.totalFaculty)}</div>
                  <div className="overview-change positive">
                    <span>{getChangeIcon(analytics.growth.faculty.change)}</span>
                    <span>{analytics.growth.faculty.change}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Distribution Charts */}
            <div className="analytics-grid">
              <section className="distribution-section">
                <h3>Institutions by Type</h3>
                <div className="distribution-chart">
                  {analytics.distribution.byType.map((item, index) => (
                    <div key={index} className="distribution-item">
                      <div className="distribution-header">
                        <span className="distribution-label">{item.type}</span>
                        <span className="distribution-count">{item.count}</span>
                      </div>
                      <div className="distribution-bar">
                        <div 
                          className="distribution-fill"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="distribution-percentage">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="distribution-section">
                <h3>Institutions by State</h3>
                <div className="distribution-chart">
                  {analytics.distribution.byState.map((item, index) => (
                    <div key={index} className="distribution-item">
                      <div className="distribution-header">
                        <span className="distribution-label">{item.state}</span>
                        <span className="distribution-count">{item.count}</span>
                      </div>
                      <div className="distribution-bar">
                        <div 
                          className="distribution-fill"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="distribution-percentage">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Performance Metrics */}
            <section className="performance-section">
              <h3>Platform Performance</h3>
              <div className="performance-grid">
                <div className="performance-card">
                  <div className="performance-header">
                    <span className="performance-title">Average Response Time</span>
                    <span className="performance-icon">⚡</span>
                  </div>
                  <div className="performance-value">{analytics.performance.averageResponseTime}</div>
                </div>

                <div className="performance-card">
                  <div className="performance-header">
                    <span className="performance-title">System Uptime</span>
                    <span className="performance-icon">🟢</span>
                  </div>
                  <div className="performance-value">{analytics.performance.uptime}</div>
                </div>

                <div className="performance-card">
                  <div className="performance-header">
                    <span className="performance-title">Active Users</span>
                    <span className="performance-icon">👤</span>
                  </div>
                  <div className="performance-value">{formatNumber(analytics.performance.activeUsers)}</div>
                </div>

                <div className="performance-card">
                  <div className="performance-header">
                    <span className="performance-title">New Registrations</span>
                    <span className="performance-icon">📈</span>
                  </div>
                  <div className="performance-value">{formatNumber(analytics.performance.newRegistrations)}</div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PlatformAnalytics;
