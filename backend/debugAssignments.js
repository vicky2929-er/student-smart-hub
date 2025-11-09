require('dotenv').config();
const mongoose = require('mongoose');
const Institute = require('./model/institute');
const Student = require('./model/student');
const Faculty = require('./model/faculty');

const MONGODB_URI = process.env.MONGO_URI || process.env.DBURL;

async function debugAssignments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const rru = await Institute.findOne({ 
      name: { $regex: /Rashtriya.*Raksha.*University/i } 
    });

    console.log('RRU ID:', rru._id);
    console.log('RRU ID Type:', typeof rru._id);
    console.log('RRU ID String:', rru._id.toString());

    // Check a sample student
    const sampleStudent = await Student.findOne({});
    if (sampleStudent) {
      console.log('\nSample Student:');
      console.log('  Name:', sampleStudent.name);
      console.log('  Institute Field:', sampleStudent.institute);
      console.log('  Institute Type:', typeof sampleStudent.institute);
      if (sampleStudent.institute) {
        console.log('  Institute String:', sampleStudent.institute.toString());
        console.log('  Match?', sampleStudent.institute.toString() === rru._id.toString());
      }
    }

    // Check a sample faculty
    const sampleFaculty = await Faculty.findOne({});
    if (sampleFaculty) {
      console.log('\nSample Faculty:');
      console.log('  Name:', sampleFaculty.name);
      console.log('  Institute Field:', sampleFaculty.institute);
      console.log('  Institute Type:', typeof sampleFaculty.institute);
      if (sampleFaculty.institute) {
        console.log('  Institute String:', sampleFaculty.institute.toString());
        console.log('  Match?', sampleFaculty.institute.toString() === rru._id.toString());
      }
    }

    // Count with different queries
    const studentCount1 = await Student.countDocuments({ institute: rru._id });
    const studentCount2 = await Student.countDocuments({ institute: rru._id.toString() });
    const studentCount3 = await Student.countDocuments({ institute: mongoose.Types.ObjectId(rru._id) });
    
    console.log('\nStudent Counts:');
    console.log('  Using ObjectId:', studentCount1);
    console.log('  Using String:', studentCount2);
    console.log('  Using mongoose.Types.ObjectId:', studentCount3);

    const facultyCount1 = await Faculty.countDocuments({ institute: rru._id });
    const facultyCount2 = await Faculty.countDocuments({ institute: rru._id.toString() });
    
    console.log('\nFaculty Counts:');
    console.log('  Using ObjectId:', facultyCount1);
    console.log('  Using String:', facultyCount2);

    // Check all students with any institute
    const studentsWithInstitute = await Student.countDocuments({ 
      institute: { $exists: true, $ne: null } 
    });
    console.log('\nTotal students with any institute:', studentsWithInstitute);

    const facultyWithInstitute = await Faculty.countDocuments({ 
      institute: { $exists: true, $ne: null } 
    });
    console.log('Total faculty with any institute:', facultyWithInstitute);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    await mongoose.connection.close();
  }
}

debugAssignments();
