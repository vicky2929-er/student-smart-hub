const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const mongoose = require("mongoose");
const College = require("../model/college");
const Institute = require("../model/institute");
const bcrypt = require("bcryptjs");
const { requireAuth } = require("../middleware/auth");
const emailService = require("../services/emailService");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
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

// Download Excel template route
router.get("/download-template", (req, res) => {
  try {
    const templateData = [
      {
        // Required fields
        name: "College of Engineering",
        code: "COE",
        email: "coe@example.edu",
        // password (optional): if left empty, server will use CODE@123
        // institute (optional for institute role): auto-filled as the authenticated institute

        // Optional fields
        contactNumber: "+91-9999999999",
        line1: "123 University Road",
        line2: "",
        city: "City",
        state: "State",
        country: "India",
        pincode: "400001",
        website: "https://coe.example.edu",
        type: "Engineering College",
        status: "Active",
      },
      {
        name: "Medical Sciences College",
        code: "MSC",
        email: "msc@example.edu",
        // password: "MSC@123",
        // institute: "<OBJECT_ID_IF_NOT_INSTITUTE_ROLE>",
        contactNumber: "+91-8888888888",
        line1: "45 Health Ave",
        city: "City",
        state: "State",
        country: "India",
        pincode: "500001",
        website: "https://msc.example.edu",
        type: "Medical College",
        status: "Active",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Column widths
    worksheet["!cols"] = [
      { wch: 28 }, // name
      { wch: 10 }, // code
      { wch: 28 }, // email
      { wch: 14 }, // password
      { wch: 26 }, // institute
      { wch: 16 }, // contactNumber
      { wch: 24 }, // line1
      { wch: 18 }, // line2
      { wch: 14 }, // city
      { wch: 14 }, // state
      { wch: 12 }, // country
      { wch: 10 }, // pincode
      { wch: 28 }, // website
      { wch: 22 }, // type
      { wch: 10 }, // status
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Colleges");

    // Instructions sheet
    const instructions = [
      { Field: "REQUIRED FIELDS", Description: "These fields must be filled", Notes: "" },
      { Field: "name", Description: "College name", Notes: "e.g., College of Engineering" },
      { Field: "code", Description: "Unique college code", Notes: "Uppercase recommended (e.g., COE)" },
      { Field: "email", Description: "Unique email", Notes: "Used for login" },
      { Field: "password", Description: "Login password", Notes: "Optional; defaults to CODE@123" },
      { Field: "institute", Description: "Institute ObjectId", Notes: "Optional when logged in as institute; otherwise required" },
      { Field: "", Description: "", Notes: "" },
      { Field: "OPTIONAL FIELDS", Description: "Can be empty", Notes: "" },
      { Field: "contactNumber", Description: "College phone", Notes: "" },
      { Field: "line1/line2/city/state/country/pincode", Description: "Address fields", Notes: "" },
      { Field: "website", Description: "Website URL", Notes: "" },
      { Field: "type", Description: "College type", Notes: "Engineering, Medical, Arts, etc." },
      { Field: "status", Description: "Active/Inactive", Notes: "Defaults to Active" },
    ];
    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    instructionsSheet["!cols"] = [{ wch: 28 }, { wch: 36 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=college_bulk_upload_template.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Bulk college template error:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
});

// Bulk college upload route
router.post(
  "/bulk-upload",
  requireAuth,
  upload.single("excelFile"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No Excel file uploaded" });
      }
      // Parse the Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ error: "Excel file is empty or invalid" });
      }
      // Validate required columns
      const requiredColumns = ["name", "code", "email"]; // password & institute can be inferred
      const firstRow = data[0];
      const missingColumns = requiredColumns.filter(
        (col) => !(col in firstRow)
      );
      if (missingColumns.length > 0) {
        return res
          .status(400)
          .json({ error: `Missing columns: ${missingColumns.join(", ")}` });
      }
      // Prepare results tracking
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

      // Process each college
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we skip header

        try {
          // Check for required fields
          if (!row.name || !row.code || !row.email) {
            results.errors.push({
              row: rowNumber,
              data: row,
              error: "Missing required fields (name, code, email)"
            });
            continue;
          }

          // Check for duplicates
          const existingCollege = await College.findOne({
            $or: [
              { email: row.email.toLowerCase() },
              { code: row.code.toUpperCase() }
            ]
          });

          if (existingCollege) {
            results.duplicates.push({
              row: rowNumber,
              data: row,
              existing: existingCollege.email
            });
            continue;
          }

          // Determine institute from row or authenticated user
          let instituteId = row.institute;
          if (!instituteId && req.user?.role === "institute") {
            instituteId = req.user._id.toString();
          }
          if (!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)) {
            results.errors.push({
              row: rowNumber,
              data: row,
              error: "Invalid or missing institute ID"
            });
            continue;
          }

          // Prepare password (default to code@123 if not provided)
          const plainPassword = row.password || `${String(row.code).toUpperCase()}@123`;
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
          
          const collegeData = {
            name: row.name,
            code: row.code.toUpperCase(),
            email: row.email.toLowerCase(),
            password: hashedPassword,
            institute: instituteId,
            contactNumber: row.contactNumber || "",
            address: {
              line1: row.line1 || "",
              line2: row.line2 || "",
              city: row.city || "",
              state: row.state || "",
              country: row.country || "",
              pincode: row.pincode || "",
            },
            website: row.website || "",
            type: row.type || "Other",
            status: row.status || "Active",
          };

          // Create and save college
          const newCollege = new College(collegeData);
          const savedCollege = await newCollege.save();

          results.success.push({
            row: rowNumber,
            collegeId: savedCollege._id,
            name: savedCollege.name,
            email: savedCollege.email,
            code: savedCollege.code
          });

          // Send welcome email
          console.log(`📧 Attempting to send email to: ${savedCollege.email}`);
          try {
            const emailResult = await emailService.sendEmail(
              savedCollege.email,
              'college',
              {
                name: savedCollege.name,
                email: savedCollege.email,
                password: plainPassword // Send original password in email
              },
              {
                uploadedBy: req.user?.email || 'institute',
                uploadType: 'bulk_colleges',
                instituteId: instituteId,
                collegeId: savedCollege._id
              }
            );

            if (emailResult.success) {
              results.emailResults.sent++;
              console.log(`✅ Email sent successfully to ${savedCollege.email}`);
            } else {
              results.emailResults.failed++;
              console.log(`❌ Email failed for ${savedCollege.email}:`, emailResult.error);
            }

            results.emailResults.details.push({
              email: savedCollege.email,
              name: savedCollege.name,
              success: emailResult.success,
              messageId: emailResult.messageId,
              error: emailResult.error
            });

          } catch (emailError) {
            console.error(`❌ Email sending failed for ${savedCollege.email}:`, emailError);
            results.emailResults.failed++;
            results.emailResults.details.push({
              email: savedCollege.email,
              name: savedCollege.name,
              success: false,
              error: emailError.message
            });
          }

        } catch (error) {
          console.error(`Error processing college at row ${rowNumber}:`, error);
          results.errors.push({
            row: rowNumber,
            data: row,
            error: error.message
          });
        }
      }

      console.log(`📊 Bulk college upload completed. Email summary:`, {
        totalEmails: results.success.length,
        emailsSent: results.emailResults.sent,
        emailsFailed: results.emailResults.failed
      });

      res.json({
        message: "Bulk college upload completed",
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
      console.error("Bulk college upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
