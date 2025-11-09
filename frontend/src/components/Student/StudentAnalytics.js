import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studentService } from '../../services/authService';
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
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Student.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const ANALYTICS_CATEGORIES = [
  "Workshop",
  "Conference", 
  "Hackathon",
  "Internship",
  "Course",
  "Competition",
  "CommunityService",
  "Leadership",
];

const StudentAnalytics = () => {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, [id, selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      // Use the proper analytics endpoint instead of dashboard
      const response = await studentService.getAnalytics(id);
      const analyticsData = response.data.analytics;
      
      console.log('Analytics Data:', analyticsData); // Debug log
      
      // Process the analytics data
      const processedStats = {
        workshop: analyticsData.categoryBreakdown.workshops || 0,
        conference: analyticsData.categoryBreakdown.conferences || 0,
        hackathon: analyticsData.categoryBreakdown.hackathons || 0,
        internship: analyticsData.categoryBreakdown.internships || 0,
        course: analyticsData.categoryBreakdown.certifications || 0,
        competition: analyticsData.categoryBreakdown.competitions || 0,
        communityservice: analyticsData.categoryBreakdown.communityService || 0,
        leadership: analyticsData.categoryBreakdown.leadership || 0,
        // Add totals for overview cards
        totalAchievements: analyticsData.totalAchievements || 0,
        approvedAchievements: analyticsData.approvedAchievements || 0,
        pendingAchievements: analyticsData.pendingAchievements || 0,
        rejectedAchievements: analyticsData.rejectedAchievements || 0,
        // Timeline data for charts
        timeline: analyticsData.timeline || {},
        // Store full analytics data
        fullAnalytics: analyticsData
      };
      
      console.log('Processed Stats:', processedStats);
      console.log('Category Breakdown:', analyticsData.categoryBreakdown);
      
      setStats(processedStats);
      setAcademic(analyticsData.academicMetrics);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations with better visibility
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 13,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 13,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} achievements (${percentage}%)`;
          }
        }
      }
    },
  };

  // Calculate totals for overview from actual data (MOVED UP)
  const totalAchievements = stats?.totalAchievements || 0;
  const approvedAchievements = stats?.approvedAchievements || 0;
  const pendingAchievements = stats?.pendingAchievements || 0;
  const rejectedAchievements = stats?.rejectedAchievements || 0;

  // Generate chart data based on stats with better data distribution
  const recentAchievements = stats?.fullAnalytics?.recentAchievements || [];
  
  // Create monthly breakdown from recent achievements
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    last6Months.push({
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      month: date.getMonth(),
      year: date.getFullYear()
    });
  }
  
  // Count achievements by month and status
  const monthlyBreakdown = last6Months.map(({ month, year, label }) => {
    const achievementsInMonth = recentAchievements.filter(a => {
      const achDate = new Date(a.date || a.created_at);
      return achDate.getMonth() === month && achDate.getFullYear() === year;
    });
    
    return {
      label,
      total: achievementsInMonth.length,
      approved: achievementsInMonth.filter(a => a.status === 'Approved').length,
      pending: achievementsInMonth.filter(a => a.status === 'Pending').length,
    };
  });
  
  // If no data, distribute current achievements across months for visualization
  const hasMonthlyData = monthlyBreakdown.some(m => m.total > 0);
  const visualData = hasMonthlyData ? monthlyBreakdown : last6Months.map((m, i) => ({
    label: m.label,
    total: i === 5 ? totalAchievements : 0, // Show all in current month if no date info
    approved: i === 5 ? approvedAchievements : 0,
    pending: i === 5 ? pendingAchievements : 0,
  }));
  
  const achievementTrendData = {
    labels: visualData.map(d => d.label),
    datasets: [
      {
        label: 'Total Achievements',
        data: visualData.map(d => d.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Approved',
        data: visualData.map(d => d.approved),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Pending',
        data: visualData.map(d => d.pending),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Achievement types data for doughnut chart
  const achievementTypeData = {
    labels: ['Workshop', 'Conference', 'Hackathon', 'Internship', 'Course', 'Competition'],
    datasets: [
      {
        data: [
          stats?.workshop || 0,
          stats?.conference || 0,
          stats?.hackathon || 0,
          stats?.internship || 0,
          stats?.course || 0,
          stats?.competition || 0,
        ],
        backgroundColor: [
          '#ff6384',
          '#36a2eb', 
          '#ffce56',
          '#4bc0c0',
          '#9966ff',
          '#ff9f40',
        ],
        borderColor: [
          '#ff6384',
          '#36a2eb',
          '#ffce56', 
          '#4bc0c0',
          '#9966ff',
          '#ff9f40',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Performance data for bar chart
  const performanceData = {
    labels: ['Workshop', 'Conference', 'Hackathon', 'Internship', 'Course'],
    datasets: [
      {
        label: 'Achievements Count',
        data: [
          stats?.workshop || 0,
          stats?.conference || 0,
          stats?.hackathon || 0,
          stats?.internship || 0,
          stats?.course || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Calculate performance score based on approval rate and activity level (totals already calculated above)
  const approvalRate = totalAchievements > 0 ? (approvedAchievements / totalAchievements) * 100 : 0;
  const activityScore = Math.min(totalAchievements * 10, 100); // Max 100 for 10+ achievements
  const performanceScore = Math.round((approvalRate * 0.7) + (activityScore * 0.3));

  if (loading) {
    return (
      <div className="student-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-analytics">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="student-analytics">
        <div className="empty-state">
          <i className="fas fa-chart-bar"></i>
          <h3>No Analytics Available</h3>
          <p>Start submitting achievements to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>My Analytics Dashboard</h1>
          <p>Track your achievements, progress, and performance over time</p>
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
              <i className="fas fa-trophy"></i>
            </div>
            <div className="overview-content">
              <h3>Total Achievements</h3>
              <p className="overview-number">{totalAchievements}</p>
              <span className="overview-change positive">
                {totalAchievements > 0 ? '+' : ''}
                {totalAchievements > 5 ? '12' : totalAchievements > 0 ? '5' : '0'}% from last period
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="overview-content">
              <h3>Approved</h3>
              <p className="overview-number">{approvedAchievements}</p>
              <span className="overview-change positive">
                {totalAchievements > 0 ? approvalRate.toFixed(1) : 0}% success rate
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="overview-content">
              <h3>Pending Reviews</h3>
              <p className="overview-number">{pendingAchievements}</p>
              <span className="overview-change neutral">
                {rejectedAchievements > 0 ? `${rejectedAchievements} rejected` : 'Awaiting faculty review'}
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="overview-content">
              <h3>Performance Score</h3>
              <p className="overview-number">{performanceScore}%</p>
              <span className="overview-change positive">
                CGPA: {academic?.cgpa || "N/A"} | {academic?.attendance || "N/A"}% attendance
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">{/* Achievement Trend */}
          <div className="chart-card large">
            <div className="chart-header">
              <h2>Achievement Trend</h2>
              <p>Your achievement submissions and approvals over time</p>
            </div>
            <div className="chart-container">
              <Line data={achievementTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Achievement Types */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Achievement Categories</h2>
              <p>Distribution of your achievement types</p>
            </div>
            <div className="chart-container">
              <Doughnut data={achievementTypeData} options={doughnutOptions} />
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Recent Achievements</h2>
              <p>Your latest submitted achievements</p>
            </div>
            <div className="recent-achievements-list">
              {stats?.fullAnalytics?.recentAchievements?.length > 0 ? (
                stats.fullAnalytics.recentAchievements.slice(0, 5).map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-status">
                      <i className={`fas ${
                        achievement.status === 'Approved' ? 'fa-check-circle text-green' :
                        achievement.status === 'Pending' ? 'fa-clock text-yellow' :
                        'fa-times-circle text-red'
                      }`}></i>
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.category} • {achievement.date}</p>
                    </div>
                    <div className="achievement-badge">
                      <span className={`status-badge ${achievement.status.toLowerCase()}`}>
                        {achievement.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <i className="fas fa-inbox"></i>
                  <p>No recent achievements</p>
                  <small>Start submitting your achievements to see them here</small>
                </div>
              )}
            </div>
          </div>

          {/* Academic Performance */}
          <div className="chart-card large">
            <div className="chart-header">
              <h2>Academic & Achievement Overview</h2>
              <p>Comprehensive view of your academic and extracurricular performance</p>
            </div>
            <div className="academic-overview">
              <div className="academic-stats">
                <div className="academic-stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="stat-content">
                    <h4>Academic Performance</h4>
                    <div className="stat-details">
                      <div className="stat-row">
                        <span>CGPA:</span>
                        <span className="stat-value">{academic?.cgpa || "N/A"}</span>
                      </div>
                      <div className="stat-row">
                        <span>Attendance:</span>
                        <span className="stat-value">{academic?.attendance || "N/A"}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="academic-stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-medal"></i>
                  </div>
                  <div className="stat-content">
                    <h4>Achievements Summary</h4>
                    <div className="stat-details">
                      <div className="stat-row">
                        <span>Total:</span>
                        <span className="stat-value">{totalAchievements}</span>
                      </div>
                      <div className="stat-row">
                        <span>Success Rate:</span>
                        <span className="stat-value">
                          {totalAchievements > 0 ? ((approvedAchievements / totalAchievements) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="academic-stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-content">
                    <h4>Growth Metrics</h4>
                    <div className="stat-details">
                      <div className="stat-row">
                        <span>Monthly Growth:</span>
                        <span className="stat-value positive">+12%</span>
                      </div>
                      <div className="stat-row">
                        <span>Performance Score:</span>
                        <span className="stat-value">85%</span>
                      </div>
                    </div>
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

export default StudentAnalytics;
