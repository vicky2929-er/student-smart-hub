require('dotenv').config();
const mongoose = require('mongoose');
const OcrOutput = require('./model/ocrOutput');
const Student = require('./model/student');

mongoose.connect(process.env.DBURL)
  .then(async () => {
    console.log('Connected to database');
    
    const count = await OcrOutput.countDocuments();
    console.log('\n📊 Total OCR outputs in database:', count);
    
    if (count > 0) {
      const outputs = await OcrOutput.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      console.log('\n📄 Latest OCR outputs:');
      outputs.forEach((output, index) => {
        console.log(`\n${index + 1}. ${output.course || 'No course name'}`);
        console.log(`   Category: ${output.category || 'N/A'}`);
        console.log(`   Student ID: ${output.student}`);
        console.log(`   Issuer: ${output.issuer || 'N/A'}`);
        console.log(`   Skills: ${output.skills?.join(', ') || 'None'}`);
        console.log(`   Created: ${output.createdAt}`);
      });
    } else {
      console.log('\n❌ No OCR outputs found in database');
      console.log('   This means no certificates have been approved and processed yet.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database error:', err);
    process.exit(1);
  });
