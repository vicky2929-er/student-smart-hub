import React, { useState } from "react";
import "./InstituteRequestModal.css";

const InstituteRequestModal = ({ request, onClose, onApprove, onReject }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError("");
      await onApprove(request._id, comment);
    } catch (err) {
      setError(err.message || "Failed to approve request");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      setError("Comment is required for rejection");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onReject(request._id, comment);
    } catch (err) {
      setError(err.message || "Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="institute-modal">
        <div className="modal-header">
          <h2>Review Institute Request</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="request-details">
            {/* University Details Section */}
            <div className="details-section">
              <h3>University Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>University Name:</label>
                  <span>{request.universityName}</span>
                </div>
                <div className="detail-item">
                  <label>AISHE Code:</label>
                  <span>{request.aisheCode}</span>
                </div>
                <div className="detail-item">
                  <label>Institute Type:</label>
                  <span>{request.instituteType}</span>
                </div>
                <div className="detail-item">
                  <label>State:</label>
                  <span>{request.state}</span>
                </div>
                <div className="detail-item">
                  <label>District:</label>
                  <span>{request.district}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{request.email}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Address:</label>
                  <span>{request.address}</span>
                </div>
              </div>
            </div>

            {/* Head of Institute Details Section */}
            <div className="details-section">
              <h3>Head of Institute Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{request.headOfInstitute.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{request.headOfInstitute.email}</span>
                </div>
                <div className="detail-item">
                  <label>Contact:</label>
                  <span>{request.headOfInstitute.contact}</span>
                </div>
                <div className="detail-item">
                  <label>Alternate Contact:</label>
                  <span>{request.headOfInstitute.alternateContact || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Modal Officer Details Section */}
            <div className="details-section">
              <h3>Modal Officer Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{request.modalOfficer.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{request.modalOfficer.email}</span>
                </div>
                <div className="detail-item">
                  <label>Contact:</label>
                  <span>{request.modalOfficer.contact}</span>
                </div>
                <div className="detail-item">
                  <label>Alternate Contact:</label>
                  <span>{request.modalOfficer.alternateContact || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Accreditation Details Section */}
            <div className="details-section">
              <h3>Accreditation Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>NAAC/NAC Grading:</label>
                  <span className={request.naacGrading ? "positive" : "negative"}>
                    {request.naacGrading ? "Yes" : "No"}
                  </span>
                </div>
                {request.naacGrading && request.naacGrade && (
                  <div className="detail-item">
                    <label>NAAC Grade:</label>
                    <span className="naac-grade">{request.naacGrade}</span>
                  </div>
                )}
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Submitted:</label>
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
                {request.reviewedAt && (
                  <div className="detail-item">
                    <label>Reviewed:</label>
                    <span>{new Date(request.reviewedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Previous Comments Section */}
            {request.reviewComment && (
              <div className="details-section">
                <h3>Previous Review Comment</h3>
                <div className="previous-comment">
                  {request.reviewComment}
                </div>
              </div>
            )}

            {/* Comment Section */}
            <div className="details-section">
              <h3>Review Comment</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  request.status === "Pending" 
                    ? "Add comments for approval or rejection (required for rejection)..."
                    : "Add additional comments..."
                }
                rows={4}
                className="comment-textarea"
              />
              <small className="comment-note">
                * Comment is mandatory for rejection, optional for approval
              </small>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          
          {request.status === "Pending" && (
            <>
              <button
                className="reject-button"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? "Rejecting..." : "Reject"}
              </button>
              <button
                className="approve-button"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? "Approving..." : "Approve"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteRequestModal;
