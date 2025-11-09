import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegisterInstitute = () => {
    navigate('/institute-registration');
  };

  const handleContactClick = () => {
    // Scroll to contact section
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>Smart Student Hub</h1>
            </div>
            <nav className="nav-menu">
              <a href="#features" className="nav-link">Features</a>
              <a href="#benefits" className="nav-link">Benefits</a>
              <a href="#contact-section" className="nav-link">Contact</a>
              <button className="login-btn" onClick={handleLogin}>Login</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Centralized Digital Platform for Student Excellence
            </h1>
            <p className="hero-subtitle">
              Transform your institution with a comprehensive student activity management system.<br />
              Track achievements, manage portfolios, and streamline accreditation processes.
            </p>
            <button className="cta-button" onClick={handleRegisterInstitute}>
              Register Institute
            </button>
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section id="benefits" className="challenge-section">
        <div className="container">
          <h2 className="section-title">The Challenge We Solve</h2>
          <p className="section-subtitle">
            Student achievements are scattered across departments, lost in paper records, creating
            inefficiencies and limiting opportunities.
          </p>
          
          <div className="challenge-grid">
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Scattered Records</h3>
              <p>Student data spread across multiple departments with no central tracking system.</p>
            </div>
            
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3>Manual Processes</h3>
              <p>Paper-based records create administrative burden during accreditation and audits.</p>
            </div>
            
            <div className="challenge-card">
              <div className="challenge-icon">
                <i className="fas fa-eye-slash"></i>
              </div>
              <h3>Limited Visibility</h3>
              <p>Students struggle to showcase comprehensive achievements for placements and admissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Comprehensive Solution Features</h2>
          <p className="section-subtitle">
            Everything you need to manage student activities and achievements
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tachometer-alt"></i>
              </div>
              <h3>Dynamic Student Dashboard</h3>
              <p>Real-time updates on academic performance, attendance, and credit-based activities.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <h3>Activity Tracker</h3>
              <p>Upload and validate participation in seminars, conferences, internships, and extracurriculars.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <h3>Faculty Approval Panel</h3>
              <p>Faculty verification system to maintain credibility of student records.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>Digital Portfolio Generation</h3>
              <p>Auto-generated downloadable and shareable verified student portfolios.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Analytics & Reporting</h3>
              <p>Generate reports for NAAC, AICTE, NIRF, and internal evaluations.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-plug"></i>
              </div>
              <h3>System Integration</h3>
              <p>Seamless integration with existing LMS, ERP, and university platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="contact-section">
        <div className="container">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">
            Ready to transform your institution? Contact us for a personalized demo.
          </p>
          
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3>Email</h3>
              <p>info@smartstudenthub.edu</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>Support</h3>
              <p>24/7 Technical Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>Smart Student Hub</h3>
              <p>Empowering educational excellence through digital transformation</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#benefits">Benefits</a></li>
                  <li><a href="#contact-section">Contact</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li><a href="#contact-section">Help Center</a></li>
                  <li><a href="#contact-section">Documentation</a></li>
                  <li><a href="#contact-section">Training</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Smart Student Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
