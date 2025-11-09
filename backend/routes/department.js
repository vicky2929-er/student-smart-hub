const express = require("express");
const mongoose = require("mongoose");
const { requireAuth, requireRole } = require("../middleware/auth");
const Department = require("../model/department");
const Faculty = require("../model/faculty");
const Student = require("../model/student");
const Event = require("../model/event");
const router = express.Router();

// Get Department Dashboard
router.get("/dashboard/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this department dashboard
    if (req.user.role === "department" && req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Find department with populated references
    const department = await Department.findById(id)
      .populate("hod", "name designation")
      .populate("faculties", "name designation specialization email status")
      .populate("college", "name")
      .populate("institute", "name");

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Get department statistics
    const stats = {
      totalFaculty: department.faculties.length,
      totalStudents: await Student.countDocuments({ department: id }),
      eventsThisMonth: await Event.countDocuments({
        $or: [{ createdBy: { $in: department.faculties } }, { department: id }],
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      activePrograms: await Student.distinct("batch", { department: id }).then(
        (batches) => batches.length
      ),
    };

    // Get recent activities from actual database events
    const recentEvents = await Event.find({
      $or: [{ createdBy: { $in: department.faculties } }, { department: id }],
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFacultyAdditions = await Faculty.find({ department: id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name createdAt");

    // Combine recent activities
    let recentActivities = [];

    // Add recent events
    recentEvents.forEach((event) => {
      recentActivities.push({
        title: `Event: ${event.title}`,
        description: `Created by ${event.createdBy?.name?.first || "Unknown"} ${
          event.createdBy?.name?.last || ""
        }`,
        date: event.createdAt,
        type: "event",
      });
    });

    // Add recent faculty additions
    recentFacultyAdditions.forEach((faculty) => {
      recentActivities.push({
        title: "New Faculty Added",
        description: `${faculty.name?.first || ""} ${
          faculty.name?.last || ""
        } joined the department`,
        date: faculty.createdAt,
        type: "faculty",
      });
    });

    // Sort all activities by date and limit to 5
    recentActivities = recentActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Get faculty list (limited to recent ones for dashboard)
    const facultyList = department.faculties.slice(0, 5);

    res.json({
      department,
      stats,
      recentActivities,
      facultyList,
    });
  } catch (error) {
    console.error("Department dashboard error:", error);
    res.status(500).json({ error: "Failed to load department dashboard" });
  }
});

// Add Faculty to Department
router.post(
  "/add-faculty",
  requireAuth,
  requireRole(["department"]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        facultyID,
        designation = "Assistant Professor",
        specialization,
        contactNumber,
        address,
        experience,
        qualifications,
        password,
        status = "Active",
      } = req.body;

      // Check if faculty already exists
      const existingFaculty = await Faculty.findOne({
        $or: [{ email }, { facultyID }],
      });

      if (existingFaculty) {
        return res.status(400).json({
          error: "Faculty with this email or ID already exists",
        });
      }

      // Get department
      const department = await Department.findById(req.user._id);
      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }

      // Create new faculty
      const newFaculty = new Faculty({
        name,
        email,
        facultyID,
        password: password || `${facultyID}@123`, // Default password
        designation,
        specialization,
        contactNumber,
        address,
        experience: experience ? parseInt(experience) : undefined,
        qualifications: Array.isArray(qualifications) ? qualifications : [],
        department: department._id,
        college: department.college,
        institute: department.institute,
        status,
      });

      await newFaculty.save();

      // Add faculty to department's faculty list
      department.faculties.push(newFaculty._id);
      await department.save();

      res.status(201).json({
        message: "Faculty added successfully",
        faculty: newFaculty,
      });
    } catch (error) {
      console.error("Add faculty error:", error);
      res.status(500).json({ error: "Failed to add faculty" });
    }
  }
);

// Delete Faculty
router.delete(
  "/faculty/:facultyId",
  requireAuth,
  requireRole(["department"]),
  async (req, res) => {
    try {
      const { facultyId } = req.params;

      // Check if faculty exists and belongs to this department
      const faculty = await Faculty.findById(facultyId);
      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      if (faculty.department.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Remove faculty from department's faculty list
      await Department.findByIdAndUpdate(req.user._id, {
        $pull: { faculties: facultyId },
      });

      // Delete the faculty
      await Faculty.findByIdAndDelete(facultyId);

      res.json({ message: "Faculty deleted successfully" });
    } catch (error) {
      console.error("Delete faculty error:", error);
      res.status(500).json({ error: "Failed to delete faculty" });
    }
  }
);

// Add Student to Department
router.post(
  "/add-student",
  requireAuth,
  requireRole(["department"]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        studentID,
        batch,
        enrollmentYear,
        contactNumber,
        address,
        guardianName,
        guardianContact,
        password,
        status = "Active",
      } = req.body;

      // Check if student already exists
      const existingStudent = await Student.findOne({
        $or: [{ email }, { studentID }],
      });

      if (existingStudent) {
        return res.status(400).json({
          error: "Student with this email or ID already exists",
        });
      }

      // Get department
      const department = await Department.findById(req.user._id);
      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }

      // Create new student
      const newStudent = new Student({
        name,
        email,
        studentID,
        password: password || `${studentID}@123`, // Default password
        batch,
        enrollmentYear: parseInt(enrollmentYear),
        contactNumber,
        address,
        guardianName,
        guardianContact,
        department: department._id,
        college: department.college,
        institute: department.institute,
        status,
      });

      await newStudent.save();

      res.status(201).json({
        message: "Student added successfully",
        student: newStudent,
      });
    } catch (error) {
      console.error("Add student error:", error);
      res.status(500).json({ error: "Failed to add student" });
    }
  }
);

