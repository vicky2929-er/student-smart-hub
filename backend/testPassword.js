require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./model/faculty');
const bcrypt = require('bcrypt');

async function testPassword() {
  try {
    await mongoose.connect(process.env.DBURL);
    
    const faculty = await Faculty.findOne({ email: 'dhaval@test.com' });
    
    if (!faculty) {
      console.log('❌ Faculty not found');
      process.exit(1);
    }
    
    console.log('✅ Faculty found:', faculty.email);
    console.log('   Name:', faculty.name.first, faculty.name.last);
    console.log('\n🔑 Testing passwords:');
    
    const passwords = ['dhaval@123', 'faculty@123', 'password123', 'Dhaval@123'];
    
    for (let pwd of passwords) {
      const match = await bcrypt.compare(pwd, faculty.password);
      console.log(`   ${pwd}: ${match ? '✅ CORRECT' : '❌ wrong'}`);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPassword();
