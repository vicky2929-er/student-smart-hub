require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const Student = require('./model/student');

const FACULTY_ID = '69104f82bf45fb03af1b59ba'; // Dhaval faculty

async function linkStudent1ToFaculty() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB\n');
    
    // Find student with email student1@example.com
    let student = await Student.findOne({ email: 'student1@example.com' }).populate('department coordinator');
    
    if (!student) {
      console.log('❌ Student with email student1@example.com not found');
      console.log('Searching for similar students...\n');
      
      // Search for students with similar email pattern
      const students = await Student.find({ 
        email: /student.*@example\.com/i 
      }).limit(5).select('_id name email studentID');
      
      console.log('Found students with similar emails:');
      students.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name.first} ${s.name.last}`);
        console.log(`   ID: ${s._id}`);
        console.log(`   Email: ${s.email}`);
        console.log(`   Student ID: ${s.studentID}\n`);
      });
      
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log('✅ Found Student:');
    console.log(`   Name: ${student.name.first} ${student.name.last}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Student ID: ${student.studentID}`);
    console.log(`   MongoDB ID: ${student._id}`);
    console.log(`   Current Department: ${student.department ? student.department.name : 'None'}`);
    console.log(`   Current Coordinator: ${student.coordinator ? `${student.coordinator.name.first} ${student.coordinator.name.last}` : 'None'}\n`);
    
    // Get Dhaval faculty
    const faculty = await Faculty.findById(FACULTY_ID).populate('department');
    
    if (!faculty) {
      console.log(`❌ Faculty with ID ${FACULTY_ID} not found`);
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log('✅ Found Faculty (Dhaval):');
    console.log(`   Name: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   Email: ${faculty.email}`);
    console.log(`   Faculty ID: ${faculty.facultyID}`);
    console.log(`   Department: ${faculty.department.name}`);
    console.log(`   Current Students: ${faculty.students.length}\n`);
    
    // Update student
    console.log('📝 Updating student...');
    
    let updated = false;
    
    // Set department to faculty's department
    if (!student.department || student.department._id.toString() !== faculty.department._id.toString()) {
      student.department = faculty.department._id;
      console.log(`   ✅ Updated department to ${faculty.department.name}`);
      updated = true;
    } else {
      console.log(`   ✓ Department already set to ${faculty.department.name}`);
    }
    
    // Set coordinator to Dhaval faculty
    if (!student.coordinator || student.coordinator._id.toString() !== faculty._id.toString()) {
      student.coordinator = faculty._id;
      console.log(`   ✅ Updated coordinator to ${faculty.name.first} ${faculty.name.last}`);
      updated = true;
    } else {
      console.log(`   ✓ Coordinator already set to ${faculty.name.first} ${faculty.name.last}`);
    }
    
    if (updated) {
      await student.save();
      console.log('\n✅ Student saved successfully');
    } else {
      console.log('\n✓ No updates needed');
    }
    
    // Update faculty's students array
    console.log('\n📝 Updating faculty...');
    
    if (!faculty.students.includes(student._id)) {
      faculty.students.push(student._id);
      await faculty.save();
      console.log(`   ✅ Added student to faculty's students list`);
      console.log(`   New total students: ${faculty.students.length}`);
    } else {
      console.log(`   ✓ Student already in faculty's students list`);
    }
    
    // Verify final state
    const verifiedStudent = await Student.findById(student._id).populate('department coordinator');
    const verifiedFaculty = await Faculty.findById(FACULTY_ID);
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('              RELATIONSHIP ESTABLISHED                      ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('👨‍🎓 STUDENT:');
    console.log(`   Name: ${verifiedStudent.name.first} ${verifiedStudent.name.last}`);
    console.log(`   Email: ${verifiedStudent.email}`);
    console.log(`   Student ID: ${verifiedStudent.studentID}`);
    console.log(`   MongoDB ID: ${verifiedStudent._id}`);
    console.log(`   Department: ${verifiedStudent.department.name}`);
    console.log(`   Coordinator: ${verifiedStudent.coordinator.name.first} ${verifiedStudent.coordinator.name.last}\n`);
    
    console.log('👨‍🏫 FACULTY (Dhaval):');
    console.log(`   Name: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   Email: ${faculty.email}`);
    console.log(`   Faculty ID: ${faculty.facultyID}`);
    console.log(`   MongoDB ID: ${faculty._id}`);
    console.log(`   Total Students: ${verifiedFaculty.students.length}\n`);
    
    console.log('✅ Verification:');
    console.log(`   • Student's coordinator is Dhaval: ${verifiedStudent.coordinator._id.toString() === faculty._id.toString() ? '✓' : '✗'}`);
    console.log(`   • Faculty has student in list: ${verifiedFaculty.students.some(s => s.toString() === verifiedStudent._id.toString()) ? '✓' : '✗'}`);
    console.log(`   • Same department: ${verifiedStudent.department._id.toString() === faculty.department._id.toString() ? '✓' : '✗'}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ Student student1@example.com is now under dhaval@test.com!');
    console.log('════════════════════════════════════════════════════════════\n');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

linkStudent1ToFaculty();
