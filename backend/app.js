require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const dbUrl = process.env.DBURL;
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// Routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const studentRoutes = require("./routes/students");
const facultyRoutes = require("./routes/faculty");
const collegeRoutes = require("./routes/college");
const departmentRoutes = require("./routes/department");
const instituteRoutes = require("./routes/institute");
const eventRoutes = require("./routes/events");
const roadmapRoutes = require("./routes/roadmap");
const bulkStudentsRoutes = require("./routes/bulkStudents");
const bulkCollegesRoutes = require("./routes/bulkColleges");
const bulkUploadRoutes = require("./routes/bulkUpload");
const instituteRequestRoutes = require("./routes/instituteRequests");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/bulk-students", bulkStudentsRoutes);
app.use("/api/bulk-colleges", bulkCollegesRoutes);
app.use("/api/bulk-upload", bulkUploadRoutes);
app.use("/api/institute-requests", instituteRequestRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    port: process.env.PORT || 3030,
  });
});

// Test route to create a sample user (for development only)
app.post("/api/test/create-user", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Student = require("./model/student");

    // Check if test user already exists
    const existingUser = await Student.findOne({ email: "test@student.com" });
    if (existingUser) {
      return res.json({
        message: "Test user already exists",
        email: "test@student.com",
        password: "password123",
        userId: existingUser._id,
      });
    }

    // Temporarily modify the student schema to make department optional
    // This is just for testing - in production you'd have proper department setup
    const studentData = {
      name: { first: "Test", last: "Student" },
      studentID: "TEST001",
      email: "test@student.com",
      password: await bcrypt.hash("password123", 12),
      batch: "2024",
      enrollmentYear: 2024,
      gpa: 8.5,
      attendance: 85,
    };

    // Create the student without department validation for testing
    const testStudent = new Student(studentData);

    // Remove the department requirement temporarily for this test
    testStudent.department = new mongoose.Types.ObjectId(); // Use a dummy ObjectId

    await testStudent.save();
    res.json({
      message: "Test user created successfully",
      email: "test@student.com",
      password: "password123",
      userId: testStudent._id,
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    res
      .status(500)
      .json({ error: "Failed to create test user", details: error.message });
  }
});

// Test route to create a sample faculty (for development only)
app.post("/api/test/create-faculty", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Faculty = require("./model/faculty");
    const Student = require("./model/student");

    // Check if test faculty already exists
    const existingFaculty = await Faculty.findOne({
      email: "test@faculty.com",
    });
    if (existingFaculty) {
      return res.json({
        message: "Test faculty already exists",
        email: "test@faculty.com",
        password: "password123",
        facultyId: existingFaculty._id,
      });
    }

    // Get all students to assign to faculty
    const students = await Student.find({});
    const studentIds = students.map((student) => student._id);

    const facultyData = {
      name: { first: "Test", last: "Faculty" },
      facultyID: "FAC001",
      email: "test@faculty.com",
      password: await bcrypt.hash("password123", 12),
      designation: "Professor",
      contactNumber: "+1234567890",
      isCoordinator: true,
      students: studentIds,
      department: new mongoose.Types.ObjectId(), // Use a dummy ObjectId
    };

    const testFaculty = new Faculty(facultyData);
    await testFaculty.save();

    res.json({
      message: "Test faculty created successfully",
      email: "test@faculty.com",
      password: "password123",
      facultyId: testFaculty._id,
      studentsAssigned: studentIds.length,
    });
  } catch (error) {
    console.error("Error creating test faculty:", error);
    res
      .status(500)
      .json({ error: "Failed to create test faculty", details: error.message });
  }
});

