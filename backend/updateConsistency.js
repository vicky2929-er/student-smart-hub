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

async function updateConsistency() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB');

    // Step 1: Get or create an Institute
    let institute = await Institute.findOne();
    if (!institute) {
      console.log('❌ No institute found in database');
      process.exit(1);
    }
    console.log(`✅ Found Institute: ${institute.name} (${institute._id})`);

    // Step 2: Create or update RRU College
    let rruCollege = await College.findOne({ code: 'RRU' });
    
    if (!rruCollege) {
      console.log('📝 Creating RRU College...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      rruCollege = new College({
        institute: institute._id,
        name: 'Raffles Raipur University',
        code: 'RRU',
        email: 'rru@example.com',
        password: hashedPassword,
        contactNumber: '+91-9000000001',
        address: {
          line1: 'Raffles Campus',
          line2: 'University Road',
          city: 'Raipur',
          state: 'Chhattisgarh',
          country: 'India',
          pincode: '492001'
        },
        website: 'https://www.rru.edu.in',
        type: 'Engineering College',
        status: 'Active'
      });
      await rruCollege.save();
      console.log(`✅ Created RRU College: ${rruCollege._id}`);
    } else {
      console.log(`✅ Found existing RRU College: ${rruCollege._id}`);
    }

    // Step 3: Create or update SITAICS Department
    let sitaicsDept = await Department.findOne({ 
      code: 'SITAICS',
      college: rruCollege._id 
    });

    if (!sitaicsDept) {
      console.log('📝 Creating SITAICS Department...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      sitaicsDept = new Department({
        college: rruCollege._id,
        institute: institute._id,
        name: 'School of IT, AI & Computer Science (SITAICS)',
        code: 'SITAICS',
        email: 'sitaics@rru.edu.in',
        password: hashedPassword,
        contactNumber: '+91-9000000002',
        status: 'Active'
      });
      await sitaicsDept.save();
      console.log(`✅ Created SITAICS Department: ${sitaicsDept._id}`);
    } else {
      console.log(`✅ Found existing SITAICS Department: ${sitaicsDept._id}`);
    }

    // Step 4: Update Faculty
    console.log('\n📝 Updating Faculty...');
    const faculty = await Faculty.findById(FACULTY_ID);
    
    if (!faculty) {
      console.log(`❌ Faculty with ID ${FACULTY_ID} not found`);
      process.exit(1);
    }

    // Update faculty details
    faculty.department = sitaicsDept._id;
    faculty.name.first = 'Dr. Rajesh';
    faculty.name.last = 'Sharma';
    faculty.facultyID = 'FAC_RRU_SITAICS_001';
    faculty.email = 'rajesh.sharma@rru.edu.in';
    faculty.designation = 'Professor';
    faculty.contactNumber = '+91-9876543001';
    faculty.specialization = 'Artificial Intelligence, Machine Learning, Data Science';
    faculty.qualifications = 'Ph.D. in Computer Science, M.Tech in AI';
    faculty.experience = 15;
    faculty.joiningDate = new Date('2010-07-15');
    faculty.isCoordinator = true;

    await faculty.save();
    console.log(`✅ Updated Faculty: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   - Department: SITAICS (${sitaicsDept._id})`);
    console.log(`   - College: RRU (${rruCollege._id})`);
    console.log(`   - Faculty ID: ${faculty.facultyID}`);
    console.log(`   - Email: ${faculty.email}`);
    console.log(`   - Designation: ${faculty.designation}`);
    console.log(`   - Students Count: ${faculty.students.length}`);

    // Step 5: Update Student
    console.log('\n📝 Updating Student...');
    const student = await Student.findById(STUDENT_ID);
    
    if (!student) {
      console.log(`❌ Student with ID ${STUDENT_ID} not found`);
      process.exit(1);
    }

    // Update student details
    student.department = sitaicsDept._id;
    student.coordinator = faculty._id;
    student.name.first = 'Arjun';
    student.name.last = 'Verma';
    student.studentID = 'STU_RRU_SITAICS_2022_001';
    student.email = 'arjun.verma@rru.edu.in';
    student.contactNumber = '+91-9876543101';
    student.course = 'B.Tech';
    student.year = '4th Year';
    student.batch = '2022-2026';
    student.enrollmentYear = 2022;
    student.interests = ['Artificial Intelligence', 'Machine Learning', 'Web Development', 'Data Science'];
    student.skills.technical = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch'];
    student.skills.soft = ['Communication', 'Leadership', 'Problem Solving', 'Team Work'];
    student.bio = 'B.Tech student at SITAICS, RRU with a strong interest in AI/ML and Full Stack Development. Passionate about building innovative solutions using cutting-edge technologies.';
    student.address = {
      line1: 'Student Hostel Block A, Room 201',
      line2: 'RRU Campus',
      city: 'Raipur',
      state: 'Chhattisgarh',
      country: 'India',
      pincode: '492001'
    };

    await student.save();
    console.log(`✅ Updated Student: ${student.name.first} ${student.name.last}`);
    console.log(`   - Department: SITAICS (${sitaicsDept._id})`);
    console.log(`   - College: RRU (via department)`);
    console.log(`   - Student ID: ${student.studentID}`);
    console.log(`   - Email: ${student.email}`);
    console.log(`   - Course: ${student.course} ${student.year}`);
    console.log(`   - Coordinator: ${faculty.name.first} ${faculty.name.last} (${faculty._id})`);
    console.log(`   - Achievements: ${student.achievements.length}`);

    // Step 6: Update Department to include faculty
    if (!sitaicsDept.faculties.includes(faculty._id)) {
      sitaicsDept.faculties.push(faculty._id);
      await sitaicsDept.save();
      console.log(`✅ Added faculty to SITAICS department`);
    }

    // Step 7: Update College to include department
    if (!rruCollege.departments.includes(sitaicsDept._id)) {
      rruCollege.departments.push(sitaicsDept._id);
      await rruCollege.save();
      console.log(`✅ Added SITAICS to RRU college departments`);
    }

    // Step 8: Verify relationships
    console.log('\n🔍 Verifying Data Consistency...\n');
    
    const verifiedFaculty = await Faculty.findById(FACULTY_ID).populate('department');
    const verifiedStudent = await Student.findById(STUDENT_ID).populate('department coordinator');
    const verifiedDept = await Department.findById(sitaicsDept._id).populate('college');
    
    console.log('=== FINAL STATE ===');
    console.log('\n📚 College: RRU');
    console.log(`   Name: ${rruCollege.name}`);
    console.log(`   Code: ${rruCollege.code}`);
    console.log(`   Location: ${rruCollege.address.city}, ${rruCollege.address.state}`);
    
    console.log('\n🏫 Department: SITAICS');
    console.log(`   Name: ${verifiedDept.name}`);
    console.log(`   Code: ${verifiedDept.code}`);
    console.log(`   College: ${verifiedDept.college.name} (${verifiedDept.college.code})`);
    console.log(`   Faculties: ${verifiedDept.faculties.length}`);
    
    console.log('\n👨‍🏫 Faculty:');
    console.log(`   Name: ${verifiedFaculty.name.first} ${verifiedFaculty.name.last}`);
    console.log(`   Faculty ID: ${verifiedFaculty.facultyID}`);
    console.log(`   Email: ${verifiedFaculty.email}`);
    console.log(`   Designation: ${verifiedFaculty.designation}`);
    console.log(`   Department: ${verifiedFaculty.department.name} (${verifiedFaculty.department.code})`);
    console.log(`   College: ${verifiedDept.college.name} (${verifiedDept.college.code})`);
    console.log(`   Students: ${verifiedFaculty.students.length}`);
    console.log(`   Is Coordinator: ${verifiedFaculty.isCoordinator}`);
    
    console.log('\n👨‍🎓 Student:');
    console.log(`   Name: ${verifiedStudent.name.first} ${verifiedStudent.name.last}`);
    console.log(`   Student ID: ${verifiedStudent.studentID}`);
    console.log(`   Email: ${verifiedStudent.email}`);
    console.log(`   Course: ${verifiedStudent.course} - ${verifiedStudent.year}`);
    console.log(`   Batch: ${verifiedStudent.batch}`);
    console.log(`   Department: ${verifiedStudent.department.name} (${verifiedStudent.department.code})`);
    console.log(`   College: ${verifiedDept.college.name} (${verifiedDept.college.code})`);
    console.log(`   Coordinator: ${verifiedStudent.coordinator.name.first} ${verifiedStudent.coordinator.name.last}`);
    console.log(`   Achievements: ${verifiedStudent.achievements.length}`);
    console.log(`   GPA: ${verifiedStudent.gpa}`);
    
    console.log('\n✅ All data is now consistent!');
    console.log('\n📋 Summary:');
    console.log(`   - College: Raffles Raipur University (RRU)`);
    console.log(`   - Department: School of IT, AI & Computer Science (SITAICS)`);
    console.log(`   - Faculty: Dr. Rajesh Sharma (Professor & Coordinator)`);
    console.log(`   - Student: Arjun Verma (B.Tech 4th Year)`);
    console.log(`   - Relationship: Student → Coordinator → Department → College`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the update
updateConsistency();
