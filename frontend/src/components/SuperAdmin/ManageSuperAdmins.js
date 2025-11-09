import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/authService";
import "./SuperAdmin.css";

const ManageSuperAdmins = () => {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: { first: "", last: "" },
    email: "",
    password: "",
    contactNumber: "",
    permissions: ["full_access"]
  });

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real app, this would be an API call
      const mockAdmins = [
        {
          id: 1,
          name: { first: "John", last: "Doe" },
          email: "john.doe@admin.com",
          contactNumber: "+91-9876543210",
          permissions: ["full_access"],
          status: "Active",
          createdAt: "2024-01-15"
        },
        {
          id: 2,
          name: { first: "Jane", last: "Smith" },
          email: "jane.smith@admin.com",
          contactNumber: "+91-9876543211",
          permissions: ["institution_management", "user_management"],
          status: "Active",
          createdAt: "2024-01-20"
        }
      ];
      setSuperAdmins(mockAdmins);
    } catch (err) {
      console.error("Failed to fetch super admins", err);
      setError("Failed to load super admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      // Mock API call - in real app, this would be an actual API call
      const newAdminData = {
        ...newAdmin,
        id: superAdmins.length + 1,
        status: "Active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setSuperAdmins(prev => [...prev, newAdminData]);
      setShowAddModal(false);
      setNewAdmin({
        name: { first: "", last: "" },
        email: "",
        password: "",
        contactNumber: "",
        permissions: ["full_access"]
      });
    } catch (err) {
      console.error("Failed to add super admin", err);
      setError("Failed to add super admin");
    }
  };

  const handleToggleStatus = async (adminId) => {
    try {
      setSuperAdmins(prev => prev.map(admin => 
        admin.id === adminId 
          ? { ...admin, status: admin.status === "Active" ? "Inactive" : "Active" }
          : admin
      ));
    } catch (err) {
      console.error("Failed to update admin status", err);
      setError("Failed to update admin status");
    }
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <section className="dashboard-card sa-hero">
          <div className="sa-hero-content">
            <h1>Manage Super Admins</h1>
            <p>Manage super admin accounts and permissions across the platform.</p>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => setShowAddModal(true)}
                className="action-btn"
              >
                Add New Super Admin
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <section className="super-admins-section">
          <h3>Super Admins ({superAdmins.length})</h3>
          <div className="admins-list">
            {loading ? (
              <div className="loading-placeholder">Loading super admins...</div>
            ) : superAdmins.length === 0 ? (
              <div className="empty-state">No super admins found</div>
            ) : (
              superAdmins.map((admin) => (
                <div key={admin.id} className="admin-item">
                  <div className="admin-avatar">
                    {admin.name.first[0]}{admin.name.last[0]}
                  </div>
                  <div className="admin-details">
                    <h4>{admin.name.first} {admin.name.last}</h4>
                    <p className="email">{admin.email}</p>
                    <p className="contact">{admin.contactNumber}</p>
                    <p className="permissions">
                      Permissions: {admin.permissions.join(", ")}
                    </p>
                    <p className="created">Created: {admin.createdAt}</p>
                  </div>
                  <div className="admin-actions">
                    <span className={`status-badge ${admin.status.toLowerCase()}`}>
                      {admin.status}
                    </span>
                    <button 
                      className={`toggle-btn ${admin.status.toLowerCase()}`}
                      onClick={() => handleToggleStatus(admin.id)}
                    >
                      {admin.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Add Super Admin Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Super Admin</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddAdmin} className="modal-body">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={newAdmin.name.first}
                    onChange={(e) => setNewAdmin(prev => ({
                      ...prev,
                      name: { ...prev.name, first: e.target.value }
                    }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={newAdmin.name.last}
                    onChange={(e) => setNewAdmin(prev => ({
                      ...prev,
                      name: { ...prev.name, last: e.target.value }
                    }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    type="tel"
                    value={newAdmin.contactNumber}
                    onChange={(e) => setNewAdmin(prev => ({
                      ...prev,
                      contactNumber: e.target.value
                    }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>Permissions:</label>
                  <select
                    multiple
                    value={newAdmin.permissions}
                    onChange={(e) => setNewAdmin(prev => ({
                      ...prev,
                      permissions: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="permissions-select"
                  >
                    <option value="full_access">Full Access</option>
                    <option value="institution_management">Institution Management</option>
                    <option value="user_management">User Management</option>
                    <option value="analytics_access">Analytics Access</option>
                    <option value="reports_access">Reports Access</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="action-btn"
                  >
                    Add Super Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageSuperAdmins;
