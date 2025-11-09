require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3030/api';
const FACULTY_EMAIL = 'dhaval@test.com';
const FACULTY_PASSWORD = 'admin123';
const FACULTY_ID = '69104f82bf45fb03af1b59ba';

async function testAPI() {
  try {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('              BACKEND API TEST REPORT                       ');
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Test 1: Login
    console.log('✅ TEST 1: Faculty Login');
    console.log(`   Endpoint: POST ${API_BASE}/auth/login`);
    console.log(`   Email: ${FACULTY_EMAIL}`);
    console.log(`   Password: ${FACULTY_PASSWORD}`);
    console.log(`   Role: faculty\n`);
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: FACULTY_EMAIL,
      password: FACULTY_PASSWORD,
      role: 'faculty'
    });
    
    const { token, user } = loginResponse.data;
    console.log('   ✅ Login Successful!');
    console.log(`   User: ${user.name.first} ${user.name.last}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   Redirect: ${loginResponse.data.redirectUrl}\n`);
    
    // Test 2: Faculty Dashboard
    console.log('✅ TEST 2: Faculty Dashboard');
    console.log(`   Endpoint: GET ${API_BASE}/faculty/dashboard/${FACULTY_ID}`);
    
    const dashboardResponse = await axios.get(
      `${API_BASE}/faculty/dashboard/${FACULTY_ID}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const { faculty, stats, pendingReviews, studentStats } = dashboardResponse.data;
    console.log('   ✅ Dashboard Data Retrieved!');
    console.log(`   Faculty: ${faculty.name.first} ${faculty.name.last}`);
    console.log(`   Department: ${faculty.department.name}`);
    console.log(`   Total Students: ${stats.totalStudents}`);
    console.log(`   Pending Reviews: ${stats.pendingReviews}`);
    console.log(`   Approved This Month: ${stats.approvedThisMonth}`);
    console.log(`   Total Reviewed: ${stats.totalReviewed}\n`);
    
    // Test 3: Get Reviews
    console.log('✅ TEST 3: Get Reviews (Pending)');
    console.log(`   Endpoint: GET ${API_BASE}/faculty/reviews/${FACULTY_ID}?filter=pending`);
    
    const reviewsResponse = await axios.get(
      `${API_BASE}/faculty/reviews/${FACULTY_ID}?filter=pending`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const { reviews } = reviewsResponse.data;
    console.log('   ✅ Reviews Retrieved!');
    console.log(`   Total Pending Reviews: ${reviews.length}`);
    
    if (reviews.length > 0) {
      const firstReview = reviews[0];
      console.log(`   Sample Review:`);
      console.log(`     Student: ${firstReview.student.name.first} ${firstReview.student.name.last}`);
      console.log(`     Achievement: ${firstReview.achievement.title}`);
      console.log(`     Type: ${firstReview.achievement.type}`);
      console.log(`     Status: ${firstReview.achievement.status}`);
      console.log(`     Submitted: ${firstReview.achievement.uploadedAt || firstReview.achievement.dateCompleted}`);
    }
    console.log();
    
    // Test 4: Get Students
    console.log('✅ TEST 4: Get Faculty Students');
    console.log(`   Endpoint: GET ${API_BASE}/faculty/students/${FACULTY_ID}`);
    
    const studentsResponse = await axios.get(
      `${API_BASE}/faculty/students/${FACULTY_ID}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const { students } = studentsResponse.data;
    console.log('   ✅ Students Retrieved!');
    console.log(`   Total Students: ${students.length}`);
    
    if (students.length > 0) {
      const firstStudent = students[0];
      console.log(`   Sample Student:`);
      console.log(`     Name: ${firstStudent.name.first} ${firstStudent.name.last}`);
      console.log(`     Student ID: ${firstStudent.studentID}`);
      console.log(`     Course: ${firstStudent.course} - ${firstStudent.year}`);
      console.log(`     GPA: ${firstStudent.cgpa}`);
      console.log(`     Achievements: ${firstStudent.achievementCount}`);
      console.log(`     Pending Reviews: ${firstStudent.pendingReviews}`);
    }
    console.log();
    
    // Test 5: Faculty Profile
    console.log('✅ TEST 5: Faculty Profile');
    console.log(`   Endpoint: GET ${API_BASE}/faculty/profile/${FACULTY_ID}`);
    
    const profileResponse = await axios.get(
      `${API_BASE}/faculty/profile/${FACULTY_ID}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const { faculty: profileFaculty } = profileResponse.data.data;
    console.log('   ✅ Profile Retrieved!');
    console.log(`   Name: ${profileFaculty.name.first} ${profileFaculty.name.last}`);
    console.log(`   Faculty ID: ${profileFaculty.facultyID}`);
    console.log(`   Email: ${profileFaculty.email}`);
    console.log(`   Designation: ${profileFaculty.designation}`);
    console.log(`   Department: ${profileFaculty.department.name} (${profileFaculty.department.code})`);
    console.log(`   Specialization: ${profileFaculty.specialization}`);
    console.log(`   Experience: ${profileFaculty.experience} years`);
    console.log();
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ ALL API TESTS PASSED!');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('📋 SUMMARY:');
    console.log('   ✅ Backend Server: Running on port 3030');
    console.log('   ✅ Database: Connected');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Faculty Login: Success');
    console.log('   ✅ Dashboard API: Working');
    console.log('   ✅ Reviews API: Working');
    console.log('   ✅ Students API: Working');
    console.log('   ✅ Profile API: Working\n');
    
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log(`   Email: ${FACULTY_EMAIL}`);
    console.log(`   Password: ${FACULTY_PASSWORD}`);
    console.log(`   Role: faculty`);
    console.log(`   Dashboard: http://localhost:3000/faculty/dashboard/${FACULTY_ID}\n`);
    
  } catch (error) {
    console.error('\n❌ API TEST FAILED!');
    console.error('Error:', error.response?.data || error.message);
    console.error('\nDetails:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAPI();
