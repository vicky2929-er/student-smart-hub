require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./model/student');

mongoose.connect(process.env.DBURL)
  .then(async () => {
    console.log('Connected to database');
    
    const student = await Student.findById('6910487553d1a1996c8c447f')
      .select('name email')
      .lean();
    
    if (student) {
      console.log('\n👤 Student Info:');
      console.log('   Name:', student.name.first, student.name.last);
      console.log('   Email:', student.email);
      console.log('\n💡 Try logging in with this email on the frontend');
      console.log('   Password: Check your seed data or try common passwords');
    } else {
      console.log('Student not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database error:', err);
    process.exit(1);
  });
