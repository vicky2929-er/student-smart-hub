import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InstituteRegistration.css";

const InstituteRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    // University Details
    aisheCode: "",
    instituteType: "",
    state: "",
    district: "",
    universityName: "",
    address: "",
    email: "",

    // Head of Institute Details
    headOfInstitute: {
      name: "",
      email: "",
      contact: "",
      alternateContact: "",
    },

    // Modal Officer Details
    modalOfficer: {
      name: "",
      email: "",
      contact: "",
      alternateContact: "",
    },

    // University Accreditation Details
    naacGrading: false,
    naacGrade: "",
  });

  const instituteTypes = [
    "Government",
    "Private",
    "Autonomous",
    "Deemed"
  ];

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'aisheCode', 'instituteType', 'state', 'district', 
      'universityName', 'address', 'email'
    ];
    
    const requiredHeadFields = ['name', 'email', 'contact'];
    const requiredModalFields = ['name', 'email', 'contact'];

    // Check main fields
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        setError(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    // Check head of institute fields
    for (let field of requiredHeadFields) {
      if (!formData.headOfInstitute[field] || formData.headOfInstitute[field].trim() === '') {
        setError(`Head of Institute ${field} is required`);
        return false;
      }
    }

    // Check modal officer fields
    for (let field of requiredModalFields) {
      if (!formData.modalOfficer[field] || formData.modalOfficer[field].trim() === '') {
        setError(`Modal Officer ${field} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid institute email');
      return false;
    }
    if (!emailRegex.test(formData.headOfInstitute.email)) {
      setError('Please enter a valid Head of Institute email');
      return false;
    }
    if (!emailRegex.test(formData.modalOfficer.email)) {
      setError('Please enter a valid Modal Officer email');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.headOfInstitute.contact)) {
      setError('Head of Institute contact must be 10 digits');
      return false;
    }
    if (!phoneRegex.test(formData.modalOfficer.contact)) {
      setError('Modal Officer contact must be 10 digits');
      return false;
    }

    // NAAC Grade validation
    if (formData.naacGrading && (!formData.naacGrade || formData.naacGrade.trim() === '')) {
      setError('NAAC Grade is required when NAAC Grading is selected as Yes');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/institute-requests/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is ok first
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = `Backend endpoint not found or server error (${response.status})`;
          } else {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status
          errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        }
        setError(errorMessage);
        return;
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Server returned invalid response format. Please check if the backend is running.');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Institute registration request submitted successfully! You will receive an email once your request is reviewed.");
        // Reset form
        setFormData({
          aisheCode: "",
          instituteType: "",
          state: "",
          district: "",
          universityName: "",
          address: "",
          email: "",
          headOfInstitute: {
            name: "",
            email: "",
            contact: "",
            alternateContact: "",
          },
          modalOfficer: {
            name: "",
            email: "",
            contact: "",
            alternateContact: "",
          },
          naacGrading: false,
          naacGrade: "",
        });
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to submit registration request");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        setError("Backend returned invalid response. Please check if the API endpoint exists and the server is running correctly.");
      } else if (error.message.includes('Failed to fetch')) {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="institute-registration-container">
      <div className="institute-registration-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← 
        </button>
        <h1>Institute Registration</h1>
      </div>

      <div className="institute-registration-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* University Details Section */}
          <div className="form-section">
            <h2>University Details</h2>
            
            <div className="form-group">
              <label htmlFor="aisheCode">AISHE Code</label>
              <input
                type="text"
                id="aisheCode"
                name="aisheCode"
                value={formData.aisheCode}
                onChange={handleChange}
                placeholder="Enter AISHE Code"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="instituteType">Type of Institute</label>
              <select
                id="instituteType"
                name="instituteType"
                value={formData.instituteType}
                onChange={handleChange}
                required
              >
                <option value="">Select Institute Type</option>
                {instituteTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter District"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="universityName">University Name</label>
              <input
                type="text"
                id="universityName"
                name="universityName"
                value={formData.universityName}
                onChange={handleChange}
                placeholder="Enter University Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Complete Address"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Institute Email"
                required
              />
            </div>
          </div>

          {/* Head of Institute Details Section */}
          <div className="form-section">
            <h2>Head of Institute Details</h2>
            
            <div className="form-group">
              <label htmlFor="headName">Name</label>
              <input
                type="text"
                id="headName"
                name="headOfInstitute.name"
                value={formData.headOfInstitute.name}
                onChange={handleChange}
                placeholder="Enter Head of Institute Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="headEmail">Email</label>
              <input
                type="email"
                id="headEmail"
                name="headOfInstitute.email"
                value={formData.headOfInstitute.email}
                onChange={handleChange}
                placeholder="Enter Head of Institute Email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="headContact">Contact</label>
              <input
                type="tel"
                id="headContact"
                name="headOfInstitute.contact"
                value={formData.headOfInstitute.contact}
                onChange={handleChange}
                placeholder="Enter 10-digit Contact Number"
                maxLength="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="headAltContact">Alternate Contact</label>
              <input
                type="tel"
                id="headAltContact"
                name="headOfInstitute.alternateContact"
                value={formData.headOfInstitute.alternateContact}
                onChange={handleChange}
                placeholder="Enter Alternate Contact Number"
                maxLength="10"
              />
            </div>
          </div>

          {/* Admin/Modal Officer Details Section */}
          <div className="form-section">
            <h2>Admin/Modal Officer's Details</h2>
            
            <div className="form-group">
              <label htmlFor="modalName">Name</label>
              <input
                type="text"
                id="modalName"
                name="modalOfficer.name"
                value={formData.modalOfficer.name}
                onChange={handleChange}
                placeholder="Enter Modal Officer Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalEmail">Email</label>
              <input
                type="email"
                id="modalEmail"
                name="modalOfficer.email"
                value={formData.modalOfficer.email}
                onChange={handleChange}
                placeholder="Enter Modal Officer Email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalContact">Contact</label>
              <input
                type="tel"
                id="modalContact"
                name="modalOfficer.contact"
                value={formData.modalOfficer.contact}
                onChange={handleChange}
                placeholder="Enter 10-digit Contact Number"
                maxLength="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalAltContact">Alternate Contact</label>
              <input
                type="tel"
                id="modalAltContact"
                name="modalOfficer.alternateContact"
                value={formData.modalOfficer.alternateContact}
                onChange={handleChange}
                placeholder="Enter Alternate Contact Number"
                maxLength="10"
              />
            </div>
          </div>

          {/* University Accreditation Details Section */}
          <div className="form-section">
            <h2>University Accreditation Details</h2>
            
            <div className="form-group radio-group">
              <label>University NAAC/NAC Grading</label>
              <div className="radio-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="naacGrading"
                    value="true"
                    checked={formData.naacGrading === true}
                    onChange={(e) => setFormData(prev => ({ ...prev, naacGrading: true }))}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="naacGrading"
                    value="false"
                    checked={formData.naacGrading === false}
                    onChange={(e) => setFormData(prev => ({ ...prev, naacGrading: false, naacGrade: "" }))}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Conditional NAAC Grade field */}
            {formData.naacGrading && (
              <div className="form-group">
                <label htmlFor="naacGrade">NAAC Grade</label>
                <select
                  id="naacGrade"
                  name="naacGrade"
                  value={formData.naacGrade}
                  onChange={handleChange}
                  required={formData.naacGrading}
                >
                  <option value="">Select NAAC Grade</option>
                  <option value="A++">A++</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B++">B++</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteRegistration;
