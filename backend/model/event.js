const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "Workshop",
        "Seminar",
        "Conference",
        "Competition",
        "Cultural",
        "Sports",
        "Hackathon",
        "Guest Lecture",
        "Placement Drive",
        "Other",
      ],
      default: "Other",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["All", "Students", "Faculty", "Department"],
      default: "All",
    },
    maxParticipants: {
      type: Number,
      default: null, // null means unlimited
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Completed"],
      default: "Published",
    },
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "registrations.userType",
        },
        userType: {
          type: String,
          enum: ["Student", "Faculty"],
        },
        registeredAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["Registered", "Attended", "Absent"],
          default: "Registered",
        },
      },
    ],
    tags: [String],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
eventSchema.index({ college: 1, eventDate: 1 });
eventSchema.index({ department: 1, eventDate: 1 });
eventSchema.index({ status: 1, eventDate: 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual("isUpcoming").get(function () {
  return this.eventDate > new Date();
});

// Virtual for checking if registration is open
eventSchema.virtual("isRegistrationOpen").get(function () {
  if (!this.registrationRequired) return false;
  if (!this.registrationDeadline) return this.isUpcoming;
  return new Date() < this.registrationDeadline && this.isUpcoming;
});

module.exports = mongoose.model("Event", eventSchema);
