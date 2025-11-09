require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

const API_BASE = "http://localhost:3030/api";

// Test credentials
const testUsers = {
  superadmin: { email: "admin@sih2025.com", password: "admin123" },
  institute: { email: "admin@iitd.ac.in", password: "password123" },
  faculty: { email: "rajesh.kumar.1@example.edu", password: "password123" },
  student: { email: "diya.malhotra.1@student.edu", password: "student123" },
  department: { email: "iitd-cse@example.edu", password: "password123" },
};

// Helper function to login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data || error.message);
    return null;
  }
}

// Test analytics endpoint
async function testAnalytics(endpoint, token, label) {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ ${label}: SUCCESS`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ ${label}: FAILED - ${error.response?.data?.error || error.message}`);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Main test function
async function runAnalyticsTests() {
  console.log("🔍 Starting Analytics Endpoints Testing...\n");
  console.log("=" .repeat(70));

  // Test Student Analytics
  console.log("\n📊 STUDENT ANALYTICS");
  console.log("-".repeat(70));
  const studentLogin = await login(testUsers.student.email, testUsers.student.password);
  if (studentLogin) {
    console.log(`✅ Student logged in: ${studentLogin.user.name.first} ${studentLogin.user.name.last}`);
    console.log(`   Role: ${studentLogin.user.role}`);
    console.log(`   ID: ${studentLogin.user._id}`);
    
    const studentAnalytics = await testAnalytics(
      `/students/analytics/${studentLogin.user._id}`,
      studentLogin.token,
      "Student Analytics"
    );
    
    if (studentAnalytics.success) {
      const data = studentAnalytics.data;
      console.log(`   📈 Total Achievements: ${data.analytics?.totalAchievements || 0}`);
      console.log(`   ✔️  Approved: ${data.analytics?.approvedAchievements || 0}`);
      console.log(`   ⏳ Pending: ${data.analytics?.pendingAchievements || 0}`);
      console.log(`   ❌ Rejected: ${data.analytics?.rejectedAchievements || 0}`);
      console.log(`   🎓 GPA: ${data.analytics?.academicMetrics?.cgpa || 'N/A'}`);
      console.log(`   📅 Attendance: ${data.analytics?.academicMetrics?.attendance || 'N/A'}%`);
    }
  }

  // Test Faculty Analytics
  console.log("\n📊 FACULTY ANALYTICS");
  console.log("-".repeat(70));
  const facultyLogin = await login(testUsers.faculty.email, testUsers.faculty.password);
  if (facultyLogin) {
    console.log(`✅ Faculty logged in: ${facultyLogin.user.name.first} ${facultyLogin.user.name.last}`);
    console.log(`   Role: ${facultyLogin.user.role}`);
    console.log(`   ID: ${facultyLogin.user._id}`);
    
    const facultyAnalytics = await testAnalytics(
      `/faculty/analytics/${facultyLogin.user._id}`,
      facultyLogin.token,
      "Faculty Analytics"
    );
    
    if (facultyAnalytics.success) {
      const data = facultyAnalytics.data;
      console.log(`   👥 Total Students: ${data.overview?.totalStudents || 0}`);
      console.log(`   📊 Total Submissions: ${data.overview?.totalSubmissions || 0}`);
      console.log(`   🎯 Active Students: ${data.overview?.activeStudents || 0}`);
      console.log(`   ✅ Approval Rate: ${data.overview?.approvalRate || 0}%`);
    }
  }

  // Test Department Analytics
  console.log("\n📊 DEPARTMENT ANALYTICS");
  console.log("-".repeat(70));
  const deptLogin = await login(testUsers.department.email, testUsers.department.password);
  if (deptLogin) {
    console.log(`✅ Department logged in: ${deptLogin.user.name}`);
    console.log(`   Role: ${deptLogin.user.role}`);
    console.log(`   ID: ${deptLogin.user._id}`);
    
    const deptAnalytics = await testAnalytics(
      `/department/analytics/${deptLogin.user._id}`,
      deptLogin.token,
      "Department Analytics"
    );
    
    if (deptAnalytics.success) {
      const data = deptAnalytics.data;
      console.log(`   👥 Total Students: ${data.totalStudents || 0}`);
      console.log(`   👨‍🏫 Total Faculty: ${data.totalFaculty || 0}`);
      console.log(`   📅 Events in Period: ${data.eventsInPeriod || 0}`);
      console.log(`   📊 Average GPA: ${data.averageGPA || 'N/A'}`);
      console.log(`   📈 Average Attendance: ${data.averageAttendance || 'N/A'}%`);
    }
  }

  // Test Institute Dashboard (contains analytics)
  console.log("\n📊 INSTITUTE DASHBOARD");
  console.log("-".repeat(70));
  const instituteLogin = await login(testUsers.institute.email, testUsers.institute.password);
  if (instituteLogin) {
    console.log(`✅ Institute logged in: ${instituteLogin.user.name}`);
    console.log(`   Role: ${instituteLogin.user.role}`);
    console.log(`   ID: ${instituteLogin.user._id}`);
    
    const instituteDashboard = await testAnalytics(
      `/institute/dashboard/${instituteLogin.user._id}`,
      instituteLogin.token,
      "Institute Dashboard"
    );
    
    if (instituteDashboard.success) {
      const data = instituteDashboard.data;
      console.log(`   🏫 Total Colleges: ${data.statistics?.totalColleges || 0}`);
      console.log(`   📚 Total Departments: ${data.statistics?.totalDepartments || 0}`);
      console.log(`   👨‍🏫 Total Faculty: ${data.statistics?.totalFaculty || 0}`);
      console.log(`   👥 Total Students: ${data.statistics?.totalStudents || 0}`);
      console.log(`   📅 Total Events: ${data.statistics?.totalEvents || 0}`);
      console.log(`   🔜 Upcoming Events: ${data.statistics?.upcomingEvents || 0}`);
      console.log(`   Achievement Stats:`);
      console.log(`      - Pending: ${data.achievementStats?.pending || 0}`);
      console.log(`      - Approved: ${data.achievementStats?.approved || 0}`);
      console.log(`      - Rejected: ${data.achievementStats?.rejected || 0}`);
    }
  }

  // Test SuperAdmin Dashboard
  console.log("\n📊 SUPERADMIN DASHBOARD");
  console.log("-".repeat(70));
  const superadminLogin = await login(testUsers.superadmin.email, testUsers.superadmin.password);
  if (superadminLogin) {
    console.log(`✅ SuperAdmin logged in: ${superadminLogin.user.name.first} ${superadminLogin.user.name.last}`);
    console.log(`   Role: ${superadminLogin.user.role}`);
    
    const superadminDashboard = await testAnalytics(
      `/dashboard/superadmin`,
      superadminLogin.token,
      "SuperAdmin Dashboard"
    );
    
    if (superadminDashboard.success) {
      const data = superadminDashboard.data;
      console.log(`   🏛️  Total Institutes: ${data.metrics?.institutes || 0}`);
      console.log(`   👥 Active Students: ${data.metrics?.activeStudents || 0}`);
      console.log(`   📊 Activities Logged: ${data.metrics?.activitiesLogged || 0}`);
      console.log(`   ⏳ Pending Approvals: ${data.metrics?.pendingApprovals || 0}`);
    }
    
    // Test Platform Health
    const platformHealth = await testAnalytics(
      `/dashboard/superadmin/platform-health`,
      superadminLogin.token,
      "Platform Health"
    );
    
    if (platformHealth.success) {
      const data = platformHealth.data;
      console.log(`   Platform Health:`);
      console.log(`      - Status: ${data.status || 'Unknown'}`);
      console.log(`      - Database: ${data.database || 'Unknown'}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Analytics Testing Complete!");
  console.log("=".repeat(70) + "\n");
}

// Run the tests
runAnalyticsTests()
  .then(() => {
    console.log("🎉 All tests completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  });
