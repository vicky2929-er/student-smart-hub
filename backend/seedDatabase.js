require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import all models
const SuperAdmin = require("./model/superadmin");
const Institute = require("./model/institute");
const College = require("./model/college");
const Department = require("./model/department");
const Faculty = require("./model/faculty");
const Student = require("./model/student");
const Event = require("./model/event");
const Roadmap = require("./model/roadmap");
const OcrOutput = require("./model/ocrOutput");

// Connect to database
const dbUrl = process.env.DBURL;

async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

// Helper function to hash passwords
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// Helper function to generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random element from array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to get random elements from array
function randomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      SuperAdmin.deleteMany({}),
      Institute.deleteMany({}),
      College.deleteMany({}),
      Department.deleteMany({}),
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Event.deleteMany({}),
      Roadmap.deleteMany({}),
      OcrOutput.deleteMany({}),
    ]);
    console.log("✅ Database cleared");

    // 1. Create SuperAdmin
    console.log("\n📊 Creating SuperAdmin...");
    const superAdmin = await SuperAdmin.create({
      name: { first: "Super", last: "Admin" },
      email: "admin@sih2025.com",
      password: await hashPassword("admin123"),
      contactNumber: "+91-9999999999",
      permissions: ["full_access"],
      status: "Active",
    });
    console.log("✅ SuperAdmin created: admin@sih2025.com / admin123");

    // 2. Create Institutes
    console.log("\n🏛️  Creating Institutes...");
    const institutes = await Institute.insertMany([
      {
        name: "Indian Institute of Technology Delhi",
        code: "IITD2024",
        aisheCode: "U-0100",
        type: "Government",
        email: "admin@iitd.ac.in",
        password: await hashPassword("password123"),
        contactNumber: "+91-11-26591111",
        address: {
          line1: "Hauz Khas",
          city: "New Delhi",
          state: "Delhi",
          district: "South Delhi",
          country: "India",
          pincode: "110016",
        },
        website: "https://home.iitd.ac.in",
        headOfInstitute: {
          name: "Prof. Rangan Banerjee",
          email: "director@iitd.ac.in",
          contact: "+91-11-26591000",
        },
        modalOfficer: {
          name: "Dr. Rajesh Kumar",
          email: "modaloff@iitd.ac.in",
          contact: "+91-11-26591100",
        },
        naacGrading: true,
        naacGrade: "A++",
        status: "Active",
        approvalStatus: "Approved",
        approvedBy: superAdmin._id,
        approvedAt: new Date("2024-01-15"),
        studentCount: 0,
      },
      {
        name: "Symbiosis International University",
        code: "SIU2024",
        aisheCode: "U-0500",
        type: "Private",
        email: "admin@siu.edu.in",
        password: await hashPassword("password123"),
        contactNumber: "+91-20-25283000",
        address: {
          line1: "Gram: Lavale, Tal: Mulshi",
          city: "Pune",
          state: "Maharashtra",
          district: "Pune",
          country: "India",
          pincode: "412115",
        },
        website: "https://www.siu.edu.in",
        headOfInstitute: {
          name: "Dr. Rajani Gupte",
          email: "vc@siu.edu.in",
          contact: "+91-20-25283001",
        },
        modalOfficer: {
          name: "Dr. Priya Sharma",
          email: "modal@siu.edu.in",
          contact: "+91-20-25283002",
        },
        naacGrading: true,
        naacGrade: "A+",
        status: "Active",
        approvalStatus: "Approved",
        approvedBy: superAdmin._id,
        approvedAt: new Date("2024-02-10"),
        studentCount: 0,
      },
      {
        name: "Anna University",
        code: "AU2024",
        aisheCode: "U-0300",
        type: "Government",
        email: "admin@annauniv.edu",
        password: await hashPassword("password123"),
        contactNumber: "+91-44-22351111",
        address: {
          line1: "Sardar Patel Road, Guindy",
          city: "Chennai",
          state: "Tamil Nadu",
          district: "Chennai",
          country: "India",
          pincode: "600025",
        },
        website: "https://www.annauniv.edu",
        headOfInstitute: {
          name: "Dr. R. Velraj",
          email: "vc@annauniv.edu",
          contact: "+91-44-22351001",
        },
        modalOfficer: {
          name: "Dr. Meera Nair",
          email: "modal@annauniv.edu",
          contact: "+91-44-22351002",
        },
        naacGrading: true,
        naacGrade: "A+",
        status: "Active",
        approvalStatus: "Approved",
        approvedBy: superAdmin._id,
        approvedAt: new Date("2024-01-20"),
        studentCount: 0,
      },
    ]);
    console.log(`✅ Created ${institutes.length} institutes`);

    // 3. Create Colleges
    console.log("\n🏫 Creating Colleges...");
    const colleges = [];
    
    // IIT Delhi Colleges
    colleges.push(
      ...(await College.insertMany([
        {
          institute: institutes[0]._id,
          name: "School of Engineering & Technology",
          code: "IITD-SET",
          email: "set@iitd.ac.in",
          password: await hashPassword("password123"),
          contactNumber: "+91-11-26591200",
          address: institutes[0].address,
          website: "https://home.iitd.ac.in/engineering",
          type: "Engineering College",
          status: "Active",
        },
        {
          institute: institutes[0]._id,
          name: "School of Management & Social Sciences",
          code: "IITD-SMSS",
          email: "smss@iitd.ac.in",
          password: await hashPassword("password123"),
          contactNumber: "+91-11-26591300",
          address: institutes[0].address,
          type: "Commerce College",
          status: "Active",
        },
      ]))
    );

    // SIU Colleges
    colleges.push(
      ...(await College.insertMany([
        {
          institute: institutes[1]._id,
          name: "Symbiosis Institute of Technology",
          code: "SIU-SIT",
          email: "sit@siu.edu.in",
          password: await hashPassword("password123"),
          contactNumber: "+91-20-25283100",
          address: institutes[1].address,
          website: "https://www.sitpune.edu.in",
          type: "Engineering College",
          status: "Active",
        },
        {
          institute: institutes[1]._id,
          name: "Symbiosis Institute of Business Management",
          code: "SIU-SIBM",
          email: "sibm@siu.edu.in",
          password: await hashPassword("password123"),
          contactNumber: "+91-20-25283200",
          address: institutes[1].address,
          type: "Commerce College",
          status: "Active",
        },
      ]))
    );

    // Anna University Colleges
    colleges.push(
      ...(await College.insertMany([
        {
          institute: institutes[2]._id,
          name: "College of Engineering Guindy",
          code: "AU-CEG",
          email: "ceg@annauniv.edu",
          password: await hashPassword("password123"),
          contactNumber: "+91-44-22351100",
          address: institutes[2].address,
          type: "Engineering College",
          status: "Active",
        },
        {
          institute: institutes[2]._id,
          name: "School of Architecture & Planning",
          code: "AU-SAP",
          email: "sap@annauniv.edu",
          password: await hashPassword("password123"),
          contactNumber: "+91-44-22351200",
          address: institutes[2].address,
          type: "Arts College",
          status: "Active",
        },
      ]))
    );

    console.log(`✅ Created ${colleges.length} colleges`);

    // 4. Create Departments
    console.log("\n🎓 Creating Departments...");
    const departments = [];

    // Departments for each college
    const departmentData = [
      // IIT Delhi - SET
      { college: colleges[0], name: "Computer Science & Engineering", code: "IITD-CSE" },
      { college: colleges[0], name: "Electrical Engineering", code: "IITD-EE" },
      { college: colleges[0], name: "Mechanical Engineering", code: "IITD-ME" },
      // IIT Delhi - SMSS
      { college: colleges[1], name: "Management Studies", code: "IITD-MS" },
      // SIU - SIT
      { college: colleges[2], name: "Computer Engineering", code: "SIU-CE" },
      { college: colleges[2], name: "Information Technology", code: "SIU-IT" },
      { college: colleges[2], name: "Electronics & Telecommunication", code: "SIU-ET" },
      // SIU - SIBM
      { college: colleges[3], name: "Business Administration", code: "SIU-BA" },
      // Anna Univ - CEG
      { college: colleges[4], name: "Computer Science & Engineering", code: "AU-CSE" },
      { college: colleges[4], name: "Electronics & Communication", code: "AU-ECE" },
      { college: colleges[4], name: "Civil Engineering", code: "AU-CE" },
      // Anna Univ - SAP
      { college: colleges[5], name: "Architecture", code: "AU-ARCH" },
    ];

    for (const dept of departmentData) {
      departments.push(
        await Department.create({
          college: dept.college._id,
          institute: dept.college.institute,
          name: dept.name,
          code: dept.code,
          email: `${dept.code.toLowerCase()}@example.edu`,
          password: await hashPassword("password123"),
          contactNumber: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          status: "Active",
        })
      );
    }
    console.log(`✅ Created ${departments.length} departments`);

    // 5. Create Faculty
    console.log("\n👨‍🏫 Creating Faculty Members...");
    const facultyNames = [
      { first: "Rajesh", last: "Kumar" },
      { first: "Priya", last: "Sharma" },
      { first: "Amit", last: "Verma" },
      { first: "Sneha", last: "Patel" },
      { first: "Vikram", last: "Singh" },
      { first: "Anita", last: "Desai" },
      { first: "Rahul", last: "Mehta" },
      { first: "Kavita", last: "Joshi" },
      { first: "Sanjay", last: "Gupta" },
      { first: "Neha", last: "Reddy" },
      { first: "Arun", last: "Nair" },
      { first: "Pooja", last: "Iyer" },
      { first: "Manoj", last: "Pillai" },
      { first: "Deepa", last: "Krishnan" },
      { first: "Suresh", last: "Rao" },
      { first: "Ritu", last: "Bansal" },
      { first: "Kiran", last: "Choudhary" },
      { first: "Anjali", last: "Malhotra" },
      { first: "Vivek", last: "Agarwal" },
      { first: "Shweta", last: "Pandey" },
    ];

    const designations = [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ];

    const specializations = [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Science",
      "Cyber Security",
      "Cloud Computing",
      "Software Engineering",
      "Database Systems",
      "Computer Networks",
      "Embedded Systems",
      "VLSI Design",
      "Digital Signal Processing",
      "Power Systems",
      "Control Systems",
      "Structural Engineering",
      "Operations Management",
      "Marketing",
      "Finance",
      "Human Resource Management",
      "Urban Planning",
      "Sustainable Architecture",
    ];

    const faculties = [];
    let facultyCounter = 1;

    for (const dept of departments) {
      // Create 3-5 faculty per department
      const numFaculty = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numFaculty; i++) {
        const name = facultyNames[(facultyCounter - 1) % facultyNames.length];
        const isHOD = i === 0; // First faculty is HOD
        
        const faculty = await Faculty.create({
          department: dept._id,
          name: name,
          facultyID: `FAC${String(facultyCounter).padStart(4, "0")}`,
          email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}.${facultyCounter}@example.edu`,
          password: await hashPassword("password123"),
          designation: isHOD ? "Professor" : randomElement(designations),
          contactNumber: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          dob: randomDate(new Date(1965, 0, 1), new Date(1990, 11, 31)),
          gender: Math.random() > 0.5 ? "Male" : "Female",
          joiningDate: randomDate(new Date(2010, 0, 1), new Date(2023, 11, 31)),
          experience: 5 + Math.floor(Math.random() * 20),
          qualifications: "Ph.D., M.Tech, B.Tech",
          specialization: randomElement(specializations),
          isCoordinator: isHOD,
          status: "Active",
        });

        faculties.push(faculty);
        facultyCounter++;
      }
    }
    console.log(`✅ Created ${faculties.length} faculty members`);

    // Update departments with faculty and HOD
    console.log("\n🔄 Updating departments with faculty...");
    for (const dept of departments) {
      const deptFaculty = faculties.filter(
        (f) => f.department.toString() === dept._id.toString()
      );
      dept.faculties = deptFaculty.map((f) => f._id);
      dept.hod = deptFaculty[0]._id; // First faculty is HOD
      await dept.save();
    }

    // 6. Create Students
    console.log("\n👨‍🎓 Creating Students...");
    const firstNames = [
      "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan",
      "Krishna", "Ishaan", "Aadhya", "Diya", "Ananya", "Saanvi", "Navya",
      "Pari", "Aarohi", "Sara", "Kiara", "Aanya", "Riya", "Myra", "Shanaya",
      "Isha", "Kavya", "Prisha", "Tara", "Zara", "Nisha", "Sia",
    ];

    const lastNames = [
      "Sharma", "Verma", "Patel", "Kumar", "Singh", "Reddy", "Iyer", "Nair",
      "Gupta", "Joshi", "Mehta", "Desai", "Pillai", "Rao", "Krishnan",
      "Bansal", "Malhotra", "Agarwal", "Choudhary", "Pandey",
    ];

    const courses = ["B.Tech", "M.Tech", "MBA", "B.Arch", "BBA"];
    const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"];

    const technicalSkills = [
      "Python", "Java", "JavaScript", "React", "Node.js", "MongoDB",
      "SQL", "Machine Learning", "Data Analysis", "AWS", "Docker",
      "Kubernetes", "Git", "HTML/CSS", "C++", "Angular", "Vue.js",
      "TensorFlow", "PyTorch", "Django", "Flask", "Spring Boot",
    ];

    const softSkills = [
      "Communication", "Leadership", "Teamwork", "Problem Solving",
      "Critical Thinking", "Time Management", "Adaptability",
      "Creativity", "Public Speaking", "Project Management",
    ];

    const interests = [
      "Web Development", "Mobile Apps", "AI/ML", "Data Science",
      "Cyber Security", "Cloud Computing", "IoT", "Blockchain",
      "Game Development", "UI/UX Design", "DevOps", "Robotics",
    ];

    const students = [];
    let studentCounter = 1;

    for (const dept of departments) {
      // Create 20-30 students per department
      const numStudents = 20 + Math.floor(Math.random() * 11);
      const deptFaculty = faculties.filter(
        (f) => f.department.toString() === dept._id.toString()
      );

      for (let i = 0; i < numStudents; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const enrollmentYear = 2021 + Math.floor(Math.random() * 4);
        const batch = batches[enrollmentYear - 2021];
        const year = years[Math.min(2024 - enrollmentYear, 3)];

        const student = await Student.create({
          department: dept._id,
          coordinator: randomElement(deptFaculty)._id,
          name: { first: firstName, last: lastName },
          studentID: `STU${String(studentCounter).padStart(5, "0")}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${studentCounter}@student.edu`,
          password: await hashPassword("student123"),
          dateOfBirth: randomDate(new Date(2000, 0, 1), new Date(2006, 11, 31)),
          gender: Math.random() > 0.5 ? "Male" : "Female",
          contactNumber: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          bio: `Passionate ${dept.name} student with interests in ${randomElement(interests)}`,
          course: randomElement(courses),
          year: year,
          interests: randomElements(interests, 2 + Math.floor(Math.random() * 3)),
          skills: {
            technical: randomElements(technicalSkills, 3 + Math.floor(Math.random() * 5)),
            soft: randomElements(softSkills, 3 + Math.floor(Math.random() * 4)),
          },
          enrollmentYear: enrollmentYear,
          batch: batch,
          gpa: 6.5 + Math.random() * 3, // GPA between 6.5 and 9.5
          attendance: 70 + Math.floor(Math.random() * 30), // Attendance between 70 and 100
          resumeGenerated: Math.random() > 0.3,
          status: "Active",
          social: {
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
            github: Math.random() > 0.5 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
          },
        });

        students.push(student);
        studentCounter++;
      }
    }
    console.log(`✅ Created ${students.length} students`);

    // Update faculty with students
    console.log("\n🔄 Updating faculty with students...");
    for (const faculty of faculties) {
      const assignedStudents = students.filter(
        (s) => s.coordinator && s.coordinator.toString() === faculty._id.toString()
      );
      faculty.students = assignedStudents.map((s) => s._id);
      await faculty.save();
    }

    // 7. Create Student Achievements
    console.log("\n🏆 Creating Student Achievements...");
    const achievementTypes = [
      "Workshop", "Conference", "Hackathon", "Internship", "Course",
      "Competition", "CommunityService", "Leadership", "Clubs", "Volunteering",
    ];

    const achievementTitles = {
      Workshop: [
        "Machine Learning Workshop by Google",
        "Web Development Bootcamp",
        "Cloud Computing with AWS",
        "Cyber Security Fundamentals",
        "Mobile App Development",
      ],
      Conference: [
        "International Conference on AI",
        "IEEE TechCon 2024",
        "National IT Summit",
        "Research Symposium",
      ],
      Hackathon: [
        "Smart India Hackathon 2024",
        "HackMIT Finals",
        "Code for Good",
        "National Level Hackathon",
      ],
      Internship: [
        "Software Development Intern at Google",
        "Data Analyst at Microsoft",
        "ML Engineer at Amazon",
        "Full Stack Developer at Startup",
      ],
      Course: [
        "Complete Python Bootcamp - Udemy",
        "AWS Certified Solutions Architect",
        "Google Data Analytics Certificate",
        "Meta React Developer Certificate",
      ],
      Competition: [
        "National Coding Competition - 1st Place",
        "State Level Tech Quiz Winner",
        "Project Competition Winner",
      ],
    };

    const organizations = [
      "Google", "Microsoft", "Amazon", "IBM", "TCS", "Infosys", "Wipro",
      "Accenture", "Cognizant", "Coursera", "Udemy", "IEEE", "ACM",
    ];

    let achievementCount = 0;
    for (const student of students) {
      // Each student gets 2-6 achievements
      const numAchievements = 2 + Math.floor(Math.random() * 5);
      const achievements = [];

      for (let i = 0; i < numAchievements; i++) {
        const type = randomElement(achievementTypes);
        const titles = achievementTitles[type] || ["Achievement"];
        const status = Math.random() > 0.2 ? "Approved" : (Math.random() > 0.5 ? "Pending" : "Rejected");
        const verifier = status === "Approved" ? randomElement(faculties.filter(f => f.department.toString() === student.department.toString()))._id : null;

        achievements.push({
          title: randomElement(titles),
          type: type,
          description: `Successfully completed ${randomElement(titles)}`,
          organization: randomElement(organizations),
          instituteEmail: student.coordinator ? faculties.find(f => f._id.toString() === student.coordinator.toString())?.email : null,
          dateCompleted: randomDate(new Date(2023, 0, 1), new Date()),
          status: status,
          verifiedBy: verifier,
          reviewedAt: status !== "Pending" ? randomDate(new Date(2023, 6, 1), new Date()) : null,
          uploadedAt: randomDate(new Date(2023, 0, 1), new Date()),
        });
        achievementCount++;
      }

      student.achievements = achievements;
      await student.save();
    }
    console.log(`✅ Created ${achievementCount} student achievements`);

    // 8. Create Events
    console.log("\n📅 Creating Events...");
    const eventTypes = [
      "Workshop", "Seminar", "Conference", "Competition", "Cultural",
      "Sports", "Hackathon", "Guest Lecture", "Placement Drive",
    ];

    const eventTitles = {
      Workshop: ["AI/ML Workshop", "Web Development Bootcamp", "Cloud Computing Session", "Cyber Security Training"],
      Seminar: ["Industry Trends Seminar", "Research Methodology", "Career Guidance Session"],
      Conference: ["Tech Conference 2024", "International Symposium", "National Level Conference"],
      Competition: ["Coding Competition", "Project Showcase", "Tech Quiz", "Debate Competition"],
      Cultural: ["Cultural Fest", "Annual Day", "Talent Show", "Music Concert"],
      Sports: ["Sports Day", "Cricket Tournament", "Football League", "Athletics Meet"],
      Hackathon: ["24-Hour Hackathon", "Smart India Hackathon", "Innovation Challenge"],
      "Guest Lecture": ["Industry Expert Talk", "Alumni Session", "Motivational Speech"],
      "Placement Drive": ["TCS Recruitment", "Campus Placement Drive", "Internship Fair"],
    };

    const events = [];
    const now = new Date();
    let eventCounter = 1;

    for (const dept of departments) {
      // Create 5-10 events per department
      const numEvents = 5 + Math.floor(Math.random() * 6);
      const deptFaculty = faculties.filter(
        (f) => f.department.toString() === dept._id.toString()
      );
      const deptStudents = students.filter(
        (s) => s.department.toString() === dept._id.toString()
      );

      for (let i = 0; i < numEvents; i++) {
        const eventType = randomElement(eventTypes);
        const titles = eventTitles[eventType] || ["Department Event"];
        const eventDate = randomDate(
          new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
          new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)  // 3 months ahead
        );
        const isPast = eventDate < now;
        
        // Get college for this department
        const college = colleges.find(c => c._id.toString() === dept.college.toString());

        const event = await Event.create({
          title: `${randomElement(titles)} ${eventCounter}`,
          description: `Join us for an exciting ${eventType.toLowerCase()} organized by ${dept.name}`,
          eventDate: eventDate,
          eventTime: `${9 + Math.floor(Math.random() * 8)}:00 AM`,
          venue: `${dept.name} Auditorium`,
          eventType: eventType,
          department: dept._id,
          college: college.institute, // Use institute ID
          createdBy: randomElement(deptFaculty)._id,
          targetAudience: randomElement(["All", "Students", "Faculty", "Department"]),
          maxParticipants: eventType === "Workshop" ? 50 : (eventType === "Guest Lecture" ? 200 : 100),
          registrationRequired: true,
          registrationDeadline: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          status: isPast ? "Completed" : (Math.random() > 0.1 ? "Published" : "Draft"),
          tags: [eventType, dept.name.split(" ")[0]],
          isPublic: true,
        });

        // Add registrations for past and some upcoming events
        if (isPast || Math.random() > 0.3) {
          const numRegistrations = Math.floor(Math.random() * Math.min(30, deptStudents.length));
          const registrations = [];
          
          for (let j = 0; j < numRegistrations; j++) {
            const student = deptStudents[j % deptStudents.length];
            registrations.push({
              user: student._id,
              userType: "Student",
              registeredAt: new Date(eventDate.getTime() - 10 * 24 * 60 * 60 * 1000),
              status: isPast ? (Math.random() > 0.2 ? "Attended" : "Absent") : "Registered",
            });
          }
          
          event.registrations = registrations;
          await event.save();
        }

        events.push(event);
        eventCounter++;
      }
    }
    console.log(`✅ Created ${events.length} events`);

    // 9. Create OCR Outputs
    console.log("\n📄 Creating OCR Outputs...");
    const certificateCategories = [
      "Technical Course", "Workshop", "Internship", "Competition",
      "Conference", "Hackathon", "Online Course", "Certification",
    ];

    const skillSets = [
      ["Python", "Machine Learning", "Data Analysis"],
      ["JavaScript", "React", "Node.js"],
      ["Java", "Spring Boot", "Microservices"],
      ["Cloud Computing", "AWS", "Docker"],
      ["Data Science", "Statistics", "Visualization"],
      ["Cyber Security", "Ethical Hacking", "Network Security"],
      ["Mobile Development", "Flutter", "React Native"],
      ["DevOps", "CI/CD", "Kubernetes"],
    ];

    let ocrCount = 0;
    for (const student of students) {
      // Each student gets 1-4 OCR outputs
      const numOcr = 1 + Math.floor(Math.random() * 4);

      for (let i = 0; i < numOcr; i++) {
        await OcrOutput.create({
          student: student._id,
          course: randomElement(achievementTitles.Course),
          date: randomDate(new Date(2023, 0, 1), new Date()),
          issuer: randomElement(organizations),
          name: `${student.name.first} ${student.name.last}`,
          skills: randomElement(skillSets),
          category: randomElement(certificateCategories),
        });
        ocrCount++;
      }
    }
    console.log(`✅ Created ${ocrCount} OCR outputs`);

    // 10. Create Roadmaps
    console.log("\n🗺️  Creating Career Roadmaps...");
    const careerPaths = [
      {
        title: "Full Stack Developer",
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
        roadmap: [
          "Learn HTML, CSS, JavaScript basics",
          "Master React.js and state management",
          "Learn Node.js and Express.js",
          "Database design with MongoDB",
          "Deploy applications on cloud platforms",
          "Build portfolio projects",
        ],
      },
      {
        title: "Data Scientist",
        skills: ["Python", "Machine Learning", "Data Analysis", "Statistics"],
        roadmap: [
          "Master Python programming",
          "Learn data manipulation with Pandas",
          "Study statistics and probability",
          "Machine learning algorithms",
          "Deep learning with TensorFlow",
          "Work on real-world datasets",
        ],
      },
      {
        title: "Cloud Architect",
        skills: ["AWS", "Docker", "Kubernetes", "Cloud Computing"],
        roadmap: [
          "Learn cloud computing fundamentals",
          "Get AWS certification",
          "Master containerization with Docker",
          "Kubernetes orchestration",
          "Infrastructure as Code",
          "Design scalable architectures",
        ],
      },
      {
        title: "Mobile App Developer",
        skills: ["React Native", "Flutter", "Mobile Development"],
        roadmap: [
          "Learn mobile development basics",
          "Master React Native or Flutter",
          "UI/UX design principles",
          "API integration",
          "App store deployment",
          "Performance optimization",
        ],
      },
      {
        title: "Cyber Security Analyst",
        skills: ["Cyber Security", "Ethical Hacking", "Network Security"],
        roadmap: [
          "Learn networking fundamentals",
          "Study security principles",
          "Ethical hacking techniques",
          "Security tools and frameworks",
          "Vulnerability assessment",
          "Incident response procedures",
        ],
      },
    ];

    let roadmapCount = 0;
    for (const student of students) {
      // Create 2-3 potential roadmaps per student
      const numRoadmaps = 2 + Math.floor(Math.random() * 2);
      const potentialRoadmaps = [];

      for (let i = 0; i < numRoadmaps; i++) {
        const career = randomElement(careerPaths);
        const studentSkills = student.skills.technical;
        const matchingSkills = career.skills.filter(skill => 
          studentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
        
        potentialRoadmaps.push({
          career_title: career.title,
          existing_skills: matchingSkills,
          match_score: matchingSkills.length / career.skills.length,
          sequenced_roadmap: career.roadmap,
        });
      }

      await Roadmap.create({
        student_id: student._id,
        potential_roadmaps: potentialRoadmaps.sort((a, b) => b.match_score - a.match_score),
      });
      roadmapCount++;
    }
    console.log(`✅ Created ${roadmapCount} student roadmaps`);

    // 11. Update relationships
    console.log("\n🔄 Updating relationships...");
    
    // Update institutes with colleges
    for (const institute of institutes) {
      const instituteColleges = colleges.filter(
        (c) => c.institute.toString() === institute._id.toString()
      );
      institute.colleges = instituteColleges.map((c) => c._id);
      institute.studentCount = students.filter(s => {
        const dept = departments.find(d => d._id.toString() === s.department.toString());
        return dept && dept.institute.toString() === institute._id.toString();
      }).length;
      await institute.save();
    }

    // Update colleges with departments
    for (const college of colleges) {
      const collegeDepts = departments.filter(
        (d) => d.college.toString() === college._id.toString()
      );
      college.departments = collegeDepts.map((d) => d._id);
      await college.save();
    }

    console.log("\n✅ All relationships updated!");

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   - SuperAdmin: 1`);
    console.log(`   - Institutes: ${institutes.length}`);
    console.log(`   - Colleges: ${colleges.length}`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Faculty: ${faculties.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Achievements: ${achievementCount}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - OCR Outputs: ${ocrCount}`);
    console.log(`   - Roadmaps: ${roadmapCount}`);
    
    console.log(`\n🔑 Login Credentials:`);
    console.log(`\n   SuperAdmin:`);
    console.log(`   📧 Email: admin@sih2025.com`);
    console.log(`   🔒 Password: admin123`);
    
    console.log(`\n   Institutes:`);
    institutes.forEach((inst, i) => {
      console.log(`   ${i + 1}. ${inst.email} / password123`);
    });
    
    console.log(`\n   Sample Faculty:`);
    faculties.slice(0, 3).forEach((fac, i) => {
      console.log(`   ${i + 1}. ${fac.email} / password123`);
    });
    
    console.log(`\n   Sample Students:`);
    students.slice(0, 3).forEach((stu, i) => {
      console.log(`   ${i + 1}. ${stu.email} / student123`);
    });
    
    console.log(`\n${"=".repeat(60)}\n`);

  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding
async function main() {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log("🔌 Database connection closed");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
