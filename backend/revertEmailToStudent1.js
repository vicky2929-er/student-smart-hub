require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./model/student');
const Faculty = require('./model/faculty');
const Department = require('./model/department');

const STUDENT_ID = '6910487553d1a1996c8c447f';

async function revertEmailToStudent1() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB\n');
    
    // Get student
    const student = await Student.findById(STUDENT_ID).populate('coordinator');
    
    if (!student) {
      console.log(`❌ Student with ID ${STUDENT_ID} not found`);
      process.exit(1);
    }
    
    console.log('📝 Current Student Details:');
    console.log(`   Name: ${student.name.first} ${student.name.last}`);
    console.log(`   Current Email: ${student.email}`);
    console.log(`   Student ID: ${student.studentID}`);
    console.log(`   Coordinator: ${student.coordinator.name.first} ${student.coordinator.name.last} (${student.coordinator.email})\n`);
    
    // Update email back to student1@example.com
    console.log('📝 Reverting email to student1@example.com...');
    student.email = 'student1@example.com';
    await student.save();
    console.log('✅ Email updated successfully\n');
    
    // Verify
    const verifiedStudent = await Student.findById(STUDENT_ID).populate('coordinator department');
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('              UPDATED STUDENT DETAILS                       ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('👨‍🎓 STUDENT:');
    console.log(`   MongoDB ID: ${verifiedStudent._id}`);
    console.log(`   Name: ${verifiedStudent.name.first} ${verifiedStudent.name.last}`);
    console.log(`   Email: ${verifiedStudent.email} ✓`);
    console.log(`   Student ID: ${verifiedStudent.studentID}`);
    console.log(`   Course: ${verifiedStudent.course} - ${verifiedStudent.year}`);
    console.log(`   Batch: ${verifiedStudent.batch}`);
    console.log(`   Department: ${verifiedStudent.department.name}\n`);
    
    console.log('👨‍🏫 COORDINATOR:');
    console.log(`   Name: ${verifiedStudent.coordinator.name.first} ${verifiedStudent.coordinator.name.last}`);
    console.log(`   Email: ${verifiedStudent.coordinator.email}`);
    console.log(`   Faculty ID: ${verifiedStudent.coordinator.facultyID}`);
    console.log(`   MongoDB ID: ${verifiedStudent.coordinator._id}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ Email successfully reverted to student1@example.com!');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('📋 SUMMARY:');
    console.log(`   Student: ${verifiedStudent.name.first} ${verifiedStudent.name.last}`);
    console.log(`   Email: student1@example.com ✓`);
    console.log(`   Coordinator: ${verifiedStudent.coordinator.name.first} ${verifiedStudent.coordinator.name.last} (dhaval@test.com) ✓`);
    console.log(`   Department: ${verifiedStudent.department.name} ✓\n`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

revertEmailToStudent1();
