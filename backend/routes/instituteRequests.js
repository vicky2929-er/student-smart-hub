const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Institute = require("../model/institute");
const { requireAuth, requireRole } = require("../middleware/auth");
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate unique institute ID
const generateInstituteId = (universityName, aisheCode) => {
  const namePrefix = universityName.substring(0, 3).toUpperCase();
  const codePrefix = aisheCode.substring(0, 3).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${namePrefix}${codePrefix}${randomSuffix}`;
};

// Generate secure password
const generatePassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Submit institute registration request
router.post("/submit", async (req, res) => {
  try {
    const {
      aisheCode,
      instituteType,
      state,
      district,
      universityName,
      address,
      email,
      headOfInstitute,
      modalOfficer,
      naacGrading,
      naacGrade,
    } = req.body;

    // Check for duplicate registration
    const existingInstitute = await Institute.findOne({
      $or: [
        { email: email },
        { aisheCode: aisheCode },
        { "headOfInstitute.email": headOfInstitute.email },
        { "modalOfficer.email": modalOfficer.email },
      ],
    });

    if (existingInstitute) {
      return res.status(400).json({
        success: false,
        message: "Institute with this email or AISHE code already exists",
      });
    }

    // Generate unique institute code
    const namePrefix = universityName.substring(0, 3).toUpperCase();
    const codePrefix = aisheCode.substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const instituteCode = `${namePrefix}${codePrefix}${randomSuffix}`;

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create new institute with pending status
    const institute = new Institute({
      name: universityName,
      code: instituteCode,
      aisheCode,
      type: instituteType,
      email,
      password: hashedPassword,
      address: {
        line1: address,
        state,
        district,
        country: "India",
      },
      headOfInstitute,
      modalOfficer,
      naacGrading,
      naacGrade,
      status: "Pending",
      approvalStatus: "Pending",
    });

    await institute.save();

    res.status(201).json({
      success: true,
      message: "Institute registration request submitted successfully",
      requestId: institute._id,
    });
  } catch (error) {
    console.error("Error submitting institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all institute requests (for Super Admin)
router.get("/all", requireAuth, requireRole(["superadmin"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status && status !== "all") {
      filter.approvalStatus = status;
    }

    const requests = await Institute.find(filter)
      .populate("reviewedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Institute.countDocuments(filter);

    // Transform data to match frontend expectations
    const transformedRequests = requests.map(institute => ({
      _id: institute._id,
      universityName: institute.name,
      aisheCode: institute.aisheCode,
      instituteType: institute.type,
      state: institute.address?.state,
      district: institute.address?.district,
      email: institute.email,
      headOfInstitute: institute.headOfInstitute,
      modalOfficer: institute.modalOfficer,
      naacGrading: institute.naacGrading,
      naacGrade: institute.naacGrade,
      status: institute.approvalStatus,
      reviewComment: institute.reviewComment,
      reviewedBy: institute.reviewedBy,
      reviewedAt: institute.reviewedAt,
      createdAt: institute.createdAt,
      updatedAt: institute.updatedAt,
    }));

    res.json({
      success: true,
      data: transformedRequests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching institute requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get single institute request details
router.get("/:id", requireAuth, requireRole(["superadmin"]), async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id)
      .populate("reviewedBy", "name email")
      .populate("approvedBy", "name email");

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute request not found",
      });
    }

    // Transform data to match frontend expectations
    const transformedRequest = {
      _id: institute._id,
      universityName: institute.name,
      aisheCode: institute.aisheCode,
      instituteType: institute.type,
      state: institute.address?.state,
      district: institute.address?.district,
      address: institute.address?.line1,
      email: institute.email,
      headOfInstitute: institute.headOfInstitute,
      modalOfficer: institute.modalOfficer,
      naacGrading: institute.naacGrading,
      naacGrade: institute.naacGrade,
      status: institute.approvalStatus,
      reviewComment: institute.reviewComment,
      reviewedBy: institute.reviewedBy,
      reviewedAt: institute.reviewedAt,
      createdAt: institute.createdAt,
      updatedAt: institute.updatedAt,
    };

    res.json({
      success: true,
      data: transformedRequest,
    });
  } catch (error) {
    console.error("Error fetching institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Approve institute request
router.post("/:id/approve", requireAuth, requireRole(["superadmin"]), async (req, res) => {
  try {
    const { reviewComment, reviewedBy } = req.body;
    
    const institute = await Institute.findById(req.params.id);
    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute request not found",
      });
    }

    if (institute.approvalStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }

    // Generate new password for approved institute
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update institute status to approved
    institute.password = hashedPassword;
    institute.status = "Active";
    institute.approvalStatus = "Approved";
    institute.approvedBy = reviewedBy;
    institute.approvedAt = new Date();
    institute.reviewedBy = reviewedBy;
    institute.reviewedAt = new Date();
    institute.reviewComment = reviewComment;
    
    await institute.save();

    // Send approval emails
    const dashboardLink = `${process.env.FRONTEND_URL}/institute/dashboard/${institute._id}`;
    
    const emailTemplate = `
      <h2>Institute Registration Approved</h2>
      <p>Dear ${institute.headOfInstitute.name},</p>
      <p>Congratulations! Your institute registration request has been approved.</p>
      
      <h3>Login Credentials:</h3>
      <p><strong>Institute ID:</strong> ${institute.code}</p>
      <p><strong>Email:</strong> ${institute.email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><strong>Dashboard Link:</strong> <a href="${dashboardLink}">${dashboardLink}</a></p>
      
      <p>Please login and complete your institute profile setup.</p>
      <p>For security reasons, please change your password after first login.</p>
      
      <p>Best regards,<br>SIH2025 Team</p>
    `;

    // Send to Head of Institute
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: institute.headOfInstitute.email,
      subject: "Institute Registration Approved - Login Credentials",
      html: emailTemplate,
    });

    // Send to Modal Officer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: institute.modalOfficer.email,
      subject: "Institute Registration Approved - Login Credentials",
      html: emailTemplate.replace(institute.headOfInstitute.name, institute.modalOfficer.name),
    });

    res.json({
      success: true,
      message: "Institute request approved successfully",
      institute: {
        id: institute._id,
        name: institute.name,
        code: institute.code,
      },
    });
  } catch (error) {
    console.error("Error approving institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Reject institute request
router.post("/:id/reject", requireAuth, requireRole(["superadmin"]), async (req, res) => {
  try {
    const { reviewComment, reviewedBy } = req.body;
    
    if (!reviewComment || reviewComment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment is required for rejection",
      });
    }

    const institute = await Institute.findById(req.params.id);
    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute request not found",
      });
    }

    if (institute.approvalStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }

    // Update institute status to rejected
    institute.status = "Inactive";
    institute.approvalStatus = "Rejected";
    institute.reviewedBy = reviewedBy;
    institute.reviewedAt = new Date();
    institute.reviewComment = reviewComment;
    institute.rejectionReason = reviewComment;
    
    await institute.save();

    // Send rejection emails
    const emailTemplate = `
      <h2>Institute Registration Rejected</h2>
      <p>Dear ${institute.headOfInstitute.name},</p>
      <p>We regret to inform you that your institute registration request has been rejected.</p>
      
      <h3>Reason for Rejection:</h3>
      <p>${reviewComment}</p>
      
      <p>You may submit a new registration request after addressing the mentioned issues.</p>
      
      <p>Best regards,<br>SIH2025 Team</p>
    `;

    // Send to Head of Institute
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: institute.headOfInstitute.email,
      subject: "Institute Registration Rejected",
      html: emailTemplate,
    });

    // Send to Modal Officer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: institute.modalOfficer.email,
      subject: "Institute Registration Rejected",
      html: emailTemplate.replace(institute.headOfInstitute.name, institute.modalOfficer.name),
    });

    res.json({
      success: true,
      message: "Institute request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting institute request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
