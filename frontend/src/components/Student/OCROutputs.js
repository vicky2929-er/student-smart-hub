import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Student.css';

const OCROutputs = () => {
  const { id } = useParams();
  const [ocrOutputs, setOcrOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOCROutputs();
  }, [id]);

  const fetchOCROutputs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3030/api'}/students/${id}/ocr-outputs`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOcrOutputs(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching OCR outputs:', err);
      setError('Failed to load OCR data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category) => {
    const categoryMap = {
      'Workshop': 'badge-workshop',
      'Conference': 'badge-conference',
      'Hackathon': 'badge-hackathon',
      'Internship': 'badge-internship',
      'Course': 'badge-course',
      'Competition': 'badge-competition',
      'CommunityService': 'badge-community',
      'Leadership': 'badge-leadership',
    };
    return categoryMap[category] || 'badge-default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not found';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="student-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading OCR data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="student-container">
      <div className="dashboard-header">
        <h1>📄 Certificate OCR Data</h1>
        <p className="subtitle">AI-extracted information from your approved certificates</p>
      </div>

      {ocrOutputs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No OCR Data Yet</h3>
          <p>OCR data will appear here once your certificates are approved and processed</p>
        </div>
      ) : (
        <div className="ocr-outputs-grid">
          {ocrOutputs.map((output, index) => (
            <div key={output._id || index} className="ocr-card">
              <div className="ocr-card-header">
                <div className="ocr-card-title">
                  <span className={`category-badge ${getCategoryBadgeClass(output.category)}`}>
                    {output.category || 'Uncategorized'}
                  </span>
                  <span className="ocr-date">{formatDate(output.createdAt)}</span>
                </div>
              </div>

              <div className="ocr-card-body">
                {output.course && (
                  <div className="ocr-field">
                    <label>📚 Course/Certificate:</label>
                    <p>{output.course}</p>
                  </div>
                )}

                {output.name && output.name !== 'Not found' && (
                  <div className="ocr-field">
                    <label>👤 Name on Certificate:</label>
                    <p>{output.name}</p>
                  </div>
                )}

                {output.issuer && output.issuer !== 'Not found' && (
                  <div className="ocr-field">
                    <label>🏢 Issuer:</label>
                    <p>{output.issuer}</p>
                  </div>
                )}

                {output.date && (
                  <div className="ocr-field">
                    <label>📅 Certificate Date:</label>
                    <p>{formatDate(output.date)}</p>
                  </div>
                )}

                {output.skills && output.skills.length > 0 && (
                  <div className="ocr-field">
                    <label>🎯 Skills Extracted:</label>
                    <div className="skills-tags">
                      {output.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(!output.skills || output.skills.length === 0) && (
                  <div className="ocr-field">
                    <label>🎯 Skills:</label>
                    <p className="text-muted">No skills extracted</p>
                  </div>
                )}
              </div>

              <div className="ocr-card-footer">
                <small className="text-muted">
                  Processed: {formatDate(output.createdAt)}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .ocr-outputs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .ocr-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .ocr-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .ocr-card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 15px 20px;
          color: white;
        }

        .ocr-card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .category-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .ocr-date {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .ocr-card-body {
          padding: 20px;
        }

        .ocr-field {
          margin-bottom: 15px;
        }

        .ocr-field:last-child {
          margin-bottom: 0;
        }

        .ocr-field label {
          display: block;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 5px;
          font-size: 0.9rem;
        }

        .ocr-field p {
          color: #2d3748;
          line-height: 1.5;
          margin: 0;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .skill-tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .text-muted {
          color: #a0aec0;
          font-style: italic;
        }

        .ocr-card-footer {
          padding: 12px 20px;
          background: #f7fafc;
          border-top: 1px solid #e2e8f0;
        }

        .ocr-card-footer small {
          font-size: 0.8rem;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: #2d3748;
          margin-bottom: 10px;
        }

        .empty-state p {
          color: #718096;
        }

        @media (max-width: 768px) {
          .ocr-outputs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default OCROutputs;
