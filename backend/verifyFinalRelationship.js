require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const Student = require('./model/student');
const Department = require('./model/department');
const College = require('./model/college');

const FACULTY_ID = '69104f82bf45fb03af1b59ba';
const STUDENT_ID = '6910487553d1a1996c8c447f';

async function verifyRelationship() {
  try {
    await mongoose.connect(process.env.DBURL);
    
    const faculty = await Faculty.findById(FACULTY_ID).populate('department');
    const student = await Student.findById(STUDENT_ID).populate('department coordinator');
    const dept = await Department.findById(faculty.department._id).populate('college');
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('           FINAL RELATIONSHIP VERIFICATION                  ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('🏛️  INSTITUTE & COLLEGE:');
    console.log(`   Institute: Rashtriya Raksha University`);
    console.log(`   College: ${dept.college.name}`);
    console.log(`   College Code: ${dept.college.code}\n`);
    
    console.log('🏫 DEPARTMENT:');
    console.log(`   Name: ${dept.name}`);
    console.log(`   Code: ${dept.code}`);
    console.log(`   Email: ${dept.email}`);
    console.log(`   ID: ${dept._id}\n`);
    
    console.log('👨‍🏫 FACULTY (Dhaval):');
    console.log(`   MongoDB ID: ${faculty._id}`);
    console.log(`   Name: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   Faculty ID: ${faculty.facultyID}`);
    console.log(`   Email: ${faculty.email}`);
    console.log(`   Designation: ${faculty.designation}`);
    console.log(`   Specialization: ${faculty.specialization}`);
    console.log(`   Is Coordinator: ${faculty.isCoordinator ? 'Yes ✓' : 'No'}`);
    console.log(`   Department: ${faculty.department.name} (${faculty.department.code})`);
    console.log(`   Total Students: ${faculty.students.length}\n`);
    
    console.log('👨‍🎓 STUDENT (Arjun Verma):');
    console.log(`   MongoDB ID: ${student._id}`);
    console.log(`   Name: ${student.name.first} ${student.name.last}`);
    console.log(`   Student ID: ${student.studentID}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Previous Email: student1@example.com (updated to RRU domain)`);
    console.log(`   Course: ${student.course} - ${student.year}`);
    console.log(`   Batch: ${student.batch}`);
    console.log(`   Department: ${student.department.name} (${student.department.code})`);
    console.log(`   GPA: ${student.gpa}`);
    console.log(`   Achievements: ${student.achievements.length}\n`);
    
    console.log('🔗 COORDINATOR RELATIONSHIP:');
    console.log(`   Coordinator Name: ${student.coordinator.name.first} ${student.coordinator.name.last}`);
    console.log(`   Coordinator Email: ${student.coordinator.email}`);
    console.log(`   Coordinator Faculty ID: ${student.coordinator.facultyID}`);
    console.log(`   Coordinator MongoDB ID: ${student.coordinator._id}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('                   VERIFICATION RESULTS                     ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    const checks = [
      {
        test: 'Student coordinator is Dhaval faculty',
        result: student.coordinator._id.toString() === faculty._id.toString()
      },
      {
        test: 'Faculty has student in students array',
        result: faculty.students.some(s => s.toString() === student._id.toString())
      },
      {
        test: 'Student and faculty in same department',
        result: student.department._id.toString() === faculty.department._id.toString()
      },
      {
        test: 'Department is SITAICS',
        result: dept.code === 'SITAICS'
      },
      {
        test: 'College is RRU Gandhinagar',
        result: dept.college.code === 'RRU_GNR'
      },
      {
        test: 'Faculty email is dhaval@test.com',
        result: faculty.email === 'dhaval@test.com'
      },
      {
        test: 'Student ID matches requested ID',
        result: student._id.toString() === STUDENT_ID
      },
      {
        test: 'Faculty ID matches requested ID',
        result: faculty._id.toString() === FACULTY_ID
      }
    ];
    
    let allPassed = true;
    checks.forEach((check, index) => {
      const status = check.result ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${index + 1}. ${check.test}`);
      console.log(`      ${status}\n`);
      if (!check.result) allPassed = false;
    });
    
    console.log('════════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✅ ALL CHECKS PASSED - RELATIONSHIP PROPERLY ESTABLISHED!');
    } else {
      console.log('⚠️  SOME CHECKS FAILED - REVIEW NEEDED');
    }
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('📋 SUMMARY:');
    console.log(`   Student: ${student.name.first} ${student.name.last} (${student._id})`);
    console.log(`   Faculty: ${faculty.name.first} ${faculty.name.last} (${faculty._id})`);
    console.log(`   Department: ${dept.name} (${dept.code})`);
    console.log(`   College: ${dept.college.name} (${dept.college.code})`);
    console.log(`   Institute: Rashtriya Raksha University`);
    console.log(`   Relationship: Student → Coordinator (Dhaval) ✓\n`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyRelationship();
