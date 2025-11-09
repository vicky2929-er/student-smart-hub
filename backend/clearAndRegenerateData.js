require("dotenv").config();
const mongoose = require("mongoose");

const dbUrl = process.env.DBURL;

async function clearAndRegenerate() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");

    const Faculty = require("./model/faculty");
    const Student = require("./model/student");

    // Find the faculty member
    const faculty = await Faculty.findOne({ email: "dhaval@test.com" });
    if (!faculty) {
      console.log("Faculty not found!");
      process.exit(1);
    }

    console.log(`Found faculty: ${faculty.name.first} ${faculty.name.last}`);

    // Delete all students assigned to this faculty
    const deleteResult = await Student.deleteMany({ coordinator: faculty._id });
    console.log(`Deleted ${deleteResult.deletedCount} existing students`);

    // Clear faculty's student list
    faculty.students = [];
    await faculty.save();

    console.log("\n✅ All student data cleared!");
    console.log("Now run: node generateAnalyticsData.js");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

clearAndRegenerate();