// Delete Student
router.delete(
  "/students/:studentId",
  requireAuth,
  requireRole(["department"]),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      // Check if student exists and belongs to this department
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      if (student.department.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete the student
      await Student.findByIdAndDelete(studentId);

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  }
);

// Bulk Upload Students
router.post(
  "/bulk-upload-students",
  requireAuth,
  requireRole(["department"]),
  async (req, res) => {
    try {
      // This would require multer middleware for file upload
      // For now, return a placeholder response
      res.status(501).json({
        error: "Bulk upload feature not implemented yet",
        message: "Please add students individually for now",
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({ error: "Failed to upload students" });
    }
  }
);

// Get Department Faculty
router.get("/faculty/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id).populate(
      "faculties",
      "name designation specialization email contactNumber experience qualifications address status facultyID createdAt"
    );

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json({
      faculty: department.faculties,
      totalCount: department.faculties.length,
    });
  } catch (error) {
    console.error("Get faculty error:", error);
    res.status(500).json({ error: "Failed to get faculty" });
  }
});

// Get Department Students
router.get("/students/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const students = await Student.find({ department: id })
      .populate("department", "name")
      .select(
        "name email studentID batch enrollmentYear gpa attendance status contactNumber guardianName guardianContact address createdAt"
      );

    res.json({
      students,
      totalCount: students.length,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Failed to get students" });
  }
});

// Get Department Coordinator
router.get("/:id/coordinator", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate("hod", "name email designation contactNumber")
      .select("hod name");

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Return the HOD as the coordinator
    res.json({
      coordinator: department.hod,
      department: {
        name: department.name,
        _id: department._id
      }
    });
  } catch (error) {
    console.error("Get coordinator error:", error);
    res.status(500).json({ error: "Failed to get coordinator" });
  }
});

// Get Department Analytics
router.get("/analytics/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = "month" } = req.query;

    // Calculate date range based on period
    let startDate;
    const endDate = new Date();

    switch (period) {
      case "week":
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    }

    // Get department and its faculty
    const department = await Department.findById(id).populate("faculties");
    
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    const facultyIds = department.faculties.map((f) => f._id);

    const departmentObjectId = new mongoose.Types.ObjectId(id);
    
    // Get average GPA
    const avgGPAResult = await Student.aggregate([
      { $match: { department: departmentObjectId, gpa: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgGPA: { $avg: "$gpa" } } },
    ]);

    // Get average Attendance
    const avgAttendanceResult = await Student.aggregate([
      { $match: { department: departmentObjectId, attendance: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgAttendance: { $avg: "$attendance" } } },
    ]);

    // Get achievement statistics
    const achievementStats = await Student.aggregate([
      { $match: { department: departmentObjectId } },
      { $unwind: "$achievements" },
      {
        $group: {
          _id: "$achievements.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get analytics data
    const analytics = {
      totalStudents: await Student.countDocuments({ department: id }),
      totalFaculty: department.faculties.length,
      eventsInPeriod: await Event.countDocuments({
        department: departmentObjectId,
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      averageGPA: avgGPAResult.length > 0 && avgGPAResult[0].avgGPA ? parseFloat(avgGPAResult[0].avgGPA.toFixed(2)) : 0,
      averageAttendance: avgAttendanceResult.length > 0 && avgAttendanceResult[0].avgAttendance ? parseFloat(avgAttendanceResult[0].avgAttendance.toFixed(2)) : 0,
      achievementStats: achievementStats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = stat.count;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 }),
    };

    res.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

module.exports = router;
