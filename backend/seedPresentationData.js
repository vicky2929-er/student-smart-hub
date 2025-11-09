const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SuperAdmin = require('./model/superadmin');
const Institute = require('./model/institute');
const College = require('./model/college');
const Department = require('./model/department');
const Faculty = require('./model/faculty');
const Student = require('./model/student');

// Current date: November 9, 2025
// We'll create achievements over the last 12 months for good timeline visualization

const getDateMonthsAgo = (months, day = 15) => {
  const date = new Date(2025, 10 - months, day); // November = month 10 (0-indexed)
  return date;
};

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
    studentCount: 15,
  },
  
  colleges: [
    {
      name: 'School of Computer Science and Engineering',
      code: 'SCSE',
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
      isCoordinator: true,
      joiningDate: new Date('2010-07-15'),
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
      isCoordinator: false,
      joiningDate: new Date('2015-08-01'),
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
      isCoordinator: false,
      joiningDate: new Date('2017-07-15'),
    },
  ],
  
  // Students with rich achievement data spread over 12 months
  students: [
    {
      name: { first: 'Aarav', last: 'Patel' },
      email: 'aarav.patel@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2022001',
      gender: 'Male',
      dateOfBirth: new Date('2004-03-15'),
      contactNumber: '+91-9876501001',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2022,
      batch: '2022-2026',
      gpa: 9.2,
      attendance: 92,
      bio: 'Passionate about AI/ML and open source development',
      interests: ['Machine Learning', 'Web Development', 'Open Source'],
      skills: {
        technical: ['Python', 'JavaScript', 'React', 'TensorFlow', 'Docker'],
        soft: ['Leadership', 'Team Collaboration', 'Public Speaking'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/aaravpatel',
        github: 'https://github.com/aaravpatel',
      },
      achievements: [
        // November 2024
        {
          title: 'Google Summer of Code 2024 - TensorFlow',
          type: 'Internship',
          description: 'Contributed to TensorFlow core library, implemented new optimization algorithms',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(0, 5),
          uploadedAt: getDateMonthsAgo(0, 5),
          status: 'Approved',
        },
        // October 2024
        {
          title: 'Smart India Hackathon 2024 - Winner',
          type: 'Hackathon',
          description: 'Developed AI-powered education platform, won first prize',
          organization: 'Government of India',
          dateCompleted: getDateMonthsAgo(1, 12),
          uploadedAt: getDateMonthsAgo(1, 12),
          status: 'Approved',
        },
        // September 2024
        {
          title: 'AWS Machine Learning Workshop',
          type: 'Workshop',
          description: 'Completed advanced ML workshop on AWS SageMaker',
          organization: 'Amazon Web Services',
          dateCompleted: getDateMonthsAgo(2, 8),
          uploadedAt: getDateMonthsAgo(2, 8),
          status: 'Approved',
        },
        // August 2024
        {
          title: 'IEEE International Conference on AI',
          type: 'Conference',
          description: 'Presented research paper on neural architecture search',
          organization: 'IEEE',
          dateCompleted: getDateMonthsAgo(3, 20),
          uploadedAt: getDateMonthsAgo(3, 20),
          status: 'Approved',
        },
        // July 2024
        {
          title: 'ACM ICPC Regional Finals',
          type: 'Competition',
          description: 'Secured 5th rank in regional programming competition',
          organization: 'ACM',
          dateCompleted: getDateMonthsAgo(4, 15),
          uploadedAt: getDateMonthsAgo(4, 15),
          status: 'Approved',
        },
        // June 2024
        {
          title: 'Code for Good - Social Impact Project',
          type: 'CommunityService',
          description: 'Developed education app for underprivileged students',
          organization: 'JPMorgan Chase',
          dateCompleted: getDateMonthsAgo(5, 10),
          uploadedAt: getDateMonthsAgo(5, 10),
          status: 'Approved',
        },
      ],
    },
    {
      name: { first: 'Diya', last: 'Sharma' },
      email: 'diya.sharma@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2022002',
      gender: 'Female',
      dateOfBirth: new Date('2004-07-22'),
      contactNumber: '+91-9876501002',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2022,
      batch: '2022-2026',
      gpa: 9.5,
      attendance: 95,
      bio: 'AI researcher and competitive programmer',
      interests: ['Artificial Intelligence', 'Research', 'Competitive Programming'],
      skills: {
        technical: ['C++', 'Python', 'PyTorch', 'Data Structures', 'Algorithms'],
        soft: ['Problem Solving', 'Research', 'Communication'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/diyasharma',
        github: 'https://github.com/diyasharma',
      },
      achievements: [
        // November 2024
        {
          title: 'Microsoft Student Ambassador - Gold',
          type: 'Leadership',
          description: 'Led technical workshops and mentored 50+ students',
          organization: 'Microsoft',
          dateCompleted: getDateMonthsAgo(0, 8),
          uploadedAt: getDateMonthsAgo(0, 8),
          status: 'Approved',
        },
        // October 2024
        {
          title: 'Grace Hopper Celebration 2024',
          type: 'Conference',
          description: 'Attended largest gathering of women technologists',
          organization: 'AnitaB.org',
          dateCompleted: getDateMonthsAgo(1, 18),
          uploadedAt: getDateMonthsAgo(1, 18),
          status: 'Approved',
        },
        // September 2024
        {
          title: 'Women in Tech Leadership Summit',
          type: 'Workshop',
          description: 'Participated in leadership development program',
          organization: 'WiT',
          dateCompleted: getDateMonthsAgo(2, 25),
          uploadedAt: getDateMonthsAgo(2, 25),
          status: 'Approved',
        },
        // August 2024
        {
          title: 'Google Code Jam - Top 100',
          type: 'Competition',
          description: 'Ranked in top 100 globally in programming competition',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(3, 12),
          uploadedAt: getDateMonthsAgo(3, 12),
          status: 'Approved',
        },
        // July 2024
        {
          title: 'AI Research Internship',
          type: 'Internship',
          description: 'Research intern at IIIT Delhi AI Lab',
          organization: 'IIIT Delhi',
          dateCompleted: getDateMonthsAgo(4, 30),
          uploadedAt: getDateMonthsAgo(4, 30),
          status: 'Approved',
        },
      ],
    },
    {
      name: { first: 'Rohan', last: 'Gupta' },
      email: 'rohan.gupta@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2022003',
      gender: 'Male',
      dateOfBirth: new Date('2004-01-10'),
      contactNumber: '+91-9876501003',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2022,
      batch: '2022-2026',
      gpa: 8.8,
      attendance: 88,
      bio: 'Full-stack developer and hackathon enthusiast',
      interests: ['Web Development', 'Cloud Computing', 'Entrepreneurship'],
      skills: {
        technical: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'AWS'],
        soft: ['Creativity', 'Adaptability', 'Time Management'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/rohangupta',
        github: 'https://github.com/rohangupta',
      },
      achievements: [
        // November 2024
        {
          title: 'DevFest Delhi 2024 - Speaker',
          type: 'Conference',
          description: 'Delivered talk on modern web development practices',
          organization: 'Google Developers Group',
          dateCompleted: getDateMonthsAgo(0, 3),
          uploadedAt: getDateMonthsAgo(0, 3),
          status: 'Approved',
        },
        // October 2024
        {
          title: 'Hack4Bengal 2024 - 2nd Prize',
          type: 'Hackathon',
          description: 'Built fintech solution for rural banking',
          organization: 'Hack4Bengal',
          dateCompleted: getDateMonthsAgo(1, 22),
          uploadedAt: getDateMonthsAgo(1, 22),
          status: 'Approved',
        },
        // September 2024
        {
          title: 'AWS Solutions Architect Certification',
          type: 'Course',
          description: 'Completed AWS Solutions Architect Associate certification',
          organization: 'Amazon Web Services',
          dateCompleted: getDateMonthsAgo(2, 5),
          uploadedAt: getDateMonthsAgo(2, 5),
          status: 'Approved',
        },
        // August 2024
        {
          title: 'Startup Weekend IIT Delhi',
          type: 'Competition',
          description: 'Co-founded startup idea, pitched to investors',
          organization: 'Techstars',
          dateCompleted: getDateMonthsAgo(3, 28),
          uploadedAt: getDateMonthsAgo(3, 28),
          status: 'Approved',
        },
        // July 2024
        {
          title: 'Full Stack Development Internship',
          type: 'Internship',
          description: 'Built scalable web applications at tech startup',
          organization: 'Zomato',
          dateCompleted: getDateMonthsAgo(4, 20),
          uploadedAt: getDateMonthsAgo(4, 20),
          status: 'Approved',
        },
        // June 2024
        {
          title: 'ReactJS Advanced Workshop',
          type: 'Workshop',
          description: 'Mastered advanced React patterns and performance optimization',
          organization: 'Meta',
          dateCompleted: getDateMonthsAgo(5, 15),
          uploadedAt: getDateMonthsAgo(5, 15),
          status: 'Approved',
        },
      ],
    },
    {
      name: { first: 'Ananya', last: 'Singh' },
      email: 'ananya.singh@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2022004',
      gender: 'Female',
      dateOfBirth: new Date('2004-09-05'),
      contactNumber: '+91-9876501004',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2022,
      batch: '2022-2026',
      gpa: 9.0,
      attendance: 90,
      bio: 'Cybersecurity enthusiast and tech community leader',
      interests: ['Cybersecurity', 'Blockchain', 'Community Building'],
      skills: {
        technical: ['Python', 'Linux', 'Network Security', 'Blockchain', 'Ethical Hacking'],
        soft: ['Leadership', 'Event Management', 'Mentoring'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/ananyasingh',
        github: 'https://github.com/ananyasingh',
      },
      achievements: [
        // November 2024
        {
          title: 'Cybersecurity Summit Asia 2024',
          type: 'Conference',
          description: 'Attended premier cybersecurity conference',
          organization: 'ISC2',
          dateCompleted: getDateMonthsAgo(0, 10),
          uploadedAt: getDateMonthsAgo(0, 10),
          status: 'Approved',
        },
        // October 2024
        {
          title: 'HackTheBox - Top 50 India',
          type: 'Competition',
          description: 'Achieved top 50 rank in ethical hacking platform',
          organization: 'HackTheBox',
          dateCompleted: getDateMonthsAgo(1, 15),
          uploadedAt: getDateMonthsAgo(1, 15),
          status: 'Approved',
        },
        // September 2024
        {
          title: 'Tech Community Lead - WiCS IIT Delhi',
          type: 'Leadership',
          description: 'Leading Women in Computer Science chapter',
          organization: 'IIT Delhi',
          dateCompleted: getDateMonthsAgo(2, 1),
          uploadedAt: getDateMonthsAgo(2, 1),
          status: 'Approved',
        },
        // August 2024
        {
          title: 'Blockchain Development Bootcamp',
          type: 'Workshop',
          description: 'Completed intensive blockchain development course',
          organization: 'Ethereum Foundation',
          dateCompleted: getDateMonthsAgo(3, 18),
          uploadedAt: getDateMonthsAgo(3, 18),
          status: 'Approved',
        },
        // July 2024
        {
          title: 'Teach for India - Tech Education',
          type: 'Volunteering',
          description: 'Teaching coding to underprivileged children',
          organization: 'Teach for India',
          dateCompleted: getDateMonthsAgo(4, 10),
          uploadedAt: getDateMonthsAgo(4, 10),
          status: 'Approved',
        },
        // June 2024
        {
          title: 'Women Techmakers Scholar 2024',
          type: 'Others',
          description: 'Selected as Google Women Techmakers Scholar',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(5, 25),
          uploadedAt: getDateMonthsAgo(5, 25),
          status: 'Approved',
        },
      ],
    },
    {
      name: { first: 'Arjun', last: 'Reddy' },
      email: 'arjun.reddy@student.iitd.ac.in',
      password: 'Student@123',
      studentID: 'IIT2022005',
      gender: 'Male',
      dateOfBirth: new Date('2004-11-18'),
      contactNumber: '+91-9876501005',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      enrollmentYear: 2022,
      batch: '2022-2026',
      gpa: 8.5,
      attendance: 85,
      bio: 'Mobile app developer and UI/UX designer',
      interests: ['Mobile Development', 'UI/UX Design', 'Product Management'],
      skills: {
        technical: ['Flutter', 'React Native', 'Figma', 'Firebase', 'Swift'],
        soft: ['Design Thinking', 'User Research', 'Project Management'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/arjunreddy',
        github: 'https://github.com/arjunreddy',
      },
      achievements: [
        // November 2024
        {
          title: 'Flutter India Conference 2024',
          type: 'Conference',
          description: 'Presented mobile app architecture best practices',
          organization: 'Flutter Community India',
          dateCompleted: getDateMonthsAgo(0, 2),
          uploadedAt: getDateMonthsAgo(0, 2),
          status: 'Approved',
        },
        // October 2024
        {
          title: 'App Design Challenge - Winner',
          type: 'Competition',
          description: 'Won national app design competition',
          organization: 'Adobe',
          dateCompleted: getDateMonthsAgo(1, 20),
          uploadedAt: getDateMonthsAgo(1, 20),
          status: 'Approved',
        },
        // September 2024
        {
          title: 'Google UX Design Professional Certificate',
          type: 'Course',
          description: 'Completed comprehensive UX design certification',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(2, 10),
          uploadedAt: getDateMonthsAgo(2, 10),
          status: 'Approved',
        },
        // August 2024
        {
          title: 'Mobile Dev Internship - Paytm',
          type: 'Internship',
          description: 'Developed features for Paytm mobile app',
          organization: 'Paytm',
          dateCompleted: getDateMonthsAgo(3, 25),
          uploadedAt: getDateMonthsAgo(3, 25),
          status: 'Approved',
        },
        // July 2024
        {
          title: 'Figma Design Workshop',
          type: 'Workshop',
          description: 'Advanced design systems and prototyping workshop',
          organization: 'Figma',
          dateCompleted: getDateMonthsAgo(4, 5),
          uploadedAt: getDateMonthsAgo(4, 5),
          status: 'Approved',
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
    await Promise.all([
      SuperAdmin.deleteMany({}),
      Student.deleteMany({}),
      Faculty.deleteMany({}),
      Department.deleteMany({}),
      College.deleteMany({}),
      Institute.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // Create Super Admin
    console.log('👤 Creating Super Admin...');
    const hashedSuperAdminPassword = await bcrypt.hash(seedData.superAdmin.password, 10);
    const superAdmin = await SuperAdmin.create({
      ...seedData.superAdmin,
      password: hashedSuperAdminPassword,
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

    // Update institute with colleges
    institute.colleges = colleges.map(c => c._id);
    await institute.save();

    // Create Departments
    console.log('📚 Creating Departments...');
    const departments = [];
    for (let i = 0; i < seedData.departments.length; i++) {
      const deptData = seedData.departments[i];
      const hashedPassword = await bcrypt.hash(deptData.password, 10);
      const college = colleges[i % 2]; // Alternate between colleges
      const department = await Department.create({
        ...deptData,
        password: hashedPassword,
        college: college._id,
        institute: institute._id,
      });
      departments.push(department);
      console.log(`   ✅ Department created: ${department.name} (${college.name})`);
    }
    console.log('');

    // Create Faculty
    console.log('👨‍🏫 Creating Faculty...');
    const facultyMembers = [];
    for (let i = 0; i < seedData.faculty.length; i++) {
      const facultyData = seedData.faculty[i];
      const hashedPassword = await bcrypt.hash(facultyData.password, 10);
      const department = departments[i % departments.length];
      const faculty = await Faculty.create({
        ...facultyData,
        password: hashedPassword,
        department: department._id,
      });
      facultyMembers.push(faculty);
      console.log(`   ✅ Faculty created: ${faculty.name.first} ${faculty.name.last}`);
    }
    console.log('');

    // Create Students with achievements
    console.log('👨‍🎓 Creating Students...');
    const students = [];
    const coordinator = facultyMembers.find(f => f.isCoordinator);
    
    for (const studentData of seedData.students) {
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const department = departments[0]; // All in CSE for consistency
      
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

    // Update faculty with students
    for (const faculty of facultyMembers) {
      faculty.students = students.map(s => s._id);
      await faculty.save();
    }

    // Print summary
    console.log('📊 Database Seeding Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Super Admins: ${1}`);
    console.log(`✅ Institutes: ${1}`);
    console.log(`✅ Colleges: ${colleges.length}`);
    console.log(`✅ Departments: ${departments.length}`);
    console.log(`✅ Faculty: ${facultyMembers.length}`);
    console.log(`✅ Students: ${students.length}`);
    const totalAchievements = students.reduce((sum, s) => sum + s.achievements.length, 0);
    console.log(`✅ Total Achievements: ${totalAchievements}`);
    console.log('═══════════════════════════════════════\n');

    // Print login credentials
    console.log('📝 Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Super Admin:');
    console.log(`  Email: ${seedData.superAdmin.email}`);
    console.log(`  Password: ${seedData.superAdmin.password}\n`);
    
    console.log('Faculty (all use password: Faculty@123):');
    seedData.faculty.forEach(f => {
      console.log(`  ${f.name.first} ${f.name.last}: ${f.email}`);
    });
    console.log('');
    
    console.log('Students (all use password: Student@123):');
    seedData.students.forEach(s => {
      console.log(`  ${s.name.first} ${s.name.last} (${s.gender})`);
      console.log(`    Email: ${s.email}`);
      console.log(`    GPA: ${s.gpa} | Attendance: ${s.attendance}%`);
      console.log(`    Achievements: ${s.achievements.length}`);
    });
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📈 All dates are consistent across last 12 months for perfect analytics visualization!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
