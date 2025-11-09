require('dotenv').config();
const mongoose = require('mongoose');
const Institute = require('./model/institute');
const Student = require('./model/student');
const Faculty = require('./model/faculty');
const Department = require('./model/department');
const College = require('./model/college');

const MONGODB_URI = process.env.MONGO_URI || process.env.DBURL;

async function assignToRRU() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Rashtriya Raksha University
    const rru = await Institute.findOne({ 
      name: { $regex: /Rashtriya Raksha University/i } 
    });

    if (!rru) {
      console.log('\n❌ Rashtriya Raksha University not found in database.');
      console.log('Searching for similar institutes...');
      
      const allInstitutes = await Institute.find({}).select('name code');
      console.log('\nAvailable Institutes:');
      allInstitutes.forEach(inst => {
        console.log(`  - ${inst.name} (${inst.code})`);
      });
      
      await mongoose.connection.close();
      return;
    }

    console.log(`\n✅ Found Institute: ${rru.name}`);
    console.log(`   Institute ID: ${rru._id}`);
    console.log(`   Code: ${rru.code}`);
    console.log(`   Type: ${rru.type}`);

    // Find or create a default college under RRU
    let defaultCollege = await College.findOne({ institute: rru._id });
    
    if (!defaultCollege) {
      console.log('\n📝 Creating default college under RRU...');
      defaultCollege = new College({
        name: `${rru.name} - Main Campus`,
        code: `${rru.code}-MC`,
        institute: rru._id,
        address: rru.address,
        contactNumber: rru.contactNumber,
        email: rru.email,
        status: 'Active'
      });
      await defaultCollege.save();
      
      // Add college to institute
      await Institute.findByIdAndUpdate(rru._id, {
        $addToSet: { colleges: defaultCollege._id }
      });
      
      console.log(`✅ Created college: ${defaultCollege.name}`);
    } else {
      console.log(`\n✅ Using existing college: ${defaultCollege.name}`);
    }

    // Find or create a default department
    let defaultDepartment = await Department.findOne({ 
      $or: [
        { college: defaultCollege._id },
        { institute: rru._id }
      ]
    });

    if (!defaultDepartment) {
      console.log('\n📝 Creating default department...');
      defaultDepartment = new Department({
        name: 'Computer Science and Engineering',
        code: 'CSE',
        institute: rru._id,
        college: defaultCollege._id,
        description: 'Department of Computer Science and Engineering',
        status: 'Active'
      });
      await defaultDepartment.save();
      console.log(`✅ Created department: ${defaultDepartment.name}`);
    } else {
      console.log(`\n✅ Using existing department: ${defaultDepartment.name}`);
    }

    // Count current assignments
    const studentsWithoutDepartment = await Student.countDocuments({ 
      $or: [
        { department: { $exists: false } },
        { department: null }
      ]
    });
    
    const facultyWithoutDepartment = await Faculty.countDocuments({ 
      $or: [
        { department: { $exists: false } },
        { department: null }
      ]
    });

    console.log('\n=== CURRENT STATUS ===');
    console.log(`Students without department: ${studentsWithoutDepartment}`);
    console.log(`Faculty without department: ${facultyWithoutDepartment}`);

    // Update all students
    console.log('\n📝 Assigning all students to RRU...');
    const studentUpdateResult = await Student.updateMany(
      {},
      {
        $set: {
          department: defaultDepartment._id
        }
      }
    );

    console.log(`✅ Updated ${studentUpdateResult.modifiedCount} students`);

    // Update all faculty
    console.log('\n📝 Assigning all faculty to RRU...');
    const facultyUpdateResult = await Faculty.updateMany(
      {},
      {
        $set: {
          department: defaultDepartment._id
        }
      }
    );

    console.log(`✅ Updated ${facultyUpdateResult.modifiedCount} faculty members`);

    // Verify assignments
    const totalStudents = await Student.countDocuments({ department: defaultDepartment._id });
    const totalFaculty = await Faculty.countDocuments({ department: defaultDepartment._id });

    console.log('\n=== FINAL STATUS ===');
    console.log(`Total students assigned to RRU department: ${totalStudents}`);
    console.log(`Total faculty assigned to RRU department: ${totalFaculty}`);

    // Update institute's student count
    await Institute.findByIdAndUpdate(rru._id, {
      studentCount: totalStudents
    });

    // Update department's student count
    await Department.findByIdAndUpdate(defaultDepartment._id, {
      $set: { faculties: [] }
    });

    // Get some sample assignments
    const sampleStudents = await Student.find({ department: defaultDepartment._id })
      .select('name email batch')
      .limit(5);
    
    const sampleFaculty = await Faculty.find({ department: defaultDepartment._id })
      .select('name email')
      .limit(5);

    if (sampleStudents.length > 0) {
      console.log('\n=== SAMPLE STUDENTS ===');
      sampleStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - Batch: ${student.batch}`);
      });
    }

    if (sampleFaculty.length > 0) {
      console.log('\n=== SAMPLE FACULTY ===');
      sampleFaculty.forEach((faculty, index) => {
        console.log(`${index + 1}. ${faculty.name} (${faculty.email})`);
      });
    }

    console.log('\n✅ Successfully assigned all students and faculty to Rashtriya Raksha University!');
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

assignToRRU();
