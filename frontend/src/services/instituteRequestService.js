const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const instituteRequestService = {
  // Submit institute registration request
  submitRequest: async (requestData) => {
    const response = await fetch(`${API_URL}/api/institute-requests/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit institute request');
    }
    
    return response.json();
  },

  // Get all institute requests (for Super Admin)
  getAllRequests: async (status = 'all', page = 1, limit = 10) => {
    const params = new URLSearchParams({
      status,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_URL}/api/institute-requests/all?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch institute requests');
    }
    
    return response.json();
  },

  // Get single institute request details
  getRequestById: async (id) => {
    const response = await fetch(`${API_URL}/api/institute-requests/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch institute request details');
    }
    
    return response.json();
  },

  // Approve institute request
  approveRequest: async (id, reviewComment = '', reviewedBy) => {
    const response = await fetch(`${API_URL}/api/institute-requests/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        reviewComment,
        reviewedBy,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve institute request');
    }
    
    return response.json();
  },

  // Reject institute request
  rejectRequest: async (id, reviewComment, reviewedBy) => {
    if (!reviewComment || reviewComment.trim() === '') {
      throw new Error('Comment is required for rejection');
    }

    const response = await fetch(`${API_URL}/api/institute-requests/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        reviewComment,
        reviewedBy,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject institute request');
    }
    
    return response.json();
  },
};
