require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Faculty = require('./model/faculty');
const Department = require('./model/department');

async function createDhavalFaculty() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB');
    
    // Get SITAICS department
    const sitaics = await Department.findOne({ code: 'SITAICS' });
    
    if (!sitaics) {
      console.log('❌ SITAICS department not found');
      process.exit(1);
    }
    
    console.log(`✅ Found SITAICS Department: ${sitaics.name} (${sitaics._id})`);
    
    // Check if Dhaval faculty already exists
    let dhavalFaculty = await Faculty.findOne({ email: 'dhaval@test.com' });
    
    if (dhavalFaculty) {
      console.log('\n📝 Dhaval faculty already exists. Updating...');
      
      // Update existing faculty
      dhavalFaculty.department = sitaics._id;
      dhavalFaculty.name.first = 'Dhaval';
      dhavalFaculty.name.last = 'Patel';
      dhavalFaculty.facultyID = 'RRU_SITAICS_FAC_DHAVAL';
      dhavalFaculty.designation = 'Assistant Professor';
      dhavalFaculty.specialization = 'Web Development, Full Stack Development, React.js';
      dhavalFaculty.qualifications = 'M.Tech (Computer Science), B.Tech (IT)';
      dhavalFaculty.experience = 5;
      dhavalFaculty.contactNumber = '+91-9876543230';
      dhavalFaculty.joiningDate = new Date('2020-08-01');
      dhavalFaculty.isCoordinator = false;
      dhavalFaculty.gender = 'Male';
      dhavalFaculty.address = {
        line1: 'Faculty Quarters, Block D-12',
        line2: 'RRU Campus',
        city: 'Gandhinagar',
        state: 'Gujarat',
        country: 'India',
        pincode: '382305'
      };
      
      await dhavalFaculty.save();
      console.log('✅ Updated Dhaval faculty');
    } else {
      console.log('\n📝 Creating new Dhaval faculty...');
      
      // Create new faculty
      const hashedPassword = await bcrypt.hash('dhaval@123', 10);
      
      dhavalFaculty = new Faculty({
        department: sitaics._id,
        name: {
          first: 'Dhaval',
          last: 'Patel'
        },
        facultyID: 'RRU_SITAICS_FAC_DHAVAL',
        email: 'dhaval@test.com',
        password: hashedPassword,
        designation: 'Assistant Professor',
        specialization: 'Web Development, Full Stack Development, React.js',
        qualifications: 'M.Tech (Computer Science), B.Tech (IT)',
        experience: 5,
        contactNumber: '+91-9876543230',
        joiningDate: new Date('2020-08-01'),
        isCoordinator: false,
        gender: 'Male',
        dob: new Date('1990-05-15'),
        address: {
          line1: 'Faculty Quarters, Block D-12',
          line2: 'RRU Campus',
          city: 'Gandhinagar',
          state: 'Gujarat',
          country: 'India',
          pincode: '382305'
        },
        students: [],
        achievementsReviewed: [],
        status: 'Active'
      });
      
      await dhavalFaculty.save();
      console.log('✅ Created Dhaval faculty');
    }
    
    // Add faculty to SITAICS department if not already there
    if (!sitaics.faculties.includes(dhavalFaculty._id)) {
      sitaics.faculties.push(dhavalFaculty._id);
      await sitaics.save();
      console.log('✅ Added Dhaval to SITAICS department');
    }
    
    // Verify
    const verifiedFaculty = await Faculty.findById(dhavalFaculty._id).populate('department');
    
    console.log('\n════════════════════════════════════════════════════════════');
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
    console.log(`   Joining Date: ${verifiedFaculty.joiningDate.toDateString()}`);
    console.log(`   Is Coordinator: ${verifiedFaculty.isCoordinator ? 'Yes' : 'No'}`);
    console.log(`   Status: ${verifiedFaculty.status}`);
    console.log(`   MongoDB ID: ${verifiedFaculty._id}\n`);
    
    console.log('🏫 DEPARTMENT:');
    console.log(`   Name: ${verifiedFaculty.department.name}`);
    console.log(`   Code: ${verifiedFaculty.department.code}`);
    console.log(`   ID: ${verifiedFaculty.department._id}\n`);
    
    console.log('📍 ADDRESS:');
    console.log(`   ${verifiedFaculty.address.line1}`);
    console.log(`   ${verifiedFaculty.address.line2}`);
    console.log(`   ${verifiedFaculty.address.city}, ${verifiedFaculty.address.state}`);
    console.log(`   ${verifiedFaculty.address.country} - ${verifiedFaculty.address.pincode}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ Dhaval faculty is now under SITAICS department!');
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

createDhavalFaculty();