// Test route to create a sample institute (for development only)
app.post("/api/test/create-institute", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Institute = require("./model/institute");
    const College = require("./model/college");
    const Department = require("./model/department");
    const Faculty = require("./model/faculty");
    const Student = require("./model/student");
    const Event = require("./model/event");

    // Check if test institute already exists
    const existingInstitute = await Institute.findOne({
      email: "test@institute.com",
    });
    if (existingInstitute) {
      return res.json({
        message: "Test institute already exists",
        email: "test@institute.com",
        password: "password123",
        instituteId: existingInstitute._id,
        institute: existingInstitute,
      });
    }

    // Create institute
    const instituteData = {
      name: "Test University",
      code: "TU001",
      type: "University",
      email: "test@institute.com",
      password: await bcrypt.hash("password123", 12),
      contactNumber: "+91-9876543200",
      address: {
        line1: "123 University Road",
        city: "Test City",
        state: "Test State",
        country: "India",
        pincode: "123456",
      },
      website: "https://testuniversity.edu",
      status: "Active",
      approvalStatus: "Approved",
    };

    const testInstitute = new Institute(instituteData);
    await testInstitute.save();

    // Create sample colleges under this institute
    const collegeData = [
      {
        institute: testInstitute._id,
        name: "College of Engineering",
        code: "COE",
        type: "Engineering College",
        email: "coe@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        contactNumber: "+91-9876543201",
        address: {
          line1: "Engineering Block",
          city: "Test City",
          state: "Test State",
          country: "India",
          pincode: "123456",
        },
        status: "Active",
      },
      {
        institute: testInstitute._id,
        name: "Medical Sciences College",
        code: "MSC",
        type: "Medical College",
        email: "msc@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        contactNumber: "+91-9876543202",
        address: {
          line1: "Medical Block",
          city: "Test City",
          state: "Test State",
          country: "India",
          pincode: "123456",
        },
        status: "Active",
      },
    ];

    const createdColleges = await College.insertMany(collegeData);

    // Create departments for each college
    const departmentData = [
      // Engineering College Departments
      {
        college: createdColleges[0]._id,
        institute: testInstitute._id,
        name: "Computer Science Engineering",
        code: "CSE",
        email: "cse@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        contactNumber: "+91-9876543210",
        status: "Active",
      },
      {
        college: createdColleges[0]._id,
        institute: testInstitute._id,
        name: "Mechanical Engineering",
        code: "ME",
        email: "me@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        contactNumber: "+91-9876543211",
        status: "Active",
      },
      // Medical College Departments
      {
        college: createdColleges[1]._id,
        institute: testInstitute._id,
        name: "General Medicine",
        code: "GM",
        email: "gm@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        contactNumber: "+91-9876543212",
        status: "Active",
      },
    ];

    const createdDepartments = await Department.insertMany(departmentData);

    // Create faculty for departments
    const facultyData = [
      {
        department: createdDepartments[0]._id,
        name: { first: "Dr. Rajesh", last: "Kumar" },
        facultyID: "FAC001",
        email: "rajesh.kumar@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        designation: "Professor",
        contactNumber: "+91-9876543220",
        status: "Active",
      },
      {
        department: createdDepartments[0]._id,
        name: { first: "Dr. Priya", last: "Sharma" },
        facultyID: "FAC002",
        email: "priya.sharma@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        designation: "Associate Professor",
        contactNumber: "+91-9876543221",
        status: "Active",
      },
      {
        department: createdDepartments[1]._id,
        name: { first: "Dr. Amit", last: "Verma" },
        facultyID: "FAC003",
        email: "amit.verma@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        designation: "Professor",
        contactNumber: "+91-9876543222",
        status: "Active",
      },
    ];

    const createdFaculty = await Faculty.insertMany(facultyData);

    // Create students
    const studentData = [
      {
        department: createdDepartments[0]._id,
        name: { first: "Student", last: "One" },
        studentID: "STU001",
        email: "student1@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        batch: "2021-2025",
        enrollmentYear: 2021,
        gpa: 8.5,
        attendance: 85,
        status: "Active",
      },
      {
        department: createdDepartments[0]._id,
        name: { first: "Student", last: "Two" },
        studentID: "STU002",
        email: "student2@testuniversity.edu",
        password: await bcrypt.hash("password123", 12),
        batch: "2022-2026",
        enrollmentYear: 2022,
        gpa: 9.0,
        attendance: 90,
        status: "Active",
      },
    ];

    await Student.insertMany(studentData);

    // Create sample events
    const now = new Date();
    const eventData = [
      {
        title: "University Tech Fest 2024",
        description: "Annual technical festival",
        type: "Festival",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        duration: 8,
        location: "Main Auditorium",
        isOnline: false,
        maxParticipants: 500,
        organizer: createdFaculty[0]._id,
        department: createdDepartments[0]._id,
        college: createdColleges[0]._id,
        institute: testInstitute._id,
        status: "Active",
      },
      {
        title: "Medical Symposium",
        description: "Medical research symposium",
        type: "Symposium",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        duration: 6,
        location: "Medical Block",
        isOnline: false,
        maxParticipants: 200,
        organizer: createdFaculty[2]._id,
        department: createdDepartments[2]._id,
        college: createdColleges[1]._id,
        institute: testInstitute._id,
        status: "Active",
      },
    ];

    await Event.insertMany(eventData);

    // Update institute with college references
    testInstitute.colleges = createdColleges.map(c => c._id);
    await testInstitute.save();

    // Update colleges with department references
    for (let i = 0; i < createdColleges.length; i++) {
      const collegeDepts = createdDepartments.filter(d => 
        d.college.toString() === createdColleges[i]._id.toString()
      );
      createdColleges[i].departments = collegeDepts.map(d => d._id);
      await createdColleges[i].save();
    }

    // Update departments with faculty references
    for (let i = 0; i < createdDepartments.length; i++) {
      const deptFaculty = createdFaculty.filter(f => 
        f.department.toString() === createdDepartments[i]._id.toString()
      );
      createdDepartments[i].faculties = deptFaculty.map(f => f._id);
      if (deptFaculty.length > 0) {
        createdDepartments[i].hod = deptFaculty[0]._id;
      }
      await createdDepartments[i].save();
    }

    res.json({
      message: "Test institute with complete hierarchy created successfully",
      email: "test@institute.com",
      password: "password123",
      instituteId: testInstitute._id,
      collegesCreated: createdColleges.length,
      departmentsCreated: createdDepartments.length,
      facultyCreated: createdFaculty.length,
      studentsCreated: studentData.length,
      eventsCreated: eventData.length,
      institute: testInstitute,
    });
  } catch (error) {
    console.error("Error creating test institute:", error);
    res.status(500).json({
      error: "Failed to create test institute",
      details: error.message,
    });
  }
});

