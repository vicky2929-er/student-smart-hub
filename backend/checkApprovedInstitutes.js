require('dotenv').config();
const mongoose = require('mongoose');
const Institute = require('./model/institute');

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || process.env.DBURL;

async function checkApprovedInstitutes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count total institutes
    const totalInstitutes = await Institute.countDocuments();
    console.log('\n=== INSTITUTE STATISTICS ===');
    console.log(`Total Institutes: ${totalInstitutes}`);

    // Count by approval status
    const approvedCount = await Institute.countDocuments({ approvalStatus: 'Approved' });
    const pendingCount = await Institute.countDocuments({ approvalStatus: 'Pending' });
    const rejectedCount = await Institute.countDocuments({ approvalStatus: 'Rejected' });

    console.log(`\nApproval Status Breakdown:`);
    console.log(`  Approved: ${approvedCount}`);
    console.log(`  Pending: ${pendingCount}`);
    console.log(`  Rejected: ${rejectedCount}`);

    // Get details of approved institutes
    const approvedInstitutes = await Institute.find({ approvalStatus: 'Approved' })
      .select('name code email type approvedAt status')
      .lean();

    if (approvedInstitutes.length > 0) {
      console.log('\n=== APPROVED INSTITUTES ===');
      approvedInstitutes.forEach((institute, index) => {
        console.log(`\n${index + 1}. ${institute.name}`);
        console.log(`   Code: ${institute.code}`);
        console.log(`   Email: ${institute.email}`);
        console.log(`   Type: ${institute.type}`);
        console.log(`   Status: ${institute.status}`);
        console.log(`   Approved At: ${institute.approvedAt ? institute.approvedAt.toLocaleDateString() : 'N/A'}`);
      });
    } else {
      console.log('\n❌ No approved institutes found.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

checkApprovedInstitutes();
