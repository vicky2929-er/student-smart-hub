const express = require("express");
const fetch = require("node-fetch");
const { requireAuth } = require("../middleware/auth");
const { upload, uploadToUploadCare, deleteFromUploadCare, convertUploadCareUrl } = require("../config/uploadCare");
const { convertAchievementArrayUrls } = require("../utils/uploadCareUtils");
const Student = require("../model/student");
const Department = require("../model/department");
const College = require("../model/college");
const router = express.Router();

// Middleware to check if user can access student data
const checkStudentAccess = (req, res, next) => {
  const studentId = req.params.id;
  const user = req.user;

  // Allow access if:
  // 1. User is the student themselves
  // 2. User is faculty/admin (has role other than student)
  if (user.role === "student" && user._id.toString() !== studentId) {
    return res.status(403).json({
      error: "Access denied. You can only view your own dashboard.",
    });
  }

  next();
};

// Student Dashboard - Dynamic route with ID
router.get(
  "/dashboard/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const studentId = req.params.id;

      // Fetch student with populated references
      const student = await Student.findById(studentId)
        .populate("department")
        .populate("coordinator");

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      // Calculate achievement statistics (only Approved)
      const achievements = student.achievements || [];
      const approvedAchievements = achievements.filter(
        (a) => a.status === "Approved"
      );

      const stats = {
        certifications: approvedAchievements.filter((a) => a.type === "Course")
          .length,
        internships: approvedAchievements.filter((a) => a.type === "Internship")
          .length,
        competitions: approvedAchievements.filter(
          (a) => a.type === "Competition"
        ).length,
        workshops: approvedAchievements.filter((a) => a.type === "Workshop")
          .length,
      };

      // Get recent activities (last 5) and convert UploadCare URLs
      const recentActivities = convertAchievementArrayUrls(
        achievements
          .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          .slice(0, 5)
      );

      // Calculate academic progress
      const academicProgress = {
        cgpa: student.gpa ? parseFloat(student.gpa.toFixed(2)) : 0,
        attendance: student.attendance
          ? parseFloat(student.attendance.toFixed(2))
          : 0,
      };

      // Get upcoming events from the events API
      let upcomingEvents = [];
      try {
        // Import Event model to fetch real events
        const Event = require("../model/event");

        const events = await Event.find({
          college: student.department.institute,
          status: "Published",
          eventDate: { $gte: new Date() },
          $or: [
            { targetAudience: "All" },
            { targetAudience: "Students" },
            { targetAudience: student.batch },
          ],
        })
          .populate("department", "name")
          .populate("createdBy", "name designation")
          .sort({ eventDate: 1 })
          .limit(5);

        upcomingEvents = events.map((event) => ({
          title: event.title,
          date: event.eventDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: event.eventTime,
          venue: event.venue,
          type: event.eventType,
          id: event._id,
        }));
      } catch (eventError) {
        console.error(
          "Error fetching events for student dashboard:",
          eventError
        );
        // If events fetch fails, use empty array
        upcomingEvents = [];
      }

      res.json({
        student,
        stats,
        recentActivities,
        academicProgress,
        upcomingEvents,
        title: `${student.name.first}'s Dashboard`,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Upload page - Return student data for form
router.get("/upload/:id", requireAuth, checkStudentAccess, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.json({
      student,
      title: "Upload New Activity",
    });
  } catch (error) {
    console.error("Upload page error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Handle file upload
router.post(
  "/upload/:id",
  requireAuth,
  checkStudentAccess,
  upload.single("certificate"),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const { category, title, organization, description, dateCompleted, instituteEmail } =
        req.body;

      let fileUrl = null;
      let fileId = null;

      // Upload file to UploadCare if file is present
      if (req.file) {
        try {
          const uploadResult = await uploadToUploadCare(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
          );
          
          if (uploadResult.success) {
            fileUrl = uploadResult.fileUrl;
            fileId = uploadResult.fileId;
          } else {
            throw new Error('Failed to upload file to UploadCare');
          }
        } catch (uploadError) {
          console.error("UploadCare upload error:", uploadError);
          return res.status(500).json({ 
            error: "File upload failed", 
            details: uploadError.message 
          });
        }
      }

      const newAchievement = {
        title,
        type: category,
        description,
        organization,
        instituteEmail,
        dateCompleted: dateCompleted ? new Date(dateCompleted) : null,
        fileUrl: fileUrl,
        fileId: fileId, // Store UploadCare file ID for deletion later
        uploadedAt: new Date(),
        status: "Pending",
      };

      student.achievements.push(newAchievement);
      await student.save();

      res.json({
        success: true,
        message: "Achievement uploaded successfully",
        achievement: newAchievement,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// Portfolio page
router.get(
  "/portfolio/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate(
        "department"
      );

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      // Group achievements by category (only approved ones) and convert URLs
      const achievements = student.achievements || [];
      const approvedAchievements = achievements.filter((a) => a.status === "Approved");
      
      const groupedAchievements = {
        certifications: convertAchievementArrayUrls(approvedAchievements.filter((a) => a.type === "Course")),
        internships: convertAchievementArrayUrls(approvedAchievements.filter((a) => a.type === "Internship")),
        competitions: convertAchievementArrayUrls(approvedAchievements.filter((a) => a.type === "Competition")),
        workshops: convertAchievementArrayUrls(approvedAchievements.filter((a) => a.type === "Workshop")),
      };

      res.json({
        student,
        groupedAchievements,
        title: `${student.name.first}'s Portfolio`,
      });
    } catch (error) {
      console.error("Portfolio error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Profile page - Get detailed student profile
router.get(
  "/profile/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id)
        .populate("department")
        .populate("coordinator");

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      res.json({
        student,
        title: `${student.name.first}'s Profile`,
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Update student profile
router.put(
  "/profile/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const studentId = req.params.id;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this route
      delete updateData.email;
      delete updateData.studentID;
      delete updateData.course;
      delete updateData.department;
      delete updateData.gpa;
      delete updateData.achievements;

      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        updateData,
        { new: true, runValidators: true }
      ).populate("department");

      if (!updatedStudent) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        student: updatedStudent,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        error: "Failed to update profile",
      });
    }
  }
);

// Upload profile picture
router.post(
  "/profile/:id/picture",
  requireAuth,
  checkStudentAccess,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const studentId = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { profilePicture: req.file.path },
        { new: true }
      ).populate("department");

      if (!updatedStudent) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        profilePicture: req.file.path,
        student: updatedStudent,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      res.status(500).json({
        error: "Failed to upload profile picture",
      });
    }
  }
);

// Analytics page
router.get(
  "/analytics/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate(
        "department"
      );

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      const achievements = student.achievements || [];

      // Calculate detailed analytics
      const analytics = {
        totalAchievements: achievements.length,
        approvedAchievements: achievements.filter(
          (a) => a.status === "Approved"
        ).length,
        pendingAchievements: achievements.filter((a) => a.status === "Pending")
          .length,
        rejectedAchievements: achievements.filter(
          (a) => a.status === "Rejected"
        ).length,

        // Category breakdown
        categoryBreakdown: {
          certifications: achievements.filter((a) => a.type === "Course")
            .length,
          internships: achievements.filter((a) => a.type === "Internship")
            .length,
          competitions: achievements.filter((a) => a.type === "Competition")
            .length,
          workshops: achievements.filter((a) => a.type === "Workshop").length,
          hackathons: achievements.filter((a) => a.type === "Hackathon").length,
          conferences: achievements.filter((a) => a.type === "Conference").length,
          communityService: achievements.filter(
            (a) => a.type === "CommunityService"
          ).length,
          leadership: achievements.filter((a) => a.type === "Leadership").length,
          clubs: achievements.filter((a) => a.type === "Clubs").length,
          volunteering: achievements.filter((a) => a.type === "Volunteering").length,
          others: achievements.filter((a) => a.type === "Others").length,
        },

        // Academic metrics
        academicMetrics: {
          cgpa: student.gpa ? parseFloat(student.gpa.toFixed(2)) : 0,
          attendance: student.attendance
            ? parseFloat(student.attendance.toFixed(2))
            : 0,
          enrollmentYear: student.enrollmentYear,
          batch: student.batch,
        },

        // Enhanced timeline data
        ...getAchievementTimeline(achievements),

        // Recent achievements with full details
        recentAchievements: achievements
          .sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted))
          .slice(0, 10)
          .map(achievement => ({
            title: achievement.title || 'Achievement',
            category: achievement.type,
            status: achievement.status,
            date: new Date(achievement.dateCompleted).toLocaleDateString(),
            dateCompleted: achievement.dateCompleted
          })),

        // Skills analysis
        skills: student.skills || [],

        // Performance insights
        insights: generateInsights(student, achievements),
        
        // Growth metrics
        growthMetrics: calculateGrowthMetrics(achievements),
        
        // Goals tracking
        monthlyGoals: calculateMonthlyGoals(achievements),
      };

      res.json({
        student,
        analytics,
        title: `${student.name.first}'s Analytics`,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Helper function to generate achievement timeline
function getAchievementTimeline(achievements) {
  const timeline = {};
  const monthlyData = {};
  
  // Initialize last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    timeline[monthKey] = 0;
    monthlyData[monthKey] = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };
  }
  
  // Populate with actual data
  achievements.forEach((achievement) => {
    const month = new Date(achievement.uploadedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    
    if (timeline.hasOwnProperty(month)) {
      timeline[month] = (timeline[month] || 0) + 1;
      monthlyData[month].total++;
      
      if (achievement.status === 'Approved') {
        monthlyData[month].approved++;
      } else if (achievement.status === 'Pending') {
        monthlyData[month].pending++;
      } else if (achievement.status === 'Rejected') {
        monthlyData[month].rejected++;
      }
    }
  });
  
  return { timeline, monthlyData };
}

// Helper function to generate performance insights
function generateInsights(student, achievements) {
  const insights = [];

  if (student.gpa >= 9.0) {
    insights.push({
      type: "success",
      title: "Excellent Academic Performance",
      description: "Your CGPA is outstanding! Keep up the great work.",
    });
  } else if (student.gpa >= 7.0) {
    insights.push({
      type: "info",
      title: "Good Academic Performance",
      description:
        "Your academic performance is solid. Consider focusing on co-curricular activities.",
    });
  } else {
    insights.push({
      type: "warning",
      title: "Academic Improvement Needed",
      description:
        "Focus on improving your academic performance along with skill development.",
    });
  }

  if (achievements.length >= 10) {
    insights.push({
      type: "success",
      title: "Highly Active Student",
      description: "You have an impressive portfolio of achievements!",
    });
  } else if (achievements.length >= 5) {
    insights.push({
      type: "info",
      title: "Good Activity Level",
      description:
        "You're doing well with extracurricular activities. Keep building your portfolio.",
    });
  } else {
    insights.push({
      type: "warning",
      title: "Increase Activity Participation",
      description:
        "Consider participating in more workshops, competitions, and certification programs.",
    });
  }

  if (student.attendance >= 90) {
    insights.push({
      type: "success",
      title: "Excellent Attendance",
      description: "Your attendance record is exemplary!",
    });
  } else if (student.attendance >= 75) {
    insights.push({
      type: "info",
      title: "Good Attendance",
      description: "Your attendance is satisfactory but could be improved.",
    });
  } else {
    insights.push({
      type: "danger",
      title: "Attendance Concern",
      description:
        "Your attendance needs immediate attention to meet academic requirements.",
    });
  }

  return insights;
}

// Helper function to calculate growth metrics
function calculateGrowthMetrics(achievements) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const thisMonthAchievements = achievements.filter(a => {
    const date = new Date(a.uploadedAt);
    return date >= thisMonth && date <= thisMonthEnd;
  }).length;
  
  const lastMonthAchievements = achievements.filter(a => {
    const date = new Date(a.uploadedAt);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return date >= lastMonth && date <= lastMonthEnd;
  }).length;
  
  const growthRate = lastMonthAchievements > 0 
    ? ((thisMonthAchievements - lastMonthAchievements) / lastMonthAchievements) * 100
    : thisMonthAchievements > 0 ? 100 : 0;
    
  return {
    thisMonth: thisMonthAchievements,
    lastMonth: lastMonthAchievements,
    growthRate: Math.round(growthRate),
    trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'
  };
}

// Helper function to calculate monthly goals
function calculateMonthlyGoals(achievements) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const thisMonthCount = achievements.filter(a => {
    const date = new Date(a.uploadedAt);
    return date >= thisMonth && date <= thisMonthEnd;
  }).length;
  
  const lastMonthCount = achievements.filter(a => {
    const date = new Date(a.uploadedAt);
    return date >= lastMonth && date <= lastMonthEnd;
  }).length;
  
  const defaultTarget = 5; // Default monthly goal
  
  return {
    currentMonth: {
      target: defaultTarget,
      achieved: thisMonthCount,
      percentage: Math.round((thisMonthCount / defaultTarget) * 100)
    },
    lastMonth: {
      target: defaultTarget,
      achieved: lastMonthCount,
      percentage: Math.round((lastMonthCount / defaultTarget) * 100)
    }
  };
}

// Generate and store PDF route
router.post(
  "/generate-pdf/:id",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const studentId = req.params.id;

      // Make request to third-party PDF generation service
      const pdfResponse = await fetch(
        `${process.env.RESUME_API}/generate/${studentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!pdfResponse.ok) {
        throw new Error(`PDF generation failed: ${pdfResponse.status}`);
      }

      const pdfData = await pdfResponse.json();

      if (!pdfData.pdf_url) {
        throw new Error("No PDF URL returned from generation service");
      }

      // Store the PDF URL in MongoDB
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
          resumePdfUrl: pdfData.pdf_url,
          resumeGenerated: true,
        },
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Return your website's PDF URL instead of third-party URL
      res.json({
        success: true,
        pdf_url: `${req.protocol}://${req.get(
          "host"
        )}/api/students/pdf/${studentId}`,
        message: "PDF generated and stored successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({
        error: "Failed to generate PDF",
        details: error.message,
      });
    }
  }
);

// Serve PDF route - redirects to actual PDF URL
router.get("/pdf/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId).select(
      "resumePdfUrl name"
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.resumePdfUrl) {
      return res.status(404).json({
        error: "PDF not available",
        message: "Portfolio PDF has not been generated yet",
      });
    }

    // Redirect to the actual PDF URL
    res.redirect(student.resumePdfUrl);
  } catch (error) {
    console.error("Error serving PDF:", error);
    res.status(500).json({
      error: "Failed to serve PDF",
      details: error.message,
    });
  }
});

// Get PDF URL route (for iframe embedding) - Public access for sharing
router.get("/pdf-url/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId).select(
      "resumePdfUrl name"
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!student.resumePdfUrl) {
      return res.status(404).json({
        error: "PDF not available",
        message: "Portfolio PDF has not been generated yet",
      });
    }

    // Return the stored PDF URL for iframe embedding
    res.json({
      pdf_url: student.resumePdfUrl,
      student_name: `${student.name.first} ${student.name.last || ""}`.trim(),
    });
  } catch (error) {
    console.error("Error getting PDF URL:", error);
    res.status(500).json({
      error: "Failed to get PDF URL",
      details: error.message,
    });
  }
});

// Delete achievement route
router.delete(
  "/:studentId/achievement/:achievementId",
  requireAuth,
  checkStudentAccess,
  async (req, res) => {
    try {
      const { studentId, achievementId } = req.params;
      
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Find the achievement to delete
      const achievementIndex = student.achievements.findIndex(
        (achievement) => achievement._id.toString() === achievementId
      );

      if (achievementIndex === -1) {
        return res.status(404).json({ error: "Achievement not found" });
      }

      const achievement = student.achievements[achievementIndex];

      // Delete file from UploadCare if it exists
      if (achievement.fileId) {
        try {
          const deleteResult = await deleteFromUploadCare(achievement.fileId);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file from UploadCare: ${deleteResult.message}`);
            // Continue with achievement deletion even if file deletion fails
          }
        } catch (error) {
          console.error("Error deleting file from UploadCare:", error);
          // Continue with achievement deletion even if file deletion fails
        }
      }

      // Remove achievement from array
      student.achievements.splice(achievementIndex, 1);
      await student.save();

      res.json({
        success: true,
        message: "Achievement deleted successfully",
      });
    } catch (error) {
      console.error("Delete achievement error:", error);
      res.status(500).json({ 
        error: "Failed to delete achievement",
        details: error.message 
      });
    }
  }
);

module.exports = router;
