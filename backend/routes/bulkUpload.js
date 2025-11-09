const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const excelParser = require('../utils/excelParser');
const emailService = require('../services/emailService');
const Student = require('../model/student');
const College = require('../model/college');
const bcrypt = require('bcryptjs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/bulk');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

// Middleware to check authentication and role
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Bulk upload students (Faculty only)
router.post('/students', requireAuth, requireRole(['faculty']), upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    filePath = req.file.path;
    console.log(`📁 Processing student bulk upload by faculty ${req.user._id}`);

    // Parse Excel file
    const parseResult = excelParser.parseFile(filePath, 'student');
    
    if (parseResult.valid.length === 0) {
      return res.status(400).json({
        message: 'No valid student records found',
        summary: parseResult.summary,
        invalidRecords: parseResult.invalid
      });
    }

    // Process valid students
    const processResults = {
      total: parseResult.valid.length,
      created: 0,
      failed: 0,
      emailsSent: 0,
      emailsFailed: 0,
      details: [],
      emailResults: []
    };

    for (const studentData of parseResult.valid) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ email: studentData.email });
        if (existingStudent) {
          processResults.failed++;
          processResults.details.push({
            email: studentData.email,
            status: 'failed',
            error: 'Student with this email already exists'
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(studentData.password, 10);
        
        // Create student record
        const newStudent = new Student({
          ...studentData,
          password: hashedPassword,
          faculty: req.user._id, // Link to uploading faculty
          college: req.user.college,
          department: req.user.department
        });

        await newStudent.save();
        processResults.created++;
        
        processResults.details.push({
          email: studentData.email,
          name: studentData.name,
          status: 'created',
          studentId: newStudent._id
        });

        // Send welcome email
        console.log(`📧 Attempting to send email to: ${studentData.email}`);
        try {
          const emailResult = await emailService.sendEmail(
            studentData.email,
            'student',
            {
              name: studentData.name,
              email: studentData.email,
              password: studentData.password // Send original password in email
            },
            {
              uploadedBy: req.user.email || 'unknown',
              uploadType: 'bulk_students',
              facultyId: req.user._id
            }
          );

          console.log(`📧 Email result for ${studentData.email}:`, emailResult);

          if (emailResult.success) {
            processResults.emailsSent++;
            console.log(`✅ Email sent successfully to ${studentData.email}`);
          } else {
            processResults.emailsFailed++;
            console.log(`❌ Email failed for ${studentData.email}:`, emailResult.error);
          }

          processResults.emailResults.push(emailResult);

        } catch (emailError) {
          console.error(`❌ Email sending failed for ${studentData.email}:`, emailError);
          processResults.emailsFailed++;
          processResults.emailResults.push({
            success: false,
            recipient: studentData.email,
            error: emailError.message
          });
        }

      } catch (error) {
        console.error(`Failed to create student ${studentData.email}:`, error);
        processResults.failed++;
        processResults.details.push({
          email: studentData.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: 'Bulk student upload completed',
      parseResults: parseResult.summary,
      processResults,
      invalidRecords: parseResult.invalid.length > 0 ? parseResult.invalid : undefined
    });

  } catch (error) {
    console.error('Bulk student upload error:', error);
    
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(500).json({
      message: 'Bulk upload failed',
      error: error.message
    });
  }
});

