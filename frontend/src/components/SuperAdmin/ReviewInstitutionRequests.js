import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/authService";
import "./SuperAdmin.css";

const ReviewInstitutionRequests = () => {
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPendingInstitutions();
  }, []);

  const fetchPendingInstitutions = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getPendingInstitutions();
      setPendingInstitutions(response.data.institutions || []);
    } catch (err) {
      console.error("Failed to fetch pending institutions", err);
      setError("Failed to load pending institutions");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (institution) => {
    setSelectedInstitution(institution);
    setComment("");
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedInstitution) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: 'approve' }));
      await dashboardService.approveInstitution(selectedInstitution.id);
      
      // Remove from list
      setPendingInstitutions(prev => prev.filter(inst => inst.id !== selectedInstitution.id));
      setShowModal(false);
      setSelectedInstitution(null);
    } catch (err) {
      console.error("Failed to approve institution", err);
      setError("Failed to approve institution");
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: null }));
    }
  };

  const handleReject = async () => {
    if (!selectedInstitution) return;
    
    if (!comment.trim()) {
      setError("Comment is required for rejection");
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: 'reject' }));
      await dashboardService.rejectInstitution(selectedInstitution.id, comment);
      
      // Remove from list
      setPendingInstitutions(prev => prev.filter(inst => inst.id !== selectedInstitution.id));
      setShowModal(false);
      setSelectedInstitution(null);
      setComment("");
    } catch (err) {
      console.error("Failed to reject institution", err);
      setError("Failed to reject institution");
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedInstitution.id]: null }));
    }
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <section className="dashboard-card sa-hero">
          <div className="sa-hero-content">
            <h1>Review Institution Requests</h1>
            <p>Review and approve pending institution registration requests.</p>
          </div>
        </section>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <section className="pending-approvals">
          <h3>Pending Institution Requests ({pendingInstitutions.length})</h3>
          <div className="approvals-list">
            {loading ? (
              <div className="loading-placeholder">Loading pending institutions...</div>
            ) : pendingInstitutions.length === 0 ? (
              <div className="empty-state">No pending institution requests</div>
            ) : (
              pendingInstitutions.map((institution) => (
                <div key={institution.id} className="approval-item">
                  <div className="institution-avatar">
                    {institution.avatar}
                  </div>
                  <div className="institution-details">
                    <h4>{institution.name}</h4>
                    <p className="location">{institution.location}</p>
                    <p className="type">Type: {institution.type}</p>
                    <p className="students">Students: {institution.students.toLocaleString()}</p>
                    <p className="requested">Requested: {institution.requested}</p>
                    <p className="contact">Contact: {institution.contact}</p>
                  </div>
                  <div className="approval-actions">
                    <button 
                      className="review-btn"
                      onClick={() => handleReview(institution)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Review Modal */}
        {showModal && selectedInstitution && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Review Institution: {selectedInstitution.name}</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="institution-overview">
                  <div className="overview-section">
                    <h4>Basic Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{selectedInstitution.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{selectedInstitution.type}</span>
                      </div>
                      <div className="info-item">
                        <label>Location:</label>
                        <span>{selectedInstitution.location}</span>
                      </div>
                      <div className="info-item">
                        <label>Student Count:</label>
                        <span>{selectedInstitution.students.toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <label>Contact Email:</label>
                        <span>{selectedInstitution.contact}</span>
                      </div>
                      <div className="info-item">
                        <label>Requested:</label>
                        <span>{selectedInstitution.requested}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-section">
                    <h4>Comments</h4>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add comments for approval or rejection..."
                      rows={4}
                      className="comment-textarea"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="reject-btn"
                  onClick={handleReject}
                  disabled={actionLoading[selectedInstitution.id]}
                >
                  {actionLoading[selectedInstitution.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                </button>
                <button 
                  className="approve-btn"
                  onClick={handleApprove}
                  disabled={actionLoading[selectedInstitution.id]}
                >
                  {actionLoading[selectedInstitution.id] === 'approve' ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReviewInstitutionRequests;
