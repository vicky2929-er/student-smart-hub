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
      console.log('Full Response:', response); // Debug log
      
      // Handle nested response structure
      const analyticsData = response.data?.data?.analytics || response.data?.analytics || response.data;
      
      console.log('Analytics Data:', analyticsData); // Debug log
      
      // Check if we have valid data
      if (!analyticsData || !analyticsData.categoryBreakdown) {
        console.error('Invalid analytics data structure:', analyticsData);
        setError("Invalid data received from server");
        return;
      }
      
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
      console.error('Error details:', err.response?.data || err.message);
      setError("Failed to load analytics: " + (err.response?.data?.message || err.message));
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
  
  // Create monthly breakdown from recent achievements based on selected period
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  
  // Determine number of months to show based on selected period
  let monthsToShow = 6; // default
  switch(selectedPeriod) {
    case 'week':
      monthsToShow = 1; // Show current month with weekly breakdown
      break;
    case 'month':
      monthsToShow = 6; // Last 6 months
      break;
    case 'semester':
      monthsToShow = 6; // Last 6 months (semester)
      break;
    case 'year':
      monthsToShow = 12; // Full year
      break;
    default:
      monthsToShow = 6;
  }
  
  const timeSeriesMonths = [];
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    timeSeriesMonths.push({
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      month: date.getMonth(),
      year: date.getFullYear()
    });
  }
  
  // Use backend's monthlyData if available, otherwise calculate from recent achievements
  const backendMonthlyData = stats?.fullAnalytics?.monthlyData || {};
  
  const visualData = timeSeriesMonths.map(({ month, year, label }) => {
    // Check if backend has data for this month
    const backendData = backendMonthlyData[label];
    
    if (backendData) {
      return {
        label,
        total: backendData.total || 0,
        approved: backendData.approved || 0,
        pending: backendData.pending || 0,
        rejected: backendData.rejected || 0,
      };
    }
    
    // Fallback: calculate from recent achievements
    const achievementsInMonth = recentAchievements.filter(a => {
      const achDate = new Date(a.date || a.created_at);
      return achDate.getMonth() === month && achDate.getFullYear() === year;
    });
    
    return {
      label,
      total: achievementsInMonth.length,
      approved: achievementsInMonth.filter(a => a.status === 'Approved').length,
      pending: achievementsInMonth.filter(a => a.status === 'Pending').length,
      rejected: achievementsInMonth.filter(a => a.status === 'Rejected').length,
    };
  });
  
  const achievementTrendData = {
    labels: visualData.map(d => d.label),
    datasets: [
      {
        label: 'Total Achievements',
        data: visualData.map(d => d.total),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        borderDash: [8, 4], // Dashed line pattern
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointStyle: 'circle',
      },
      {
        label: 'Approved',
        data: visualData.map(d => d.approved),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointStyle: 'circle',
      },
      {
        label: 'Pending',
        data: visualData.map(d => d.pending),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointStyle: 'triangle',
      },
      {
        label: 'Rejected',
        data: visualData.map(d => d.rejected || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointStyle: 'rect',
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
  
  // Calculate metrics with proper logic
  const approvalRate = totalAchievements > 0 ? (approvedAchievements / totalAchievements) * 100 : 0;
  
  // Performance Score Calculation:
  // 1. Academic Score (40%): Based on CGPA (out of 10) and Attendance (out of 100)
  //    - CGPA weighted 60% → (CGPA/10) * 60
  //    - Attendance weighted 40% → (Attendance/100) * 40
  // 2. Achievement Score (60%): Based on approval rate and activity
  //    - Approval Rate 70% → (approvedAchievements/totalAchievements) * 70
  //    - Activity Level 30% → min(totalAchievements * 3, 30)
  const cgpa = academic?.cgpa || 0;
  const attendance = academic?.attendance || 0;
  const academicScore = ((cgpa / 10) * 60) + ((attendance / 100) * 40); // Out of 100
  const achievementApprovalScore = totalAchievements > 0 ? (approvalRate * 0.7) : 0; // 70% weight
  const achievementActivityScore = Math.min(totalAchievements * 3, 30); // 30% weight, max 30 for 10+ achievements
  const achievementScore = achievementApprovalScore + achievementActivityScore;
  const performanceScore = Math.round((academicScore * 0.4) + (achievementScore * 0.6));
  
  // Monthly Growth Calculation from backend data
  const growthMetrics = stats?.fullAnalytics?.growthMetrics || { growthRate: 0, trend: 'stable' };
  const monthlyGrowthRate = growthMetrics.growthRate || 0;

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
              <h2>Achievement Trend - {selectedPeriod === 'week' ? 'This Week' : selectedPeriod === 'month' ? 'Last 6 Months' : selectedPeriod === 'semester' ? 'This Semester' : 'This Year'}</h2>
              <p>Track total submissions (dashed line) and status breakdown (Approved, Pending, Rejected)</p>
            </div>
            <div className="chart-container">
              <Line data={achievementTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Achievement Types */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Achievement Categories</h2>
              <p>Distribution of <strong>approved</strong> achievements by type</p>
            </div>
            <div className="chart-container">
              <Doughnut data={achievementTypeData} options={doughnutOptions} />
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Recent Achievements {stats?.fullAnalytics?.recentAchievements?.length > 0 && `(${stats.fullAnalytics.recentAchievements.length})`}</h2>
              <p>All your submitted achievements - scroll to view more</p>
            </div>
            <div className="recent-achievements-list">
              {stats?.fullAnalytics?.recentAchievements?.length > 0 ? (
                stats.fullAnalytics.recentAchievements.map((achievement, index) => (
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
                        <span className={`stat-value ${monthlyGrowthRate >= 0 ? 'positive' : 'negative'}`}>
                          {monthlyGrowthRate >= 0 ? '+' : ''}{monthlyGrowthRate}%
                        </span>
                      </div>
                      <div className="stat-row">
                        <span>Performance Score:</span>
                        <span className={`stat-value ${performanceScore >= 70 ? 'positive' : performanceScore >= 50 ? 'neutral' : 'negative'}`}>
                          {performanceScore}%
                        </span>
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