// Test route to create a sample SuperAdmin (for development only)
app.post("/api/test/create-superadmin", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const SuperAdmin = require("./model/superadmin");

    // Check if test superadmin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({
      email: "admin@sih2025.com",
    });
    if (existingSuperAdmin) {
      return res.json({
        message: "Test SuperAdmin already exists",
        email: "admin@sih2025.com",
        password: "admin123",
        superAdminId: existingSuperAdmin._id,
      });
    }

    const superAdminData = {
      name: { first: "Super", last: "Admin" },
      email: "admin@sih2025.com",
      password: await bcrypt.hash("admin123", 12),
      contactNumber: "+91-9999999999",
      permissions: ["full_access"],
      status: "Active",
    };

    const testSuperAdmin = new SuperAdmin(superAdminData);
    await testSuperAdmin.save();

    res.json({
      message: "Test SuperAdmin created successfully",
      email: "admin@sih2025.com",
      password: "admin123",
      superAdminId: testSuperAdmin._id,
    });
  } catch (error) {
    console.error("Error creating test SuperAdmin:", error);
    res.status(500).json({
      error: "Failed to create test SuperAdmin",
      details: error.message,
    });
  }
});

// Test route to create sample institute requests (for development only)
app.post("/api/test/create-institute-requests", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const crypto = require("crypto");
    const Institute = require("./model/institute");

    // Check if test requests already exist
    const existingRequests = await Institute.find({
      email: { $in: ["test1@university.edu", "test2@college.edu", "test3@institute.edu"] },
    });
    
    if (existingRequests.length > 0) {
      return res.json({
        message: "Test institute requests already exist",
        count: existingRequests.length,
        requests: existingRequests,
      });
    }

    const sampleRequests = [
      {
        name: "Test University of Technology",
        code: "TESU1234",
        aisheCode: "U-12345",
        type: "Government",
        email: "test1@university.edu",
        password: await bcrypt.hash(crypto.randomBytes(8).toString("hex"), 12),
        address: {
          line1: "123 University Road",
          city: "Mumbai",
          state: "Maharashtra",
          district: "Mumbai",
          country: "India",
          pincode: "400001",
        },
        headOfInstitute: {
          name: "Dr. Rajesh Kumar",
          email: "rajesh.kumar@university.edu",
          contact: "+91-9876543210",
          alternateContact: "+91-9876543211",
        },
        modalOfficer: {
          name: "Prof. Priya Sharma",
          email: "priya.sharma@university.edu",
          contact: "+91-9876543212",
          alternateContact: "+91-9876543213",
        },
        naacGrading: true,
        naacGrade: "A+",
        status: "Pending",
        approvalStatus: "Pending",
      },
      {
        name: "Test Engineering College",
        code: "TEEC5678",
        aisheCode: "C-67890",
        type: "Private",
        email: "test2@college.edu",
        password: await bcrypt.hash(crypto.randomBytes(8).toString("hex"), 12),
        address: {
          line1: "456 College Street",
          city: "Bangalore",
          state: "Karnataka",
          district: "Bangalore",
          country: "India",
          pincode: "560001",
        },
        headOfInstitute: {
          name: "Dr. Amit Verma",
          email: "amit.verma@college.edu",
          contact: "+91-9876543220",
          alternateContact: "+91-9876543221",
        },
        modalOfficer: {
          name: "Dr. Sunita Patel",
          email: "sunita.patel@college.edu",
          contact: "+91-9876543222",
          alternateContact: "+91-9876543223",
        },
        naacGrading: false,
        naacGrade: "",
        status: "Pending",
        approvalStatus: "Pending",
      },
      {
        name: "Test Autonomous Institute",
        code: "TEAI9999",
        aisheCode: "A-11111",
        type: "Autonomous",
        email: "test3@institute.edu",
        password: await bcrypt.hash(crypto.randomBytes(8).toString("hex"), 12),
        address: {
          line1: "789 Institute Avenue",
          city: "Chennai",
          state: "Tamil Nadu",
          district: "Chennai",
          country: "India",
          pincode: "600001",
        },
        headOfInstitute: {
          name: "Dr. Meera Nair",
          email: "meera.nair@institute.edu",
          contact: "+91-9876543230",
        },
        modalOfficer: {
          name: "Prof. Ravi Krishnan",
          email: "ravi.krishnan@institute.edu",
          contact: "+91-9876543231",
        },
        naacGrading: true,
        naacGrade: "A++",
        status: "Active",
        approvalStatus: "Approved",
      },
    ];

    const createdRequests = await Institute.insertMany(sampleRequests);

    res.json({
      message: "Test institute requests created successfully",
      count: createdRequests.length,
      requests: createdRequests,
    });
  } catch (error) {
    console.error("Error creating test institute requests:", error);
    res.status(500).json({
      error: "Failed to create test institute requests",
      details: error.message,
    });
  }
});

