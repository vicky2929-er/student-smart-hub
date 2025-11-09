require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const bcrypt = require('bcrypt');

const FACULTY_ID = '69104f82bf45fb03af1b59ba';
const NEW_PASSWORD = 'admin123';

async function updatePassword() {
  try {
    await mongoose.connect(process.env.DBURL);
    console.log('✅ Connected to MongoDB\n');
    
    const faculty = await Faculty.findById(FACULTY_ID);
    
    if (!faculty) {
      console.log('❌ Faculty not found');
      process.exit(1);
    }
    
    console.log('✅ Faculty found:', faculty.email);
    console.log('   Name:', faculty.name.first, faculty.name.last);
    console.log(`\n🔑 Setting new password: ${NEW_PASSWORD}`);
    
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    faculty.password = hashedPassword;
    
    await faculty.save();
    
    console.log('✅ Password updated successfully!\n');
    
    // Test the new password
    console.log('🧪 Testing new password...');
    const match = await bcrypt.compare(NEW_PASSWORD, faculty.password);
    console.log(`   Result: ${match ? '✅ SUCCESS - Password works!' : '❌ FAILED'}\n`);
    
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${faculty.email}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log(`   Role: faculty\n`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePassword();
