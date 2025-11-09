import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { facultyService } from "../../services/authService";
import "./Faculty.css";

const FacultyReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [id, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await facultyService.getReviews(id, filter);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Reviews error:", error);
      setError(error.response?.data?.error || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews based on search term
  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;

    const studentName = `${review.student?.name?.first || ""} ${
      review.student?.name?.last || ""
    }`.toLowerCase();
    const achievementTitle = (review.achievement?.title || "").toLowerCase();
    const studentId = (review.student?.studentID || "").toLowerCase();
    const achievementType = (review.achievement?.type || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      studentName.includes(searchLower) ||
      achievementTitle.includes(searchLower) ||
      studentId.includes(searchLower) ||
      achievementType.includes(searchLower)
    );
  });

  // Sort reviews
  const sortedReviews = filteredReviews.sort((a, b) => {
    switch (sortBy) {
      case "student":
        const nameA = `${a.student?.name?.first || ""} ${
          a.student?.name?.last || ""
        }`;
        const nameB = `${b.student?.name?.first || ""} ${
          b.student?.name?.last || ""
        }`;
        return nameA.localeCompare(nameB);
      case "title":
        return (a.achievement?.title || "").localeCompare(
          b.achievement?.title || ""
        );
      case "status":
        const statusA = a.achievement?.status || "Pending";
        const statusB = b.achievement?.status || "Pending";
        return statusA.localeCompare(statusB);
      case "type":
        return (a.achievement?.type || "").localeCompare(
          b.achievement?.type || ""
        );
      case "recent":
      default:
        const dateA = new Date(a.achievement?.uploadedAt || 0);
        const dateB = new Date(b.achievement?.uploadedAt || 0);
        return dateB - dateA; // Most recent first
    }
  });

  const handleReview = async (achievementId, studentId, status, comment) => {
    try {
      await facultyService.reviewAchievement(id, achievementId, {
        status,
        comment,
        studentId,
      });
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "Course":
      case "Certification":
        return "fas fa-certificate";
      case "Internship":
        return "fas fa-briefcase";
      case "Competition":
      case "Hackathon":
        return "fas fa-trophy";
      case "Workshop":
      case "Conference":
        return "fas fa-chalkboard-teacher";
      case "CommunityService":
        return "fas fa-hands-helping";
      case "Leadership":
        return "fas fa-users-cog";
      default:
        return "fas fa-star";
    }
  };

  if (loading) {
    return (
      <div className="faculty-dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section - Full Width */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Achievement Reviews</h1>
          <p>Review and approve student achievements</p>
        </div>
      </div>

      {/* Reviews Controls */}
      <div className="reviews-controls">
        <div className="search-and-sort">
          {/* Search Box */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by student name, achievement title, student ID, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="sort-dropdown">
            <label htmlFor="filter-select">Filter:</label>
            <select
              id="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sort-dropdown">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="student">Student Name</option>
              <option value="title">Achievement Title</option>
              <option value="status">Status</option>
              <option value="type">Achievement Type</option>
            </select>
          </div>
        </div>

        <div className="reviews-summary">
          <span className="review-count">
            {searchTerm
              ? `${filteredReviews.length} Review${
                  filteredReviews.length !== 1 ? "s" : ""
                }`
              : `${reviews.length} Review${reviews.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Reviews Table */}
        <div className="reviews-container">
          {sortedReviews.length > 0 ? (
            <div className="reviews-table">
              <div className="table-header">
                <div className="table-header-cell student-col">STUDENT</div>
                <div className="table-header-cell activity-col">ACTIVITY</div>
                <div className="table-header-cell type-col">TYPE</div>
                <div className="table-header-cell submitted-col">SUBMITTED</div>
                <div className="table-header-cell status-col">STATUS</div>
                <div className="table-header-cell actions-col">ACTIONS</div>
              </div>
              <div className="table-body">
                {sortedReviews.map((review, index) => (
                  <ReviewRow
                    key={index}
                    review={review}
                    onReview={handleReview}
                    formatDate={formatDate}
                    getActivityIcon={getActivityIcon}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Reviews Found</h3>
              <p>
                {searchTerm
                  ? `No reviews match "${searchTerm}". Try searching with different terms.`
                  : `No ${filter === "all" ? "" : filter} reviews available`}
              </p>
              {searchTerm && (
                <button className="cta-btn" onClick={() => setSearchTerm("")}>
                  <i className="fas fa-times"></i>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewRow = ({ review, onReview, formatDate, getActivityIcon }) => {
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  const handleSubmitReview = () => {
    // Check if comment is required for rejection
    if (reviewStatus === "Rejected" && !comment.trim()) {
      alert("Comment is required when rejecting an achievement.");
      return;
    }

    if (reviewStatus) {
      onReview(
        review.achievement._id,
        review.student._id,
        reviewStatus,
        comment
      );
      setShowModal(false);
      setComment("");
      setReviewStatus("");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setComment("");
    setReviewStatus("");
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "conference":
        return "type-conference";
      case "certification":
        return "type-certification";
      case "competition":
        return "type-competition";
      case "internship":
        return "type-internship";
      default:
        return "type-default";
    }
  };

  return (
    <>
      <div className="table-row">
        <div className="table-cell student-col">
          <div className="student-info">
            <div 
              className="student-avatar" 
              data-letter={review.student?.name?.first?.charAt(0) || "S"}
            >
              {review.student?.name?.first?.charAt(0) || "S"}
              {review.student?.name?.last?.charAt(0) || ""}
            </div>
            <div className="student-details">
              <div className="student-name">
                {review.student?.name?.first} {review.student?.name?.last}
              </div>
              <div className="student-class">
                {review.student?.course} - {review.student?.year}
              </div>
            </div>
          </div>
        </div>

        <div className="table-cell activity-col">
          <div className="activity-title">
            {review.achievement?.title || "Untitled Achievement"}
          </div>
        </div>

        <div className="table-cell type-col">
          <span
            className={`type-badge ${getTypeBadgeClass(
              review.achievement?.type
            )}`}
          >
            {review.achievement?.type || "Other"}
          </span>
        </div>

        <div className="table-cell submitted-col">
          {formatDate(review.achievement?.uploadedAt)}
        </div>

        <div className="table-cell status-col">
          <span
            className={`status-badge ${getStatusBadgeClass(
              review.achievement?.status || "pending"
            )}`}
          >
            {review.achievement?.status === "Pending"
              ? "Pending Review"
              : review.achievement?.status === "Rejected"
              ? "Needs Revision"
              : review.achievement?.status || "Pending Review"}
          </span>
        </div>

        <div className="table-cell actions-col">
          {(!review.achievement?.status ||
            review.achievement?.status === "Pending") && (
            <div className="action-buttons">
              <div className="action-row">
                <button
                  className="faculty-review-action-btn faculty-review-approve-btn"
                  onClick={() =>
                    onReview(
                      review.achievement._id,
                      review.student._id,
                      "Approved",
                      ""
                    )
                  }
                >
                  Approve
                </button>
                <button
                  className="faculty-review-action-btn faculty-review-reject-btn"
                  onClick={() => {
                    setReviewStatus("Rejected");
                    setShowModal(true);
                  }}
                >
                  Reject
                </button>
              </div>
              <div className="action-row">
                <button
                  className="faculty-review-action-btn faculty-review-review-btn"
                  onClick={() => setShowModal(true)}
                >
                  Review
                </button>
              </div>
            </div>
          )}
          {review.achievement?.status &&
            review.achievement?.status !== "Pending" && (
              <button
                className="faculty-review-action-btn faculty-review-view-details-btn"
                onClick={() => setShowModal(true)}
              >
                View Details
              </button>
            )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {review.achievement?.status === "Pending" ||
                !review.achievement?.status
                  ? "Review Achievement"
                  : "Achievement Details"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              {/* Debug: Log achievement data to console */}
              {console.log("Achievement data:", review.achievement)}

              <div className="achievement-details">
                <h3>{review.achievement?.title}</h3>
                <p>
                  <strong>Student:</strong> {review.student?.name?.first}{" "}
                  {review.student?.name?.last}
                </p>
                <p>
                  <strong>Type:</strong> {review.achievement?.type}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {review.achievement?.description}
                </p>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {formatDate(review.achievement?.uploadedAt)}
                </p>
                {review.achievement?.status &&
                  review.achievement?.status !== "Pending" && (
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          review.achievement?.status
                        )}`}
                      >
                        {review.achievement?.status === "Rejected"
                          ? "Needs Revision"
                          : review.achievement?.status}
                      </span>
                    </p>
                  )}
                {review.achievement?.reviewComment && (
                  <p>
                    <strong>Review Comment:</strong>{" "}
                    {review.achievement?.reviewComment}
                  </p>
                )}

                {/* Certificate Image */}
                <div className="certificate-image-container">
                  <div className="certificate-image-label">
                    Certificate/Document
                  </div>
                  {review.achievement?.certificateUrl ||
                  review.achievement?.certificate ||
                  review.achievement?.documentUrl ||
                  review.achievement?.document ||
                  review.achievement?.fileUrl ||
                  review.achievement?.file ? (
                    <img
                      src={
                        review.achievement?.certificateUrl ||
                        review.achievement?.certificate ||
                        review.achievement?.documentUrl ||
                        review.achievement?.document ||
                        review.achievement?.fileUrl ||
                        review.achievement?.file
                      }
                      alt="Achievement Certificate"
                      className="certificate-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : (
                    <div className="no-certificate">
                      No certificate image available
                    </div>
                  )}
                  <div className="no-certificate" style={{ display: "none" }}>
                    Certificate image could not be loaded
                  </div>
                </div>
              </div>

              {(!review.achievement?.status ||
                review.achievement?.status === "Pending") && (
                <div className="review-form">
                  <div className="status-selection">
                    <label>Review Decision:</label>
                    <div className="status-buttons">
                      <button
                        className={`status-btn approve ${
                          reviewStatus === "Approved" ? "active" : ""
                        }`}
                        onClick={() => setReviewStatus("Approved")}
                      >
                        <i className="fas fa-check"></i>
                        Approve
                      </button>
                      <button
                        className={`status-btn reject ${
                          reviewStatus === "Rejected" ? "active" : ""
                        }`}
                        onClick={() => setReviewStatus("Rejected")}
                      >
                        <i className="fas fa-times"></i>
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="comment-section">
                    <label htmlFor="comment">
                      Comment{" "}
                      {reviewStatus === "Rejected"
                        ? "(Required for rejection)"
                        : "(Optional)"}
                      :
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        reviewStatus === "Rejected"
                          ? "Please provide a reason for rejection..."
                          : "Add your feedback..."
                      }
                      rows="4"
                      className={
                        reviewStatus === "Rejected" && !comment.trim()
                          ? "required-field"
                          : ""
                      }
                    />
                  </div>

                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button
                      className="submit-btn"
                      onClick={handleSubmitReview}
                      disabled={!reviewStatus}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              )}

              {review.achievement?.status &&
                review.achievement?.status !== "Pending" && (
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={handleCloseModal}>
                      Close
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyReviews;
