import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import './SuperAdminAnalytics.css';

const SuperAdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalInstitutes: 0,
      totalStudents: 0,
      totalFaculty: 0,
      totalEvents: 0,
      activeUsers: 0,
      systemUptime: '0%'
    },
    growth: {
      instituteGrowth: [],
      studentGrowth: [],
      eventGrowth: []
    },
    demographics: {
      institutesByType: [],
      studentsByYear: [],
      facultyByDepartment: []
    },
    activity: {
      dailyLogins: [],
      eventParticipation: [],
      systemUsage: []
    },
    performance: {
      responseTime: [],
      errorRate: [],
      serverLoad: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await superAdminService.getAnalyticsData(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const MetricCard = ({ title, value, change, icon, color = 'primary' }) => (
    <div className={`analytics-metric-card ${color}`}>
      <div className="analytics-metric-icon">
        <i className={icon}></i>
      </div>
      <div className="analytics-metric-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && (
          <span className={`analytics-metric-change ${change.type}`}>
            <i className={`fas fa-arrow-${change.type === 'positive' ? 'up' : 'down'}`}></i>
            {change.value}
          </span>
        )}
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h3>{title}</h3>
        {actions && <div className="analytics-chart-actions">{actions}</div>}
      </div>
      <div className="analytics-chart-content">
        {children}
      </div>
    </div>
  );

  const SimpleBarChart = ({ data, color = '#284B63' }) => (
    <div className="analytics-simple-chart">
      {data.map((item, index) => (
        <div key={index} className="analytics-bar-item">
          <div 
            className="analytics-bar" 
            style={{ 
              height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
              backgroundColor: color 
            }}
          ></div>
          <span className="analytics-bar-label">{item.label}</span>
          <span className="analytics-bar-value">{item.value}</span>
        </div>
      ))}
    </div>
  );

  const SimpleLineChart = ({ data, color = '#10b981' }) => (
    <div className="analytics-line-chart">
      <svg viewBox="0 0 400 200" className="analytics-line-svg">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={data.map((point, index) => 
            `${(index / (data.length - 1)) * 380 + 10},${190 - (point.value / Math.max(...data.map(d => d.value))) * 170}`
          ).join(' ')}
        />
        {data.map((point, index) => (
          <circle
            key={index}
            cx={(index / (data.length - 1)) * 380 + 10}
            cy={190 - (point.value / Math.max(...data.map(d => d.value))) * 170}
            r="3"
            fill={color}
          />
        ))}
      </svg>
      <div className="analytics-line-labels">
        {data.map((point, index) => (
          <span key={index} className="analytics-line-label">{point.label}</span>
        ))}
      </div>
    </div>
  );

  const DonutChart = ({ data, centerText }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div className="analytics-donut-chart">
        <svg viewBox="0 0 200 200" className="analytics-donut-svg">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
            const strokeDashoffset = -cumulativePercentage * 2.51;
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r="40"
                fill="transparent"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
              />
            );
          })}
        </svg>
        <div className="analytics-donut-center">
          <span className="analytics-donut-value">{centerText}</span>
        </div>
        <div className="analytics-donut-legend">
          {data.map((item, index) => (
            <div key={index} className="analytics-legend-item">
              <span 
                className="analytics-legend-color" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="analytics-legend-label">{item.label}</span>
              <span className="analytics-legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-loading-container">
        <div className="analytics-loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error-container">
        <div className="analytics-error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button className="analytics-btn-primary" onClick={handleRefresh}>
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-content">
          <h1 className="analytics-title">System Analytics</h1>
          <p className="analytics-subtitle">
            Comprehensive insights and performance metrics
          </p>
          <div className="analytics-header-actions">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="analytics-time-select"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <button 
              className="analytics-btn-primary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="analytics-btn-secondary">
              <i className="fas fa-download"></i>
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="analytics-metrics-grid">
        <MetricCard
          icon="fas fa-university"
          title="Total Institutes"
          value={analyticsData.overview.totalInstitutes.toLocaleString()}
          change={{ type: 'positive', value: '+12%' }}
          color="primary"
        />
        <MetricCard
          icon="fas fa-user-graduate"
          title="Total Students"
          value={analyticsData.overview.totalStudents.toLocaleString()}
          change={{ type: 'positive', value: '+8%' }}
          color="success"
        />
        <MetricCard
          icon="fas fa-chalkboard-teacher"
          title="Total Faculty"
          value={analyticsData.overview.totalFaculty.toLocaleString()}
          change={{ type: 'positive', value: '+5%' }}
          color="info"
        />
        <MetricCard
          icon="fas fa-calendar-alt"
          title="Active Events"
          value={analyticsData.overview.totalEvents.toLocaleString()}
          change={{ type: 'positive', value: '+15%' }}
          color="warning"
        />
        <MetricCard
          icon="fas fa-users"
          title="Active Users"
          value={analyticsData.overview.activeUsers.toLocaleString()}
          change={{ type: 'positive', value: '+3%' }}
          color="purple"
        />
        <MetricCard
          icon="fas fa-server"
          title="System Uptime"
          value={analyticsData.overview.systemUptime}
          change={{ type: 'positive', value: '99.9%' }}
          color="success"
        />
      </div>

      <div className="analytics-content">
        {/* Growth Trends */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">
            <i className="fas fa-chart-line"></i>
            Growth Trends
          </h2>
          <div className="analytics-charts-grid">
            <ChartCard title="Institute Growth">
              <SimpleLineChart 
                data={analyticsData.growth.instituteGrowth} 
                color="#284B63"
              />
            </ChartCard>
            <ChartCard title="Student Enrollment">
              <SimpleLineChart 
                data={analyticsData.growth.studentGrowth} 
                color="#10b981"
              />
            </ChartCard>
            <ChartCard title="Event Activity">
              <SimpleBarChart 
                data={analyticsData.growth.eventGrowth} 
                color="#f59e0b"
              />
            </ChartCard>
          </div>
        </div>

        {/* Demographics */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">
            <i className="fas fa-chart-pie"></i>
            Demographics
          </h2>
          <div className="analytics-charts-grid">
            <ChartCard title="Institutes by Type">
              <DonutChart 
                data={analyticsData.demographics.institutesByType}
                centerText="Institutes"
              />
            </ChartCard>
            <ChartCard title="Students by Academic Year">
              <SimpleBarChart 
                data={analyticsData.demographics.studentsByYear}
                color="#7c3aed"
              />
            </ChartCard>
            <ChartCard title="Faculty Distribution">
              <SimpleBarChart 
                data={analyticsData.demographics.facultyByDepartment}
                color="#ef4444"
              />
            </ChartCard>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">
            <i className="fas fa-activity"></i>
            User Activity
          </h2>
          <div className="analytics-charts-grid">
            <ChartCard title="Daily Active Users">
              <SimpleLineChart 
                data={analyticsData.activity.dailyLogins}
                color="#06b6d4"
              />
            </ChartCard>
            <ChartCard title="Event Participation">
              <SimpleBarChart 
                data={analyticsData.activity.eventParticipation}
                color="#84cc16"
              />
            </ChartCard>
            <ChartCard title="System Usage">
              <SimpleLineChart 
                data={analyticsData.activity.systemUsage}
                color="#f97316"
              />
            </ChartCard>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">
            <i className="fas fa-tachometer-alt"></i>
            System Performance
          </h2>
          <div className="analytics-charts-grid">
            <ChartCard title="Response Time (ms)">
              <SimpleLineChart 
                data={analyticsData.performance.responseTime}
                color="#8b5cf6"
              />
            </ChartCard>
            <ChartCard title="Error Rate (%)">
              <SimpleLineChart 
                data={analyticsData.performance.errorRate}
                color="#ef4444"
              />
            </ChartCard>
            <ChartCard title="Server Load (%)">
              <SimpleLineChart 
                data={analyticsData.performance.serverLoad}
                color="#10b981"
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
