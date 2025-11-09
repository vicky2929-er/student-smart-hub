const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Student = require("../model/student");
const Faculty = require("../model/faculty");
const bcrypt = require("bcryptjs");
const { requireAuth } = require("../middleware/auth");
const emailService = require("../services/emailService");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedMimes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Bulk student upload route
router.post(
  "/bulk-upload",
  requireAuth,
  upload.single("excelFile"),
  async (req, res) => {
    try {
      console.log("=== BULK STUDENT UPLOAD ===");
      console.log("Request user:", req.user);
      console.log("File:", req.file);

      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No Excel file uploaded" });
      }

      // Find the faculty
      const faculty = await Faculty.findById(req.user._id).populate(
        "department"
      );
      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      console.log("Faculty found:", faculty.name);

      // Parse the Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log("Parsed Excel data:", data);

      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ error: "Excel file is empty or invalid" });
      }

      // Validate required columns - using exact model field names
      const requiredColumns = ["name.first", "name.last", "email", "studentID"];
      const firstRow = data[0];
      const missingColumns = requiredColumns.filter(
        (col) => !(col in firstRow)
      );

      if (missingColumns.length > 0) {
        return res.status(400).json({
          error: `Missing required columns: ${missingColumns.join(", ")}`,
          note: "Required columns: name.first, name.last, email, studentID",
        });
      }

      const results = {
        success: [],
        errors: [],
        duplicates: [],
        emailResults: {
          sent: 0,
          failed: 0,
          details: []
        }
      };

      // Process each student
      for (let i = 0; i < data.length; i++) {
        const studentData = data[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we skip header

        try {
          // Validate required fields - using exact model field names
          if (
            !studentData["name.first"] ||
            !studentData["name.last"] ||
            !studentData.email ||
            !studentData.studentID
          ) {
            results.errors.push({
              row: rowNumber,
              data: studentData,
              error: "Missing required fields",
            });
            continue;
          }

          // Check if student already exists
          const existingStudent = await Student.findOne({
            $or: [
              { email: studentData.email },
              { studentID: studentData.studentID },
            ],
          });

          if (existingStudent) {
            results.duplicates.push({
              row: rowNumber,
              data: studentData,
              existing: existingStudent.email,
            });
            continue;
          }

          // Generate password (default or from Excel)
          const password =
            studentData.password || `${studentData.studentID}@123`;
          const hashedPassword = await bcrypt.hash(password, 10);

          // Parse skills array if provided as comma-separated string
          let skillsObject = {
            technical: [],
            soft: [],
          };
          if (studentData.skills) {
            const skillsArray = studentData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill);
            // Put all skills in technical by default, can be categorized later
            skillsObject.technical = skillsArray;
          }

          // Validate gender field
          const validGenders = ["Male", "Female", "Other"];
          const genderValue = studentData.gender?.trim();
          const isValidGender =
            genderValue && validGenders.includes(genderValue);

          // Create student object using exact model field names
          const studentObj = {
            name: {
              first: studentData["name.first"].trim(),
              last: studentData["name.last"]?.trim() || "",
            },
            email: studentData.email.toLowerCase().trim(),
            password: hashedPassword,
            studentID: studentData.studentID.toString().trim(),
            department: faculty.department._id,
            coordinator: faculty._id,
            contactNumber: studentData.contactNumber || "",
            address: {
              line1: studentData["address.line1"] || "",
              line2: studentData["address.line2"] || "",
              city: studentData["address.city"] || "",
              state: studentData["address.state"] || "",
              country: studentData["address.country"] || "",
              pincode: studentData["address.pincode"] || "",
            },
            enrollmentYear: studentData.enrollmentYear
              ? parseInt(studentData.enrollmentYear)
              : new Date().getFullYear(),
            batch: studentData.batch || new Date().getFullYear().toString(),
            skills: skillsObject,
            status: studentData.status || "Active",
          };

          // Only add optional fields if they have valid values
          if (studentData.dob) {
            studentObj.dob = new Date(studentData.dob);
          }

          if (isValidGender) {
            studentObj.gender = genderValue;
          }

          if (studentData.gpa && !isNaN(parseFloat(studentData.gpa))) {
            studentObj.gpa = parseFloat(studentData.gpa);
          }

          if (
            studentData.attendance &&
            !isNaN(parseFloat(studentData.attendance))
          ) {
            studentObj.attendance = parseFloat(studentData.attendance);
          }

          const newStudent = new Student(studentObj);

          // Save student
          const savedStudent = await newStudent.save();

          // Add student to faculty's students array
          faculty.students.push(savedStudent._id);

          results.success.push({
            row: rowNumber,
            studentId: savedStudent._id,
            name: `${savedStudent.name.first} ${savedStudent.name.last}`,
            email: savedStudent.email,
            studentID: savedStudent.studentID,
          });

          // Send welcome email
          console.log(`📧 Attempting to send email to: ${savedStudent.email}`);
          try {
            const emailResult = await emailService.sendEmail(
              savedStudent.email,
              'student',
              {
                name: `${savedStudent.name.first} ${savedStudent.name.last}`,
                email: savedStudent.email,
                password: password // Send original password in email
              },
              {
                uploadedBy: faculty.email || 'faculty',
                uploadType: 'bulk_students',
                facultyId: faculty._id,
                studentId: savedStudent._id
              }
            );

            if (emailResult.success) {
              results.emailResults.sent++;
              console.log(`✅ Email sent successfully to ${savedStudent.email}`);
            } else {
              results.emailResults.failed++;
              console.log(`❌ Email failed for ${savedStudent.email}:`, emailResult.error);
            }

            results.emailResults.details.push({
              email: savedStudent.email,
              name: `${savedStudent.name.first} ${savedStudent.name.last}`,
              success: emailResult.success,
              messageId: emailResult.messageId,
              error: emailResult.error
            });

          } catch (emailError) {
            console.error(`❌ Email sending failed for ${savedStudent.email}:`, emailError);
            results.emailResults.failed++;
            results.emailResults.details.push({
              email: savedStudent.email,
              name: `${savedStudent.name.first} ${savedStudent.name.last}`,
              success: false,
              error: emailError.message
            });
          }
        } catch (error) {
          console.error(`Error processing student at row ${rowNumber}:`, error);
          results.errors.push({
            row: rowNumber,
            data: studentData,
            error: error.message,
          });
        }
      }

      // Save faculty with updated students array
      await faculty.save();

      console.log(`📊 Bulk upload completed. Email summary:`, {
        totalEmails: results.success.length,
        emailsSent: results.emailResults.sent,
        emailsFailed: results.emailResults.failed
      });

      res.json({
        message: "Bulk upload completed",
        results: results,
        summary: {
          totalProcessed: data.length,
          successful: results.success.length,
          errors: results.errors.length,
          duplicates: results.duplicates.length,
          emailsSent: results.emailResults.sent,
          emailsFailed: results.emailResults.failed,
        },
      });
    } catch (error) {
      console.error("Error in bulk upload:", error);
      res.status(500).json({
        error: "Internal server error during bulk upload",
        details: error.message,
      });
    }
  }
);

