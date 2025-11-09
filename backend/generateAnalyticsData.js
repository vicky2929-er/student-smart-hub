require("dotenv").config();
const mongoose = require("mongoose");

// Connect to database
const dbUrl = process.env.DBURL;

const achievementTypes = [
  "Workshop",
  "Conference",
  "Hackathon",
  "Internship",
  "Course",
  "Competition",
  "CommunityService",
  "Leadership",
  "Clubs",
  "Volunteering",
];

const achievementTitles = {
  Course: [
    "AWS Certified Solutions Architect",
    "Google Cloud Professional",
    "Microsoft Azure Fundamentals",
    "Oracle Java Certification",
    "Cisco CCNA Certification",
    "CompTIA Security+",
    "Python Programming Certification",
    "Data Science Certification",
  ],
  Internship: [
    "Summer Internship at Google",
    "Software Development Intern at Microsoft",
    "Data Analytics Intern at Amazon",
    "ML Internship at IBM",
    "Web Development Internship",
    "Mobile App Development Internship",
  ],
  Competition: [
    "Smart India Hackathon Winner",
    "ACM ICPC Regional Round",
    "Google Code Jam Participant",
    "HackerRank Competition Winner",
    "Coding Championship First Place",
    "Tech Quiz Competition Winner",
  ],
  Workshop: [
    "Machine Learning Workshop",
    "Cloud Computing Workshop",
    "Blockchain Technology Workshop",
    "IoT Development Workshop",
    "Cybersecurity Fundamentals Workshop",
    "AI and Deep Learning Workshop",
  ],
  Hackathon: [
    "24-Hour Hackathon Winner",
    "National Level Hackathon",
    "College Hackathon First Place",
    "Startup Weekend Participant",
    "Code for Good Hackathon",
  ],
  Conference: [
    "IEEE International Conference",
    "ACM SIGCHI Conference",
    "Tech Summit 2024",
    "Developer Conference Speaker",
    "National IT Conference",
  ],
  CommunityService: [
    "Teaching Coding to Underprivileged Kids",
    "Blood Donation Camp Organizer",
    "Environmental Awareness Campaign",
    "COVID Relief Volunteer",
    "Rural Education Initiative",
  ],
  Leadership: [
    "Student Council President",
    "Tech Club Lead",
    "Event Coordinator",
    "Department Representative",
    "Team Captain",
  ],
  Clubs: [
    "Coding Club Member",
    "Robotics Club Coordinator",
    "Cultural Club Lead",
    "Sports Club Captain",
    "Entrepreneurship Cell Member",
  ],
  Volunteering: [
    "NGO Volunteer",
    "Social Service Activities",
    "Community Outreach Program",
    "Elder Care Support",
    "Animal Welfare Volunteer",
  ],
};