// Bulk upload colleges (Institute only)
router.post('/colleges', requireAuth, requireRole(['institute']), upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    filePath = req.file.path;
    console.log(`📁 Processing college bulk upload by institute ${req.user._id}`);

    // Parse Excel file
    const parseResult = excelParser.parseFile(filePath, 'college');
    
    if (parseResult.valid.length === 0) {
      return res.status(400).json({
        message: 'No valid college records found',
        summary: parseResult.summary,
        invalidRecords: parseResult.invalid
      });
    }

    // Process valid colleges
    const processResults = {
      total: parseResult.valid.length,
      created: 0,
      failed: 0,
      emailsSent: 0,
      emailsFailed: 0,
      details: [],
      emailResults: []
    };

    for (const collegeData of parseResult.valid) {
      try {
        // Check if college already exists
        const existingCollege = await College.findOne({ 
          $or: [
            { email: collegeData.email },
            { code: collegeData.code }
          ]
        });
        
        if (existingCollege) {
          processResults.failed++;
          processResults.details.push({
            email: collegeData.email,
            code: collegeData.code,
            status: 'failed',
            error: 'College with this email or code already exists'
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(collegeData.password, 10);
        
        // Create college record
        const newCollege = new College({
          ...collegeData,
          password: hashedPassword,
          institute: req.user._id, // Link to uploading institute
          status: collegeData.status || 'active'
        });

        await newCollege.save();
        processResults.created++;
        
        processResults.details.push({
          email: collegeData.email,
          name: collegeData.name,
          code: collegeData.code,
          status: 'created',
          collegeId: newCollege._id
        });

        // Send welcome email
        try {
          const emailResult = await emailService.sendEmail(
            collegeData.email,
            'college',
            {
              name: collegeData.name,
              email: collegeData.email,
              password: collegeData.password // Send original password in email
            },
            {
              uploadedBy: req.user.email,
              uploadType: 'bulk_colleges',
              instituteId: req.user._id
            }
          );

          if (emailResult.success) {
            processResults.emailsSent++;
          } else {
            processResults.emailsFailed++;
          }

          processResults.emailResults.push(emailResult);

        } catch (emailError) {
          console.error(`Email sending failed for ${collegeData.email}:`, emailError);
          processResults.emailsFailed++;
          processResults.emailResults.push({
            success: false,
            recipient: collegeData.email,
            error: emailError.message
          });
        }

      } catch (error) {
        console.error(`Failed to create college ${collegeData.email}:`, error);
        processResults.failed++;
        processResults.details.push({
          email: collegeData.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: 'Bulk college upload completed',
      parseResults: parseResult.summary,
      processResults,
      invalidRecords: parseResult.invalid.length > 0 ? parseResult.invalid : undefined
    });

  } catch (error) {
    console.error('Bulk college upload error:', error);
    
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(500).json({
      message: 'Bulk upload failed',
      error: error.message
    });
  }
});

// Download Excel templates
router.get('/template/students', requireAuth, requireRole(['faculty']), (req, res) => {
  try {
    const template = excelParser.generateStudentTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
    
    const buffer = XLSX.write(template.workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
    
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ message: 'Failed to generate template' });
  }
});

router.get('/template/colleges', requireAuth, requireRole(['institute']), (req, res) => {
  try {
    const template = excelParser.generateCollegeTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
    
    const XLSX = require('xlsx');
    const buffer = XLSX.write(template.workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
    
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ message: 'Failed to generate template' });
  }
});

// Get bulk upload history/logs
router.get('/history', requireAuth, (req, res) => {
  // This would typically query a logs collection
  // For now, return a simple response
  res.json({
    message: 'Bulk upload history',
    note: 'Check server logs for detailed upload history'
  });
});

// Test email configuration
router.post('/test-email', requireAuth, requireRole(['faculty', 'institute']), async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email address is required' });
    }

    // Verify email service connection
    const connectionValid = await emailService.verifyConnection();
    if (!connectionValid) {
      return res.status(500).json({ message: 'Email service connection failed' });
    }

    // Send test email based on user role
    const template = req.user.role === 'faculty' ? 'student' : 'college';
    const testData = template === 'student' 
      ? { name: 'Test Student', email: testEmail, password: 'TestPass123' }
      : { name: 'Test College', email: testEmail, password: 'TestPass123' };

    const result = await emailService.sendEmail(
      testEmail,
      template,
      testData,
      { testEmail: true, sentBy: req.user.email }
    );

    res.json({
      message: 'Test email sent',
      result: result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;
