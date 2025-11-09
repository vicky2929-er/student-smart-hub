require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./model/student');

async function testLogin() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('Connected to database');

    // Test student credentials
    const testEmail = 'aarav.patel@student.iitd.ac.in';
    const testPassword = 'Student@123';

    const student = await Student.findOne({ email: testEmail });
    
    if (!student) {
      console.log('❌ Student not found with email:', testEmail);
      mongoose.disconnect();
      return;
    }

    console.log('✅ Student found:', student.name.first, student.name.last);
    console.log('   Email:', student.email);
    console.log('   Password is hashed:', student.password.startsWith('$2'));
    
    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, student.password);
    console.log('   Password match result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    if (!isMatch) {
      console.log('\n⚠️  Password does not match!');
      console.log('   Expected password:', testPassword);
      console.log('   Hash in DB:', student.password.substring(0, 30) + '...');
    }

    await mongoose.disconnect();
    console.log('\nTest completed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
