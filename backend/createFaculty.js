require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Connect to database
const dbUrl = process.env.DBURL;

async function createFaculty() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");

    const Faculty = require("./model/faculty");

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({
      email: "dhaval@test.com",
    });

    if (existingFaculty) {
      console.log("Faculty with email dhaval@test.com already exists!");
      console.log("Faculty ID:", existingFaculty._id);
      console.log("Email: dhaval@test.com");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Create new faculty
    const facultyData = {
      name: { first: "Dhaval", last: "Faculty" },
      facultyID: "FAC_DHAVAL",
      email: "dhaval@test.com",
      password: await bcrypt.hash("admin123", 12),
      designation: "Professor",
      contactNumber: "+91-9876543230",
      isCoordinator: false,
      students: [],
      department: new mongoose.Types.ObjectId(), // Use a dummy ObjectId
      status: "Active",
    };

    const newFaculty = new Faculty(facultyData);
    await newFaculty.save();

    console.log("✅ Faculty created successfully!");
    console.log("Faculty ID:", newFaculty._id);
    console.log("Email: dhaval@test.com");
    console.log("Password: admin123");
    console.log("Faculty Details:", {
      name: `${newFaculty.name.first} ${newFaculty.name.last}`,
      facultyID: newFaculty.facultyID,
      designation: newFaculty.designation,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating faculty:", error);
    process.exit(1);
  }
}

createFaculty();
