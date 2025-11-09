const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const SuperAdmin = require('./model/superadmin');
const Institute = require('./model/institute');
const College = require('./model/college');
const Department = require('./model/department');
const Faculty = require('./model/faculty');
const Student = require('./model/student');
const Event = require('./model/event');
const Roadmap = require('./model/roadmap');
const OcrOutput = require('./model/ocrOutput');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const dbUrl = process.env.DBURL || process.env.MONGODB_URI || 'mongodb://localhost:27017/sih2025';
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Connected to: ${dbUrl.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Helper function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Comprehensive Data Generation
const seedData = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    await SuperAdmin.deleteMany({});
    await Institute.deleteMany({});
    await College.deleteMany({});
    await Department.deleteMany({});
    await Faculty.deleteMany({});
    await Student.deleteMany({});
    await Event.deleteMany({});
    await Roadmap.deleteMany({});
    await OcrOutput.deleteMany({});
    console.log('✅ Data cleared successfully');

    // 1. CREATE SUPER ADMINS
    console.log('👤 Creating Super Admins...');
    const hashedPassword = await hashPassword('admin123');
    const superAdmins = await SuperAdmin.insertMany([
      {
        name: { first: 'Rajesh', last: 'Kumar' },
        email: 'rajesh.admin@sih.gov.in',
        password: hashedPassword,
        contactNumber: '+91-9876543210',
        permissions: ['full_access'],
        status: 'Active',
      },
      {
        name: { first: 'Priya', last: 'Sharma' },
        email: 'priya.admin@sih.gov.in',
        password: hashedPassword,
        contactNumber: '+91-9876543211',
        permissions: ['full_access'],
        status: 'Active',
      },
      {
        name: { first: 'Amit', last: 'Verma' },
        email: 'amit.admin@sih.gov.in',
        password: hashedPassword,
        contactNumber: '+91-9876543212',
        permissions: ['full_access'],
        status: 'Inactive',
      },
    ]);
    console.log(`✅ Created ${superAdmins.length} Super Admins`);

    // 2. CREATE INSTITUTES (All Types)
    console.log('🏛️ Creating Institutes...');
    const instituteTypes = ['University', 'StandaloneCollege', 'Government', 'Private', 'Autonomous', 'Deemed'];
    const instituteStatuses = ['Approved', 'Pending', 'Rejected'];
    const naacGrades = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'];
    
    const institutes = [];
    let instituteCounter = 1;

    for (let type of instituteTypes) {
      for (let status of instituteStatuses) {
        const hasNaac = Math.random() > 0.3;
        const institute = {
          name: `${type} of Excellence ${instituteCounter}`,
          code: `INST${String(instituteCounter).padStart(3, '0')}`,
          aisheCode: `AISHE${String(instituteCounter).padStart(6, '0')}`,
          type: type,
          email: `institute${instituteCounter}@example.com`,
          password: hashedPassword,
          contactNumber: `+91-${9000000000 + instituteCounter}`,
          address: {
            line1: `${instituteCounter} Education Street`,
            line2: 'Knowledge Park',
            city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'][instituteCounter % 6],
            state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra'][instituteCounter % 6],
            district: ['Mumbai', 'New Delhi', 'Bangalore Urban', 'Chennai', 'Kolkata', 'Pune'][instituteCounter % 6],
            country: 'India',
            pincode: `${400000 + instituteCounter}`,
          },
          website: `https://www.institute${instituteCounter}.edu.in`,
          headOfInstitute: {
            name: `Dr. ${['Ramesh', 'Suresh', 'Dinesh', 'Mahesh'][instituteCounter % 4]} Patel`,
            email: `head.institute${instituteCounter}@example.com`,
            contact: `+91-${9100000000 + instituteCounter}`,
            alternateContact: `+91-${9200000000 + instituteCounter}`,
          },
          modalOfficer: {
            name: `Prof. ${['Sunita', 'Kavita', 'Anita', 'Rita'][instituteCounter % 4]} Singh`,
            email: `officer.institute${instituteCounter}@example.com`,
            contact: `+91-${9300000000 + instituteCounter}`,
            alternateContact: `+91-${9400000000 + instituteCounter}`,
          },
          naacGrading: hasNaac,
          naacGrade: hasNaac ? naacGrades[instituteCounter % naacGrades.length] : '',
          status: status === 'Approved' ? 'Active' : status === 'Pending' ? 'Pending' : 'Inactive',
          approvalStatus: status,
          studentCount: Math.floor(Math.random() * 5000) + 500,
          location: {
            city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'][instituteCounter % 6],
            state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra'][instituteCounter % 6],
            country: 'India',
          },
        };

        if (status === 'Approved') {
          institute.approvedBy = superAdmins[0]._id;
          institute.approvedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        } else if (status === 'Rejected') {
          institute.rejectionReason = 'Incomplete documentation provided';
          institute.reviewedBy = superAdmins[1]._id;
          institute.reviewedAt = new Date();
        }

        institutes.push(institute);
        instituteCounter++;
      }
    }

    const createdInstitutes = await Institute.insertMany(institutes);
    console.log(`✅ Created ${createdInstitutes.length} Institutes`);

    // Only proceed with approved institutes
    const approvedInstitutes = createdInstitutes.filter(inst => inst.approvalStatus === 'Approved');
    console.log(`✅ ${approvedInstitutes.length} Approved Institutes for further processing`);

    // 3. CREATE COLLEGES (All Types)
    console.log('🏫 Creating Colleges...');
    const collegeTypes = [
      'Engineering College',
      'Medical College',
      'Arts College',
      'Science College',
      'Commerce College',
      'Law College',
      'Other',
    ];
    
    const colleges = [];
    let collegeCounter = 1;

    for (let institute of approvedInstitutes) {
      // Each institute gets 2-3 colleges
      const numColleges = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numColleges; i++) {
        const college = {
          institute: institute._id,
          name: `${collegeTypes[collegeCounter % collegeTypes.length]} ${collegeCounter}`,
          code: `COL${String(collegeCounter).padStart(4, '0')}`,
          email: `college${collegeCounter}@example.com`,
          password: hashedPassword,
          contactNumber: `+91-${8000000000 + collegeCounter}`,
          address: {
            line1: `${collegeCounter} Campus Road`,
            line2: institute.address.line2,
            city: institute.address.city,
            state: institute.address.state,
            country: 'India',
            pincode: `${400000 + collegeCounter}`,
          },
          website: `https://www.college${collegeCounter}.edu.in`,
          type: collegeTypes[collegeCounter % collegeTypes.length],
          status: Math.random() > 0.1 ? 'Active' : 'Inactive',
        };
        colleges.push(college);
        collegeCounter++;
      }
    }

    const createdColleges = await College.insertMany(colleges);
    console.log(`✅ Created ${createdColleges.length} Colleges`);

    // Update institutes with college references
    for (let college of createdColleges) {
      await Institute.findByIdAndUpdate(college.institute, {
        $push: { colleges: college._id },
      });
    }

    // Only proceed with active colleges
    const activeColleges = createdColleges.filter(col => col.status === 'Active');
    console.log(`✅ ${activeColleges.length} Active Colleges for further processing`);

    // 4. CREATE DEPARTMENTS
    console.log('🏢 Creating Departments...');
    const departmentNames = [
      'Computer Science',
      'Electronics',
      'Mechanical',
      'Civil',
      'Electrical',
      'Information Technology',
      'Biotechnology',
      'Chemical',
      'Automobile',
      'Aerospace',
      'Mathematics',
      'Physics',
      'Chemistry',
      'English',
      'Economics',
    ];

    const departments = [];
    let deptCounter = 1;

    for (let college of activeColleges) {
      // Each college gets 3-5 departments
      const numDepts = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numDepts && i < departmentNames.length; i++) {
        const department = {
          college: college._id,
          institute: college.institute,
          name: departmentNames[i],
          code: `DEPT${String(deptCounter).padStart(4, '0')}`,
          email: `dept${deptCounter}@example.com`,
          password: hashedPassword,
          contactNumber: `+91-${7000000000 + deptCounter}`,
          status: Math.random() > 0.05 ? 'Active' : 'Inactive',
        };
        departments.push(department);
        deptCounter++;
      }
    }

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} Departments`);

    // Update colleges with department references
    for (let dept of createdDepartments) {
      await College.findByIdAndUpdate(dept.college, {
        $push: { departments: dept._id },
      });
    }

    const activeDepartments = createdDepartments.filter(dept => dept.status === 'Active');
    console.log(`✅ ${activeDepartments.length} Active Departments for further processing`);

    // 5. CREATE FACULTY (All Designations)
    console.log('👨‍🏫 Creating Faculty Members...');
    const designations = [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'Coordinator',
      'HOD',
      'Dean',
    ];
    const genders = ['Male', 'Female', 'Other'];
    const firstNames = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Suresh', 'Kavita', 'Rajesh', 'Pooja'];
    const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Verma', 'Gupta', 'Reddy', 'Nair', 'Desai', 'Mehta'];

    const faculties = [];
    let facultyCounter = 1;

    for (let dept of activeDepartments) {
      // Each department gets 5-8 faculty members
      const numFaculty = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < numFaculty; i++) {
        const isCoordinator = i === 0; // First faculty is coordinator
        const designation = i === 0 ? 'HOD' : designations[facultyCounter % (designations.length - 1)];
        
        const faculty = {
          department: dept._id,
          name: {
            first: firstNames[facultyCounter % firstNames.length],
            last: lastNames[facultyCounter % lastNames.length],
          },
          facultyID: `FAC${String(facultyCounter).padStart(5, '0')}`,
          email: `faculty${facultyCounter}@example.com`,
          password: hashedPassword,
          designation: designation,
          contactNumber: `+91-${6000000000 + facultyCounter}`,
          dob: new Date(1970 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: genders[facultyCounter % genders.length],
          address: {
            line1: `${facultyCounter} Faculty Street`,
            line2: 'Campus Area',
            city: 'City Name',
            state: 'State Name',
            country: 'India',
            pincode: `${500000 + facultyCounter}`,
          },
          joiningDate: new Date(2010 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 12), 1),
          experience: Math.floor(Math.random() * 20) + 1,
          qualifications: ['PhD', 'M.Tech', 'B.Tech'][Math.floor(Math.random() * 3)],
          specialization: `${dept.name} Specialization`,
          isCoordinator: isCoordinator,
          status: Math.random() > 0.05 ? 'Active' : 'Inactive',
        };
        faculties.push(faculty);
        facultyCounter++;
      }
    }

    const createdFaculty = await Faculty.insertMany(faculties);
    console.log(`✅ Created ${createdFaculty.length} Faculty Members`);

    // Update departments with faculty references and HOD
    for (let dept of activeDepartments) {
      const deptFaculty = createdFaculty.filter(f => f.department.toString() === dept._id.toString());
      const hod = deptFaculty.find(f => f.designation === 'HOD');
      
      await Department.findByIdAndUpdate(dept._id, {
        $push: { faculties: { $each: deptFaculty.map(f => f._id) } },
        hod: hod ? hod._id : null,
      });
    }

    const activeFaculty = createdFaculty.filter(f => f.status === 'Active');
    console.log(`✅ ${activeFaculty.length} Active Faculty Members`);

    // 6. CREATE STUDENTS (Comprehensive Data)
    console.log('🎓 Creating Students...');
    const studentFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Aadhya', 'Ananya', 'Diya', 'Isha', 'Saanvi'];
    const studentLastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Rao', 'Nair', 'Joshi', 'Iyer'];
    const courses = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'B.Com', 'M.Com', 'BA', 'MA'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];
    const achievementTypes = [
      'Workshop',
      'Conference',
      'Hackathon',
      'Internship',
      'Course',
      'Competition',
      'CommunityService',
      'Leadership',
      'Clubs',
      'Volunteering',
      'Others',
    ];

    const students = [];
    let studentCounter = 1;

    for (let dept of activeDepartments) {
      const deptFaculty = activeFaculty.filter(f => f.department.toString() === dept._id.toString());
      const coordinator = deptFaculty.find(f => f.isCoordinator) || deptFaculty[0];
      
      // Each department gets 20-30 students
      const numStudents = Math.floor(Math.random() * 11) + 20;
      
      for (let i = 0; i < numStudents; i++) {
        const enrollYear = 2020 + Math.floor(Math.random() * 5);
        const currentYear = new Date().getFullYear();
        const yearIndex = Math.min(currentYear - enrollYear, years.length - 1);
        
        // Generate 0-10 achievements per student
        const numAchievements = Math.floor(Math.random() * 11);
        const achievements = [];
        
        for (let j = 0; j < numAchievements; j++) {
          const status = ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)];
          const achievement = {
            title: `Achievement ${j + 1} - ${achievementTypes[j % achievementTypes.length]}`,
            type: achievementTypes[j % achievementTypes.length],
            description: `Detailed description of ${achievementTypes[j % achievementTypes.length]} achievement`,
            organization: ['Google', 'Microsoft', 'Amazon', 'IBM', 'TCS', 'Infosys', 'Wipro'][j % 7],
            instituteEmail: `student${studentCounter}@example.com`,
            dateCompleted: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            fileUrl: `https://ucarecdn.com/dummy-file-${studentCounter}-${j}/`,
            fileId: `dummy-uuid-${studentCounter}-${j}`,
            status: status,
            comment: status === 'Approved' ? 'Well done!' : status === 'Rejected' ? 'Needs verification' : '',
            rejectionComment: status === 'Rejected' ? 'Please provide proper documentation' : '',
            uploadedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
            reviewedAt: status !== 'Pending' ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
            verifiedBy: status !== 'Pending' && deptFaculty.length > 0 ? deptFaculty[Math.floor(Math.random() * deptFaculty.length)]._id : undefined,
          };
          achievements.push(achievement);
        }

        // Generate education history
        const education = [
          {
            institution: `School ${studentCounter}`,
            location: 'Mumbai, Maharashtra',
            year: `${enrollYear - 4}`,
            degree: '10th Standard - CBSE',
          },
          {
            institution: `College ${studentCounter}`,
            location: 'Pune, Maharashtra',
            year: `${enrollYear - 2}`,
            degree: '12th Standard - State Board',
          },
        ];

        // Generate projects
        const numProjects = Math.floor(Math.random() * 5) + 1;
        const projects = [];
        for (let p = 0; p < numProjects; p++) {
          projects.push({
            title: `Project ${p + 1} - ${dept.name}`,
            link: `https://github.com/student${studentCounter}/project${p}`,
            tech: 'React, Node.js, MongoDB, Express',
            description: [
              `Developed a comprehensive solution for ${dept.name}`,
              `Implemented modern technologies and best practices`,
              `Achieved ${Math.floor(Math.random() * 50) + 50}% performance improvement`,
            ],
          });
        }

        const student = {
          department: dept._id,
          coordinator: coordinator ? coordinator._id : null,
          name: {
            first: studentFirstNames[studentCounter % studentFirstNames.length],
            last: studentLastNames[studentCounter % studentLastNames.length],
          },
          studentID: `STU${String(studentCounter).padStart(6, '0')}`,
          email: `student${studentCounter}@example.com`,
          password: hashedPassword,
          dateOfBirth: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: genders[studentCounter % genders.length],
          contactNumber: `+91-${5000000000 + studentCounter}`,
          bio: `Passionate ${dept.name} student with interest in technology and innovation`,
          profilePicture: `https://ui-avatars.com/api/?name=${studentFirstNames[studentCounter % studentFirstNames.length]}+${studentLastNames[studentCounter % studentLastNames.length]}`,
          emergencyContact: {
            name: `Parent ${studentCounter}`,
            phone: `+91-${4000000000 + studentCounter}`,
            relationship: ['Father', 'Mother', 'Guardian'][studentCounter % 3],
          },
          course: courses[studentCounter % courses.length],
          year: years[yearIndex] || 'Final Year',
          interests: ['Coding', 'AI/ML', 'Web Development', 'Mobile Apps', 'Cloud Computing'].slice(0, Math.floor(Math.random() * 3) + 2),
          skills: {
            technical: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB'].slice(0, Math.floor(Math.random() * 4) + 2),
            soft: ['Communication', 'Leadership', 'Team Work', 'Problem Solving'].slice(0, Math.floor(Math.random() * 3) + 1),
          },
          address: {
            line1: `${studentCounter} Student Hostel`,
            line2: 'Campus Area',
            city: 'City Name',
            state: 'State Name',
            country: 'India',
            pincode: `${600000 + studentCounter}`,
          },
          enrollmentYear: enrollYear,
          batch: `${enrollYear}-${enrollYear + 4}`,
          achievements: achievements,
          gpa: parseFloat((Math.random() * 4 + 6).toFixed(2)), // 6.0 to 10.0
          attendance: Math.floor(Math.random() * 30) + 70, // 70-100%
          resumeGenerated: Math.random() > 0.5,
          status: Math.random() > 0.05 ? 'Active' : 'Inactive',
          resumePdfUrl: Math.random() > 0.5 ? `https://ucarecdn.com/resume-${studentCounter}.pdf` : undefined,
          social: {
            linkedin: `https://linkedin.com/in/student${studentCounter}`,
            github: `https://github.com/student${studentCounter}`,
          },
          education: education,
          projects: projects,
        };
        students.push(student);
        studentCounter++;
      }
    }

    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} Students`);

    // Update faculty with student references
    for (let student of createdStudents) {
      if (student.coordinator) {
        await Faculty.findByIdAndUpdate(student.coordinator, {
          $push: { students: student._id },
        });
      }
    }

    // Update faculty achievement reviews
    for (let student of createdStudents) {
      for (let achievement of student.achievements) {
        if (achievement.verifiedBy) {
          await Faculty.findByIdAndUpdate(achievement.verifiedBy, {
            $push: {
              achievementsReviewed: {
                achievementId: achievement._id,
                studentId: student._id,
                status: achievement.status,
                comment: achievement.comment || achievement.rejectionComment,
                reviewedAt: achievement.reviewedAt,
              },
            },
          });
        }
      }
    }

    // 7. CREATE EVENTS (All Types)
    console.log('🎉 Creating Events...');
    const eventTypes = [
      'Workshop',
      'Seminar',
      'Conference',
      'Competition',
      'Cultural',
      'Sports',
      'Hackathon',
      'Guest Lecture',
      'Placement Drive',
      'Other',
    ];
    const eventStatuses = ['Draft', 'Published', 'Cancelled', 'Completed'];
    const targetAudiences = ['All', 'Students', 'Faculty', 'Department'];

    const events = [];
    let eventCounter = 1;

    for (let dept of activeDepartments) {
      const deptFaculty = activeFaculty.filter(f => f.department.toString() === dept._id.toString());
      if (deptFaculty.length === 0) continue;

      const college = activeColleges.find(c => c._id.toString() === dept.college.toString());
      if (!college) continue;

      // Each department gets 5-10 events
      const numEvents = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < numEvents; i++) {
        const eventType = eventTypes[eventCounter % eventTypes.length];
        const status = eventStatuses[Math.floor(Math.random() * eventStatuses.length)];
        const isPast = Math.random() > 0.5;
        const eventDate = isPast 
          ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000);
        
        const requiresRegistration = Math.random() > 0.3;
        
        // Generate registrations for past published events
        const registrations = [];
        if (isPast && status === 'Published') {
          const numRegistrations = Math.floor(Math.random() * 20) + 5;
          const deptStudents = createdStudents.filter(s => s.department.toString() === dept._id.toString() && s.status === 'Active').slice(0, numRegistrations);
          
          for (let student of deptStudents) {
            registrations.push({
              user: student._id,
              userType: 'Student',
              registeredAt: new Date(eventDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              status: ['Registered', 'Attended', 'Absent'][Math.floor(Math.random() * 3)],
            });
          }

          // Add some faculty registrations
          const facultyToRegister = deptFaculty.slice(0, Math.floor(Math.random() * 3) + 1);
          for (let faculty of facultyToRegister) {
            registrations.push({
              user: faculty._id,
              userType: 'Faculty',
              registeredAt: new Date(eventDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              status: ['Registered', 'Attended'][Math.floor(Math.random() * 2)],
            });
          }
        }

        const event = {
          title: `${eventType} ${eventCounter} - ${dept.name}`,
          description: `Comprehensive ${eventType} focusing on latest trends in ${dept.name}. This event will cover multiple aspects and provide hands-on experience.`,
          eventDate: eventDate,
          eventTime: `${Math.floor(Math.random() * 12) + 1}:${['00', '30'][Math.floor(Math.random() * 2)]} ${['AM', 'PM'][Math.floor(Math.random() * 2)]}`,
          venue: ['Seminar Hall', 'Auditorium', 'Conference Room', 'Lab', 'Sports Ground', 'Open Area'][eventCounter % 6],
          eventType: eventType,
          department: dept._id,
          college: college.institute,
          createdBy: deptFaculty[Math.floor(Math.random() * deptFaculty.length)]._id,
          targetAudience: targetAudiences[Math.floor(Math.random() * targetAudiences.length)],
          maxParticipants: requiresRegistration ? Math.floor(Math.random() * 100) + 50 : null,
          registrationRequired: requiresRegistration,
          registrationDeadline: requiresRegistration ? new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000) : undefined,
          status: isPast && status === 'Published' ? 'Completed' : status,
          attachments: [
            {
              name: `${eventType}_Brochure.pdf`,
              url: `https://ucarecdn.com/event-${eventCounter}-brochure.pdf`,
              uploadedAt: new Date(eventDate.getTime() - 15 * 24 * 60 * 60 * 1000),
            },
          ],
          registrations: registrations,
          tags: [eventType, dept.name, 'Academic', 'Student Development'],
          isPublic: Math.random() > 0.2,
        };
        events.push(event);
        eventCounter++;
      }
    }

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} Events`);

    // 8. CREATE OCR OUTPUTS
    console.log('📄 Creating OCR Outputs...');
    const categories = ['Certificate', 'Course Completion', 'Workshop', 'Internship', 'Achievement'];
    const issuers = ['Coursera', 'Udemy', 'Google', 'Microsoft', 'IBM', 'AWS', 'NPTEL', 'edX'];
    const skillsList = [
      ['Python', 'Machine Learning', 'Data Science'],
      ['JavaScript', 'React', 'Node.js'],
      ['Java', 'Spring Boot', 'Microservices'],
      ['Cloud Computing', 'AWS', 'DevOps'],
      ['Web Development', 'HTML', 'CSS'],
    ];

    const ocrOutputs = [];
    let ocrCounter = 1;

    for (let student of createdStudents) {
      // Each student gets 2-5 OCR outputs
      const numOcr = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < numOcr; i++) {
        const ocr = {
          student: student._id,
          course: `${categories[i % categories.length]} Course ${ocrCounter}`,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          issuer: issuers[ocrCounter % issuers.length],
          name: `${student.name.first} ${student.name.last}`,
          skills: skillsList[ocrCounter % skillsList.length],
          category: categories[i % categories.length],
        };
        ocrOutputs.push(ocr);
        ocrCounter++;
      }
    }

    const createdOcrOutputs = await OcrOutput.insertMany(ocrOutputs);
    console.log(`✅ Created ${createdOcrOutputs.length} OCR Outputs`);

    // Update students with OCR references
    for (let ocr of createdOcrOutputs) {
      await Student.findByIdAndUpdate(ocr.student, {
        $push: { ocrOutputs: ocr._id },
      });
    }

    // 9. CREATE ROADMAPS
    console.log('🗺️ Creating Career Roadmaps...');
    const careerPathData = {
      'Full Stack Developer': {
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML/CSS', 'Git'],
        roadmap: [
          'Master HTML, CSS, and JavaScript fundamentals',
          'Learn React.js for frontend development',
          'Study Node.js and Express for backend',
          'Learn database design with MongoDB/PostgreSQL',
          'Build REST APIs and implement authentication',
          'Deploy full-stack projects on cloud platforms',
          'Create a portfolio with 3-5 full-stack projects',
          'Contribute to open-source projects on GitHub',
          'Apply for junior full-stack developer positions'
        ]
      },
      'Data Scientist': {
        skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics', 'SQL'],
        roadmap: [
          'Master Python programming and data structures',
          'Learn statistics and probability theory',
          'Study Pandas and NumPy for data manipulation',
          'Learn data visualization with Matplotlib/Seaborn',
          'Master SQL for database querying',
          'Learn machine learning algorithms with Scikit-learn',
          'Work on real-world datasets from Kaggle',
          'Build end-to-end data science projects',
          'Create a data science portfolio and blog'
        ]
      },
      'Machine Learning Engineer': {
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'MLOps', 'Docker'],
        roadmap: [
          'Master Python and linear algebra fundamentals',
          'Learn supervised and unsupervised ML algorithms',
          'Study deep learning with TensorFlow/PyTorch',
          'Learn neural network architectures (CNN, RNN, Transformers)',
          'Practice on ML competitions (Kaggle, DrivenData)',
          'Learn MLOps: model deployment and monitoring',
          'Study cloud ML services (AWS SageMaker, GCP AI)',
          'Build and deploy ML models in production',
          'Contribute to open-source ML projects'
        ]
      },
      'DevOps Engineer': {
        skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
        roadmap: [
          'Master Linux system administration and shell scripting',
          'Learn Git version control and GitHub workflows',
          'Study Docker containerization and Docker Compose',
          'Learn Kubernetes for container orchestration',
          'Set up CI/CD pipelines with Jenkins/GitHub Actions',
          'Learn Infrastructure as Code with Terraform',
          'Study cloud platforms (AWS/Azure/GCP)',
          'Implement monitoring with Prometheus and Grafana',
          'Get certified (AWS Solutions Architect, CKA)'
        ]
      },
      'Mobile App Developer': {
        skills: ['React Native', 'Flutter', 'JavaScript', 'Dart', 'Firebase', 'APIs'],
        roadmap: [
          'Learn JavaScript/TypeScript fundamentals',
          'Master React Native or Flutter framework',
          'Study mobile UI/UX design principles',
          'Learn state management (Redux, Provider)',
          'Integrate REST APIs and handle async operations',
          'Implement Firebase for backend services',
          'Learn app deployment (App Store, Play Store)',
          'Build 3-5 mobile apps for portfolio',
          'Contribute to open-source mobile projects'
        ]
      },
      'Cloud Architect': {
        skills: ['AWS', 'Azure', 'Networking', 'Security', 'Terraform', 'Architecture'],
        roadmap: [
          'Master cloud computing fundamentals and services',
          'Learn AWS/Azure core services (EC2, S3, Lambda)',
          'Study cloud networking and security best practices',
          'Learn Infrastructure as Code with Terraform/CloudFormation',
          'Design scalable and resilient architectures',
          'Study microservices and serverless architectures',
          'Implement cost optimization strategies',
          'Get cloud certifications (AWS Solutions Architect)',
          'Build multi-cloud architecture projects'
        ]
      },
      'Cybersecurity Specialist': {
        skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Linux', 'Python', 'SIEM'],
        roadmap: [
          'Learn networking fundamentals (TCP/IP, OSI model)',
          'Study Linux system administration and security',
          'Master cryptography and encryption techniques',
          'Learn ethical hacking and penetration testing',
          'Study web application security (OWASP Top 10)',
          'Practice on CTF platforms (HackTheBox, TryHackMe)',
          'Learn SIEM tools and security monitoring',
          'Get security certifications (CEH, CISSP, Security+)',
          'Participate in bug bounty programs'
        ]
      },
      'AI Research Scientist': {
        skills: ['Python', 'Research', 'Deep Learning', 'Mathematics', 'PyTorch', 'Publications'],
        roadmap: [
          'Master advanced mathematics (linear algebra, calculus)',
          'Study machine learning theory and algorithms',
          'Learn deep learning architectures in depth',
          'Read and implement research papers from arXiv',
          'Work on novel research problems',
          'Publish papers in conferences (NeurIPS, ICML)',
          'Contribute to AI research communities',
          'Build a strong research portfolio',
          'Apply for research positions or PhD programs'
        ]
      },
      'Backend Engineer': {
        skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Docker', 'Kafka'],
        roadmap: [
          'Master Java or Python backend programming',
          'Learn Spring Boot or Django framework',
          'Study database design and SQL optimization',
          'Learn RESTful API design and implementation',
          'Study microservices architecture patterns',
          'Learn message queues (RabbitMQ, Kafka)',
          'Implement caching strategies (Redis, Memcached)',
          'Deploy backend services with Docker/Kubernetes',
          'Build scalable backend systems for portfolio'
        ]
      },
      'Frontend Developer': {
        skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Webpack', 'Testing'],
        roadmap: [
          'Master HTML, CSS, and responsive design',
          'Learn JavaScript ES6+ and TypeScript',
          'Master React.js and component-based architecture',
          'Study state management (Redux, Context API)',
          'Learn CSS preprocessors (SASS) and frameworks (Tailwind)',
          'Study build tools (Webpack, Vite) and bundling',
          'Learn testing (Jest, React Testing Library)',
          'Build responsive, accessible web applications',
          'Create a portfolio with modern frontend projects'
        ]
      }
    };

    const roadmaps = [];
    
    for (let student of createdStudents) {
      // Each student gets 2-4 potential roadmaps
      const numRoadmaps = Math.floor(Math.random() * 3) + 2;
      const potentialRoadmaps = [];
      
      // Shuffle career paths to get random selections
      const careerTitles = Object.keys(careerPathData);
      const shuffledCareers = [...careerTitles].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numRoadmaps; i++) {
        const careerTitle = shuffledCareers[i];
        const careerData = careerPathData[careerTitle];
        const matchScore = parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)); // 0.6 to 1.0
        
        // Use student's skills if available, otherwise use career-specific skills
        const studentSkills = student.skills?.technical?.length > 0 
          ? student.skills.technical.slice(0, 3)
          : careerData.skills.slice(0, 3);
        
        potentialRoadmaps.push({
          career_title: careerTitle,
          existing_skills: studentSkills,
          match_score: matchScore,
          sequenced_roadmap: careerData.roadmap,
        });
      }

      roadmaps.push({
        student_id: student._id,
        potential_roadmaps: potentialRoadmaps,
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      });
    }

    const createdRoadmaps = await Roadmap.insertMany(roadmaps);
    console.log(`✅ Created ${createdRoadmaps.length} Career Roadmaps`);

    // Print Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE DATA SEEDING COMPLETED');
    console.log('='.repeat(60));
    console.log(`✅ Super Admins: ${superAdmins.length}`);
    console.log(`✅ Institutes: ${createdInstitutes.length} (${approvedInstitutes.length} approved)`);
    console.log(`✅ Colleges: ${createdColleges.length} (${activeColleges.length} active)`);
    console.log(`✅ Departments: ${createdDepartments.length} (${activeDepartments.length} active)`);
    console.log(`✅ Faculty: ${createdFaculty.length} (${activeFaculty.length} active)`);
    console.log(`✅ Students: ${createdStudents.length}`);
    console.log(`✅ Events: ${createdEvents.length}`);
    console.log(`✅ OCR Outputs: ${createdOcrOutputs.length}`);
    console.log(`✅ Roadmaps: ${createdRoadmaps.length}`);
    console.log('='.repeat(60));
    console.log('\n🎯 Sample Login Credentials:');
    console.log('─'.repeat(60));
    console.log('Super Admin:');
    console.log('  Email: rajesh.admin@sih.gov.in');
    console.log('  Password: admin123');
    console.log('\nInstitute (Approved):');
    console.log(`  Email: ${approvedInstitutes[0]?.email}`);
    console.log('  Password: admin123');
    console.log('\nCollege:');
    console.log(`  Email: ${activeColleges[0]?.email}`);
    console.log('  Password: admin123');
    console.log('\nDepartment:');
    console.log(`  Email: ${activeDepartments[0]?.email}`);
    console.log('  Password: admin123');
    console.log('\nFaculty:');
    console.log(`  Email: ${activeFaculty[0]?.email}`);
    console.log('  Password: admin123');
    console.log('\nStudent:');
    console.log(`  Email: ${createdStudents[0]?.email}`);
    console.log('  Password: admin123');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedData();
  console.log('\n✅ Database seeding completed successfully!');
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
