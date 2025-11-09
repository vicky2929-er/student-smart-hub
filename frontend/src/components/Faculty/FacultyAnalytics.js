import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facultyService } from "../../services/authService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import "./FacultyAnalytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FacultyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [id, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getAnalytics(id, selectedPeriod);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Analytics error:", error);
      setError(error.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const submissionTrendData = {
    labels: analyticsData?.submissionTrend?.labels || [],
    datasets: [
      {
        label: "Submissions",
        data: analyticsData?.submissionTrend?.data || [],
        borderColor: "rgb(102, 126, 234)",
        backgroundColor: "rgba(102, 126, 234, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const achievementTypeData = {
    labels: analyticsData?.achievementTypes?.labels || [],
    datasets: [
      {
        data: analyticsData?.achievementTypes?.data || [],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const performanceData = {
    labels: analyticsData?.studentPerformance?.labels || [],
    datasets: [
      {
        label: "Student Performance",
        data: analyticsData?.studentPerformance?.data || [],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          usePointStyle: true,
          boxWidth: 12,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="faculty-analytics">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faculty-analytics">
        <div className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Analytics</h2>
            <p>{error}</p>
            <button onClick={fetchAnalytics} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-analytics">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
        </div>

        <div className="period-selector">
          <label htmlFor="period-select">Time Period:</label>
          <select
            id="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="dashboard-content">
        <div className="analytics-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="overview-content">
              <h3>Total Submissions</h3>
              <p className="overview-number">
                {analyticsData?.overview?.totalSubmissions || 0}
              </p>
              <span className="overview-change positive">
                +{analyticsData?.overview?.submissionGrowth || 0}% from last
                period
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="overview-content">
              <h3>Active Students</h3>
              <p className="overview-number">
                {analyticsData?.overview?.activeStudents || 0}
              </p>
              <span className="overview-change positive">
                {(
                  ((analyticsData?.overview?.activeStudents || 0) /
                    Math.max(analyticsData?.overview?.totalStudents || 1, 1)) *
                  100
                ).toFixed(1)}
                % of total
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="overview-content">
              <h3>Avg Review Time</h3>
              <p className="overview-number">
                {analyticsData?.overview?.avgReviewTime || 0}h
              </p>
              <span className="overview-change negative">
                -{analyticsData?.overview?.reviewTimeImprovement || 0}% faster
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-thumbs-up"></i>
            </div>
            <div className="overview-content">
              <h3>Approval Rate</h3>
              <p className="overview-number">
                {analyticsData?.overview?.approvalRate || 0}%
              </p>
              <span className="overview-change positive">
                +{analyticsData?.overview?.approvalRateChange || 0}% from last
                period
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        {/* Submission Trend */}
        <div className="charts-grid">
          <div className="chart-card submission-trend">
            <div className="chart-header">
              <h2>Submission Trend</h2>
              <p>Student achievement submissions over time</p>
            </div>
            <div className="chart-container" style={{ height: "350px" }}>
              <Line
                data={{
                  labels: analyticsData?.submissionTrend?.labels || [],
                  datasets: [
                    {
                      label: "Submissions",
                      data: analyticsData?.submissionTrend?.data || [],
                      borderColor: "rgba(59,130,246,1)", // blue line
                      backgroundColor: "rgba(59,130,246,0.2)", // light blue area
                      pointBackgroundColor: "rgba(59,130,246,1)",
                      pointRadius: 5, // bigger dots
                      pointHoverRadius: 7, // hover effect
                      borderWidth: 2,
                      tension: 0.3, // smooth curve
                      fill: true, // area under line
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.raw} submissions`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 30, // tilt dates slightly
                        minRotation: 30,
                      },
                      grid: { display: false },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                      title: {
                        display: true,
                        text: "Number of Submissions",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Top Performers */}
          <div className="chart-card top-performers">
            <div className="chart-header">
              <h2>Top Performers</h2>
              <p>Students with highest achievement scores</p>
            </div>
            <div className="top-performers-list">
              {analyticsData?.topPerformers?.map((student, index) => (
                <div key={index} className="performer-item">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-info">
                    <h4>{student.name}</h4>
                    <p>{student.achievements} achievements</p>
                  </div>
                  <div className="performer-score">{student.score}%</div>
                </div>
              )) || (
                <div className="no-data">
                  <p>No performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Achievement Types */}
          <div className="chart-card achievement-types">
            <div className="chart-header">
              <h2>Achievement Types</h2>
              <p>Distribution of achievement categories</p>
            </div>
            <div className="chart-container" style={{ height: "300px" }}>
              <Doughnut data={achievementTypeData} options={doughnutOptions} />
            </div>
          </div>

          {/* Student Performance */}
          <div className="chart-card student-performance">
            <div className="chart-header">
              <h2>Student Performance</h2>
              <p>Performance scores distribution</p>
            </div>
            <div className="chart-container" style={{ height: "350px" }}>
              <Bar
                data={{
                  labels: analyticsData?.studentPerformance?.labels || [],
                  datasets: [
                    {
                      label: "Student Performance",
                      data: analyticsData?.studentPerformance?.data || [],
                      backgroundColor: (ctx) => {
                        const value = ctx.raw;
                        // highlight top performers
                        return value >= 80
                          ? "rgba(16, 185, 129, 1)" // darker green
                          : "rgba(16, 185, 129, 0.5)"; // lighter green
                      },
                      borderRadius: 6, // rounded bars
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.label}: ${context.raw}%`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 30, // tilt labels slightly
                        minRotation: 30,
                        callback: function (value, index, ticks) {
                          let label = this.getLabelForValue(value);
                          return label.length > 15
                            ? label.substring(0, 15) + "…" // trim long names
                            : label;
                        },
                      },
                      grid: { display: false }, // clean x-axis
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" }, // light grid
                      title: {
                        display: true,
                        text: "Score (%)",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="chart-card recent-activity">
            <div className="chart-header">
              <h2>Recent Activity</h2>
              <p>Latest student activities</p>
            </div>
            <div className="activity-timeline">
              {analyticsData?.recentActivity?.length > 0 ? (
                analyticsData.recentActivity
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>{activity.title}</h4>
                        <p>
                          {activity.student} • {activity.type}
                        </p>
                        <span className="timeline-date">{activity.date}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-data">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="chart-card monthly-stats">
            <div className="chart-header">
              <h2>Monthly Statistics</h2>
              <p>Key metrics comparison by month</p>
            </div>
            <div className="monthly-stats">
              <div className="stats-grid">
                <div className="stat-box">
                  <h3>This Month</h3>
                  <div className="stat-row">
                    <span>Submissions:</span>
                    <span>
                      {analyticsData?.monthlyStats?.currentMonth?.submissions ||
                        0}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span>Reviews:</span>
                    <span>
                      {analyticsData?.monthlyStats?.currentMonth?.reviews || 0}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span>Approvals:</span>
                    <span>
                      {analyticsData?.monthlyStats?.currentMonth?.approvals ||
                        0}
                    </span>
                  </div>
                </div>

                <div className="stat-box">
                  <h3>Last Month</h3>
                  <div className="stat-row">
                    <span>Submissions:</span>
                    <span>
                      {analyticsData?.monthlyStats?.lastMonth?.submissions || 0}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span>Reviews:</span>
                    <span>
                      {analyticsData?.monthlyStats?.lastMonth?.reviews || 0}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span>Approvals:</span>
                    <span>
                      {analyticsData?.monthlyStats?.lastMonth?.approvals || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAnalytics;
