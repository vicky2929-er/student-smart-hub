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
      console.log('Response data type:', typeof response.data, Array.isArray(response.data));
      
      // Backend returns array directly
      let roadmapsData = [];
      if (Array.isArray(response.data)) {
        roadmapsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        roadmapsData = response.data.data;
      } else if (response.data) {
        // Single roadmap object
        roadmapsData = [response.data];
      }
      
      console.log('Processed roadmaps data:', roadmapsData);
      console.log('Number of roadmaps:', roadmapsData.length);
      
      if (roadmapsData.length > 0) {
        console.log('First roadmap structure:', roadmapsData[0]);
        console.log('Potential roadmaps in first:', roadmapsData[0].potential_roadmaps?.length);
      }
      
      setRoadmaps(roadmapsData);
      if (roadmapsData.length > 0) {
        setSelectedRoadmap(roadmapsData[0]); // Select the most recent roadmap
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
        ).concat(['JavaScript', 'HTML/CSS']),
        match_score: Math.min(0.9, 0.5 + (extractedSkills.length * 0.1)),
        sequenced_roadmap: [
          'Master HTML, CSS, and JavaScript fundamentals',
          'Learn React.js for frontend development',
          'Study Node.js and Express for backend',
          'Learn database design with MongoDB/PostgreSQL',
          'Build REST APIs and implement authentication',
          'Deploy full-stack projects on cloud platforms',
          'Create a portfolio with 3-5 full-stack projects',
          'Contribute to open-source projects on GitHub',
          'Apply for junior full-stack developer positions'
        ]
      },
      {
        career_title: "Machine Learning Engineer",
        existing_skills: baseSkills.filter(skill => 
          ['python', 'machine learning', 'tensorflow', 'pytorch'].includes(skill)
        ).concat(['Python', 'Mathematics']),
        match_score: Math.min(0.88, 0.45 + (extractedSkills.length * 0.09)),
        sequenced_roadmap: [
          'Master Python and linear algebra fundamentals',
          'Learn supervised and unsupervised ML algorithms',
          'Study deep learning with TensorFlow/PyTorch',
          'Learn neural network architectures (CNN, RNN, Transformers)',
          'Practice on ML competitions (Kaggle, DrivenData)',
          'Learn MLOps: model deployment and monitoring',
          'Study cloud ML services (AWS SageMaker, GCP AI)',
          'Build and deploy ML models in production',
          'Contribute to open-source ML projects'
        ]
      },
      {
        career_title: "Data Scientist",
        existing_skills: baseSkills.filter(skill => 
          ['python', 'statistics', 'data analysis', 'pandas', 'numpy'].includes(skill)
        ).concat(['Python', 'Statistics']),
        match_score: Math.min(0.85, 0.4 + (extractedSkills.length * 0.08)),
        sequenced_roadmap: [
          'Master Python programming and data structures',
          'Learn statistics and probability theory',
          'Study Pandas and NumPy for data manipulation',
          'Learn data visualization with Matplotlib/Seaborn',
          'Master SQL for database querying',
          'Learn machine learning algorithms with Scikit-learn',
          'Work on real-world datasets from Kaggle',
          'Build end-to-end data science projects',
          'Create a data science portfolio and blog'
        ]
      },
      {
        career_title: "DevOps Engineer",
        existing_skills: baseSkills.filter(skill => 
          ['docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'linux'].includes(skill)
        ).concat(['Linux', 'Docker']),
        match_score: Math.min(0.8, 0.3 + (extractedSkills.length * 0.07)),
        sequenced_roadmap: [
          'Master Linux system administration and shell scripting',
          'Learn Git version control and GitHub workflows',
          'Study Docker containerization and Docker Compose',
          'Learn Kubernetes for container orchestration',
          'Set up CI/CD pipelines with Jenkins/GitHub Actions',
          'Learn Infrastructure as Code with Terraform',
          'Study cloud platforms (AWS/Azure/GCP)',
          'Implement monitoring with Prometheus and Grafana',
          'Get certified (AWS Solutions Architect, CKA)'
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
                  {(selectedRoadmap || roadmaps[0])?.potential_roadmaps?.length > 0 ? (
                    (selectedRoadmap || roadmaps[0]).potential_roadmaps.map((career, index) => (
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
                  ))
                  ) : (
                    <div className="roadmap-empty-state">
                      <div className="empty-roadmap-icon">
                        <i className="fas fa-exclamation-circle"></i>
                      </div>
                      <h3>No Career Paths Available</h3>
                      <p>This roadmap doesn't contain any career paths yet.</p>
                    </div>
                  )}
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