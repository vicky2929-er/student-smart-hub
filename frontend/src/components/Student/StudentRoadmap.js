import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { roadmapService, studentService } from '../../services/authService';
import './Student.css';

const StudentRoadmap = () => {
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
    testRoadmapConnection();
  }, [id]);

  const testRoadmapConnection = async () => {
    try {
      const response = await roadmapService.testConnection();
      console.log('Roadmap API test successful:', response.data);
    } catch (error) {
      console.error('Roadmap API test failed:', error);
    }
  };

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
      console.log('Fetching roadmaps for student:', id);
      const response = await roadmapService.getStudentRoadmaps(id);
      console.log('Roadmaps response:', response);
      setRoadmaps(response.data);
      if (response.data.length > 0) {
        setSelectedRoadmap(response.data[0]); // Select the most recent roadmap
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      console.error('Error details:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const generateNewRoadmap = async () => {
    try {
      setGenerating(true);
      setError('');
      
      console.log('Starting roadmap generation for student:', id);
      
      // Get student's portfolio data first
      try {
        const portfolioResponse = await studentService.getPortfolio(id);
        const portfolioData = portfolioResponse.data;
        
        console.log('Portfolio data:', portfolioData);
        
        // Extract skills and achievements for AI analysis
        const achievements = portfolioData.groupedAchievements || {};
        const allAchievements = [
          ...(achievements.certifications || []),
          ...(achievements.internships || []),
          ...(achievements.competitions || []),
          ...(achievements.workshops || [])
        ];
        
        console.log('Extracted achievements:', allAchievements);
        
        // Create mock roadmap based on student's achievements
        const extractedSkills = extractSkillsFromAchievements(allAchievements);
        console.log('Extracted skills:', extractedSkills);
        
        const mockRoadmap = generateMockRoadmap(extractedSkills, portfolioData.student);
        console.log('Generated roadmap data:', mockRoadmap);

        // Create roadmap via API
        const response = await roadmapService.createRoadmap(mockRoadmap);
        
        console.log('Roadmap creation response:', response);
        
        setRoadmaps([response.data, ...roadmaps]);
        setSelectedRoadmap(response.data);
        
      } catch (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
        // If portfolio fetch fails, create a basic roadmap with default skills
        console.log('Creating basic roadmap with default skills...');
        
        const defaultRoadmap = generateMockRoadmap(['Problem Solving', 'Communication'], { name: { first: 'Student' } });
        console.log('Default roadmap data:', defaultRoadmap);
        
        const response = await roadmapService.createRoadmap(defaultRoadmap);
        console.log('Default roadmap creation response:', response);
        
        setRoadmaps([response.data, ...roadmaps]);
        setSelectedRoadmap(response.data);
      }
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      console.error('Error details:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const extractSkillsFromAchievements = (achievements) => {
    const skillKeywords = {
      'programming': ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql'],
      'data science': ['python', 'machine learning', 'data analysis', 'statistics', 'pandas', 'numpy'],
      'web development': ['javascript', 'react', 'angular', 'vue', 'html', 'css', 'node.js'],
      'mobile development': ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios'],
      'devops': ['docker', 'kubernetes', 'aws', 'azure', 'ci/cd', 'jenkins'],
      'design': ['ui/ux', 'figma', 'photoshop', 'illustrator', 'design thinking']
    };

    const foundSkills = new Set();
    
    achievements.forEach(achievement => {
      const text = `${achievement.title} ${achievement.description || ''}`.toLowerCase();
      
      Object.entries(skillKeywords).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            foundSkills.add(keyword);
          }
        });
      });
    });

    return Array.from(foundSkills);
  };

  const generateMockRoadmap = (extractedSkills, student) => {
    const baseSkills = extractedSkills.length > 0 ? extractedSkills : ['Problem Solving', 'Communication'];
    
    const roadmapTemplates = [
      {
        career_title: "Full Stack Developer",
        existing_skills: baseSkills.filter(skill => 
          ['javascript', 'react', 'node.js', 'html', 'css'].includes(skill)
        ).concat(['Problem Solving']),
        match_score: Math.min(0.9, 0.5 + (extractedSkills.length * 0.1)),
        sequenced_roadmap: [
          "Master Advanced React Concepts",
          "Learn TypeScript for Better Development",
          "Database Design & Management (SQL/NoSQL)",
          "RESTful API Development",
          "DevOps & Deployment (Docker, AWS)",
          "System Design & Architecture",
          "Testing (Unit, Integration, E2E)",
          "Microservices Architecture"
        ]
      },
      {
        career_title: "Data Scientist",
        existing_skills: baseSkills.filter(skill => 
          ['python', 'statistics', 'data analysis', 'machine learning'].includes(skill)
        ).concat(['Analytical Thinking']),
        match_score: Math.min(0.85, 0.4 + (extractedSkills.length * 0.08)),
        sequenced_roadmap: [
          "Advanced Python for Data Science",
          "Statistics & Probability",
          "Machine Learning Algorithms",
          "Deep Learning with TensorFlow/PyTorch",
          "Data Visualization (Matplotlib, Seaborn)",
          "Big Data Technologies (Spark, Hadoop)",
          "MLOps & Model Deployment",
          "Business Intelligence & Analytics"
        ]
      },
      {
        career_title: "DevOps Engineer",
        existing_skills: baseSkills.filter(skill => 
          ['docker', 'kubernetes', 'aws', 'azure', 'jenkins'].includes(skill)
        ).concat(['System Administration']),
        match_score: Math.min(0.8, 0.3 + (extractedSkills.length * 0.07)),
        sequenced_roadmap: [
          "Linux System Administration",
          "Container Technologies (Docker)",
          "Kubernetes Orchestration",
          "CI/CD Pipeline Development",
          "Infrastructure as Code (Terraform)",
          "Monitoring & Logging (Prometheus, ELK)",
          "Cloud Platforms (AWS/Azure/GCP)",
          "Security & Compliance"
        ]
      }
    ];

    return {
      student_id: id,
      potential_roadmaps: roadmapTemplates.map(template => ({
        ...template,
        existing_skills: template.existing_skills.length > 0 ? template.existing_skills : ['Foundation Skills'],
      }))
    };
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

  // Check if current user is viewing their own roadmap
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

  const studentName = studentData 
    ? `${studentData.name.first} ${studentData.name.last || ''}`.trim()
    : 'Student';

  return (
    <div className="student-dashboard">
      <div className="dashboard-content">
        <div className="roadmap-container">
          <div className="roadmap-header">
            <button onClick={handleBackToDashboard} className="back-btn">
              ← Back to Dashboard
            </button>
            <div className="roadmap-title-section">
              <h1>
                <i className="fas fa-map-location-dot"></i>
                Career Roadmap - {studentName}
              </h1>
              <div className="roadmap-meta">
                <span>Personalized career guidance based on your skills and portfolio</span>
              </div>
            </div>
            {isOwnRoadmap && (
              <button
                className="roadmap-generate-btn"
                onClick={generateNewRoadmap}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Generate New Roadmap
                  </>
                )}
              </button>
            )}
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
               

                {/* Roadmap Grid */}
                <div className="roadmaps-grid">
                  {(selectedRoadmap || roadmaps[0])?.potential_roadmaps.map((career, index) => (
                    <div key={index} className="career-roadmap-card">
                      <div className="career-header">
                        <h3 className="career-title">{career.career_title}</h3>
                        <div className="match-score">
                          <span className="match-percentage">
                            {Math.round(career.match_score * 100)}% Match
                          </span>
                          <div className="match-bar">
                            <div 
                              className="match-fill" 
                              style={{ width: `${career.match_score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="existing-skills">
                        <h4>
                          <i className="fas fa-check-circle"></i>
                          Your Matching Skills:
                        </h4>
                        <div className="skills-list">
                          {career.existing_skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="roadmap-sequence">
                        <h4>
                          <i className="fas fa-route"></i>
                          Learning Path:
                        </h4>
                        <div className="roadmap-steps">
                          {career.sequenced_roadmap.map((step, stepIndex) => (
                            <div key={stepIndex} className="roadmap-step">
                              <div className="step-number">{stepIndex + 1}</div>
                              <div className="step-content">
                                <h5>{step}</h5>
                                <div className="step-actions">
                                  <button className="step-btn">
                                    <i className="fas fa-book"></i>
                                    Resources
                                  </button>
                                  <button className="step-btn">
                                    <i className="fas fa-check"></i>
                                    Complete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
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

export default StudentRoadmap;