const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const router = express.Router();
const Faculty = require("../model/faculty");
const Student = require("../model/student");
const { requireAuth } = require("../middleware/auth");
const { convertUploadCareUrl } = require("../utils/uploadCareUtils");

// Faculty Dashboard
router.get("/dashboard/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Security check: Ensure the logged-in user is accessing their own dashboard
    if (req.user.role !== "faculty" || req.user._id.toString() !== id) {
      return res.status(403).json({
        error: "Access denied. You can only access your own dashboard.",
      });
    }

    const faculty = await Faculty.findById(id)
      .populate("department", "name")
      .populate("students", "name studentID");

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Get pending reviews count with proper error handling
    const pendingReviews = await Student.aggregate([
      {
        $match: {
          coordinator: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: {
          path: "$achievements",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "achievements.status": "Pending",
        },
      },
      {
        $count: "total",
      },
    ]);

    // Get this month's approved achievements dynamically from faculty's reviewed achievements
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const approvedThisMonth = await Faculty.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: {
          path: "$achievementsReviewed",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "achievementsReviewed.status": "Approved",
          "achievementsReviewed.reviewedAt": {
            $exists: true,
            $gte: startOfMonth,
          },
        },
      },
      {
        $count: "total",
      },
    ]);

    // Get total reviewed achievements dynamically from faculty's reviewed achievements
    const totalReviewed = await Faculty.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: {
          path: "$achievementsReviewed",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "achievementsReviewed.reviewedAt": { $exists: true },
        },
      },
      {
        $count: "total",
      },
    ]);

    // Get recent pending reviews for display with better error handling
    const recentPendingReviews = await Student.aggregate([
      {
        $match: {
          coordinator: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: {
          path: "$achievements",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "achievements.status": "Pending",
        },
      },
      {
        $sort: {
          "achievements.uploadedAt": -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          student: {
            _id: "$_id",
            name: "$name",
          },
          achievement: "$achievements",
        },
      },
    ]);

    // Get student statistics with proper null handling
    const totalStudentsCount = await Student.countDocuments({
      coordinator: new mongoose.Types.ObjectId(id),
    });

    const studentStats = {
      active: totalStudentsCount,
      highPerformers: await Student.countDocuments({
        coordinator: new mongoose.Types.ObjectId(id),
        gpa: { $gte: 8.0 },
      }),
      recentSubmissions: await Student.aggregate([
        {
          $match: {
            coordinator: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: {
            path: "$achievements",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "achievements.uploadedAt": {
              $exists: true,
              $gte: startOfMonth,
            },
          },
        },
        {
          $count: "total",
        },
      ]).then((result) => result[0]?.total || 0),
    };

    // Get recent activities with null handling
    const recentActivities = (faculty.achievementsReviewed || [])
      .slice(-5)
      .reverse()
      .map((review) => ({
        description: `${review.status || "Unknown"} achievement review`,
        timestamp: review.reviewedAt || new Date(),
        action: review.status || "Unknown",
      }));

    // Calculate stats with proper null/undefined handling
    const stats = {
      totalStudents: totalStudentsCount,
      pendingReviews: pendingReviews[0]?.total || 0,
      approvedThisMonth: approvedThisMonth[0]?.total || 0,
      totalReviewed: totalReviewed[0]?.total || 0,
    };

    res.json({
      faculty,
      stats,
      pendingReviews: recentPendingReviews,
      recentActivities,
      studentStats,
    });
  } catch (error) {
    console.error("Faculty dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// Get Reviews
router.get("/reviews/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { filter = "all" } = req.query;

    // Security check: Ensure the logged-in user is accessing their own data
    if (req.user.role !== "faculty" || req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({ error: "Access denied. You can only access your own data." });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    let matchStage = {
      coordinator: new mongoose.Types.ObjectId(id),
    };

    // Apply filter for achievement status
    if (filter !== "all") {
      matchStage["achievements.status"] =
        filter === "pending"
          ? "Pending"
          : filter === "approved"
          ? "Approved"
          : "Rejected";
    }

    const reviews = await Student.aggregate([
      {
        $match: matchStage,
      },
      {
        $unwind: "$achievements",
      },
      {
        $match:
          filter !== "all"
            ? {
                "achievements.status":
                  filter === "pending"
                    ? "Pending"
                    : filter === "approved"
                    ? "Approved"
                    : "Rejected",
              }
            : {},
      },
      {
        $sort: {
          "achievements.uploadedAt": -1,
        },
      },
      {
        $project: {
          student: {
            _id: "$_id",
            name: "$name",
            studentID: "$studentID",
            course: "$course",
            year: "$year",
          },
          achievement: "$achievements",
        },
      },
    ]);

    res.json({ reviews });
  } catch (error) {
    console.error("Reviews error:", error);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

// Review Achievement
router.post(
  "/review/:facultyId/:achievementId",
  requireAuth,
  async (req, res) => {
    try {
      const { facultyId, achievementId } = req.params;
      const { status, comment, studentId } = req.body;

      // Security check: Ensure the logged-in user is the faculty making the review
      if (
        req.user.role !== "faculty" ||
        req.user._id.toString() !== facultyId
      ) {
        return res
          .status(403)
          .json({ error: "Access denied. You can only review as yourself." });
      }

      // Get student and achievement details before updating
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const achievement = student.achievements.find(
        (ach) => ach._id.toString() === achievementId
      );
      if (!achievement) {
        return res.status(404).json({ error: "Achievement not found" });
      }

      // Update student's achievement status
      const reviewedAt = new Date();
      await Student.updateOne(
        { _id: studentId, "achievements._id": achievementId },
        {
          $set: {
            "achievements.$.status": status,
            "achievements.$.comment": comment || "",
            "achievements.$.reviewedAt": reviewedAt,
          },
        }
      );

      // Add to faculty's reviewed achievements
      await Faculty.updateOne(
        { _id: facultyId },
        {
          $push: {
            achievementsReviewed: {
              achievementId,
              studentId,
              status,
              comment: comment || "",
              reviewedAt: reviewedAt,
            },
          },
        }
      );

      // If achievement is approved and has a file URL, call Flask API
      if (status === "Approved" && achievement.fileUrl) {
        try {
          console.log(`Calling Flask API for approved achievement: ${achievementId}`);
          console.log(`Student ID: ${studentId}`);
          console.log(`Original file URL: ${achievement.fileUrl}`);
          
          // Convert UploadCare URL to use correct domain
          const processedUrl = convertUploadCareUrl(achievement.fileUrl);
          const flaskApiUrl = process.env.FLASK_API_URL || 'http://localhost:5003';
          
          console.log(`Processed file URL: ${processedUrl}`);
          console.log(`Flask API URL: ${flaskApiUrl}`);
          
          // Send GET request to Flask API with query parameters
          const apiEndpoint = `${flaskApiUrl}/process_certificate_get`;
          console.log(`Full API call: ${apiEndpoint}?document_url=${encodeURIComponent(processedUrl)}&student_id=${studentId}`);
          
          const response = await axios.get(apiEndpoint, {
            params: {
              document_url: processedUrl,
              student_id: studentId
            },
            timeout: 30000, // 30 second timeout
            headers: {
              'Accept': 'application/json'
            }
          });

          console.log("Flask API response:", response.data);
          
          // Return success with Flask response
          res.json({
            message: "Achievement reviewed successfully",
            flask_response: response.data,
            status: "Flask API called successfully",
            processed_url: processedUrl
          });
        } catch (flaskError) {
          console.error("Flask API error:", flaskError.message);
          
          if (flaskError.code === 'ECONNREFUSED') {
            console.error("Flask API server is not running or not accessible");
          } else if (flaskError.code === 'ETIMEDOUT') {
            console.error("Flask API request timed out");
          }
          
          // Still return success for the review, but note the Flask API issue
          res.json({
            message: "Achievement reviewed successfully",
            warning: "Flask API call failed",
            flask_error: flaskError.message,
            flask_error_code: flaskError.code || 'UNKNOWN'
          });
        }
      } else {
        // Normal response for non-approved or no file URL
        const statusMessage = status === "Approved" 
          ? "No file URL found for Flask processing" 
          : `Achievement ${status.toLowerCase()}`;
          
        console.log(`Achievement review completed: ${statusMessage}`);
        
        res.json({ 
          message: "Achievement reviewed successfully",
          status: statusMessage
        });
      }
    } catch (error) {
      console.error("Review error:", error);
      res.status(500).json({ error: "Failed to review achievement" });
    }
  }
);

// Get Faculty Students
router.get("/students/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Security check: Ensure the logged-in user is accessing their own data
    if (req.user.role !== "faculty" || req.user._id.toString() !== id) {
      return res.status(403).json({
        error: "Access denied. You can only access your own students.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Find students where this faculty is the coordinator
    const students = await Student.find({
      coordinator: id,
    })
      .populate("department", "name")
      .lean();

    // Enhance student data with calculated fields
    const enhancedStudents = students.map((student) => {
      const achievementCount =
        student.achievements?.filter((a) => a.status === "Approved").length ||
        0;
      const pendingReviews =
        student.achievements?.filter((a) => a.status === "Pending").length || 0;
      const approvedAchievements =
        student.achievements?.filter((a) => a.status === "Approved").length ||
        0;

      // Calculate performance score based on GPA, achievements, and attendance
      const gpaScore = ((student.gpa || 0) / 10) * 40; // 40% weight
      const achievementScore = Math.min(achievementCount * 5, 30); // 30% weight, max 30
      const attendanceScore = ((student.attendance || 0) / 100) * 30; // 30% weight
      const performanceScore = Math.round(
        gpaScore + achievementScore + attendanceScore
      );

      // Get recent achievements
      const recentAchievements =
        student.achievements
          ?.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          .slice(0, 3) || [];

      const lastActivity =
        recentAchievements[0]?.uploadedAt || student.updatedAt;

      return {
        ...student,
        cgpa: student.gpa ? parseFloat(student.gpa.toFixed(2)) : 0,
        attendance: student.attendance
          ? parseFloat(student.attendance.toFixed(2))
          : 0,
        achievementCount,
        pendingReviews,
        performanceScore,
        recentAchievements,
        lastActivity,
      };
    });

    res.json({ students: enhancedStudents });
  } catch (error) {
    console.error("Students error:", error);
    res.status(500).json({ error: "Failed to load students" });
  }
});

// Get Analytics
router.get("/analytics/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = "month" } = req.query;

    // Security check: Ensure the logged-in user is accessing their own data
    if (req.user.role !== "faculty" || req.user._id.toString() !== id) {
      return res.status(403).json({
        error: "Access denied. You can only access your own analytics.",
      });
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "semester":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get submission trend data
    const submissionTrend = await Student.aggregate([
      {
        $match: {
          coordinator: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: "$achievements",
      },
      {
        $match: {
          "achievements.uploadedAt": { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$achievements.uploadedAt",
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    // Get achievement types distribution
    const achievementTypes = await Student.aggregate([
      {
        $match: {
          coordinator: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: "$achievements",
      },
      {
        $group: {
          _id: "$achievements.type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get student performance data
    const studentPerformance = await Student.find({
      coordinator: new mongoose.Types.ObjectId(id),
    }).select("name gpa achievements");

    // Get top performers
    const topPerformers = studentPerformance
      .map((student) => ({
        name: `${student.name.first} ${student.name.last}`,
        achievements: student.achievements?.length || 0,
        score: Math.round(((student.gpa || 0) / 10) * 100),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = await Student.aggregate([
      {
        $match: {
          coordinator: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: "$achievements",
      },
      {
        $sort: {
          "achievements.uploadedAt": -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          title: "$achievements.title",
          student: { $concat: ["$name.first", " ", "$name.last"] },
          type: "$achievements.type",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$achievements.uploadedAt",
            },
          },
        },
      },
    ]);

    // Calculate overview statistics
    const totalSubmissions = await Student.aggregate([
      {
        $match: {
          coordinator: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: "$achievements",
      },
      {
        $match: {
          "achievements.uploadedAt": { $gte: startDate },
        },
      },
      {
        $count: "total",
      },
    ]);

    const activeStudents = await Student.countDocuments({
      coordinator: new mongoose.Types.ObjectId(id),
      updatedAt: { $gte: startDate },
    });

    const overview = {
      totalSubmissions: totalSubmissions[0]?.total || 0,
      submissionGrowth: 12, // Mock data - calculate based on previous period
      activeStudents,
      totalStudents: studentPerformance.length,
      avgReviewTime: 24, // Mock data - calculate from review timestamps
      reviewTimeImprovement: 15, // Mock data
      approvalRate: 85, // Mock data - calculate from approved vs total reviews
      approvalRateChange: 5, // Mock data
    };

    // Format data for charts
    const analyticsData = {
      overview,
      submissionTrend: {
        labels: submissionTrend.map((item) => item._id.date),
        data: submissionTrend.map((item) => item.count),
      },
      achievementTypes: {
        labels: achievementTypes.map((item) => item._id || "Other"),
        data: achievementTypes.map((item) => item.count),
      },
      studentPerformance: {
        labels: studentPerformance.map((s) => `${s.name.first} ${s.name.last}`),
        data: studentPerformance.map((s) =>
          Math.round(((s.gpa || 0) / 10) * 100)
        ),
      },
      topPerformers,
      recentActivity,
      monthlyStats: {
        currentMonth: {
          submissions: totalSubmissions[0]?.total || 0,
          reviews: faculty.achievementsReviewed.filter(
            (r) => new Date(r.reviewedAt) >= startDate
          ).length,
          approvals: faculty.achievementsReviewed.filter(
            (r) =>
              r.status === "Approved" && new Date(r.reviewedAt) >= startDate
          ).length,
        },
        lastMonth: {
          submissions: 45, // Mock data
          reviews: 42, // Mock data
          approvals: 38, // Mock data
        },
      },
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

// Edit Student
router.put("/students/:facultyId/:studentId", requireAuth, async (req, res) => {
  try {
    const { facultyId, studentId } = req.params;
    const updateData = req.body;

    // Security check: Ensure the logged-in user is the faculty
    if (req.user.role !== "faculty" || req.user._id.toString() !== facultyId) {
      return res.status(403).json({
        error: "Access denied. You can only edit your own students.",
      });
    }

    // Check if student exists and is assigned to this faculty
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.coordinator.toString() !== facultyId) {
      return res.status(403).json({
        error: "Access denied. This student is not assigned to you.",
      });
    }

    // Remove sensitive fields from update
    const { password, role, _id, __v, achievements, ...safeUpdateData } = updateData;

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      safeUpdateData,
      { new: true, runValidators: true }
    ).populate("department", "name");

    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Edit student error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete Student
router.delete("/students/:facultyId/:studentId", requireAuth, async (req, res) => {
  try {
    const { facultyId, studentId } = req.params;

    // Security check: Ensure the logged-in user is the faculty
    if (req.user.role !== "faculty" || req.user._id.toString() !== facultyId) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own students.",
      });
    }

    // Check if student exists and is assigned to this faculty
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.coordinator.toString() !== facultyId) {
      return res.status(403).json({
        error: "Access denied. This student is not assigned to you.",
      });
    }

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// Faculty Profile Routes
router.get('/profile/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Security check: Faculty can only access their own profile
    if (req.user.role === 'faculty' && req.user._id !== id) {
      return res.status(403).json({ error: 'Access denied. You can only access your own profile.' });
    }

    const faculty = await Faculty.findById(id)
      .populate('department', 'name code')
      .select('-password');

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    res.json({
      success: true,
      data: { faculty }
    });
  } catch (error) {
    console.error('Get faculty profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Security check: Faculty can only update their own profile
    if (req.user.role === 'faculty' && req.user._id !== id) {
      return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
    }

    // Remove sensitive fields from update
    const { password, role, _id, __v, ...updateData } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .select('-password');

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { faculty }
    });
  } catch (error) {
    console.error('Update faculty profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
