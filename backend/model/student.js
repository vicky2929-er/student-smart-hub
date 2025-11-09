const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    name: {
      first: { type: String, required: true },
      last: { type: String },
    },
    studentID: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    contactNumber: String,
    bio: String,
    profilePicture: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    course: String,
    year: String,
    interests: [String],
    skills: {
      technical: [String],
      soft: [String],
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    enrollmentYear: { type: Number, required: true },
    batch: String,
    achievements: [
      {
        title: String,
        type: {
          type: String,
          enum: [
            "Workshop",
            "Conference",
            "Hackathon",
            "Internship",
            "Course",
            "Competition",
            "CommunityService",
            "Leadership",
            "Clubs",
            "Volunteering",
            "Others",
          ],
        },
        description: String,
        organization: String,
        instituteEmail: {
          type: String,
          validate: {
            validator: function(v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
          }
        },
        dateCompleted: Date,
        fileUrl: String, // UploadCare CDN URL
        fileId: String, // UploadCare file UUID for deletion
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        comment: String,
        rejectionComment: String,
        uploadedAt: { type: Date, default: Date.now },
        reviewedAt: Date,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Faculty",
        },
      },
    ],
    gpa: { type: Number, min: 0, max: 10 },
    attendance: { type: Number, min: 0, max: 100 },
    resumeGenerated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    resumePdfUrl: String,
    social: {
      linkedin: String,
      github: String,
    },
    education: [
      {
        institution: String,
        location: String,
        year: String,
        degree: String,
      },
    ],
    projects: [
      {
        title: String,
        link: String,
        tech: String,
        description: [String],
      },
    ],

    ocrOutputs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OcrOutput",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
