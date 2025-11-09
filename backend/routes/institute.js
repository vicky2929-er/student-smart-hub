const express = require("express");
const router = express.Router();
const Institute = require("../model/institute");
const College = require("../model/college");
const Department = require("../model/department");
const Faculty = require("../model/faculty");
const Student = require("../model/student");
const Event = require("../model/event");
const { requireAuth } = require("../middleware/auth");

// Get institute dashboard data
router.get("/dashboard/:id", requireAuth, async (req, res) => {
  try {
    const instituteId = req.params.id;

    // Verify the user has access to this institute
    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    // Get institute basic info
    const institute = await Institute.findById(instituteId).select("-password");
    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    // Get colleges under this institute
    const colleges = await College.find({ institute: instituteId })
      .populate("departments", "name code")
      .select("name code type status departments");

    // Get all departments under this institute
    const departments = await Department.find({ institute: instituteId })
      .populate("hod", "name designation")
      .populate("college", "name")
      .select("name code college hod faculties status");

    // Get faculty count
    const facultyCount = await Faculty.countDocuments({
      department: { $in: departments.map(d => d._id) }
    });

    // Get student count
    const studentCount = await Student.countDocuments({
      department: { $in: departments.map(d => d._id) }
    });

    // Get recent events (college field in Event schema refers to institute)
    const recentEvents = await Event.find({ college: instituteId })
      .populate("createdBy", "name")
      .populate("department", "name")
      .sort({ eventDate: -1 })
      .limit(5)
      .select("title eventType eventDate venue status createdBy department");

    // Get upcoming events
    const upcomingEvents = await Event.find({
      college: instituteId,
      eventDate: { $gte: new Date() },
      status: { $in: ["Published", "Active"] }
    })
      .populate("createdBy", "name")
      .populate("department", "name")
      .sort({ eventDate: 1 })
      .limit(10)
      .select("title eventType eventDate venue createdBy department maxParticipants");

    // Calculate college-wise statistics
    const collegeStats = await Promise.all(
      colleges.map(async (college) => {
        const collegeDepartments = await Department.find({ college: college._id });
        const departmentIds = collegeDepartments.map(d => d._id);
        
        const facultyCount = await Faculty.countDocuments({
          department: { $in: departmentIds }
        });
        
        const studentCount = await Student.countDocuments({
          department: { $in: departmentIds }
        });

        return {
          _id: college._id,
          name: college.name,
          type: college.type,
          departmentCount: collegeDepartments.length,
          facultyCount,
          studentCount,
          status: college.status
        };
      })
    );

    // Get department-wise faculty and student counts
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const facultyCount = await Faculty.countDocuments({ department: dept._id });
        const studentCount = await Student.countDocuments({ department: dept._id });
        
        return {
          _id: dept._id,
          name: dept.name,
          code: dept.code,
          college: dept.college,
          hod: dept.hod,
          facultyCount,
          studentCount,
          status: dept.status
        };
      })
    );

    // Get achievement statistics
    const achievementStats = await Student.aggregate([
      {
        $match: {
          department: { $in: departments.map(d => d._id) }
        }
      },
      {
        $unwind: "$achievements"
      },
      {
        $group: {
          _id: "$achievements.status",
          count: { $sum: 1 }
        }
      }
    ]);

    const dashboardData = {
      institute: {
        _id: institute._id,
        name: institute.name,
        code: institute.code,
        type: institute.type,
        email: institute.email,
        contactNumber: institute.contactNumber,
        website: institute.website,
        address: institute.address,
        status: institute.status,
        approvalStatus: institute.approvalStatus
      },
      statistics: {
        totalColleges: colleges.length,
        totalDepartments: departments.length,
        totalFaculty: facultyCount,
        totalStudents: studentCount,
        totalEvents: await Event.countDocuments({ college: instituteId }),
        upcomingEvents: upcomingEvents.length
      },
      colleges: collegeStats,
      departments: departmentStats,
      recentEvents,
      upcomingEvents,
      achievementStats: achievementStats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = stat.count;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 })
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Institute dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch institute dashboard data" });
  }
});

// Get institute profile
router.get("/profile/:id", requireAuth, async (req, res) => {
  try {
    const instituteId = req.params.id;

    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    const institute = await Institute.findById(instituteId).select("-password");
    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    res.json(institute);
  } catch (error) {
    console.error("Institute profile error:", error);
    res.status(500).json({ error: "Failed to fetch institute profile" });
  }
});

