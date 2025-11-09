const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SuperAdmin = require('./model/superadmin');
const Institute = require('./model/institute');
const College = require('./model/college');
const Department = require('./model/department');
const Faculty = require('./model/faculty');
const Student = require('./model/student');

// Quality seed data with consistent information
const seedData = {
  superAdmin: {
    name: { first: 'Admin', last: 'User' },
    email: 'admin@smartstudenthub.com',
    password: 'Admin@123',
  },
  
  institute: {
    name: 'Indian Institute of Technology Delhi',
    code: 'IITD',
    type: 'University',
    email: 'admin@iitd.ac.in',
    password: 'IIT@Delhi123',
    address: {
      line1: 'Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110016',
    },
    contactNumber: '+91-11-26591111',
    website: 'https://www.iitd.ac.in',
    headOfInstitute: {
      name: 'Dr. Rangan Banerjee',
      email: 'director@iitd.ac.in',
      contact: '+91-11-26591001',
    },
    modalOfficer: {
      name: 'Dr. Subhasis Chaudhuri',
      email: 'modalofficer@iitd.ac.in',
      contact: '+91-11-26591002',
    },
    naacGrading: true,
    naacGrade: 'A++',
    status: 'Active',
    approvalStatus: 'Approved',
  },
  
  colleges: [
    {
      name: 'School of Computer Science',
      code: 'SCS',
      email: 'cs@iitd.ac.in',
      password: 'CS@IIT123',
      contactNumber: '+91-11-26591234',
      address: {
        line1: 'Block 5, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
    },
    {
      name: 'School of Engineering',
      code: 'SOE',
      email: 'engineering@iitd.ac.in',
      password: 'Eng@IIT123',
      contactNumber: '+91-11-26591235',
      address: {
        line1: 'Block 3, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
    },
  ],
  
  departments: [
    { name: 'Computer Science & Engineering', code: 'CSE', email: 'cse@iitd.ac.in', password: 'Dept@123' },
    { name: 'Electrical Engineering', code: 'EE', email: 'ee@iitd.ac.in', password: 'Dept@123' },
    { name: 'Mechanical Engineering', code: 'ME', email: 'me@iitd.ac.in', password: 'Dept@123' },
    { name: 'Mathematics & Computing', code: 'MNC', email: 'mnc@iitd.ac.in', password: 'Dept@123' },
  ],
  
  faculty: [
    {
      name: { first: 'Rajesh', last: 'Kumar' },
      facultyID: 'FAC001',
      email: 'rajesh.kumar@iitd.ac.in',
      password: 'Faculty@123',
      gender: 'Male',
      designation: 'Professor',
      qualification: 'Ph.D. in Computer Science',
      specialization: 'Machine Learning, Data Science',
      experience: 15,
      contactNumber: '+91-9876543210',
    },
    {
      name: { first: 'Priya', last: 'Sharma' },
      facultyID: 'FAC002',
      email: 'priya.sharma@iitd.ac.in',
      password: 'Faculty@123',
      gender: 'Female',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Artificial Intelligence',
      specialization: 'Deep Learning, Computer Vision',
      experience: 10,
      contactNumber: '+91-9876543211',
    },
    {
      name: { first: 'Amit', last: 'Verma' },
      facultyID: 'FAC003',
      email: 'amit.verma@iitd.ac.in',
      password: 'Faculty@123',
      gender: 'Male',
      designation: 'Assistant Professor',
      qualification: 'Ph.D. in Software Engineering',
      specialization: 'Cloud Computing, DevOps',
      experience: 8,
      contactNumber: '+91-9876543212',
    },
  ],
  
  students: [
    {
      name: { first: 'Aarav', last: 'Patel' },
      email: 'aarav.patel@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2021001',
      gender: 'Male',
      dateOfBirth: new Date('2003-05-15'),
      contactNumber: '+91-9876501001',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2021,
      batch: '2021-2025',
      achievements: [
        {
          title: 'Google Summer of Code 2024',
          type: 'Internship',
          description: 'Contributed to open-source ML project',
          organization: 'Google',
          dateCompleted: new Date('2024-08-15'),
          status: 'Approved',
          uploadedAt: new Date('2024-08-20'),
        },
        {
          title: 'Smart India Hackathon Winner',
          type: 'Hackathon',
          description: 'First prize in Software Edition',
          organization: 'Government of India',
          dateCompleted: new Date('2024-09-10'),
          status: 'Approved',
          uploadedAt: new Date('2024-09-15'),
        },
        {
          title: 'AWS Machine Learning Workshop',
          type: 'Workshop',
          description: 'Completed AWS ML certification workshop',
          organization: 'Amazon Web Services',
          dateCompleted: new Date('2024-10-05'),
          status: 'Approved',
          uploadedAt: new Date('2024-10-08'),
        },
      ],
    },
    {
      name: { first: 'Diya', last: 'Sharma' },
      email: 'diya.sharma@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2021002',
      gender: 'Female',
      dateOfBirth: new Date('2003-08-22'),
      contactNumber: '+91-9876501002',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2021,
      batch: '2021-2025',
      achievements: [
        {
          title: 'Microsoft Student Ambassador',
          type: 'Leadership',
          description: 'Selected as Microsoft Learn Student Ambassador',
          organization: 'Microsoft',
          dateCompleted: new Date('2024-07-20'),
          status: 'Approved',
          uploadedAt: new Date('2024-07-25'),
        },
        {
          title: 'Women in Tech Conference',
          type: 'Conference',
          description: 'Presented research paper on AI Ethics',
          organization: 'IEEE',
          dateCompleted: new Date('2024-09-05'),
          status: 'Approved',
          uploadedAt: new Date('2024-09-10'),
        },
      ],
    },
    {
      name: { first: 'Rohan', last: 'Gupta' },
      email: 'rohan.gupta@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2021003',
      gender: 'Male',
      dateOfBirth: new Date('2003-03-10'),
      contactNumber: '+91-9876501003',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2021,
      batch: '2021-2025',
      achievements: [
        {
          title: 'ACM ICPC Regionalist',
          type: 'Competition',
          description: 'Qualified for ACM ICPC Regional Round',
          organization: 'ACM',
          dateCompleted: new Date('2024-10-15'),
          status: 'Approved',
          uploadedAt: new Date('2024-10-18'),
        },
      ],
    },
    {
      name: { first: 'Ananya', last: 'Singh' },
      email: 'ananya.singh@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2021004',
      gender: 'Female',
      dateOfBirth: new Date('2003-11-28'),
      contactNumber: '+91-9876501004',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2021,
      batch: '2021-2025',
      achievements: [
        {
          title: 'Community Service - Teach for India',
          type: 'Volunteering',
          description: 'Taught programming to underprivileged children',
          organization: 'Teach for India',
          dateCompleted: new Date('2024-08-30'),
          status: 'Approved',
          uploadedAt: new Date('2024-09-02'),
        },
        {
          title: 'Google Cloud Certification',
          type: 'Course',
          description: 'Professional Cloud Architect Certification',
          organization: 'Google Cloud',
          dateCompleted: new Date('2024-09-20'),
          status: 'Approved',
          uploadedAt: new Date('2024-09-22'),
        },
      ],
    },
    {
      name: { first: 'Arjun', last: 'Reddy' },
      email: 'arjun.reddy@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2021005',
      gender: 'Male',
      dateOfBirth: new Date('2003-06-12'),
      contactNumber: '+91-9876501005',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2021,
      batch: '2021-2025',
      achievements: [
        {
          title: 'Startup Incubation Program',
          type: 'Leadership',
          description: 'Founded AI-based EdTech startup',
          organization: 'IIT Delhi Incubator',
          dateCompleted: new Date('2024-10-01'),
          status: 'Approved',
          uploadedAt: new Date('2024-10-05'),
        },
      ],
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await SuperAdmin.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Department.deleteMany({});
    await College.deleteMany({});
    await Institute.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Super Admin
    console.log('👤 Creating Super Admin...');
    const hashedAdminPassword = await bcrypt.hash(seedData.superAdmin.password, 10);
    const superAdmin = await SuperAdmin.create({
      ...seedData.superAdmin,
      password: hashedAdminPassword,
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}\n`);

    // Create Institute
    console.log('🏛️  Creating Institute...');
    const hashedInstitutePassword = await bcrypt.hash(seedData.institute.password, 10);
    const institute = await Institute.create({
      ...seedData.institute,
      password: hashedInstitutePassword,
    });
    console.log(`✅ Institute created: ${institute.name}\n`);

    // Create Colleges
    console.log('🏫 Creating Colleges...');
    const colleges = [];
    for (const collegeData of seedData.colleges) {
      const hashedPassword = await bcrypt.hash(collegeData.password, 10);
      const college = await College.create({
        ...collegeData,
        password: hashedPassword,
        institute: institute._id,
      });
      colleges.push(college);
      console.log(`   ✅ College created: ${college.name}`);
    }
    console.log('');

    // Create Departments (2 per college)
    console.log('📚 Creating Departments...');
    const departments = [];
    let deptIndex = 0;
    for (const college of colleges) {
      for (let i = 0; i < 2; i++) {
        const deptData = seedData.departments[deptIndex % seedData.departments.length];
        const department = await Department.create({
          ...deptData,
          college: college._id,
          institute: institute._id,
        });
        departments.push(department);
        console.log(`   ✅ Department created: ${department.name} (${college.name})`);
        deptIndex++;
      }
    }
    console.log('');

    // Create Faculty
    console.log('👨‍🏫 Creating Faculty...');
    const faculties = [];
    for (let i = 0; i < seedData.faculty.length; i++) {
      const facultyData = seedData.faculty[i];
      const hashedPassword = await bcrypt.hash(facultyData.password, 10);
      const department = departments[i % departments.length];
      
      const faculty = await Faculty.create({
        ...facultyData,
        password: hashedPassword,
        department: department._id,
        college: department.college,
        institute: institute._id,
      });
      faculties.push(faculty);
      console.log(`   ✅ Faculty created: ${faculty.name.first} ${faculty.name.last}`);
    }
    console.log('');

    // Create Students
    console.log('👨‍🎓 Creating Students...');
    const students = [];
    for (let i = 0; i < seedData.students.length; i++) {
      const studentData = seedData.students[i];
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const department = departments[i % departments.length];
      const coordinator = faculties[i % faculties.length];
      
      const student = await Student.create({
        ...studentData,
        password: hashedPassword,
        department: department._id,
        coordinator: coordinator._id,
      });
      students.push(student);
      console.log(`   ✅ Student created: ${student.name.first} ${student.name.last} (${student.achievements.length} achievements)`);
    }
    console.log('');

    // Summary
    console.log('📊 Database Seeding Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Super Admins: 1`);
    console.log(`✅ Institutes: 1`);
    console.log(`✅ Colleges: ${colleges.length}`);
    console.log(`✅ Departments: ${departments.length}`);
    console.log(`✅ Faculty: ${faculties.length}`);
    console.log(`✅ Students: ${students.length}`);
    console.log(`✅ Total Achievements: ${students.reduce((sum, s) => sum + s.achievements.length, 0)}`);
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Super Admin:');
    console.log(`  Email: ${seedData.superAdmin.email}`);
    console.log(`  Password: ${seedData.superAdmin.password}\n`);
    console.log('Faculty (example):');
    console.log(`  Email: ${seedData.faculty[0].email}`);
    console.log(`  Password: ${seedData.faculty[0].password}\n`);
    console.log('Students:');
    seedData.students.forEach(s => {
      console.log(`  ${s.name.first} ${s.name.last} (${s.gender})`);
      console.log(`    Email: ${s.email}`);
      console.log(`    Password: ${s.password}`);
      console.log(`    Achievements: ${s.achievements.length}`);
    });
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
