require('dotenv').config();
const mongoose = require('mongoose');
const Institute = require('./model/institute');
const College = require('./model/college');
const Department = require('./model/department');
const Student = require('./model/student');
const Faculty = require('./model/faculty');

const MONGODB_URI = process.env.MONGO_URI || process.env.DBURL;

async function verifyAssignments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const rru = await Institute.findOne({ 
      name: { $regex: /Rashtriya.*Raksha.*University/i } 
    });

    console.log('=== RASHTRIYA RAKSHA UNIVERSITY HIERARCHY ===\n');
    console.log(`Institute: ${rru.name}`);
    console.log(`Institute ID: ${rru._id}\n`);

    // Get colleges under RRU
    const colleges = await College.find({ institute: rru._id });
    console.log(`Total Colleges: ${colleges.length}`);
    colleges.forEach(college => {
      console.log(`  - ${college.name} (${college.code})`);
    });

    // Get departments under RRU
    const departments = await Department.find({ institute: rru._id });
    console.log(`\nTotal Departments: ${departments.length}`);
    for (const dept of departments) {
      const studentCount = await Student.countDocuments({ department: dept._id });
      const facultyCount = await Faculty.countDocuments({ department: dept._id });
      console.log(`  - ${dept.name} (${dept.code})`);
      console.log(`    Students: ${studentCount}, Faculty: ${facultyCount}`);
    }

    // Total students and faculty under RRU
    const allDeptIds = departments.map(d => d._id);
    const totalStudents = await Student.countDocuments({ department: { $in: allDeptIds } });
    const totalFaculty = await Faculty.countDocuments({ department: { $in: allDeptIds } });

    console.log('\n=== SUMMARY ===');
    console.log(`Total Students under RRU: ${totalStudents}`);
    console.log(`Total Faculty under RRU: ${totalFaculty}`);

    // Sample students
    console.log('\n=== SAMPLE STUDENTS (First 10) ===');
    const students = await Student.find({ department: { $in: allDeptIds } })
      .select('name email batch studentID')
      .populate('department', 'name code')
      .limit(10);
    
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name.first} ${student.name.last || ''}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Student ID: ${student.studentID}`);
      console.log(`   Batch: ${student.batch}`);
      console.log(`   Department: ${student.department?.name || 'N/A'}\n`);
    });

    // Sample faculty
    console.log('=== SAMPLE FACULTY (First 10) ===');
    const faculty = await Faculty.find({ department: { $in: allDeptIds } })
      .select('name email facultyID designation')
      .populate('department', 'name code')
      .limit(10);
    
    faculty.forEach((fac, index) => {
      console.log(`${index + 1}. ${fac.name.first} ${fac.name.last || ''}`);
      console.log(`   Email: ${fac.email}`);
      console.log(`   Faculty ID: ${fac.facultyID}`);
      console.log(`   Designation: ${fac.designation}`);
      console.log(`   Department: ${fac.department?.name || 'N/A'}\n`);
    });

    await mongoose.connection.close();
    console.log('✅ Verification complete. Database connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

verifyAssignments();
