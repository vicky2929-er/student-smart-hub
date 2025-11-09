const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

class ExcelParser {
  constructor() {
    this.defaultPassword = process.env.DEFAULT_PASSWORD || 'TempPass@123';
  }

  // Parse Excel/CSV file and return structured data
  parseFile(filePath, type = 'student') {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: ''
      });

      if (rawData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      const headers = rawData[0].map(header => 
        typeof header === 'string' ? header.toLowerCase().trim() : ''
      );
      const dataRows = rawData.slice(1);

      // Parse based on type
      if (type === 'student') {
        return this.parseStudentData(headers, dataRows);
      } else if (type === 'college') {
        return this.parseCollegeData(headers, dataRows);
      } else {
        throw new Error('Invalid type. Must be "student" or "college"');
      }

    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // Parse student data from Excel
  parseStudentData(headers, dataRows) {
    const results = {
      valid: [],
      invalid: [],
      summary: {
        total: dataRows.length,
        valid: 0,
        invalid: 0
      }
    };

    // Required fields for students
    const requiredFields = ['name', 'email'];
    const optionalFields = [
      'password', 'studentid', 'course', 'department', 'year', 'batch', 
      'enrollmentyear', 'cgpa', 'attendance', 'contactnumber', 'address',
      'emergencycontact', 'skills', 'interests', 'socialmedia'
    ];

    // Check if required headers exist
    const missingRequired = requiredFields.filter(field => 
      !headers.some(header => header.includes(field))
    );

    if (missingRequired.length > 0) {
      throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    // Process each row
    dataRows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      
      try {
        const studentData = this.extractStudentFields(headers, row);
        
        // Validate required fields
        const validation = this.validateStudentData(studentData);
        
        if (validation.isValid) {
          // Set default password if not provided
          if (!studentData.password) {
            studentData.password = this.defaultPassword;
          }
          
          results.valid.push({
            ...studentData,
            rowNumber
          });
          results.summary.valid++;
        } else {
          results.invalid.push({
            rowNumber,
            data: studentData,
            errors: validation.errors
          });
          results.summary.invalid++;
        }
      } catch (error) {
        results.invalid.push({
          rowNumber,
          data: row,
          errors: [`Row parsing error: ${error.message}`]
        });
        results.summary.invalid++;
      }
    });

    return results;
  }

  // Parse college data from Excel
  parseCollegeData(headers, dataRows) {
    const results = {
      valid: [],
      invalid: [],
      summary: {
        total: dataRows.length,
        valid: 0,
        invalid: 0
      }
    };

    // Required fields for colleges
    const requiredFields = ['name', 'code', 'email'];
    const optionalFields = [
      'password', 'institute', 'contactnumber', 'line1', 'line2', 
      'city', 'state', 'country', 'pincode', 'website', 'type', 'status'
    ];

    // Check if required headers exist
    const missingRequired = requiredFields.filter(field => 
      !headers.some(header => header.includes(field))
    );

    if (missingRequired.length > 0) {
      throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    // Process each row
    dataRows.forEach((row, index) => {
      const rowNumber = index + 2;
      
      try {
        const collegeData = this.extractCollegeFields(headers, row);
        
        // Validate required fields
        const validation = this.validateCollegeData(collegeData);
        
        if (validation.isValid) {
          // Set default password if not provided
          if (!collegeData.password) {
            collegeData.password = `${collegeData.code}@123`;
          }
          
          results.valid.push({
            ...collegeData,
            rowNumber
          });
          results.summary.valid++;
        } else {
          results.invalid.push({
            rowNumber,
            data: collegeData,
            errors: validation.errors
          });
          results.summary.invalid++;
        }
      } catch (error) {
        results.invalid.push({
          rowNumber,
          data: row,
          errors: [`Row parsing error: ${error.message}`]
        });
        results.summary.invalid++;
      }
    });

    return results;
  }

  // Extract student fields from row
  extractStudentFields(headers, row) {
    const student = {};
    
    headers.forEach((header, index) => {
      const value = row[index] ? String(row[index]).trim() : '';
      
      if (header.includes('name')) student.name = value;
      else if (header.includes('email')) student.email = value;
      else if (header.includes('password')) student.password = value;
      else if (header.includes('studentid') || header.includes('student_id')) student.studentId = value;
      else if (header.includes('course')) student.course = value;
      else if (header.includes('department')) student.department = value;
      else if (header.includes('year')) student.year = value;
      else if (header.includes('batch')) student.batch = value;
      else if (header.includes('enrollment')) student.enrollmentYear = value;
      else if (header.includes('cgpa')) student.cgpa = parseFloat(value) || 0;
      else if (header.includes('attendance')) student.attendance = parseFloat(value) || 0;
      else if (header.includes('contact') || header.includes('phone')) student.contactNumber = value;
      else if (header.includes('address')) student.address = value;
      else if (header.includes('emergency')) student.emergencyContact = value;
      else if (header.includes('skill')) student.skills = value.split(',').map(s => s.trim()).filter(s => s);
      else if (header.includes('interest')) student.interests = value.split(',').map(s => s.trim()).filter(s => s);
      else if (header.includes('social')) student.socialMedia = value;
    });

    return student;
  }

  // Extract college fields from row
  extractCollegeFields(headers, row) {
    const college = {
      address: {}
    };
    
    headers.forEach((header, index) => {
      const value = row[index] ? String(row[index]).trim() : '';
      
      if (header.includes('name')) college.name = value;
      else if (header.includes('code')) college.code = value.toUpperCase();
      else if (header.includes('email')) college.email = value;
      else if (header.includes('password')) college.password = value;
      else if (header.includes('institute')) college.institute = value;
      else if (header.includes('contact') || header.includes('phone')) college.contactNumber = value;
      else if (header.includes('line1')) college.address.line1 = value;
      else if (header.includes('line2')) college.address.line2 = value;
      else if (header.includes('city')) college.address.city = value;
      else if (header.includes('state')) college.address.state = value;
      else if (header.includes('country')) college.address.country = value;
      else if (header.includes('pincode') || header.includes('zip')) college.address.pincode = value;
      else if (header.includes('website')) college.website = value;
      else if (header.includes('type')) college.type = value;
      else if (header.includes('status')) college.status = value;
    });

    return college;
  }

  // Validate student data
  validateStudentData(student) {
    const errors = [];

    if (!student.name || student.name.length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    }

    if (!student.email || !this.isValidEmail(student.email)) {
      errors.push('Valid email address is required');
    }

    if (student.cgpa && (student.cgpa < 0 || student.cgpa > 10)) {
      errors.push('CGPA must be between 0 and 10');
    }

    if (student.attendance && (student.attendance < 0 || student.attendance > 100)) {
      errors.push('Attendance must be between 0 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate college data
  validateCollegeData(college) {
    const errors = [];

    if (!college.name || college.name.length < 2) {
      errors.push('College name is required and must be at least 2 characters');
    }

    if (!college.code || college.code.length < 2) {
      errors.push('College code is required and must be at least 2 characters');
    }

    if (!college.email || !this.isValidEmail(college.email)) {
      errors.push('Valid email address is required');
    }

    // Validate college type if provided
    const validTypes = [
      'Engineering College', 'Medical College', 'Arts College', 
      'Science College', 'Commerce College', 'Law College', 'Other'
    ];
    if (college.type && !validTypes.includes(college.type)) {
      errors.push(`College type must be one of: ${validTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate sample Excel templates
  generateStudentTemplate() {
    const headers = [
      'Name', 'Email', 'Password', 'StudentID', 'Course', 'Department', 
      'Year', 'Batch', 'EnrollmentYear', 'CGPA', 'Attendance', 
      'ContactNumber', 'Address', 'EmergencyContact', 'Skills', 'Interests'
    ];

    const sampleData = [
      [
        'John Doe', 'john.doe@example.com', '', 'STU001', 'Computer Science', 
        'CSE', '2024', 'A', '2021', '8.5', '85', '+1234567890', 
        '123 Main St', 'Jane Doe - +0987654321', 'JavaScript,Python,React', 'Programming,Music'
      ]
    ];

    return this.createWorkbook(headers, sampleData, 'Student_Template');
  }

  generateCollegeTemplate() {
    const headers = [
      'Name', 'Code', 'Email', 'Password', 'ContactNumber', 'Line1', 'Line2', 
      'City', 'State', 'Country', 'Pincode', 'Website', 'Type', 'Status'
    ];

    const sampleData = [
      [
        'Tech College of Engineering', 'TCE001', 'admin@tce.edu', '', 
        '+1234567890', '123 College Street', 'Tech Campus', 'Mumbai', 
        'Maharashtra', 'India', '400001', 'https://tce.edu', 'Engineering College', 'Active'
      ]
    ];

    return this.createWorkbook(headers, sampleData, 'College_Template');
  }

  // Create Excel workbook
  createWorkbook(headers, data, filename) {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    return {
      workbook: wb,
      filename: `${filename}.xlsx`
    };
  }
}

module.exports = new ExcelParser();
