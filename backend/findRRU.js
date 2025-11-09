require('dotenv').config();
const mongoose = require('mongoose');
const Institute = require('./model/institute');

const MONGODB_URI = process.env.MONGO_URI || process.env.DBURL;

async function findRRU() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Search for RRU
    const rru = await Institute.findOne({ 
      name: { $regex: /Rashtriya.*Raksha.*University/i } 
    });

    if (rru) {
      console.log('✅ Found Rashtriya Raksha University:');
      console.log(`   Name: ${rru.name}`);
      console.log(`   ID: ${rru._id}`);
      console.log(`   Code: ${rru.code}`);
      console.log(`   Type: ${rru.type}`);
      console.log(`   Status: ${rru.status}`);
      console.log(`   Approval Status: ${rru.approvalStatus}`);
    } else {
      console.log('❌ Rashtriya Raksha University not found.');
      console.log('\nSearching all institutes...\n');
      
      const allInstitutes = await Institute.find({}).select('name code type approvalStatus').sort({ name: 1 });
      console.log(`Total Institutes: ${allInstitutes.length}\n`);
      
      allInstitutes.forEach((inst, index) => {
        console.log(`${index + 1}. ${inst.name}`);
        console.log(`   Code: ${inst.code}, Type: ${inst.type}, Status: ${inst.approvalStatus}\n`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

findRRU();