const organizations = [
  "Google",
  "Microsoft",
  "Amazon",
  "IBM",
  "Infosys",
  "TCS",
  "Wipro",
  "Cognizant",
  "Tech Mahindra",
  "IEEE",
  "ACM",
  "Coursera",
  "Udemy",
  "edX",
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

// Generate dates with better distribution across months
function getRandomDateWithDistribution() {
  const now = new Date();
  const rand = Math.random();
  
  // 40% current month, 30% last month, 20% 2 months ago, 10% 3+ months ago
  if (rand < 0.4) {
    // Current month (0-30 days ago)
    const daysAgo = Math.floor(Math.random() * 30);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else if (rand < 0.7) {
    // Last month (30-60 days ago)
    const daysAgo = Math.floor(Math.random() * 30) + 30;
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else if (rand < 0.9) {
    // 2 months ago (60-90 days ago)
    const daysAgo = Math.floor(Math.random() * 30) + 60;
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else {
    // 3+ months ago (90-150 days ago)
    const daysAgo = Math.floor(Math.random() * 60) + 90;
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }
}

function generateAchievement() {
  const type = getRandomElement(achievementTypes);
  const titles = achievementTitles[type];
  const title = getRandomElement(titles);
  const statuses = ["Approved", "Pending", "Rejected"];
  const statusWeights = [0.7, 0.2, 0.1]; // 70% approved, 20% pending, 10% rejected
  
  const rand = Math.random();
  let status;
  if (rand < statusWeights[0]) status = "Approved";
  else if (rand < statusWeights[0] + statusWeights[1]) status = "Pending";
  else status = "Rejected";

  const completedDate = getRandomDateWithDistribution();
  const achievement = {
    title,
    type,
    description: `Completed ${title} with excellent performance and gained valuable skills.`,
    organization: getRandomElement(organizations),
    dateCompleted: completedDate,
    status,
    fileUrl: `https://example.com/certificate/${Math.random().toString(36).substring(7)}.pdf`,
    uploadedAt: completedDate,
  };

  // Add reviewedAt for approved/rejected achievements
  if (status !== "Pending") {
    // Reviewed 1-7 days after completion
    achievement.reviewedAt = new Date(completedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  }

  return achievement;
}

async function generateAnalyticsData() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");

    const Student = require("./model/student");
    const Faculty = require("./model/faculty");

    // Find the faculty member (Dhaval)
    const faculty = await Faculty.findOne({ email: "dhaval@test.com" });
    if (!faculty) {
      console.log("Faculty not found! Please create faculty first.");
      process.exit(1);
    }

    console.log(`Found faculty: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`Faculty ID: ${faculty._id}`);

    // Get or create students for this faculty
    let students = await Student.find({ coordinator: faculty._id });
    
    if (students.length === 0) {
      console.log("No students found for this faculty. Creating sample students...");
      
      // Create 55 sample students with realistic Indian names
      const studentNames = [
        { first: "Rahul", last: "Sharma" },
        { first: "Priya", last: "Patel" },
        { first: "Amit", last: "Kumar" },
        { first: "Sneha", last: "Verma" },
        { first: "Rohan", last: "Singh" },
        { first: "Anjali", last: "Gupta" },
        { first: "Vikram", last: "Reddy" },
        { first: "Pooja", last: "Nair" },
        { first: "Karan", last: "Mehta" },
        { first: "Neha", last: "Joshi" },
        { first: "Arjun", last: "Pillai" },
        { first: "Divya", last: "Iyer" },
        { first: "Siddharth", last: "Rao" },
        { first: "Riya", last: "Desai" },
        { first: "Aditya", last: "Malhotra" },
        { first: "Kavya", last: "Krishnan" },
        { first: "Aryan", last: "Chopra" },
        { first: "Ishita", last: "Agarwal" },
        { first: "Advait", last: "Sinha" },
        { first: "Ananya", last: "Bose" },
        { first: "Dhruv", last: "Pandey" },
        { first: "Tanvi", last: "Shah" },
        { first: "Vihaan", last: "Menon" },
        { first: "Aisha", last: "Khan" },
        { first: "Atharv", last: "Jain" },
        { first: "Myra", last: "Kapoor" },
        { first: "Reyansh", last: "Mishra" },
        { first: "Saanvi", last: "Saxena" },
        { first: "Kabir", last: "Banerjee" },
        { first: "Diya", last: "Naik" },
        { first: "Ayaan", last: "Mathur" },
        { first: "Aadhya", last: "Kulkarni" },
        { first: "Vivaan", last: "Yadav" },
        { first: "Sara", last: "Rajan" },
        { first: "Shivansh", last: "Thakur" },
        { first: "Ira", last: "Bhatt" },
        { first: "Arnav", last: "Pawar" },
        { first: "Kiara", last: "Sood" },
        { first: "Aarav", last: "Das" },
        { first: "Tara", last: "Bhatia" },
        { first: "Shaurya", last: "Dubey" },
        { first: "Navya", last: "Rana" },
        { first: "Rudra", last: "Sethi" },
        { first: "Pari", last: "Gill" },
        { first: "Ayansh", last: "Nambiar" },
        { first: "Avni", last: "Dixit" },
        { first: "Shaan", last: "Kohli" },
        { first: "Anvi", last: "Chatterjee" },
        { first: "Veer", last: "Hegde" },
        { first: "Nitya", last: "Mohan" },
        { first: "Hriday", last: "Shetty" },
        { first: "Zara", last: "Arora" },
        { first: "Agastya", last: "Deshpande" },
        { first: "Mira", last: "Kapadia" },
        { first: "Yash", last: "Trivedi" },
      ];

      const bcrypt = require("bcryptjs");
      const batches = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"];
      const years = ["First Year", "Second Year", "Third Year", "Final Year"];
      const courses = ["B.Tech CSE", "B.Tech IT", "B.Tech ECE", "B.Tech Mechanical"];
      const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad"];
      const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "West Bengal", "Maharashtra", "Telangana", "Gujarat"];
      
      for (let i = 0; i < studentNames.length; i++) {
        const name = studentNames[i];
        const batchIndex = Math.floor(i / 14); // Distribute across batches
        const batch = batches[Math.min(batchIndex, batches.length - 1)];
        const enrollmentYear = parseInt(batch.split("-")[0]);
        const cityIndex = i % cities.length;
        
        const studentData = {
          name,
          studentID: `STU${enrollmentYear}${String(i + 1).padStart(3, "0")}`,
          email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@student.edu`,
          password: await bcrypt.hash("password123", 12),
          batch,
          enrollmentYear,
          year: years[Math.min(batchIndex, years.length - 1)],
          course: courses[i % courses.length],
          gpa: (Math.random() * 5 + 5).toFixed(2), // GPA between 5.0 and 10.0 (more realistic range)
          attendance: Math.floor(Math.random() * 40 + 60), // 60-100% (more realistic)
          contactNumber: `+91-${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          dateOfBirth: new Date(2002 + Math.floor(i / 14), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: i % 3 === 0 ? "Male" : i % 3 === 1 ? "Female" : "Other",
          address: {
            line1: `${Math.floor(Math.random() * 200) + 1}, Street ${Math.floor(Math.random() * 50) + 1}`,
            city: cities[cityIndex],
            state: states[cityIndex],
            country: "India",
            pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
          },
          skills: {
            technical: [
              ["JavaScript", "Python", "Java"][i % 3],
              ["React", "Angular", "Vue"][i % 3],
              ["Node.js", "Django", "Spring Boot"][i % 3],
            ],
            soft: [
              ["Leadership", "Communication", "Teamwork"][i % 3],
              ["Problem Solving", "Critical Thinking", "Time Management"][i % 3],
            ],
          },
          interests: [
            ["Machine Learning", "Web Development", "Mobile Apps"][i % 3],
            ["Cloud Computing", "Cybersecurity", "Data Science"][i % 3],
          ],
          bio: `Passionate ${years[Math.min(batchIndex, years.length - 1)]} student specializing in ${courses[i % courses.length]}`,
          coordinator: faculty._id,
          department: faculty.department || new mongoose.Types.ObjectId(),
          status: "Active",
          achievements: [], // Will add later
        };
        
        const student = new Student(studentData);
        await student.save();
        students.push(student);
        console.log(`Created student: ${name.first} ${name.last} (${batch}, ${studentData.course})`);
      }
    }

    console.log(`\nGenerating achievements for ${students.length} students...`);

    // Target: 275 total achievements with realistic distribution
    // Some students will have many achievements, others fewer
    const targetAchievements = 275;
    const achievementsPerStudent = Math.floor(targetAchievements / students.length);
    const extraAchievements = targetAchievements % students.length;

    let totalGenerated = 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Realistic variation: some students are high achievers, some average, some low
      const baseCount = achievementsPerStudent;
      
      // Create performance tiers
      if (i < students.length * 0.15) {
        // Top 15% - high achievers (10-15 achievements)
        var achievementCount = Math.floor(Math.random() * 6) + 10;
      } else if (i < students.length * 0.35) {
        // Next 20% - above average (7-9 achievements)
        var achievementCount = Math.floor(Math.random() * 3) + 7;
      } else if (i < students.length * 0.70) {
        // Middle 35% - average (4-6 achievements)
        var achievementCount = Math.floor(Math.random() * 3) + 4;
      } else {
        // Bottom 30% - below average (1-3 achievements)
        var achievementCount = Math.floor(Math.random() * 3) + 1;
      }

      const achievements = [];
      for (let j = 0; j < achievementCount; j++) {
        achievements.push(generateAchievement());
      }

      // Update student with achievements
      student.achievements = achievements;
      await student.save();

      totalGenerated += achievementCount;
      console.log(
        `${student.name.first} ${student.name.last}: ${achievementCount} achievements (Total: ${totalGenerated})`
      );
    }

    // Update faculty's student list
    faculty.students = students.map(s => s._id);
    await faculty.save();

    console.log("\n✅ Sample data generation completed!");
    console.log(`Total Students: ${students.length}`);
    console.log(`Total Achievements: ${totalGenerated}`);
    console.log(`Average per Student: ${(totalGenerated / students.length).toFixed(1)}`);
    
    // Calculate status distribution
    const allAchievements = students.flatMap(s => s.achievements);
    const approved = allAchievements.filter(a => a.status === "Approved").length;
    const pending = allAchievements.filter(a => a.status === "Pending").length;
    const rejected = allAchievements.filter(a => a.status === "Rejected").length;
    
    console.log(`\nStatus Distribution:`);
    console.log(`Approved: ${approved} (${((approved/totalGenerated)*100).toFixed(1)}%)`);
    console.log(`Pending: ${pending} (${((pending/totalGenerated)*100).toFixed(1)}%)`);
    console.log(`Rejected: ${rejected} (${((rejected/totalGenerated)*100).toFixed(1)}%)`);

    console.log("\n🎉 You can now view the analytics at:");
    console.log(`http://localhost:3000/faculty/analytics/${faculty._id}`);

    process.exit(0);
  } catch (error) {
    console.error("Error generating data:", error);
    process.exit(1);
  }
}

generateAnalyticsData();