// Update institute profile
router.put("/profile/:id", requireAuth, async (req, res) => {
  try {
    const instituteId = req.params.id;

    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password updates through this route

    const institute = await Institute.findByIdAndUpdate(
      instituteId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    res.json(institute);
  } catch (error) {
    console.error("Institute profile update error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: "Failed to update institute profile" });
  }
});

// Get colleges by institute
router.get("/:id/colleges", requireAuth, async (req, res) => {
  try {
    const instituteId = req.params.id;

    // Verify the user has access to this institute
    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    // Get colleges under this institute with detailed information
    const colleges = await College.find({ institute: instituteId })
      .populate("departments", "name")
      .select("name code email type contactNumber website address status createdAt");

    // Get detailed stats for each college
    const collegeStats = await Promise.all(
      colleges.map(async (college) => {
        const departments = await Department.find({ college: college._id });
        const departmentIds = departments.map(d => d._id);
        
        const facultyCount = await Faculty.countDocuments({
          department: { $in: departmentIds }
        });
        
        const studentCount = await Student.countDocuments({
          department: { $in: departmentIds }
        });

        return {
          _id: college._id,
          name: college.name,
          code: college.code,
          email: college.email,
          type: college.type,
          contactNumber: college.contactNumber,
          website: college.website,
          address: college.address,
          status: college.status || 'active',
          departmentCount: departments.length,
          facultyCount,
          studentCount,
          createdAt: college.createdAt
        };
      })
    );

    res.json(collegeStats);
  } catch (error) {
    console.error("Get colleges error:", error);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

// Add college to institute
router.post("/colleges", requireAuth, async (req, res) => {
  try {
    const {
      name,
      code,
      email,
      password,
      contactNumber,
      address,
      website,
      type,
      institute
    } = req.body;

    // Verify the user has access to this institute
    if (req.user.role !== "institute" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.user.role === "institute" && req.user._id.toString() !== institute) {
      return res.status(403).json({ error: "Access denied to this institute" });
    }

    // Check if college code already exists
    const existingCollege = await College.findOne({ code: code.toUpperCase() });
    if (existingCollege) {
      return res.status(400).json({ error: "College code already exists" });
    }

    // Check if email already exists
    const existingEmail = await College.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create new college
    const college = new College({
      institute,
      name: name.trim(),
      code: code.toUpperCase(),
      email: email.toLowerCase(),
      password, // In production, this should be hashed
      contactNumber,
      address,
      website,
      type: type || 'Other'
    });

    await college.save();

    res.status(201).json({
      message: "College added successfully",
      college: {
        _id: college._id,
        name: college.name,
        code: college.code,
        email: college.email,
        type: college.type,
        status: college.status
      }
    });
  } catch (error) {
    console.error("Add college error:", error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: "Failed to add college" });
  }
});

// Bulk upload colleges from Excel file
router.post("/colleges/bulk-upload", requireAuth, async (req, res) => {
  try {
    const multer = require('multer');
    const xlsx = require('xlsx');
    const bcrypt = require('bcryptjs');
    
    // Configure multer for file upload
    const storage = multer.memoryStorage();
    const upload = multer({ 
      storage: storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
          cb(null, true);
        } else {
          cb(new Error('Only Excel files are allowed'), false);
        }
      }
    }).single('file');

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const instituteId = req.body.institute;

      // Verify the user has access to this institute
      if (req.user.role !== "institute" && req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Access denied" });
      }

      if (req.user.role === "institute" && req.user._id.toString() !== instituteId) {
        return res.status(403).json({ error: "Access denied to this institute" });
      }

      try {
        // Parse Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
          return res.status(400).json({ error: 'Excel file is empty' });
        }

        const results = {
          successful: [],
          failed: [],
          total: data.length
        };

        // Process each row
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
          try {
            // Validate required fields
            if (!row.Name || !row.Code || !row.Email || !row.Password) {
              results.failed.push({
                row: i + 2, // +2 because Excel rows start at 1 and we have header
                data: row,
                error: 'Missing required fields (Name, Code, Email, Password)'
              });
              continue;
            }

            // Check if college code already exists
            const existingCollege = await College.findOne({ code: row.Code.toString().toUpperCase() });
            if (existingCollege) {
              results.failed.push({
                row: i + 2,
                data: row,
                error: `College code '${row.Code}' already exists`
              });
              continue;
            }

            // Check if email already exists
            const existingEmail = await College.findOne({ email: row.Email.toString().toLowerCase() });
            if (existingEmail) {
              results.failed.push({
                row: i + 2,
                data: row,
                error: `Email '${row.Email}' already exists`
              });
              continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(row.Password.toString(), 10);

            // Create college object
            const collegeData = {
              institute: instituteId,
              name: row.Name.toString().trim(),
              code: row.Code.toString().toUpperCase(),
              email: row.Email.toString().toLowerCase(),
              password: hashedPassword,
              contactNumber: row['Contact Number'] ? row['Contact Number'].toString() : '',
              address: {
                line1: row['Address Line 1'] ? row['Address Line 1'].toString() : '',
                line2: row['Address Line 2'] ? row['Address Line 2'].toString() : '',
                city: row.City ? row.City.toString() : '',
                state: row.State ? row.State.toString() : '',
                country: row.Country ? row.Country.toString() : '',
                pincode: row.Pincode ? row.Pincode.toString() : ''
              },
              website: row.Website ? row.Website.toString() : '',
              type: row.Type || 'Other'
            };

            // Create and save college
            const college = new College(collegeData);
            await college.save();

            results.successful.push({
              row: i + 2,
              name: college.name,
              code: college.code,
              email: college.email
            });

          } catch (error) {
            results.failed.push({
              row: i + 2,
              data: row,
              error: error.message
            });
          }
        }

        res.status(200).json({
          message: `Bulk upload completed. ${results.successful.length} colleges created, ${results.failed.length} failed.`,
          results
        });

      } catch (error) {
        console.error("Excel parsing error:", error);
        res.status(500).json({ error: "Failed to parse Excel file" });
      }
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Failed to process bulk upload" });
  }
});

module.exports = router;
