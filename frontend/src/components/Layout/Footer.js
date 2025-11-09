import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Don't show footer on auth pages
  if (
    location.pathname === "/login" ||
    location.pathname === "/institute-registration" ||
    location.pathname === "/"
  ) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="brand-logo">
                <span className="logo-icon">
                  <i className="fas fa-graduation-cap"></i>
                </span>
                <span className="brand-text">SIH</span>
              </div>
              <h3>Student Information Hub</h3>
              <p>
                Empowering students to showcase their achievements and track
                their academic journey.
              </p>
            </div>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-link">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/features">Features</Link>
              </li>
              <li>
                <Link to="/help">Help Center</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Student Resources */}
          <div className="footer-section">
            <h4>Student Resources</h4>
            <ul className="footer-links">
              <li>
                <Link to="/guides">User Guides</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/tutorials">Tutorials</Link>
              </li>
              <li>
                <Link to="/support">Technical Support</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookies">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/accessibility">Accessibility</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <span>support@sih.edu</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <i className="fas fa-phone"></i>
                </span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </span>
                <span>Education District, City, State</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">
                  <i className="fas fa-clock"></i>
                </span>
                <span>Mon-Fri: 9AM-5PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>
                &copy; {currentYear} Student Information Hub. All rights
                reserved.
              </p>
            </div>
            <div className="footer-bottom-links">
              <Link to="/sitemap">Sitemap</Link>
              <span className="separator">|</span>
              <Link to="/status">System Status</Link>
              <span className="separator">|</span>
              <Link to="/feedback">Feedback</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
