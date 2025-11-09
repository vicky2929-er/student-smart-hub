require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./model/student');
const Faculty = require('./model/faculty');

mongoose.connect(process.env.DBURL)
  .then(async () => {
    console.log('Connected to database');
    
    const student = await Student.findById('6910487553d1a1996c8c447f')
      .select('name email coordinator facultyCoordinator')
      .populate('coordinator', 'name email')
      .populate('facultyCoordinator', 'name email')
      .lean();
    
    if (student) {
      console.log('\n👤 Student Info:');
      console.log('   Name:', student.name.first, student.name.last);
      console.log('   Email:', student.email);
      console.log('\n👨‍🏫 Coordinator Info:');
      console.log('   coordinator field:', student.coordinator);
      console.log('   facultyCoordinator field:', student.facultyCoordinator);
      
      const faculty = await Faculty.findById('69104f82bf45fb03af1b59ba')
        .select('name email')
        .lean();
      console.log('\n🔍 Dhaval Faculty:');
      console.log('   ID: 69104f82bf45fb03af1b59ba');
      console.log('   Name:', faculty?.name);
      console.log('   Email:', faculty?.email);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database error:', err);
    process.exit(1);
  });
