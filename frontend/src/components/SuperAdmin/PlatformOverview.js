import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/authService";
import "./SuperAdmin.css";

const PlatformOverview = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [metricsRes, healthRes, activityRes] = await Promise.all([
        dashboardService.getDashboard("superadmin"),
        dashboardService.getPlatformHealth(),
        dashboardService.getRecentActivity()
      ]);
      
      setOverviewData({
        metrics: metricsRes.data.metrics,
        health: healthRes.data.healthMetrics,
        activity: activityRes.data.activities
      });
    } catch (err) {
      console.error("Failed to fetch overview data", err);
      setError("Failed to load platform overview");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    if (value == null) return "—";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return value.toLocaleString();
    return String(value);
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <section className="dashboard-card sa-hero">
          <div className="sa-hero-content">
            <h1>Platform Overview</h1>
            <p>Comprehensive overview of the platform's current status and performance.</p>
          </div>
        </section>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {loading ? (
          <div className="loading-placeholder">Loading platform overview...</div>
        ) : overviewData && (
          <>
            {/* Key Metrics */}
            <section className="sa-quick-stats">
              <div className="sa-metric-card">
                <div className="sa-metric-header">
                  <span className="sa-metric-icon"><i className="fas fa-school"></i></span>
                  <span className="sa-metric-title">Active Institutions</span>
                </div>
                <div className="sa-metric-value">{formatNumber(overviewData.metrics?.institutes)}</div>
                <div className="sa-metric-trend up">
                  <i className="fas fa-arrow-up"></i>
                  <span>+8 this month</span>
                </div>
              </div>

              <div className="sa-metric-card">
                <div className="sa-metric-header">
                  <span className="sa-metric-icon"><i className="fas fa-user-graduate"></i></span>
                  <span className="sa-metric-title">Active Students</span>
                </div>
                <div className="sa-metric-value">{formatNumber(overviewData.metrics?.activeStudents)}</div>
                <div className="sa-metric-trend up">
                  <i className="fas fa-arrow-up"></i>
                  <span>+15% growth</span>
                </div>
              </div>

              <div className="sa-metric-card">
                <div className="sa-metric-header">
                  <span className="sa-metric-icon"><i className="fas fa-clipboard-list"></i></span>
                  <span className="sa-metric-title">Activities Logged</span>
                </div>
                <div className="sa-metric-value">{formatNumber(overviewData.metrics?.activitiesLogged)}</div>
                <div className="sa-metric-trend up">
                  <i className="fas fa-arrow-up"></i>
                  <span>+23% from last month</span>
                </div>
              </div>

              <div className="sa-metric-card">
                <div className="sa-metric-header">
                  <span className="sa-metric-icon"><i className="fas fa-hourglass-half"></i></span>
                  <span className="sa-metric-title">Pending Approvals</span>
                </div>
                <div className="sa-metric-value">{formatNumber(overviewData.metrics?.pendingApprovals)}</div>
                <div className="sa-metric-trend warn">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Requires attention</span>
                </div>
              </div>
            </section>

            {/* Content Grid */}
            <div className="content-grid">
              {/* Platform Health */}
              <section className="platform-health">
                <h3>Platform Health</h3>
                <div className="health-metrics">
                  <div className="health-item">
                    <span className="health-label">System Uptime:</span>
                    <span className="health-value positive">{overviewData.health?.systemUptime || "—"}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Active Institutions:</span>
                    <span className="health-value positive">{overviewData.health?.activeInstitutions || "—"}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Data Sync Status:</span>
                    <span className="health-value warning">{overviewData.health?.dataSyncStatus || "—"}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Security Alerts:</span>
                    <span className="health-value positive">{overviewData.health?.securityAlerts || "—"}</span>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {overviewData.activity && overviewData.activity.length > 0 ? (
                    overviewData.activity.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <span className="activity-icon">✅</span>
                        <div className="activity-content">
                          <p>{activity.title}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No recent activity</div>
                  )}
                </div>
              </section>
            </div>

            {/* Platform Statistics */}
            <section className="dashboard-card sa-stats">
              <h2>Platform Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{formatNumber(overviewData.metrics?.institutes)}</span>
                  <span className="stat-label">Institutions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{formatNumber(overviewData.metrics?.activeStudents)}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{formatNumber(overviewData.metrics?.activitiesLogged)}</span>
                  <span className="stat-label">Activities</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{formatNumber(overviewData.metrics?.pendingApprovals)}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PlatformOverview;
