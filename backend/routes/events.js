const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Event = require("../model/event");
const Faculty = require("../model/faculty");
const { requireAuth } = require("../middleware/auth");

// Test endpoint to check faculty authorization
router.get("/test-auth", requireAuth, async (req, res) => {
  try {
    console.log("=== AUTH TEST ===");
    console.log("User:", req.user);
    console.log("Role:", req.user?.role);

    if (req.user.role !== "faculty") {
      return res.json({
        authorized: false,
        role: req.user?.role,
        message: "Not a faculty member",
      });
    }

    const faculty = await Faculty.findById(req.user._id).populate("department");
    res.json({
      authorized: true,
      role: req.user.role,
      faculty: faculty
        ? {
            name: faculty.name,
            id: faculty._id,
            department: faculty.department?.name,
            college: faculty.department?.institute,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all events for an institute
router.get("/institute/:instituteId", requireAuth, async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { status = "Published", upcoming = "true" } = req.query;

    // Find all colleges under this institute
    const College = require("../model/college");
    const colleges = await College.find({ institute: instituteId });
    const collegeIds = colleges.map(c => c._id);

    let matchStage = {
      college: { $in: collegeIds },
      status: status,
    };

    // Filter for upcoming events if requested
    if (upcoming === "true") {
      matchStage.eventDate = { $gte: new Date() };
    }

    const events = await Event.find(matchStage)
      .populate("department", "name")
      .populate("college", "name")
      .populate("createdBy", "name designation")
      .sort({ eventDate: 1 })
      .limit(100);

    res.json({ events });
  } catch (error) {
    console.error("Get institute events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get all events for a college
router.get("/college/:collegeId", requireAuth, async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { status = "Published", upcoming = "true" } = req.query;

    let matchStage = {
      college: new mongoose.Types.ObjectId(collegeId),
      status: status,
    };

    // Filter for upcoming events if requested
    if (upcoming === "true") {
      matchStage.eventDate = { $gte: new Date() };
    }

    const events = await Event.find(matchStage)
      .populate("department", "name")
      .populate("createdBy", "name designation")
      .sort({ eventDate: 1 })
      .limit(50);

    res.json({ events });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get events for faculty dashboard
router.get("/faculty/:facultyId", requireAuth, async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Get faculty to find their college
    const faculty = await Faculty.findById(facultyId).populate("department");
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Get upcoming events for the faculty's college
    const events = await Event.find({
      college: faculty.department.institute,
      status: "Published",
      eventDate: { $gte: new Date() },
    })
      .populate("department", "name")
      .populate("createdBy", "name designation")
      .sort({ eventDate: 1 })
      .limit(10);

    res.json({ events });
  } catch (error) {
    console.error("Get faculty events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get events for department dashboard
router.get("/department/:departmentId", requireAuth, async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Get department to find their college
    const Department = require("../model/department");
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Get upcoming events for the department's college
    const events = await Event.find({
      $or: [
        { department: departmentId }, // Events created by this department
        { college: department.institute }, // All college events
      ],
      status: "Published",
      eventDate: { $gte: new Date() },
    })
      .populate("department", "name")
      .populate("createdBy", "name designation")
      .sort({ eventDate: 1 })
      .limit(10);

    res.json({ events });
  } catch (error) {
    console.error("Get department events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get events for student dashboard
router.get("/student/:studentId", requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student to find their college
    const Student = require("../model/student");
    const student = await Student.findById(studentId).populate("department");
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get upcoming events for the student's college
    const events = await Event.find({
      college: student.department.institute,
      status: "Published",
      eventDate: { $gte: new Date() },
      $or: [
        { targetAudience: "All" },
        { targetAudience: "Students" },
        { targetAudience: student.batch }, // If events target specific batch/year
      ],
    })
      .populate("department", "name")
      .populate("createdBy", "name designation")
      .sort({ eventDate: 1 })
      .limit(10);

    res.json({ events });
  } catch (error) {
    console.error("Get student events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Create new event
router.post(
  "/create",
  (req, res, next) => {
    console.log("=== EVENT CREATE REQUEST ===");
    console.log("URL:", req.originalUrl);
    console.log("Path:", req.path);
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Is authenticated:", req.isAuthenticated());
    next();
  },
  requireAuth,
  async (req, res) => {
    try {
      console.log("=== EVENT CREATION DEBUG ===");
      console.log("Is authenticated:", req.isAuthenticated());
      console.log("User object:", req.user);
      console.log("User role:", req.user?.role);
      console.log("User ID:", req.user?._id);
      console.log("Request body:", req.body);

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user has a role
      if (!req.user.role) {
        return res.status(403).json({ error: "User role not defined" });
      }

      // Only faculty can create events
      if (req.user.role !== "faculty") {
        return res.status(403).json({
          error: `Only faculty can create events. Current role: ${req.user.role}`,
        });
      }

      // Verify faculty exists in database
      const faculty = await Faculty.findById(req.user._id).populate(
        "department"
      );
      if (!faculty) {
        console.log("Faculty not found with ID:", req.user._id);
        return res.status(404).json({ error: "Faculty not found in database" });
      }

      console.log(
        "Faculty found:",
        faculty.name,
        "Department:",
        faculty.department?.name
      );

      const {
        title,
        description,
        eventDate,
        eventTime,
        venue,
        eventType,
        targetAudience,
        maxParticipants,
        registrationRequired,
        registrationDeadline,
        tags,
      } = req.body;

      // Validate required fields
      if (!title || !description || !eventDate || !venue) {
        return res.status(400).json({
          error:
            "Missing required fields: title, description, eventDate, and venue are required",
        });
      }

      // Validate event date is in the future
      if (new Date(eventDate) <= new Date()) {
        return res
          .status(400)
          .json({ error: "Event date must be in the future" });
      }

      // Validate registration deadline if registration is required
      if (registrationRequired && registrationDeadline) {
        if (new Date(registrationDeadline) >= new Date(eventDate)) {
          return res.status(400).json({
            error: "Registration deadline must be before event date",
          });
        }
      }

      // Check if faculty has department and college information
      if (!faculty.department) {
        return res.status(400).json({ error: "Faculty department not found" });
      }

      if (!faculty.department.institute) {
        return res
          .status(400)
          .json({ error: "Faculty college/institute not found" });
      }

      console.log("Creating event with data:", {
        title,
        eventDate,
        venue,
        department: faculty.department._id,
        college: faculty.department.institute,
        createdBy: faculty._id,
      });

      const event = new Event({
        title,
        description,
        eventDate: new Date(eventDate),
        eventTime,
        venue,
        eventType,
        department: faculty.department._id,
        college: faculty.department.institute,
        createdBy: faculty._id,
        targetAudience: targetAudience || "All",
        maxParticipants: maxParticipants || null,
        registrationRequired: registrationRequired || false,
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline)
          : null,
        tags: tags || [],
      });

      console.log("Event object created, attempting to save...");
      await event.save();
      console.log("Event saved successfully with ID:", event._id);

      // Populate the created event for response
      await event.populate([
        { path: "department", select: "name" },
        { path: "createdBy", select: "name designation" },
      ]);

      res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("=== CREATE EVENT ERROR ===");
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      // Handle specific MongoDB validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (e) => e.message
        );
        return res.status(400).json({
          error: "Validation failed",
          details: validationErrors,
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          error: "Duplicate event data",
          details: "An event with similar details already exists",
        });
      }

      res.status(500).json({
        error: "Failed to create event",
        details: error.message,
      });
    }
  }
);

// Update event
router.put("/:eventId", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Only faculty can update events
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can update events" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Only the creator can update the event
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You can only update events you created",
      });
    }

    const {
      title,
      description,
      eventDate,
      eventTime,
      venue,
      eventType,
      targetAudience,
      maxParticipants,
      registrationRequired,
      registrationDeadline,
      status,
      tags,
    } = req.body;

    // Validate event date is in the future (only if changing date)
    if (eventDate && new Date(eventDate) <= new Date()) {
      return res
        .status(400)
        .json({ error: "Event date must be in the future" });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (eventDate) event.eventDate = new Date(eventDate);
    if (eventTime) event.eventTime = eventTime;
    if (venue) event.venue = venue;
    if (eventType) event.eventType = eventType;
    if (targetAudience) event.targetAudience = targetAudience;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (registrationRequired !== undefined)
      event.registrationRequired = registrationRequired;
    if (registrationDeadline)
      event.registrationDeadline = new Date(registrationDeadline);
    if (status) event.status = status;
    if (tags) event.tags = tags;

    await event.save();

    // Populate the updated event for response
    await event.populate([
      { path: "department", select: "name" },
      { path: "createdBy", select: "name designation" },
    ]);

    res.json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete event
router.delete("/:eventId", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Only faculty can delete events
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can delete events" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Only the creator can delete the event
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You can only delete events you created",
      });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Register for event
router.post("/:eventId/register", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if registration is required and open
    if (!event.registrationRequired) {
      return res
        .status(400)
        .json({ error: "Registration not required for this event" });
    }

    if (!event.isRegistrationOpen) {
      return res
        .status(400)
        .json({ error: "Registration is closed for this event" });
    }

    // Check if user is already registered
    const existingRegistration = event.registrations.find(
      (reg) => reg.user.toString() === req.user._id.toString()
    );

    if (existingRegistration) {
      return res
        .status(400)
        .json({ error: "You are already registered for this event" });
    }

    // Check participant limit
    if (
      event.maxParticipants &&
      event.registrations.length >= event.maxParticipants
    ) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Add registration
    event.registrations.push({
      user: req.user._id,
      userType: req.user.role === "faculty" ? "Faculty" : "Student",
    });

    await event.save();

    res.json({ message: "Successfully registered for event" });
  } catch (error) {
    console.error("Register for event error:", error);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

// Get single event details
router.get("/:eventId", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("department", "name")
      .populate("createdBy", "name designation")
      .populate("registrations.user", "name studentID facultyID");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

module.exports = router;
