require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const Student = require('./model/student');
const Department = require('./model/department');

const FACULTY_ID = '69104f82bf45fb03af1b59ba';
const STUDENT_ID = '6910487553d1a1996c8c447f';

async function linkStudentToFaculty() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB\n');
    
    // Get faculty
    const faculty = await Faculty.findById(FACULTY_ID).populate('department');
    if (!faculty) {
      console.log(`❌ Faculty with ID ${FACULTY_ID} not found`);
      process.exit(1);
    }
    
    console.log(`✅ Found Faculty: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   Email: ${faculty.email}`);
    console.log(`   Department: ${faculty.department.name}\n`);
    
    // Get student
    const student = await Student.findById(STUDENT_ID).populate('department coordinator');
    if (!student) {
      console.log(`❌ Student with ID ${STUDENT_ID} not found`);
      process.exit(1);
    }
    
    console.log(`✅ Found Student: ${student.name.first} ${student.name.last}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Current Department: ${student.department.name}`);
    console.log(`   Current Coordinator: ${student.coordinator ? `${student.coordinator.name.first} ${student.coordinator.name.last}` : 'None'}\n`);
    
    // Update student
    console.log('📝 Updating student...');
    
    let updated = false;
    
    // Set department to same as faculty's department
    if (student.department._id.toString() !== faculty.department._id.toString()) {
      student.department = faculty.department._id;
      console.log(`   ✅ Updated department to ${faculty.department.name}`);
      updated = true;
    } else {
      console.log(`   ✓ Department already set to ${faculty.department.name}`);
    }
    
    // Set coordinator to this faculty
    if (!student.coordinator || student.coordinator._id.toString() !== faculty._id.toString()) {
      student.coordinator = faculty._id;
      console.log(`   ✅ Updated coordinator to ${faculty.name.first} ${faculty.name.last}`);
      updated = true;
    } else {
      console.log(`   ✓ Coordinator already set to ${faculty.name.first} ${faculty.name.last}`);
    }
    
    if (updated) {
      await student.save();
      console.log('\n✅ Student updated successfully');
    } else {
      console.log('\n✓ No updates needed - already configured correctly');
    }
    
    // Update faculty's students array
    console.log('\n📝 Updating faculty...');
    
    if (!faculty.students.includes(student._id)) {
      faculty.students.push(student._id);
      await faculty.save();
      console.log(`   ✅ Added student to faculty's students list`);
    } else {
      console.log(`   ✓ Student already in faculty's students list`);
    }
    
    // Verify final state
    const verifiedStudent = await Student.findById(STUDENT_ID).populate('department coordinator');
    const verifiedFaculty = await Faculty.findById(FACULTY_ID).populate('department');
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('              STUDENT-FACULTY RELATIONSHIP                  ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('👨‍🎓 STUDENT:');
    console.log(`   Name: ${verifiedStudent.name.first} ${verifiedStudent.name.last}`);
    console.log(`   Student ID: ${verifiedStudent.studentID}`);
    console.log(`   Email: ${verifiedStudent.email}`);
    console.log(`   Course: ${verifiedStudent.course} - ${verifiedStudent.year}`);
    console.log(`   Batch: ${verifiedStudent.batch}`);
    console.log(`   MongoDB ID: ${verifiedStudent._id}\n`);
    
    console.log('🏫 STUDENT\'S DEPARTMENT:');
    console.log(`   Name: ${verifiedStudent.department.name}`);
    console.log(`   Code: ${verifiedStudent.department.code}\n`);
    
    console.log('👨‍🏫 STUDENT\'S COORDINATOR:');
    console.log(`   Name: ${verifiedStudent.coordinator.name.first} ${verifiedStudent.coordinator.name.last}`);
    console.log(`   Faculty ID: ${verifiedStudent.coordinator.facultyID}`);
    console.log(`   Email: ${verifiedStudent.coordinator.email}`);
    console.log(`   Designation: ${verifiedStudent.coordinator.designation}`);
    console.log(`   MongoDB ID: ${verifiedStudent.coordinator._id}\n`);
    
    console.log('👨‍🏫 FACULTY (Dhaval):');
    console.log(`   Name: ${verifiedFaculty.name.first} ${verifiedFaculty.name.last}`);
    console.log(`   Faculty ID: ${verifiedFaculty.facultyID}`);
    console.log(`   Email: ${verifiedFaculty.email}`);
    console.log(`   Department: ${verifiedFaculty.department.name}`);
    console.log(`   Total Students: ${verifiedFaculty.students.length}`);
    console.log(`   MongoDB ID: ${verifiedFaculty._id}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ RELATIONSHIP ESTABLISHED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════════════════════');
    
    console.log('\n📋 HIERARCHY:');
    console.log('   Institute: Rashtriya Raksha University');
    console.log('      └── College: Rashtriya Raksha University Gandhinagar');
    console.log('          └── Department: SITAICS');
    console.log('              └── Faculty: Dhaval Patel (Coordinator)');
    console.log(`                  └── Student: ${verifiedStudent.name.first} ${verifiedStudent.name.last}\n`);
    
    console.log('✅ Verification:');
    console.log(`   • Student department matches faculty department: ${verifiedStudent.department._id.toString() === verifiedFaculty.department._id.toString() ? '✓' : '✗'}`);
    console.log(`   • Student coordinator is Dhaval faculty: ${verifiedStudent.coordinator._id.toString() === verifiedFaculty._id.toString() ? '✓' : '✗'}`);
    console.log(`   • Faculty has student in list: ${verifiedFaculty.students.some(s => s.toString() === verifiedStudent._id.toString()) ? '✓' : '✗'}\n`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

linkStudentToFaculty();
