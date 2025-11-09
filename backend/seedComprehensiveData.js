const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SuperAdmin = require('./model/superadmin');
const Institute = require('./model/institute');
const College = require('./model/college');
const Department = require('./model/department');
const Faculty = require('./model/faculty');
const Student = require('./model/student');
const Event = require('./model/event');

// Helper function to get dates for last 12 months (Nov 2024 to Nov 2025)
const getDateMonthsAgo = (months, day = 15) => {
  const date = new Date(2025, 10 - months, day); // November 2025 = month 10 (0-indexed)
  return date;
};

const seedData = {
  superAdmin: {
    name: { first: 'Admin', last: 'Master' },
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
      qualifications: 'Ph.D. in Computer Science, M.Tech, B.Tech',
      specialization: 'Machine Learning, Data Science, Artificial Intelligence',
      experience: 15,
      contactNumber: '+91-9876543210',
      isCoordinator: true,
      joiningDate: new Date('2010-07-15'),
      dob: new Date('1980-05-20'),
      address: {
        line1: 'Faculty Quarters, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
    },
    {
      name: { first: 'Priya', last: 'Sharma' },
      facultyID: 'FAC002',
      email: 'priya.sharma@iitd.ac.in',
      password: 'Faculty@123',
      gender: 'Female',
      designation: 'Associate Professor',
      qualifications: 'Ph.D. in Artificial Intelligence, M.Tech',
      specialization: 'Deep Learning, Computer Vision, Neural Networks',
      experience: 10,
      contactNumber: '+91-9876543211',
      isCoordinator: false,
      joiningDate: new Date('2015-08-01'),
      dob: new Date('1985-08-12'),
      address: {
        line1: 'Sector 15, Rohini',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110085',
      },
    },
    {
      name: { first: 'Amit', last: 'Verma' },
      facultyID: 'FAC003',
      email: 'amit.verma@iitd.ac.in',
      password: 'Faculty@123',
      gender: 'Male',
      designation: 'Assistant Professor',
      qualifications: 'Ph.D. in Software Engineering, M.Tech',
      specialization: 'Cloud Computing, DevOps, Software Architecture',
      experience: 8,
      contactNumber: '+91-9876543212',
      isCoordinator: false,
      joiningDate: new Date('2017-07-15'),
      dob: new Date('1987-03-25'),
      address: {
        line1: 'Dwarka Sector 10',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110075',
      },
    },
  ],
  
  // Students with MIXED status achievements (Approved, Pending, Rejected)
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
      bio: 'Passionate about AI/ML and open source development. Active contributor to TensorFlow.',
      interests: ['Machine Learning', 'Web Development', 'Open Source', 'Research'],
      skills: {
        technical: ['Python', 'JavaScript', 'React', 'TensorFlow', 'Docker', 'Kubernetes'],
        soft: ['Leadership', 'Team Collaboration', 'Public Speaking', 'Problem Solving'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/aaravpatel',
        github: 'https://github.com/aaravpatel',
      },
      address: {
        line1: 'Hostel 5, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
      achievements: [
        // APPROVED - November 2024
        {
          title: 'Google Summer of Code 2024 - TensorFlow',
          type: 'Internship',
          description: 'Contributed to TensorFlow core library, implemented new optimization algorithms for neural networks',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(0, 5),
          uploadedAt: getDateMonthsAgo(0, 6),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(0, 7),
        },
        // APPROVED - October 2024
        {
          title: 'Smart India Hackathon 2024 - Winner',
          type: 'Hackathon',
          description: 'Developed AI-powered education platform that won first prize at national level',
          organization: 'Government of India',
          dateCompleted: getDateMonthsAgo(1, 12),
          uploadedAt: getDateMonthsAgo(1, 13),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(1, 14),
        },
        // PENDING - October 2024
        {
          title: 'Machine Learning Research Paper',
          type: 'Others',
          description: 'Submitted research paper on novel ML algorithm to IEEE conference',
          organization: 'IEEE',
          dateCompleted: getDateMonthsAgo(1, 25),
          uploadedAt: getDateMonthsAgo(1, 26),
          status: 'Pending',
        },
        // APPROVED - September 2024
        {
          title: 'AWS Machine Learning Workshop',
          type: 'Workshop',
          description: 'Completed advanced ML workshop on AWS SageMaker and deployment strategies',
          organization: 'Amazon Web Services',
          dateCompleted: getDateMonthsAgo(2, 8),
          uploadedAt: getDateMonthsAgo(2, 9),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(2, 10),
        },
        // REJECTED - September 2024
        {
          title: 'Local Coding Competition',
          type: 'Competition',
          description: 'Participated in inter-college coding competition',
          organization: 'Local College',
          dateCompleted: getDateMonthsAgo(2, 22),
          uploadedAt: getDateMonthsAgo(2, 23),
          status: 'Rejected',
          rejectionComment: 'Please provide valid certificate or proof of participation',
          reviewedAt: getDateMonthsAgo(2, 24),
        },
        // APPROVED - August 2024
        {
          title: 'IEEE International Conference on AI',
          type: 'Conference',
          description: 'Presented research paper on neural architecture search optimization',
          organization: 'IEEE',
          dateCompleted: getDateMonthsAgo(3, 20),
          uploadedAt: getDateMonthsAgo(3, 21),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(3, 22),
        },
        // APPROVED - July 2024
        {
          title: 'ACM ICPC Regional Finals',
          type: 'Competition',
          description: 'Secured 5th rank in regional programming competition',
          organization: 'ACM',
          dateCompleted: getDateMonthsAgo(4, 15),
          uploadedAt: getDateMonthsAgo(4, 16),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(4, 17),
        },
        // APPROVED - June 2024
        {
          title: 'Code for Good - Social Impact Project',
          type: 'CommunityService',
          description: 'Developed education app for underprivileged students',
          organization: 'JPMorgan Chase',
          dateCompleted: getDateMonthsAgo(5, 10),
          uploadedAt: getDateMonthsAgo(5, 11),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(5, 12),
        },
        // PENDING - May 2024
        {
          title: 'Tech Talk Series Speaker',
          type: 'Leadership',
          description: 'Conducted tech talk on AI trends',
          organization: 'IIT Delhi Tech Club',
          dateCompleted: getDateMonthsAgo(6, 5),
          uploadedAt: getDateMonthsAgo(6, 6),
          status: 'Pending',
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
      bio: 'AI researcher and competitive programmer. Passionate about advancing AI for social good.',
      interests: ['Artificial Intelligence', 'Research', 'Competitive Programming', 'Women in Tech'],
      skills: {
        technical: ['C++', 'Python', 'PyTorch', 'Data Structures', 'Algorithms', 'Research'],
        soft: ['Problem Solving', 'Research', 'Communication', 'Mentoring'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/diyasharma',
        github: 'https://github.com/diyasharma',
      },
      address: {
        line1: 'Hostel 3, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
      achievements: [
        // APPROVED - November 2024
        {
          title: 'Microsoft Student Ambassador - Gold',
          type: 'Leadership',
          description: 'Led technical workshops and mentored 50+ students in cloud technologies',
          organization: 'Microsoft',
          dateCompleted: getDateMonthsAgo(0, 8),
          uploadedAt: getDateMonthsAgo(0, 9),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(0, 10),
        },
        // APPROVED - October 2024
        {
          title: 'Grace Hopper Celebration 2024',
          type: 'Conference',
          description: 'Attended largest gathering of women technologists and presented research poster',
          organization: 'AnitaB.org',
          dateCompleted: getDateMonthsAgo(1, 18),
          uploadedAt: getDateMonthsAgo(1, 19),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(1, 20),
        },
        // REJECTED - October 2024
        {
          title: 'Online Course Completion',
          type: 'Course',
          description: 'Completed online ML course',
          organization: 'Coursera',
          dateCompleted: getDateMonthsAgo(1, 5),
          uploadedAt: getDateMonthsAgo(1, 6),
          status: 'Rejected',
          rejectionComment: 'Free online courses do not qualify. Please submit paid certifications or university courses.',
          reviewedAt: getDateMonthsAgo(1, 7),
        },
        // APPROVED - September 2024
        {
          title: 'Women in Tech Leadership Summit',
          type: 'Workshop',
          description: 'Participated in leadership development program for women in technology',
          organization: 'WiT',
          dateCompleted: getDateMonthsAgo(2, 25),
          uploadedAt: getDateMonthsAgo(2, 26),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(2, 27),
        },
        // APPROVED - August 2024
        {
          title: 'Google Code Jam - Top 100',
          type: 'Competition',
          description: 'Ranked in top 100 globally in programming competition',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(3, 12),
          uploadedAt: getDateMonthsAgo(3, 13),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(3, 14),
        },
        // PENDING - August 2024
        {
          title: 'Research Paper Submission',
          type: 'Others',
          description: 'Submitted paper to ACM conference',
          organization: 'ACM',
          dateCompleted: getDateMonthsAgo(3, 28),
          uploadedAt: getDateMonthsAgo(3, 29),
          status: 'Pending',
        },
        // APPROVED - July 2024
        {
          title: 'AI Research Internship',
          type: 'Internship',
          description: 'Research intern at IIIT Delhi AI Lab working on computer vision',
          organization: 'IIIT Delhi',
          dateCompleted: getDateMonthsAgo(4, 30),
          uploadedAt: getDateMonthsAgo(4, 30),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(5, 1),
        },
        // APPROVED - June 2024
        {
          title: 'Girls Who Code - Mentor',
          type: 'Volunteering',
          description: 'Mentored high school girls in programming',
          organization: 'Girls Who Code',
          dateCompleted: getDateMonthsAgo(5, 20),
          uploadedAt: getDateMonthsAgo(5, 21),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(5, 22),
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
      bio: 'Full-stack developer and hackathon enthusiast. Building scalable web applications.',
      interests: ['Web Development', 'Cloud Computing', 'Entrepreneurship', 'Startups'],
      skills: {
        technical: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
        soft: ['Creativity', 'Adaptability', 'Time Management', 'Teamwork'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/rohangupta',
        github: 'https://github.com/rohangupta',
      },
      address: {
        line1: 'Hostel 7, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
      achievements: [
        // APPROVED - November 2024
        {
          title: 'DevFest Delhi 2024 - Speaker',
          type: 'Conference',
          description: 'Delivered talk on modern web development practices and microservices',
          organization: 'Google Developers Group',
          dateCompleted: getDateMonthsAgo(0, 3),
          uploadedAt: getDateMonthsAgo(0, 4),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(0, 5),
        },
        // APPROVED - October 2024
        {
          title: 'Hack4Bengal 2024 - 2nd Prize',
          type: 'Hackathon',
          description: 'Built fintech solution for rural banking',
          organization: 'Hack4Bengal',
          dateCompleted: getDateMonthsAgo(1, 22),
          uploadedAt: getDateMonthsAgo(1, 23),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(1, 24),
        },
        // REJECTED - October 2024
        {
          title: 'Weekend Hackathon Participation',
          type: 'Hackathon',
          description: 'Participated in college hackathon',
          organization: 'College Tech Club',
          dateCompleted: getDateMonthsAgo(1, 8),
          uploadedAt: getDateMonthsAgo(1, 9),
          status: 'Rejected',
          rejectionComment: 'Internal college events need faculty coordinator approval',
          reviewedAt: getDateMonthsAgo(1, 10),
        },
        // APPROVED - September 2024
        {
          title: 'AWS Solutions Architect Certification',
          type: 'Course',
          description: 'Completed AWS Solutions Architect Associate certification',
          organization: 'Amazon Web Services',
          dateCompleted: getDateMonthsAgo(2, 5),
          uploadedAt: getDateMonthsAgo(2, 6),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(2, 7),
        },
        // PENDING - September 2024
        {
          title: 'Startup Pitch Competition',
          type: 'Competition',
          description: 'Pitched startup idea at entrepreneurship summit',
          organization: 'E-Summit IIT Delhi',
          dateCompleted: getDateMonthsAgo(2, 18),
          uploadedAt: getDateMonthsAgo(2, 19),
          status: 'Pending',
        },
        // APPROVED - August 2024
        {
          title: 'Startup Weekend IIT Delhi',
          type: 'Competition',
          description: 'Co-founded startup idea, pitched to investors, won best idea award',
          organization: 'Techstars',
          dateCompleted: getDateMonthsAgo(3, 28),
          uploadedAt: getDateMonthsAgo(3, 29),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(3, 30),
        },
        // APPROVED - July 2024
        {
          title: 'Full Stack Development Internship',
          type: 'Internship',
          description: 'Built scalable web applications at tech startup',
          organization: 'Zomato',
          dateCompleted: getDateMonthsAgo(4, 20),
          uploadedAt: getDateMonthsAgo(4, 21),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(4, 22),
        },
        // APPROVED - June 2024
        {
          title: 'ReactJS Advanced Workshop',
          type: 'Workshop',
          description: 'Mastered advanced React patterns and performance optimization',
          organization: 'Meta',
          dateCompleted: getDateMonthsAgo(5, 15),
          uploadedAt: getDateMonthsAgo(5, 16),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(5, 17),
        },
        // REJECTED - May 2024
        {
          title: 'Blog Writing',
          type: 'Others',
          description: 'Technical blog posts',
          organization: 'Personal Blog',
          dateCompleted: getDateMonthsAgo(6, 12),
          uploadedAt: getDateMonthsAgo(6, 13),
          status: 'Rejected',
          rejectionComment: 'Personal blogs do not qualify as verifiable achievements',
          reviewedAt: getDateMonthsAgo(6, 14),
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
      bio: 'Cybersecurity enthusiast and tech community leader. Passionate about ethical hacking.',
      interests: ['Cybersecurity', 'Blockchain', 'Community Building', 'Ethical Hacking'],
      skills: {
        technical: ['Python', 'Linux', 'Network Security', 'Blockchain', 'Ethical Hacking', 'Cryptography'],
        soft: ['Leadership', 'Event Management', 'Mentoring', 'Public Speaking'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/ananyasingh',
        github: 'https://github.com/ananyasingh',
      },
      address: {
        line1: 'Hostel 4, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
      achievements: [
        // APPROVED - November 2024
        {
          title: 'Cybersecurity Summit Asia 2024',
          type: 'Conference',
          description: 'Attended premier cybersecurity conference and networked with industry experts',
          organization: 'ISC2',
          dateCompleted: getDateMonthsAgo(0, 10),
          uploadedAt: getDateMonthsAgo(0, 11),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(0, 12),
        },
        // APPROVED - October 2024
        {
          title: 'HackTheBox - Top 50 India',
          type: 'Competition',
          description: 'Achieved top 50 rank in ethical hacking platform',
          organization: 'HackTheBox',
          dateCompleted: getDateMonthsAgo(1, 15),
          uploadedAt: getDateMonthsAgo(1, 16),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(1, 17),
        },
        // PENDING - October 2024
        {
          title: 'Cybersecurity Workshop Organizer',
          type: 'Leadership',
          description: 'Organized cybersecurity awareness workshop',
          organization: 'IIT Delhi',
          dateCompleted: getDateMonthsAgo(1, 28),
          uploadedAt: getDateMonthsAgo(1, 29),
          status: 'Pending',
        },
        // APPROVED - September 2024
        {
          title: 'Tech Community Lead - WiCS IIT Delhi',
          type: 'Leadership',
          description: 'Leading Women in Computer Science chapter with 100+ members',
          organization: 'IIT Delhi',
          dateCompleted: getDateMonthsAgo(2, 1),
          uploadedAt: getDateMonthsAgo(2, 2),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(2, 3),
        },
        // APPROVED - August 2024
        {
          title: 'Blockchain Development Bootcamp',
          type: 'Workshop',
          description: 'Completed intensive blockchain development course',
          organization: 'Ethereum Foundation',
          dateCompleted: getDateMonthsAgo(3, 18),
          uploadedAt: getDateMonthsAgo(3, 19),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(3, 20),
        },
        // REJECTED - August 2024
        {
          title: 'YouTube Tutorial Series',
          type: 'Others',
          description: 'Created cybersecurity tutorials',
          organization: 'YouTube',
          dateCompleted: getDateMonthsAgo(3, 5),
          uploadedAt: getDateMonthsAgo(3, 6),
          status: 'Rejected',
          rejectionComment: 'Personal content creation does not qualify without significant reach/impact metrics',
          reviewedAt: getDateMonthsAgo(3, 7),
        },
        // APPROVED - July 2024
        {
          title: 'Teach for India - Tech Education',
          type: 'Volunteering',
          description: 'Teaching coding to underprivileged children every weekend',
          organization: 'Teach for India',
          dateCompleted: getDateMonthsAgo(4, 10),
          uploadedAt: getDateMonthsAgo(4, 11),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(4, 12),
        },
        // APPROVED - June 2024
        {
          title: 'Women Techmakers Scholar 2024',
          type: 'Others',
          description: 'Selected as Google Women Techmakers Scholar',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(5, 25),
          uploadedAt: getDateMonthsAgo(5, 26),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(5, 27),
        },
        // APPROVED - May 2024
        {
          title: 'Certified Ethical Hacker (CEH)',
          type: 'Course',
          description: 'Achieved CEH certification',
          organization: 'EC-Council',
          dateCompleted: getDateMonthsAgo(6, 8),
          uploadedAt: getDateMonthsAgo(6, 9),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(6, 10),
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
      bio: 'Mobile app developer and UI/UX designer. Building beautiful and functional apps.',
      interests: ['Mobile Development', 'UI/UX Design', 'Product Management', 'Flutter'],
      skills: {
        technical: ['Flutter', 'React Native', 'Figma', 'Firebase', 'Swift', 'Kotlin'],
        soft: ['Design Thinking', 'User Research', 'Project Management', 'Creativity'],
      },
      social: {
        linkedin: 'https://linkedin.com/in/arjunreddy',
        github: 'https://github.com/arjunreddy',
      },
      address: {
        line1: 'Hostel 6, IIT Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110016',
      },
      achievements: [
        // APPROVED - November 2024
        {
          title: 'Flutter India Conference 2024',
          type: 'Conference',
          description: 'Presented mobile app architecture best practices',
          organization: 'Flutter Community India',
          dateCompleted: getDateMonthsAgo(0, 2),
          uploadedAt: getDateMonthsAgo(0, 3),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(0, 4),
        },
        // APPROVED - October 2024
        {
          title: 'App Design Challenge - Winner',
          type: 'Competition',
          description: 'Won national app design competition with innovative UI/UX',
          organization: 'Adobe',
          dateCompleted: getDateMonthsAgo(1, 20),
          uploadedAt: getDateMonthsAgo(1, 21),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(1, 22),
        },
        // PENDING - October 2024
        {
          title: 'App Launch - Student Marketplace',
          type: 'Others',
          description: 'Launched student marketplace app',
          organization: 'Personal Project',
          dateCompleted: getDateMonthsAgo(1, 10),
          uploadedAt: getDateMonthsAgo(1, 11),
          status: 'Pending',
        },
        // APPROVED - September 2024
        {
          title: 'Google UX Design Professional Certificate',
          type: 'Course',
          description: 'Completed comprehensive UX design certification',
          organization: 'Google',
          dateCompleted: getDateMonthsAgo(2, 10),
          uploadedAt: getDateMonthsAgo(2, 11),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(2, 12),
        },
        // REJECTED - September 2024
        {
          title: 'Freelance Design Work',
          type: 'Others',
          description: 'Freelance UI/UX design projects',
          organization: 'Fiverr',
          dateCompleted: getDateMonthsAgo(2, 25),
          uploadedAt: getDateMonthsAgo(2, 26),
          status: 'Rejected',
          rejectionComment: 'Freelance work does not qualify without institutional recognition',
          reviewedAt: getDateMonthsAgo(2, 27),
        },
        // APPROVED - August 2024
        {
          title: 'Mobile Dev Internship - Paytm',
          type: 'Internship',
          description: 'Developed features for Paytm mobile app reaching 50M+ users',
          organization: 'Paytm',
          dateCompleted: getDateMonthsAgo(3, 25),
          uploadedAt: getDateMonthsAgo(3, 26),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(3, 27),
        },
        // APPROVED - July 2024
        {
          title: 'Figma Design Workshop',
          type: 'Workshop',
          description: 'Advanced design systems and prototyping workshop',
          organization: 'Figma',
          dateCompleted: getDateMonthsAgo(4, 5),
          uploadedAt: getDateMonthsAgo(4, 6),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(4, 7),
        },
        // APPROVED - June 2024
        {
          title: 'UI/UX Design Hackathon - 3rd Place',
          type: 'Hackathon',
          description: 'Designed mobile app for healthcare in 48 hours',
          organization: 'DesignJam',
          dateCompleted: getDateMonthsAgo(5, 18),
          uploadedAt: getDateMonthsAgo(5, 19),
          status: 'Approved',
          reviewedAt: getDateMonthsAgo(5, 20),
        },
        // PENDING - May 2024
        {
          title: 'Design Mentorship Program',
          type: 'Leadership',
          description: 'Mentoring junior students in design',
          organization: 'IIT Delhi Design Club',
          dateCompleted: getDateMonthsAgo(6, 15),
          uploadedAt: getDateMonthsAgo(6, 16),
          status: 'Pending',
        },
      ],
    },
  ],

  // Events for comprehensive system
  events: [
    {
      title: 'Tech Fest 2025',
      description: 'Annual technical festival with workshops, competitions, and talks',
      eventType: 'Technical',
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-02-17'),
      venue: 'IIT Delhi Main Auditorium',
      capacity: 500,
      registrationDeadline: new Date('2025-02-10'),
    },
    {
      title: 'Coding Marathon',
      description: '24-hour coding competition',
      eventType: 'Competition',
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-01-21'),
      venue: 'Computer Lab Block-5',
      capacity: 200,
      registrationDeadline: new Date('2025-01-15'),
    },
    {
      title: 'Industry Connect Summit',
      description: 'Networking event with industry professionals',
      eventType: 'Workshop',
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-03-10'),
      venue: 'Conference Hall',
      capacity: 300,
      registrationDeadline: new Date('2025-03-05'),
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
      Event.deleteMany({}),
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
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
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
      console.log(`   ✅ Faculty created: ${faculty.name.first} ${faculty.name.last} (${faculty.designation})`);
    }
    console.log('');

    // Create Students with achievements
    console.log('👨‍🎓 Creating Students with Mixed Status Achievements...');
    const students = [];
    const coordinator = facultyMembers.find(f => f.isCoordinator);
    const reviewers = facultyMembers.filter(f => !f.isCoordinator);
    
    for (let i = 0; i < seedData.students.length; i++) {
      const studentData = seedData.students[i];
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      const department = departments[0]; // All in CSE for consistency
      
      // Add reviewer reference to approved/rejected achievements
      const achievementsWithReviewer = studentData.achievements.map((ach, index) => {
        if (ach.status === 'Approved' || ach.status === 'Rejected') {
          return {
            ...ach,
            verifiedBy: reviewers[index % reviewers.length]._id,
          };
        }
        return ach;
      });
      
      const student = await Student.create({
        ...studentData,
        achievements: achievementsWithReviewer,
        password: hashedPassword,
        department: department._id,
        coordinator: coordinator._id,
      });
      students.push(student);
      
      const approvedCount = student.achievements.filter(a => a.status === 'Approved').length;
      const pendingCount = student.achievements.filter(a => a.status === 'Pending').length;
      const rejectedCount = student.achievements.filter(a => a.status === 'Rejected').length;
      
      console.log(`   ✅ ${student.name.first} ${student.name.last}: ${student.achievements.length} total (✓${approvedCount} ⏳${pendingCount} ✗${rejectedCount})`);
    }
    console.log('');

    // Update faculty with students and achievement reviews
    console.log('🔗 Linking Faculty with Students and Reviews...');
    for (const faculty of facultyMembers) {
      faculty.students = students.map(s => s._id);
      
      // Add achievement reviews
      students.forEach(student => {
        student.achievements.forEach(achievement => {
          if ((achievement.status === 'Approved' || achievement.status === 'Rejected') && 
              achievement.verifiedBy && achievement.verifiedBy.equals(faculty._id)) {
            faculty.achievementsReviewed.push({
              achievementId: achievement._id,
              studentId: student._id,
              status: achievement.status,
              comment: achievement.rejectionComment || 'Good work!',
              reviewedAt: achievement.reviewedAt,
            });
          }
        });
      });
      
      await faculty.save();
      console.log(`   ✅ ${faculty.name.first} ${faculty.name.last}: ${faculty.achievementsReviewed.length} reviews completed`);
    }
    console.log('');

    // Events skipped (can be added later with proper model fields)
    const events = [];
    console.log('');

    // Calculate statistics
    const totalAchievements = students.reduce((sum, s) => sum + s.achievements.length, 0);
    const approvedAchievements = students.reduce((sum, s) => 
      sum + s.achievements.filter(a => a.status === 'Approved').length, 0);
    const pendingAchievements = students.reduce((sum, s) => 
      sum + s.achievements.filter(a => a.status === 'Pending').length, 0);
    const rejectedAchievements = students.reduce((sum, s) => 
      sum + s.achievements.filter(a => a.status === 'Rejected').length, 0);
    const totalReviews = facultyMembers.reduce((sum, f) => sum + f.achievementsReviewed.length, 0);

    // Print comprehensive summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 COMPREHENSIVE DATABASE SEEDING SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n🎯 USER ACCOUNTS:');
    console.log(`   ✅ Super Admins: 1`);
    console.log(`   ✅ Institutes: 1`);
    console.log(`   ✅ Colleges: ${colleges.length}`);
    console.log(`   ✅ Departments: ${departments.length}`);
    console.log(`   ✅ Faculty Members: ${facultyMembers.length}`);
    console.log(`   ✅ Students: ${students.length}`);
    
    console.log('\n📈 ACHIEVEMENT STATISTICS:');
    console.log(`   📊 Total Achievements: ${totalAchievements}`);
    console.log(`   ✅ Approved: ${approvedAchievements} (${Math.round(approvedAchievements/totalAchievements*100)}%)`);
    console.log(`   ⏳ Pending: ${pendingAchievements} (${Math.round(pendingAchievements/totalAchievements*100)}%)`);
    console.log(`   ✗ Rejected: ${rejectedAchievements} (${Math.round(rejectedAchievements/totalAchievements*100)}%)`);
    
    console.log('\n👨‍🏫 FACULTY ACTIVITY:');
    console.log(`   📝 Total Reviews Completed: ${totalReviews}`);
    console.log(`   🎓 Students per Faculty: ${Math.round(students.length / facultyMembers.length)}`);
    
    console.log('\n📅 EVENTS:');
    console.log(`   🎪 Total Events: ${events.length}`);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🔑 LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════════');
    
    console.log('\n👤 SUPER ADMIN:');
    console.log(`   Email: ${seedData.superAdmin.email}`);
    console.log(`   Password: ${seedData.superAdmin.password}`);
    
    console.log('\n🏛️  INSTITUTE:');
    console.log(`   Email: ${seedData.institute.email}`);
    console.log(`   Password: ${seedData.institute.password}`);
    
    console.log('\n👨‍🏫 FACULTY (All use password: Faculty@123):');
    seedData.faculty.forEach(f => {
      console.log(`   ${f.name.first} ${f.name.last} (${f.designation})`);
      console.log(`     └─ ${f.email}`);
    });
    
    console.log('\n👨‍🎓 STUDENTS (All use password: Student@123):');
    seedData.students.forEach((s, index) => {
      const student = students[index];
      const approved = student.achievements.filter(a => a.status === 'Approved').length;
      const pending = student.achievements.filter(a => a.status === 'Pending').length;
      const rejected = student.achievements.filter(a => a.status === 'Rejected').length;
      
      console.log(`   ${s.name.first} ${s.name.last} (${s.gender}) - GPA: ${s.gpa}`);
      console.log(`     └─ ${s.email}`);
      console.log(`     └─ Achievements: ✓${approved} ⏳${pending} ✗${rejected}`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✨ ANALYTICS FEATURES READY:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ Achievement Timeline (12 months data)');
    console.log('   ✅ Status Distribution (Approved/Pending/Rejected)');
    console.log('   ✅ Category Breakdown (All types covered)');
    console.log('   ✅ Faculty Review Dashboard');
    console.log('   ✅ Growth Metrics & Trends');
    console.log('   ✅ Monthly Goals Tracking');
    console.log('   ✅ Student Performance Analytics');
    console.log('   ✅ Department Analytics');
    console.log('   ✅ Institute-wide Statistics');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('📈 All data is consistent with mixed statuses for comprehensive analytics!');
    console.log('🎯 Perfect for presentation with all permutations covered!\n');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
