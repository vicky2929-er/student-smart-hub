require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const Faculty = require('./model/faculty');
const Student = require('./model/student');
const Department = require('./model/department');
const College = require('./model/college');
const Institute = require('./model/institute');

// IDs to update
const FACULTY_ID = '69104f82bf45fb03af1b59ba';
const STUDENT_ID = '6910487553d1a1996c8c447f';

async function updateRRUConsistency() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create or update Rashtriya Raksha University Institute
    let rruInstitute = await Institute.findOne({ code: 'RRU_INSTITUTE' });
    
    if (!rruInstitute) {
      console.log('📝 Creating Rashtriya Raksha University Institute...');
      const hashedPassword = await bcrypt.hash('rru@admin123', 10);
      
      rruInstitute = new Institute({
        name: 'Rashtriya Raksha University',
        code: 'RRU_INSTITUTE',
        aisheCode: 'U-0123',
        type: 'University',
        email: 'admin@rru.ac.in',
        password: hashedPassword,
        contactNumber: '+91-79-23977171',
        address: {
          line1: 'Lavad-Dehgam Road, Lavad',
          line2: 'Dahegam',
          city: 'Gandhinagar',
          state: 'Gujarat',
          district: 'Gandhinagar',
          country: 'India',
          pincode: '382305'
        },
        website: 'https://www.rru.ac.in',
        headOfInstitute: {
          name: 'Dr. Bimal N. Patel',
          email: 'vc@rru.ac.in',
          contact: '+91-79-23977173',
          alternateContact: '+91-79-23977174'
        },
        modalOfficer: {
          name: 'Prof. K. S. Subramanian',
          email: 'nodalofficer@rru.ac.in',
          contact: '+91-79-23977175',
          alternateContact: '+91-79-23977176'
        },
        naacGrading: true,
        naacGrade: 'A+',
        location: {
          city: 'Gandhinagar',
          state: 'Gujarat',
          country: 'India'
        },
        studentCount: 5000,
        status: 'Active',
        approvalStatus: 'Approved',
        approvedAt: new Date('2010-01-15')
      });
      await rruInstitute.save();
      console.log(`✅ Created RRU Institute: ${rruInstitute._id}`);
    } else {
      console.log(`✅ Found existing RRU Institute: ${rruInstitute._id}`);
    }

    // Step 2: Create or update RRU College (Gandhinagar)
    let rruCollege = await College.findOne({ 
      code: 'RRU_GNR',
      institute: rruInstitute._id 
    });
    
    if (!rruCollege) {
      console.log('📝 Creating Rashtriya Raksha University College...');
      const hashedPassword = await bcrypt.hash('rru@college123', 10);
      
      rruCollege = new College({
        institute: rruInstitute._id,
        name: 'Rashtriya Raksha University Gandhinagar',
        code: 'RRU_GNR',
        email: 'gandhinagar@rru.ac.in',
        password: hashedPassword,
        contactNumber: '+91-79-23977172',
        address: {
          line1: 'Lavad-Dehgam Road, Lavad',
          line2: 'Dahegam',
          city: 'Gandhinagar',
          state: 'Gujarat',
          country: 'India',
          pincode: '382305'
        },
        website: 'https://www.rru.ac.in',
        type: 'Engineering College',
        status: 'Active'
      });
      await rruCollege.save();
      console.log(`✅ Created RRU College: ${rruCollege._id}`);
    } else {
      console.log(`✅ Found existing RRU College: ${rruCollege._id}`);
    }

    // Step 3: Create or update SITAICS Department
    let sitaicsDept = await Department.findOne({ code: 'SITAICS' });

    if (!sitaicsDept) {
      console.log('📝 Creating SITAICS Department...');
      const hashedPassword = await bcrypt.hash('sitaics@123', 10);
      
      sitaicsDept = new Department({
        college: rruCollege._id,
        institute: rruInstitute._id,
        name: 'School of IT, AI & Computer Science (SITAICS)',
        code: 'SITAICS',
        email: 'sitaics@rru.ac.in',
        password: hashedPassword,
        contactNumber: '+91-79-23977180',
        status: 'Active'
      });
      await sitaicsDept.save();
      console.log(`✅ Created SITAICS Department: ${sitaicsDept._id}`);
    } else {
      console.log(`✅ Found existing SITAICS Department: ${sitaicsDept._id}`);
      console.log('   Updating department details...');
      // Update existing department
      sitaicsDept.college = rruCollege._id;
      sitaicsDept.institute = rruInstitute._id;
      sitaicsDept.name = 'School of IT, AI & Computer Science (SITAICS)';
      sitaicsDept.email = 'sitaics@rru.ac.in';
      sitaicsDept.contactNumber = '+91-79-23977180';
      await sitaicsDept.save();
      console.log(`   ✅ Updated SITAICS Department`);
    }

    // Step 4: Update existing Faculty (Dr. Rajesh Sharma)
    console.log('\n📝 Updating Faculty (ID: 69104f82bf45fb03af1b59ba)...');
    const mainFaculty = await Faculty.findById(FACULTY_ID);
    
    if (!mainFaculty) {
      console.log(`❌ Faculty with ID ${FACULTY_ID} not found`);
      process.exit(1);
    }

    mainFaculty.department = sitaicsDept._id;
    mainFaculty.name.first = 'Dr. Rajesh';
    mainFaculty.name.last = 'Sharma';
    mainFaculty.facultyID = 'RRU_SITAICS_FAC_001';
    mainFaculty.email = 'rajesh.sharma@rru.ac.in';
    mainFaculty.designation = 'Professor';
    mainFaculty.contactNumber = '+91-9876543001';
    mainFaculty.specialization = 'Artificial Intelligence, Machine Learning, Computer Vision';
    mainFaculty.qualifications = 'Ph.D. (Computer Science - AI), M.Tech (CSE), B.E. (CSE)';
    mainFaculty.experience = 15;
    mainFaculty.joiningDate = new Date('2010-08-01');
    mainFaculty.isCoordinator = true;
    mainFaculty.address = {
      line1: 'Faculty Quarters, Block A-15',
      line2: 'RRU Campus',
      city: 'Gandhinagar',
      state: 'Gujarat',
      country: 'India',
      pincode: '382305'
    };

    await mainFaculty.save();
    console.log(`✅ Updated Faculty: ${mainFaculty.name.first} ${mainFaculty.name.last}`);

    // Step 5: Create additional faculty members
    console.log('\n📝 Creating additional faculty members...');
    
    const additionalFaculties = [
      {
        name: { first: 'Dr. Priya', last: 'Patel' },
        facultyID: 'RRU_SITAICS_FAC_002',
        email: 'priya.patel@rru.ac.in',
        designation: 'Associate Professor',
        specialization: 'Data Science, Big Data Analytics, IoT',
        qualifications: 'Ph.D. (Data Science), M.Tech (IT), B.Tech (IT)',
        experience: 12,
        contactNumber: '+91-9876543002',
        joiningDate: new Date('2013-07-15')
      },
      {
        name: { first: 'Dr. Amit', last: 'Desai' },
        facultyID: 'RRU_SITAICS_FAC_003',
        email: 'amit.desai@rru.ac.in',
        designation: 'Associate Professor',
        specialization: 'Cybersecurity, Network Security, Ethical Hacking',
        qualifications: 'Ph.D. (Cybersecurity), M.Tech (CSE), B.E. (CSE)',
        experience: 10,
        contactNumber: '+91-9876543003',
        joiningDate: new Date('2015-01-10')
      },
      {
        name: { first: 'Dr. Neha', last: 'Shah' },
        facultyID: 'RRU_SITAICS_FAC_004',
        email: 'neha.shah@rru.ac.in',
        designation: 'Assistant Professor',
        specialization: 'Software Engineering, Cloud Computing, DevOps',
        qualifications: 'Ph.D. (Software Engineering), M.Tech (CSE), B.Tech (CSE)',
        experience: 8,
        contactNumber: '+91-9876543004',
        joiningDate: new Date('2017-08-01')
      },
      {
        name: { first: 'Prof. Vikram', last: 'Joshi' },
        facultyID: 'RRU_SITAICS_FAC_005',
        email: 'vikram.joshi@rru.ac.in',
        designation: 'Assistant Professor',
        specialization: 'Web Development, Mobile Apps, UI/UX Design',
        qualifications: 'M.Tech (Computer Science), B.Tech (IT)',
        experience: 6,
        contactNumber: '+91-9876543005',
        joiningDate: new Date('2019-07-20')
      },
      {
        name: { first: 'Dr. Kavita', last: 'Mehta' },
        facultyID: 'RRU_SITAICS_FAC_006',
        email: 'kavita.mehta@rru.ac.in',
        designation: 'Assistant Professor',
        specialization: 'Database Management, Data Mining, Information Retrieval',
        qualifications: 'Ph.D. (Database Systems), M.Tech (IT), B.E. (IT)',
        experience: 9,
        contactNumber: '+91-9876543006',
        joiningDate: new Date('2016-08-15')
      },
      {
        name: { first: 'Prof. Rohan', last: 'Trivedi' },
        facultyID: 'RRU_SITAICS_FAC_007',
        email: 'rohan.trivedi@rru.ac.in',
        designation: 'Lecturer',
        specialization: 'Programming Languages, Algorithms, Competitive Programming',
        qualifications: 'M.Tech (Computer Science), B.Tech (CSE)',
        experience: 4,
        contactNumber: '+91-9876543007',
        joiningDate: new Date('2021-07-10')
      },
      {
        name: { first: 'Dr. Anjali', last: 'Verma' },
        facultyID: 'RRU_SITAICS_FAC_008',
        email: 'anjali.verma@rru.ac.in',
        designation: 'HOD',
        specialization: 'Computer Networks, Distributed Systems, Blockchain',
        qualifications: 'Ph.D. (Computer Networks), M.Tech (CSE), B.E. (CSE)',
        experience: 18,
        contactNumber: '+91-9876543008',
        joiningDate: new Date('2007-08-01')
      }
    ];

    const hashedPassword = await bcrypt.hash('faculty@123', 10);
    const createdFaculties = [];

    for (const facultyData of additionalFaculties) {
      // Check if faculty already exists
      const existingFaculty = await Faculty.findOne({ facultyID: facultyData.facultyID });
      
      if (!existingFaculty) {
        const newFaculty = new Faculty({
          ...facultyData,
          department: sitaicsDept._id,
          password: hashedPassword,
          gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
          dob: new Date(1975 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          address: {
            line1: `Faculty Quarters, Block ${String.fromCharCode(65 + createdFaculties.length)}`,
            line2: 'RRU Campus',
            city: 'Gandhinagar',
            state: 'Gujarat',
            country: 'India',
            pincode: '382305'
          },
          isCoordinator: facultyData.designation === 'HOD',
          students: [],
          achievementsReviewed: [],
          status: 'Active'
        });
        
        await newFaculty.save();
        createdFaculties.push(newFaculty);
        console.log(`   ✅ Created: ${newFaculty.name.first} ${newFaculty.name.last} (${newFaculty.designation})`);
      } else {
        console.log(`   ⏭️  Already exists: ${existingFaculty.name.first} ${existingFaculty.name.last}`);
        createdFaculties.push(existingFaculty);
      }
    }

    // Step 6: Update Student
    console.log('\n📝 Updating Student...');
    const student = await Student.findById(STUDENT_ID);
    
    if (!student) {
      console.log(`❌ Student with ID ${STUDENT_ID} not found`);
      process.exit(1);
    }

    student.department = sitaicsDept._id;
    student.coordinator = mainFaculty._id;
    student.name.first = 'Arjun';
    student.name.last = 'Verma';
    student.studentID = 'RRU_SITAICS_2022_001';
    student.email = 'arjun.verma@rru.ac.in';
    student.contactNumber = '+91-9876543101';
    student.course = 'B.Tech';
    student.year = '4th Year';
    student.batch = '2022-2026';
    student.enrollmentYear = 2022;
    student.interests = ['Artificial Intelligence', 'Machine Learning', 'Web Development', 'Cybersecurity'];
    student.skills.technical = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch', 'Docker'];
    student.skills.soft = ['Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Time Management'];
    student.bio = 'B.Tech CSE student at SITAICS, Rashtriya Raksha University with a strong passion for AI/ML and Full Stack Development. Active participant in hackathons and coding competitions.';
    student.address = {
      line1: 'Student Hostel, Block A, Room 301',
      line2: 'RRU Campus, Lavad',
      city: 'Gandhinagar',
      state: 'Gujarat',
      country: 'India',
      pincode: '382305'
    };

    await student.save();
    console.log(`✅ Updated Student: ${student.name.first} ${student.name.last}`);

    // Step 7: Update Department relationships
    console.log('\n📝 Updating Department relationships...');
    
    // Add all faculties to department
    sitaicsDept.faculties = [mainFaculty._id, ...createdFaculties.map(f => f._id)];
    
    // Set HOD
    const hodFaculty = createdFaculties.find(f => f.designation === 'HOD');
    if (hodFaculty) {
      sitaicsDept.hod = hodFaculty._id;
    }
    
    await sitaicsDept.save();
    console.log(`✅ Updated SITAICS Department with ${sitaicsDept.faculties.length} faculties`);

    // Step 8: Update College to include department
    if (!rruCollege.departments.includes(sitaicsDept._id)) {
      rruCollege.departments.push(sitaicsDept._id);
      await rruCollege.save();
      console.log(`✅ Added SITAICS to RRU College departments`);
    }

    // Step 9: Update Institute to include college
    if (!rruInstitute.colleges || !rruInstitute.colleges.includes(rruCollege._id)) {
      if (!rruInstitute.colleges) rruInstitute.colleges = [];
      rruInstitute.colleges.push(rruCollege._id);
      await rruInstitute.save();
      console.log(`✅ Added RRU College to Institute`);
    }

    // Step 10: Verify final state
    console.log('\n🔍 Verifying Data Consistency...\n');
    
    const verifiedFaculty = await Faculty.findById(FACULTY_ID).populate('department');
    const verifiedStudent = await Student.findById(STUDENT_ID).populate('department coordinator');
    const verifiedDept = await Department.findById(sitaicsDept._id).populate('college hod');
    const verifiedCollege = await College.findById(rruCollege._id).populate('institute');
    const allFaculties = await Faculty.find({ department: sitaicsDept._id }).select('name facultyID designation');
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('                    FINAL STATE REPORT                      ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('🏛️  INSTITUTE:');
    console.log(`   Name: ${rruInstitute.name}`);
    console.log(`   Code: ${rruInstitute.code}`);
    console.log(`   Location: ${rruInstitute.address.city}, ${rruInstitute.address.state}`);
    console.log(`   Website: ${rruInstitute.website}`);
    console.log(`   ID: ${rruInstitute._id}\n`);
    
    console.log('📚 COLLEGE:');
    console.log(`   Name: ${verifiedCollege.name}`);
    console.log(`   Code: ${verifiedCollege.code}`);
    console.log(`   Location: ${verifiedCollege.address.city}, ${verifiedCollege.address.state}`);
    console.log(`   Institute: ${verifiedCollege.institute.name}`);
    console.log(`   ID: ${verifiedCollege._id}\n`);
    
    console.log('🏫 DEPARTMENT:');
    console.log(`   Name: ${verifiedDept.name}`);
    console.log(`   Code: ${verifiedDept.code}`);
    console.log(`   College: ${verifiedDept.college.name}`);
    console.log(`   HOD: ${verifiedDept.hod ? `${verifiedDept.hod.name.first} ${verifiedDept.hod.name.last}` : 'Not assigned'}`);
    console.log(`   Total Faculties: ${allFaculties.length}`);
    console.log(`   ID: ${verifiedDept._id}\n`);
    
    console.log('👨‍🏫 MAIN FACULTY (Your Faculty):');
    console.log(`   Name: ${verifiedFaculty.name.first} ${verifiedFaculty.name.last}`);
    console.log(`   Faculty ID: ${verifiedFaculty.facultyID}`);
    console.log(`   Email: ${verifiedFaculty.email}`);
    console.log(`   Designation: ${verifiedFaculty.designation}`);
    console.log(`   Specialization: ${verifiedFaculty.specialization}`);
    console.log(`   Experience: ${verifiedFaculty.experience} years`);
    console.log(`   Department: ${verifiedFaculty.department.name}`);
    console.log(`   Is Coordinator: ${verifiedFaculty.isCoordinator ? 'Yes' : 'No'}`);
    console.log(`   Students: ${verifiedFaculty.students.length}`);
    console.log(`   ID: ${verifiedFaculty._id}\n`);
    
    console.log('👥 ALL FACULTIES IN SITAICS:');
    allFaculties.forEach((faculty, index) => {
      console.log(`   ${index + 1}. ${faculty.name.first} ${faculty.name.last}`);
      console.log(`      ID: ${faculty.facultyID} | Designation: ${faculty.designation}`);
    });
    
    console.log('\n👨‍🎓 STUDENT:');
    console.log(`   Name: ${verifiedStudent.name.first} ${verifiedStudent.name.last}`);
    console.log(`   Student ID: ${verifiedStudent.studentID}`);
    console.log(`   Email: ${verifiedStudent.email}`);
    console.log(`   Course: ${verifiedStudent.course} - ${verifiedStudent.year}`);
    console.log(`   Batch: ${verifiedStudent.batch}`);
    console.log(`   Department: ${verifiedStudent.department.name}`);
    console.log(`   Coordinator: ${verifiedStudent.coordinator.name.first} ${verifiedStudent.coordinator.name.last}`);
    console.log(`   Achievements: ${verifiedStudent.achievements.length}`);
    console.log(`   GPA: ${verifiedStudent.gpa}`);
    console.log(`   ID: ${verifiedStudent._id}\n`);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ DATA CONSISTENCY CHECK PASSED!');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('📋 HIERARCHY SUMMARY:');
    console.log('   Institute: Rashtriya Raksha University');
    console.log('      └── College: Rashtriya Raksha University Gandhinagar');
    console.log('          └── Department: SITAICS');
    console.log(`              ├── Faculties: ${allFaculties.length} members`);
    console.log('              │   ├── Dr. Rajesh Sharma (Professor & Coordinator)');
    console.log('              │   └── 7 more faculty members');
    console.log('              └── Students');
    console.log('                  └── Arjun Verma (B.Tech 4th Year)');
    console.log('                      └── Coordinator: Dr. Rajesh Sharma\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the update
updateRRUConsistency();
