import React, { useState, useEffect } from "react";
import { instituteRequestService } from "../../services/instituteRequestService";
import InstituteRequestModal from "./InstituteRequestModal";
import "./InstituteRequestsTable.css";

const InstituteRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, pagination.current]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await instituteRequestService.getAllRequests(
        statusFilter,
        pagination.current,
        10
      );
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to fetch institute requests:", err);
      setError("Failed to load institute requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (request) => {
    try {
      const detailResponse = await instituteRequestService.getRequestById(request._id);
      setSelectedRequest(detailResponse.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch request details:", err);
      setError("Failed to load request details");
    }
  };

  const handleApprove = async (requestId, comment) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      await instituteRequestService.approveRequest(requestId, comment, currentUser._id);
      
      // Remove from current list or update status
      setRequests(prev => prev.filter(req => req._id !== requestId));
      setShowModal(false);
      setSelectedRequest(null);
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      console.error("Failed to approve request:", err);
      throw err;
    }
  };

  const handleReject = async (requestId, comment) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      await instituteRequestService.rejectRequest(requestId, comment, currentUser._id);
      
      // Remove from current list or update status
      setRequests(prev => prev.filter(req => req._id !== requestId));
      setShowModal(false);
      setSelectedRequest(null);
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      console.error("Failed to reject request:", err);
      throw err;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: "status-badge pending",
      Approved: "status-badge approved",
      Rejected: "status-badge rejected",
    };
    return statusClasses[status] || "status-badge";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="institute-requests-container">
      <div className="requests-header">
        <h2>Institute Registration Requests</h2>
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            className="status-filter"
          >
            <option value="all">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="requests-table-container">
        {loading ? (
          <div className="loading-state">Loading institute requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>No institute requests found</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>University Name</th>
                <th>AISHE Code</th>
                <th>Type</th>
                <th>State</th>
                <th>Head of Institute</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>
                    <div className="university-info">
                      <strong>{request.universityName}</strong>
                      <small>{request.email}</small>
                    </div>
                  </td>
                  <td>{request.aisheCode}</td>
                  <td>{request.instituteType}</td>
                  <td>{request.state}</td>
                  <td>
                    <div className="contact-info">
                      <strong>{request.headOfInstitute.name}</strong>
                      <small>{request.headOfInstitute.email}</small>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadge(request.status)}>
                      {request.status}
                    </span>
                  </td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="review-btn"
                        onClick={() => handleReview(request)}
                      >
                        Review
                      </button>
                      {request.status === "Pending" && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() => handleReview(request)}
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleReview(request)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.current === 1}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
          >
            Previous
          </button>
          <span>
            Page {pagination.current} of {pagination.pages} ({pagination.total} total)
          </span>
          <button
            disabled={pagination.current === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedRequest && (
        <InstituteRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default InstituteRequestsTable;
