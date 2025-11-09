import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { roadmapService, studentService } from '../../services/authService';
import './Student.css';

const StudentRoadmapNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    fetchStudentData();
    fetchRoadmaps();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const response = await studentService.getStudentProfile(id);
      setStudentData(response.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await roadmapService.getStudentRoadmaps(id);
      setRoadmaps(response.data);
      if (response.data.length > 0) {
        setSelectedRoadmap(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setError(error.response?.data?.message || 'Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const generateNewRoadmap = async () => {
    try {
      setGenerating(true);
      setError('');
      
      // Create sample roadmap data matching your DB structure
      const sampleRoadmap = {
        student_id: id,
        generated_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        potential_roadmaps: [
          {
            career_title: "Full Stack Developer",
            existing_skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
            sequenced_roadmap: [
              "Master Advanced React Concepts and Hooks",
              "Learn TypeScript for Better Development",
              "Database Design & Management (SQL/NoSQL)",
              "RESTful API Development and Testing",
              "DevOps & Deployment (Docker, AWS)",
              "System Design & Architecture Patterns",
              "Testing Strategies (Unit, Integration, E2E)",
              "Microservices Architecture Implementation"
            ]
          },
          {
            career_title: "Data Scientist",
            existing_skills: ["Python", "Statistics", "Machine Learning", "Data Analysis"],
            sequenced_roadmap: [
              "Advanced Python for Data Science",
              "Statistics & Probability Theory",
              "Machine Learning Algorithms Deep Dive",
              "Deep Learning with TensorFlow/PyTorch",
              "Data Visualization (Matplotlib, Seaborn, Plotly)",
              "Big Data Technologies (Spark, Hadoop)",
              "MLOps & Model Deployment Strategies",
              "Business Intelligence & Analytics"
            ]
          }
        ]
      };

      const response = await roadmapService.createRoadmap(sampleRoadmap);
      setRoadmaps([response.data, ...roadmaps]);
      setSelectedRoadmap(response.data);
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate(`/students/dashboard/${id}`);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Date not available';
    }
  };

  const isOwnRoadmap = currentUser && currentUser._id === id;

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading roadmaps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && roadmaps.length === 0) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-content">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Roadmaps</h2>
            <p>{error}</p>
            <button onClick={fetchRoadmaps} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const studentName = studentData && studentData.name
    ? `${studentData.name.first || ''} ${studentData.name.last || ''}`.trim()
    : 'Student';

  return (
    <div className="student-dashboard">
      <div className="dashboard-content">
        <div className="roadmap-container">
          <div className="roadmap-header">
            <div className="roadmap-title-section">
              <h1>
                <i className="fas fa-map-location-dot"></i>
                Career Roadmap - {studentName}
              </h1>
              <div className="roadmap-meta">
                <span>Personalized career guidance based on your skills and portfolio</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="roadmap-content">
            {roadmaps.length === 0 ? (
              <div className="roadmap-empty-state">
                <div className="empty-roadmap-icon">
                  <i className="fas fa-map-location-dot"></i>
                </div>
                <h3>No Roadmaps Generated Yet</h3>
                <p>Generate your first personalized career roadmap based on your portfolio and achievements.</p>
                {isOwnRoadmap && (
                  <button 
                    className="roadmap-btn-primary"
                    onClick={generateNewRoadmap}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Generating Your First Roadmap...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic"></i>
                        Generate My First Roadmap
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <>
                

                {/* Roadmap Display - Following your requested format */}
                <div className="roadmaps-display">
                  {(selectedRoadmap || roadmaps[0])?.potential_roadmaps?.map((career, index) => (
                    <div key={index} className="career-roadmap-container">
                      
                      {/* 1. Existing Skills Section */}
                      <div className="existing-skills-section">
                        <h2 className="section-title">
                          <i className="fas fa-check-circle"></i>
                          Your Existing Skills
                        </h2>
                        <div className="skills-grid">
                          {career.existing_skills?.map((skill, skillIndex) => (
                            <div key={skillIndex} className="skill-card">
                              <i className="fas fa-star"></i>
                              <span className="skill-name">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. Learning Path Section */}
                      <div className="learning-path-section">
                        <h2 className="section-title">
                          <i className="fas fa-route"></i>
                          Your Learning Journey
                        </h2>
                        <div className="roadmap-timeline">
                          {career.sequenced_roadmap?.map((step, stepIndex) => (
                            <div key={stepIndex} className="timeline-step">
                              <div className="step-indicator">
                                <div className="step-number">{stepIndex + 1}</div>
                                <div className="step-connector"></div>
                              </div>
                              <div className="step-content">
                                <div className="step-card">
                                  <h3 className="step-title">{step}</h3>
                                  <div className="step-actions">
                                    <button className="step-btn resources-btn">
                                      <i className="fas fa-book"></i>
                                      Resources
                                    </button>
                                    <button className="step-btn complete-btn">
                                      <i className="fas fa-check"></i>
                                      Mark Complete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Career Title at the End */}
                      <div className="career-destination-section">
                        <div className="destination-card">
                          <div className="destination-icon">
                            <i className="fas fa-trophy"></i>
                          </div>
                          <div className="destination-content">
                            <h2 className="destination-title">Your Career Goal</h2>
                            <h1 className="career-title">{career.career_title}</h1>
                            <p className="destination-message">
                              Complete the learning journey above to achieve your goal of becoming a {career.career_title}!
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRoadmapNew;
