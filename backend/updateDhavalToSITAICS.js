require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const Department = require('./model/department');
const College = require('./model/college');

const FACULTY_ID = '69104f82bf45fb03af1b59ba';

async function updateDhavalToSITAICS() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB');
    
    // Get SITAICS department
    const sitaics = await Department.findOne({ code: 'SITAICS' });
    
    if (!sitaics) {
      console.log('❌ SITAICS department not found');
      process.exit(1);
    }
    
    console.log(`✅ Found SITAICS Department: ${sitaics.name}`);
    console.log(`   ID: ${sitaics._id}\n`);
    
    // Get the faculty
    const faculty = await Faculty.findById(FACULTY_ID);
    
    if (!faculty) {
      console.log(`❌ Faculty with ID ${FACULTY_ID} not found`);
      process.exit(1);
    }
    
    console.log(`📝 Found faculty: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   Current email: ${faculty.email}`);
    console.log(`   Current department: ${faculty.department}\n`);
    
    // Update faculty to be under SITAICS with Dhaval name
    console.log('📝 Updating faculty to Dhaval under SITAICS...');
    
    faculty.department = sitaics._id;
    faculty.name.first = 'Dhaval';
    faculty.name.last = 'Patel';
    faculty.facultyID = 'RRU_SITAICS_FAC_DHAVAL';
    faculty.email = 'dhaval@test.com';
    faculty.designation = 'Assistant Professor';
    faculty.specialization = 'Web Development, Full Stack Development, React.js, Node.js';
    faculty.qualifications = 'M.Tech (Computer Science), B.Tech (IT)';
    faculty.experience = 5;
    faculty.contactNumber = '+91-9876543230';
    faculty.joiningDate = new Date('2020-08-01');
    faculty.isCoordinator = true;
    faculty.gender = 'Male';
    faculty.dob = new Date('1990-05-15');
    faculty.address = {
      line1: 'Faculty Quarters, Block D-12',
      line2: 'RRU Campus',
      city: 'Gandhinagar',
      state: 'Gujarat',
      country: 'India',
      pincode: '382305'
    };
    
    await faculty.save();
    console.log('✅ Updated faculty to Dhaval Patel\n');
    
    // Add faculty to SITAICS department if not already there
    if (!sitaics.faculties.includes(faculty._id)) {
      sitaics.faculties.push(faculty._id);
      await sitaics.save();
      console.log('✅ Added Dhaval to SITAICS department faculties list\n');
    } else {
      console.log('✅ Dhaval already in SITAICS department faculties list\n');
    }
    
    // Verify
    const verifiedFaculty = await Faculty.findById(FACULTY_ID).populate('department');
    const verifiedDept = await Department.findById(sitaics._id).populate('college');
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('                  DHAVAL FACULTY DETAILS                    ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('👨‍🏫 FACULTY INFORMATION:');
    console.log(`   Name: ${verifiedFaculty.name.first} ${verifiedFaculty.name.last}`);
    console.log(`   Faculty ID: ${verifiedFaculty.facultyID}`);
    console.log(`   Email: ${verifiedFaculty.email}`);
    console.log(`   Designation: ${verifiedFaculty.designation}`);
    console.log(`   Specialization: ${verifiedFaculty.specialization}`);
    console.log(`   Qualifications: ${verifiedFaculty.qualifications}`);
    console.log(`   Experience: ${verifiedFaculty.experience} years`);
    console.log(`   Contact: ${verifiedFaculty.contactNumber}`);
    console.log(`   Gender: ${verifiedFaculty.gender}`);
    console.log(`   Is Coordinator: ${verifiedFaculty.isCoordinator ? 'Yes' : 'No'}`);
    console.log(`   Students: ${verifiedFaculty.students.length}`);
    console.log(`   Status: ${verifiedFaculty.status}`);
    console.log(`   MongoDB ID: ${verifiedFaculty._id}\n`);
    
    console.log('🏫 DEPARTMENT:');
    console.log(`   Name: ${verifiedFaculty.department.name}`);
    console.log(`   Code: ${verifiedFaculty.department.code}`);
    console.log(`   Email: ${verifiedFaculty.department.email}`);
    console.log(`   ID: ${verifiedFaculty.department._id}\n`);
    
    console.log('📚 COLLEGE:');
    console.log(`   Name: ${verifiedDept.college.name}`);
    console.log(`   Code: ${verifiedDept.college.code}`);
    console.log(`   ID: ${verifiedDept.college._id}\n`);
    
    console.log('📍 ADDRESS:');
    console.log(`   ${verifiedFaculty.address.line1}`);
    console.log(`   ${verifiedFaculty.address.line2}`);
    console.log(`   ${verifiedFaculty.address.city}, ${verifiedFaculty.address.state}`);
    console.log(`   ${verifiedFaculty.address.country} - ${verifiedFaculty.address.pincode}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ SUCCESS: Dhaval faculty is now under SITAICS department!');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\n📋 HIERARCHY:');
    console.log('   Institute: Rashtriya Raksha University');
    console.log('      └── College: Rashtriya Raksha University Gandhinagar');
    console.log('          └── Department: SITAICS');
    console.log('              └── Faculty: Dhaval Patel (Assistant Professor & Coordinator)');
    console.log(`                  └── ${verifiedFaculty.students.length} Students\n`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateDhavalToSITAICS();
