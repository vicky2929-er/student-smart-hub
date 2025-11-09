import React, { useState } from "react";
import { dashboardService } from "../../services/authService";
import "./SuperAdmin.css";

const AddNewInstitution = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "University",
    email: "",
    password: "",
    contactNumber: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "India",
      pincode: ""
    },
    location: {
      city: "",
      state: "",
      country: "India"
    },
    website: "",
    studentCount: 0,
    status: "Pending"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // In a real app, this would be an API call
      // await dashboardService.createInstitution(formData);
      
      // Mock success for now
      setSuccess("Institution created successfully and is pending approval!");
      setFormData({
        name: "",
        code: "",
        type: "University",
        email: "",
        password: "",
        contactNumber: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          country: "India",
          pincode: ""
        },
        location: {
          city: "",
          state: "",
          country: "India"
        },
        website: "",
        studentCount: 0,
        status: "Pending"
      });
    } catch (err) {
      console.error("Failed to create institution", err);
      setError("Failed to create institution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <section className="dashboard-card sa-hero">
          <div className="sa-hero-content">
            <h1>Add New Institution</h1>
            <p>Register a new institution on the platform.</p>
          </div>
        </section>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">{success}</div>
        )}

        <section className="institution-form-section">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="institution-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institution Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Institution Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., MIT001"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Institution Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="University">University</option>
                      <option value="StandaloneCollege">Standalone College</option>
                      <option value="Engineering College">Engineering College</option>
                      <option value="Medical College">Medical College</option>
                      <option value="IIT">IIT</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Student Count</label>
                    <input
                      type="number"
                      name="studentCount"
                      value={formData.studentCount}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Estimated student count"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="admin@institution.edu"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Temporary password"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="+91-9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.institution.edu"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-group">
                  <label>Address Line 1 *</label>
                  <input
                    type="text"
                    name="address.line1"
                    value={formData.address.line1}
                    onChange={handleInputChange}
                    required
                    placeholder="Street address"
                  />
                </div>

                <div className="form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    name="address.line2"
                    value={formData.address.line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Location for Display</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Display City *</label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City for display"
                    />
                  </div>
                  <div className="form-group">
                    <label>Display State *</label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State for display"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Institution"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AddNewInstitution;