// Download Excel template route
router.get("/download-template", (req, res) => {
  try {
    // Create a comprehensive Excel template using exact Student model field names
    const templateData = [
      {
        // Required fields
        "name.first": "John",
        "name.last": "Doe",
        email: "john.doe@example.com",
        studentID: "STU001",

        // Optional personal details
        dob: "2000-01-15", // Date format: YYYY-MM-DD
        gender: "Male", // Male, Female, Other
        contactNumber: "+91-9876543210",

        // Address fields (all optional)
        "address.line1": "123 Main Street",
        "address.line2": "Apartment 4B",
        "address.city": "Mumbai",
        "address.state": "Maharashtra",
        "address.country": "India",
        "address.pincode": "400001",

        // Academic details (optional)
        enrollmentYear: 2023,
        batch: "2023-2027",
        gpa: 8.5, // Number (0-10)
        attendance: 85.5, // Percentage

        // Skills (comma-separated)
        skills: "JavaScript, Python, React, Node.js",

        // System fields (optional)
        password: "STU001@123", // If not provided, studentID@123 will be used
        status: "Active", // Active, Inactive
      },
      {
        // Required fields
        "name.first": "Jane",
        "name.last": "Smith",
        email: "jane.smith@example.com",
        studentID: "STU002",

        // Optional personal details
        dob: "2001-03-22",
        gender: "Female",
        contactNumber: "+91-9876543211",

        // Address fields
        "address.line1": "456 Oak Avenue",
        "address.line2": "",
        "address.city": "Delhi",
        "address.state": "Delhi",
        "address.country": "India",
        "address.pincode": "110001",

        // Academic details
        enrollmentYear: 2023,
        batch: "2023-2027",
        gpa: 9.2,
        attendance: 92.0,

        // Skills
        skills: "Java, Spring Boot, MySQL, Angular",

        // System fields
        password: "STU002@123",
        status: "Active",
      },
      {
        // Minimal required data example
        "name.first": "Mike",
        "name.last": "Johnson",
        email: "mike.johnson@example.com",
        studentID: "STU003",

        // All other fields can be left empty and will use defaults
        dob: "",
        // gender: "", // Leave empty or use "Male", "Female", "Other"
        contactNumber: "",
        "address.line1": "",
        "address.line2": "",
        "address.city": "",
        "address.state": "",
        "address.country": "",
        "address.pincode": "",
        enrollmentYear: "",
        batch: "",
        gpa: "",
        attendance: "",
        skills: "",
        password: "", // Will auto-generate STU003@123
        status: "", // Will default to Active
      },
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 15 }, // name.first
      { wch: 15 }, // name.last
      { wch: 25 }, // email
      { wch: 12 }, // studentID
      { wch: 12 }, // dob
      { wch: 10 }, // gender
      { wch: 15 }, // contactNumber
      { wch: 20 }, // address.line1
      { wch: 15 }, // address.line2
      { wch: 15 }, // address.city
      { wch: 15 }, // address.state
      { wch: 10 }, // address.country
      { wch: 10 }, // address.pincode
      { wch: 15 }, // enrollmentYear
      { wch: 12 }, // batch
      { wch: 8 }, // gpa
      { wch: 12 }, // attendance
      { wch: 30 }, // skills
      { wch: 15 }, // password
      { wch: 10 }, // status
    ];
    worksheet["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Add instructions sheet
    const instructionsData = [
      {
        Field: "REQUIRED FIELDS",
        Description: "These fields must be filled",
        "Example/Notes": "",
      },
      {
        Field: "name.first",
        Description: "Student's first name",
        "Example/Notes": "John",
      },
      {
        Field: "name.last",
        Description: "Student's last name",
        "Example/Notes": "Doe",
      },
      {
        Field: "email",
        Description: "Unique email address",
        "Example/Notes": "john.doe@example.com",
      },
      {
        Field: "studentID",
        Description: "Unique student ID/Roll number",
        "Example/Notes": "STU001",
      },
      { Field: "", Description: "", "Example/Notes": "" },
      {
        Field: "OPTIONAL FIELDS",
        Description: "These fields can be empty",
        "Example/Notes": "",
      },
      {
        Field: "dob",
        Description: "Date of birth",
        "Example/Notes": "2000-01-15 (YYYY-MM-DD)",
      },
      {
        Field: "gender",
        Description: "Student's gender (leave empty if not specified)",
        "Example/Notes": "Male, Female, Other (exact values only)",
      },
      {
        Field: "contactNumber",
        Description: "Phone number",
        "Example/Notes": "+91-9876543210",
      },
      {
        Field: "address.line1",
        Description: "Address line 1",
        "Example/Notes": "123 Main Street",
      },
      {
        Field: "address.line2",
        Description: "Address line 2",
        "Example/Notes": "Apartment 4B",
      },
      { Field: "address.city", Description: "City", "Example/Notes": "Mumbai" },
      {
        Field: "address.state",
        Description: "State",
        "Example/Notes": "Maharashtra",
      },
      {
        Field: "address.country",
        Description: "Country",
        "Example/Notes": "India",
      },
      {
        Field: "address.pincode",
        Description: "PIN/ZIP code",
        "Example/Notes": "400001",
      },
      {
        Field: "enrollmentYear",
        Description: "Year of enrollment",
        "Example/Notes": "2023",
      },
      {
        Field: "batch",
        Description: "Batch identifier",
        "Example/Notes": "2023-2027",
      },
      {
        Field: "gpa",
        Description: "Grade Point Average",
        "Example/Notes": "8.5 (0-10 scale)",
      },
      {
        Field: "attendance",
        Description: "Attendance percentage",
        "Example/Notes": "85.5",
      },
      {
        Field: "skills",
        Description: "Comma-separated skills",
        "Example/Notes": "JavaScript, Python, React",
      },
      {
        Field: "password",
        Description: "Login password",
        "Example/Notes": "If empty, uses studentID@123",
      },
      {
        Field: "status",
        Description: "Student status",
        "Example/Notes": "Active, Inactive (default: Active)",
      },
      { Field: "", Description: "", "Example/Notes": "" },
      { Field: "IMPORTANT NOTES", Description: "", "Example/Notes": "" },
      {
        Field: "• Department and coordinator",
        Description: "Automatically assigned from faculty",
        "Example/Notes": "",
      },
      {
        Field: "• Email and studentID",
        Description: "Must be unique across all students",
        "Example/Notes": "",
      },
      {
        Field: "• Date format",
        Description: "Use YYYY-MM-DD for dates",
        "Example/Notes": "",
      },
      {
        Field: "• Skills format",
        Description: "Separate multiple skills with commas",
        "Example/Notes": "",
      },
      {
        Field: "• Gender values",
        Description: "Must be exactly: Male, Female, or Other (or leave empty)",
        "Example/Notes": "",
      },
      {
        Field: "• File format",
        Description: "Save as .xlsx or .xls format",
        "Example/Notes": "",
      },
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet["!cols"] = [
      { wch: 25 }, // Field
      { wch: 35 }, // Description
      { wch: 40 }, // Example/Notes
    ];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_bulk_upload_template.xlsx"
    );

    // Send the file
    res.send(excelBuffer);
  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
});

// Single student creation route
router.post("/single-student", requireAuth, async (req, res) => {
  try {
    console.log("=== SINGLE STUDENT CREATION ===");
    console.log("Request user:", req.user);
    console.log("Student data:", req.body);

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find the faculty
    const faculty = await Faculty.findById(req.user._id).populate("department");
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const studentData = req.body;

    // Validate required fields
    if (
      !studentData["name.first"] ||
      !studentData["name.last"] ||
      !studentData.email ||
      !studentData.studentID
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: name.first, name.last, email, studentID",
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email: studentData.email }, { studentID: studentData.studentID }],
    });

    if (existingStudent) {
      return res.status(400).json({
        error: "Student with this email or student ID already exists",
      });
    }

    // Generate password (default or from form)
    const password = studentData.password || `${studentData.studentID}@123`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate gender field
    const validGenders = ["Male", "Female", "Other"];
    const genderValue = studentData.gender?.trim();
    const isValidGender = genderValue && validGenders.includes(genderValue);

    // Parse skills array if provided as comma-separated string
    let skillsObject = {
      technical: [],
      soft: [],
    };
    if (studentData.skills && Array.isArray(studentData.skills)) {
      const skillsArray = studentData.skills.filter(
        (skill) => skill && skill.trim()
      );
      skillsObject.technical = skillsArray;
    }

    // Create student object using exact model field names
    const studentObj = {
      name: {
        first: studentData["name.first"].trim(),
        last: studentData["name.last"]?.trim() || "",
      },
      email: studentData.email.toLowerCase().trim(),
      password: hashedPassword,
      studentID: studentData.studentID.toString().trim(),
      department: faculty.department._id,
      coordinator: faculty._id,
      contactNumber: studentData.contactNumber || "",
      address: {
        line1: studentData["address.line1"] || "",
        line2: studentData["address.line2"] || "",
        city: studentData["address.city"] || "",
        state: studentData["address.state"] || "",
        country: studentData["address.country"] || "",
        pincode: studentData["address.pincode"] || "",
      },
      enrollmentYear: studentData.enrollmentYear
        ? parseInt(studentData.enrollmentYear)
        : new Date().getFullYear(),
      batch: studentData.batch || new Date().getFullYear().toString(),
      skills: skillsObject,
      status: studentData.status || "Active",
    };

    // Only add optional fields if they have valid values
    if (studentData.dob) {
      studentObj.dob = new Date(studentData.dob);
    }

    if (isValidGender) {
      studentObj.gender = genderValue;
    }

    if (studentData.gpa && !isNaN(parseFloat(studentData.gpa))) {
      studentObj.gpa = parseFloat(studentData.gpa);
    }

    if (studentData.attendance && !isNaN(parseFloat(studentData.attendance))) {
      studentObj.attendance = parseFloat(studentData.attendance);
    }

    const newStudent = new Student(studentObj);

    // Save student
    const savedStudent = await newStudent.save();

    // Add student to faculty's students array
    faculty.students.push(savedStudent._id);
    await faculty.save();

    console.log("Student created successfully:", savedStudent._id);

    res.json({
      message: "Student created successfully",
      student: {
        id: savedStudent._id,
        name: `${savedStudent.name.first} ${savedStudent.name.last}`,
        email: savedStudent.email,
        studentID: savedStudent.studentID,
      },
    });
  } catch (error) {
    console.error("Single student creation error:", error);
    res.status(500).json({
      error: "Server error during student creation",
      details: error.message,
    });
  }
});

module.exports = router;
