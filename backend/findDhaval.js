require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const Department = require('./model/department');

async function findDhaval() {
  try {
    await mongoose.connect(process.env.DBURL);
    
    // Search for Dhaval faculty
    const dhavalFaculty = await Faculty.findOne({ 
      email: 'dhaval@test.com' 
    }).populate('department');
    
    console.log('\n=== DHAVAL FACULTY (dhaval@test.com) ===');
    if (dhavalFaculty) {
      console.log('ID:', dhavalFaculty._id);
      console.log('Name:', dhavalFaculty.name.first, dhavalFaculty.name.last);
      console.log('Email:', dhavalFaculty.email);
      console.log('Faculty ID:', dhavalFaculty.facultyID);
      console.log('Department:', dhavalFaculty.department ? dhavalFaculty.department.name : 'None');
    } else {
      console.log('NOT FOUND');
    }
    
    // Search broadly
    const allFaculties = await Faculty.find({}).limit(10).select('_id name email facultyID');
    console.log('\n=== SAMPLE FACULTIES (First 10) ===');
    allFaculties.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name.first} ${f.name.last} - ${f.email} - ${f.facultyID}`);
    });
    
    const sitaics = await Department.findOne({ code: 'SITAICS' });
    console.log('\n=== SITAICS DEPARTMENT ===');
    console.log('ID:', sitaics._id);
    console.log('Name:', sitaics.name);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

findDhaval();