// Test route to create a sample department (for development only)
app.post("/api/test/create-department", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const Department = require("./model/department");
    const Faculty = require("./model/faculty");
    const Student = require("./model/student");
    const Event = require("./model/event");

    // Check if test department already exists
    let existingDepartment = await Department.findOne({
      email: "test@department.com",
    });

    if (existingDepartment) {
      // Update existing department with real data
      existingDepartment.name = "Computer Science";
      existingDepartment.code = "CSE";
      existingDepartment.contactNumber = "+91-9876543213";
      await existingDepartment.save();

      return res.json({
        message: "Test department already exists and updated",
        email: "test@department.com",
        password: "password123",
        departmentId: existingDepartment._id,
        department: existingDepartment,
      });
    }

    // Create department first
    const departmentData = {
      name: "Computer Science",
      code: "CSE",
      email: "test@department.com",
      password: await bcrypt.hash("password123", 12),
      contactNumber: "+91-9876543213",
      college: new mongoose.Types.ObjectId(),
      institute: new mongoose.Types.ObjectId(),
      faculties: [],
      status: "Active",
    };

    const testDepartment = new Department(departmentData);
    await testDepartment.save();

    // Create sample faculty members for the department
    const facultyMembers = [
      {
        name: { first: "Rajesh", last: "Kumar" },
        facultyID: "FAC001",
        email: "rajesh.kumar@dept.com",
        password: await bcrypt.hash("password123", 12),
        designation: "HOD",
        specialization: "Artificial Intelligence",
        contactNumber: "+91-9876543210",
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
      {
        name: { first: "Priya", last: "Sharma" },
        facultyID: "FAC002",
        email: "priya.sharma@dept.com",
        password: await bcrypt.hash("password123", 12),
        designation: "Associate Professor",
        specialization: "Machine Learning",
        contactNumber: "+91-9876543211",
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
      {
        name: { first: "Amit", last: "Verma" },
        facultyID: "FAC003",
        email: "amit.verma@dept.com",
        password: await bcrypt.hash("password123", 12),
        designation: "Assistant Professor",
        specialization: "Data Science",
        contactNumber: "+91-9876543212",
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
    ];

    const createdFaculty = await Faculty.insertMany(facultyMembers);
    const facultyIds = createdFaculty.map((f) => f._id);

    // Update department with faculty references and HOD
    testDepartment.faculties = facultyIds;
    testDepartment.hod = createdFaculty[0]._id; // Set first faculty as HOD
    await testDepartment.save();

    // Create sample students for the department
    const students = [
      {
        name: { first: "Student", last: "One" },
        studentID: "STU001",
        email: "student1@dept.com",
        password: await bcrypt.hash("password123", 12),
        batch: "2021-2025",
        enrollmentYear: 2021,
        gpa: 8.5,
        attendance: 85,
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
      },
      {
        name: { first: "Student", last: "Two" },
        studentID: "STU002",
        email: "student2@dept.com",
        password: await bcrypt.hash("password123", 12),
        batch: "2022-2026",
        enrollmentYear: 2022,
        gpa: 9.0,
        attendance: 90,
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
      },
    ];

    await Student.insertMany(students);

    // Create sample events for the department
    const now = new Date();
    const events = [
      {
        title: "AI Workshop",
        description: "Workshop on Artificial Intelligence fundamentals",
        type: "Workshop",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 4,
        location: "CS Department Lab",
        isOnline: false,
        maxParticipants: 50,
        organizer: createdFaculty[0]._id, // HOD as organizer
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
      {
        title: "Tech Symposium 2024",
        description: "Annual technical symposium for Computer Science students",
        type: "Symposium",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: 8,
        location: "Auditorium",
        isOnline: false,
        maxParticipants: 200,
        organizer: createdFaculty[1]._id,
        department: testDepartment._id,
        college: testDepartment.college,
        institute: testDepartment.institute,
        status: "Active",
      },
    ];

    await Event.insertMany(events);

    res.json({
      message: "Test department with sample data created successfully",
      email: "test@department.com",
      password: "password123",
      departmentId: testDepartment._id,
      facultyCreated: createdFaculty.length,
      studentsCreated: students.length,
      eventsCreated: events.length,
      department: testDepartment,
    });
  } catch (error) {
    console.error("Error creating test department:", error);
    res.status(500).json({
      error: "Failed to create test department",
      details: error.message,
    });
  }
});


// Serve React app (for production)
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch all handler for React routes (only for non-API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
