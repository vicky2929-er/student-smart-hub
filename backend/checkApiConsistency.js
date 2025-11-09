/**
 * API Consistency Checker
 * Compares frontend service calls with backend route definitions
 */

const FRONTEND_API_CALLS = {
  // Auth Service
  auth: [
    { method: "POST", path: "/auth/login", frontend: "authService.login" },
    { method: "POST", path: "/auth/logout", frontend: "authService.logout" },
    { method: "GET", path: "/auth/status", frontend: "authService.checkStatus" },
  ],

  // Dashboard Service
  dashboard: [
    { method: "GET", path: "/dashboard/:role", frontend: "dashboardService.getDashboard" },
    { method: "GET", path: "/dashboard/superadmin/pending-institutions", frontend: "dashboardService.getPendingInstitutions" },
    { method: "POST", path: "/dashboard/superadmin/approve-institution/:id", frontend: "dashboardService.approveInstitution" },
    { method: "POST", path: "/dashboard/superadmin/reject-institution/:id", frontend: "dashboardService.rejectInstitution" },
    { method: "GET", path: "/dashboard/superadmin/platform-health", frontend: "dashboardService.getPlatformHealth" },
    { method: "GET", path: "/dashboard/superadmin/recent-activity", frontend: "dashboardService.getRecentActivity" },
    { method: "POST", path: "/dashboard/superadmin/create-test-institutions", frontend: "dashboardService.createTestInstitutions" },
  ],

  // Student Service
  students: [
    { method: "GET", path: "/students/dashboard/:id", frontend: "studentService.getStudentDashboard" },
    { method: "POST", path: "/students/upload/:id", frontend: "studentService.uploadAchievement" },
    { method: "GET", path: "/students/portfolio/:id", frontend: "studentService.getPortfolio" },
    { method: "GET", path: "/students/analytics/:id", frontend: "studentService.getAnalytics" },
    { method: "GET", path: "/students/profile/:id", frontend: "studentService.getStudentProfile" },
    { method: "PUT", path: "/students/profile/:id", frontend: "studentService.updateProfile" },
    { method: "POST", path: "/students/profile/:id/picture", frontend: "studentService.uploadProfilePicture" },
    { method: "POST", path: "/students/profile/:id/projects", frontend: "studentService.addProject" },
  ],

  // Faculty Service
  faculty: [
    { method: "GET", path: "/faculty/dashboard/:id", frontend: "facultyService.getFacultyDashboard" },
    { method: "GET", path: "/faculty/reviews/:id", frontend: "facultyService.getReviews" },
    { method: "POST", path: "/faculty/review/:facultyId/:achievementId", frontend: "facultyService.reviewAchievement" },
    { method: "GET", path: "/faculty/students/:id", frontend: "facultyService.getStudents" },
    { method: "GET", path: "/faculty/analytics/:id", frontend: "facultyService.getAnalytics" },
    { method: "POST", path: "/faculty/reports/:id", frontend: "facultyService.generateReport" },
    { method: "PUT", path: "/faculty/students/:facultyId/:studentId", frontend: "facultyService.editStudent" },
    { method: "DELETE", path: "/faculty/students/:facultyId/:studentId", frontend: "facultyService.deleteStudent" },
  ],

  // Department Service
  department: [
    { method: "GET", path: "/department/dashboard/:id", frontend: "departmentService.getDepartmentDashboard" },
    { method: "POST", path: "/department/:departmentId/faculty", frontend: "departmentService.addFaculty" },
    { method: "GET", path: "/department/:departmentId/faculty", frontend: "departmentService.getFaculty" },
    { method: "GET", path: "/department/:departmentId/students", frontend: "departmentService.getStudents" },
    { method: "GET", path: "/department/analytics/:departmentId", frontend: "departmentService.getAnalytics" },
    { method: "POST", path: "/department/reports/:departmentId", frontend: "departmentService.generateReport" },
    { method: "GET", path: "/department/:id/coordinator", frontend: "studentService.getCoordinator" },
  ],

  // Institute Service
  institute: [
    { method: "GET", path: "/institute/dashboard/:id", frontend: "instituteService.getInstituteDashboard" },
    { method: "GET", path: "/institute/profile/:id", frontend: "instituteService.getInstituteProfile" },
    { method: "PUT", path: "/institute/profile/:id", frontend: "instituteService.updateProfile" },
    { method: "POST", path: "/institute/colleges", frontend: "instituteService.addCollege" },
    { method: "POST", path: "/institute/colleges/bulk-upload", frontend: "instituteService.bulkUploadColleges" },
    { method: "GET", path: "/institute/:instituteId/colleges", frontend: "instituteService.getCollegesByInstitute" },
    { method: "PUT", path: "/colleges/:collegeId", frontend: "instituteService.updateCollege" },
    { method: "DELETE", path: "/colleges/:collegeId", frontend: "instituteService.deleteCollege" },
    { method: "GET", path: "/colleges/:collegeId", frontend: "instituteService.getCollegeDetails" },
  ],

  // Event Service
  events: [
    { method: "GET", path: "/events/college/:collegeId", frontend: "eventService.getCollegeEvents" },
    { method: "GET", path: "/events/institute/:instituteId", frontend: "eventService.getInstituteEvents" },
    { method: "GET", path: "/events/faculty/:facultyId", frontend: "eventService.getFacultyEvents" },
    { method: "GET", path: "/events/department/:departmentId", frontend: "eventService.getDepartmentEvents" },
    { method: "GET", path: "/events/student/:id", frontend: "studentService.getEvents" },
    { method: "POST", path: "/events/create", frontend: "eventService.createEvent" },
    { method: "PUT", path: "/events/:eventId", frontend: "eventService.updateEvent" },
    { method: "DELETE", path: "/events/:eventId", frontend: "eventService.deleteEvent" },
    { method: "GET", path: "/events/:eventId", frontend: "eventService.getEvent" },
    { method: "POST", path: "/events/:eventId/register", frontend: "eventService.registerForEvent" },
  ],

  // Roadmap Service
  roadmap: [
    { method: "GET", path: "/roadmap/test", frontend: "roadmapService.testConnection" },
    { method: "GET", path: "/roadmap/:id", frontend: "roadmapService.getRoadmap" },
    { method: "GET", path: "/roadmap/student/:studentId", frontend: "roadmapService.getStudentRoadmaps" },
    { method: "POST", path: "/roadmap", frontend: "roadmapService.generateRoadmap" },
    { method: "PUT", path: "/roadmap/:roadmapId", frontend: "roadmapService.updateRoadmap" },
    { method: "DELETE", path: "/roadmap/:roadmapId", frontend: "roadmapService.deleteRoadmap" },
  ],
};

const BACKEND_ROUTES = {
  auth: [
    { method: "POST", path: "/login" },
    { method: "POST", path: "/logout" },
    { method: "GET", path: "/status" },
  ],

  dashboard: [
    { method: "GET", path: "/superadmin" },
    { method: "GET", path: "/superadmin/pending-institutions" },
    { method: "POST", path: "/superadmin/approve-institution/:id" },
    { method: "POST", path: "/superadmin/reject-institution/:id" },
    { method: "GET", path: "/superadmin/platform-health" },
    { method: "GET", path: "/superadmin/recent-activity" },
    { method: "POST", path: "/superadmin/add-admin" },
    { method: "POST", path: "/superadmin/create-test-institutions" },
  ],

  students: [
    { method: "GET", path: "/dashboard/:id" },
    { method: "GET", path: "/upload/:id" },
    { method: "POST", path: "/upload/:id" },
    { method: "GET", path: "/portfolio/:id" },
    { method: "GET", path: "/profile/:id" },
    { method: "PUT", path: "/profile/:id" },
    { method: "POST", path: "/profile/:id/picture" },
    { method: "GET", path: "/analytics/:id" },
    { method: "POST", path: "/profile/:id/projects" },
    { method: "POST", path: "/generate-resume/:id" },
    { method: "GET", path: "/pdf/:id" },
    { method: "GET", path: "/pdf-url/:id" },
    { method: "DELETE", path: "/achievement/:studentId/:achievementId" },
  ],

  faculty: [
    { method: "GET", path: "/dashboard/:id" },
    { method: "GET", path: "/reviews/:id" },
    { method: "POST", path: "/review/:facultyId/:achievementId" },
    { method: "GET", path: "/students/:id" },
    { method: "GET", path: "/analytics/:id" },
    { method: "PUT", path: "/students/:facultyId/:studentId" },
    { method: "DELETE", path: "/students/:facultyId/:studentId" },
    { method: "GET", path: "/profile/:id" },
    { method: "PUT", path: "/profile/:id" },
  ],

  department: [
    { method: "GET", path: "/dashboard/:id" },
    { method: "POST", path: "/:id/add-faculty" },
    { method: "DELETE", path: "/:id/remove-faculty/:facultyId" },
    { method: "POST", path: "/:id/add-student" },
    { method: "DELETE", path: "/:id/remove-student/:studentId" },
    { method: "POST", path: "/:id/set-hod" },
    { method: "GET", path: "/faculty/:id" },
    { method: "GET", path: "/students/:id" },
    { method: "GET", path: "/:id/coordinator" },
    { method: "GET", path: "/analytics/:id" },
  ],

  institute: [
    { method: "GET", path: "/dashboard/:id" },
    { method: "GET", path: "/profile/:id" },
    { method: "PUT", path: "/profile/:id" },
    { method: "GET", path: "/:id/colleges" },
    { method: "POST", path: "/colleges" },
    { method: "POST", path: "/colleges/bulk-upload" },
  ],

  events: [
    { method: "GET", path: "/test-auth" },
    { method: "GET", path: "/college/:collegeId" },
    { method: "GET", path: "/faculty/:facultyId" },
    { method: "GET", path: "/department/:departmentId" },
    { method: "GET", path: "/student/:studentId" },
    { method: "POST", path: "/create" },
    { method: "PUT", path: "/:eventId" },
    { method: "DELETE", path: "/:eventId" },
    { method: "POST", path: "/:eventId/register" },
    { method: "GET", path: "/:eventId" },
  ],

  roadmap: [
    { method: "GET", path: "/test" },
    { method: "GET", path: "/student/:studentId" },
    { method: "POST", path: "/" },
    { method: "GET", path: "/:roadmapId" },
    { method: "PUT", path: "/:roadmapId" },
    { method: "DELETE", path: "/:roadmapId" },
  ],

  college: [
    { method: "GET", path: "/profile/:id" },
    { method: "PUT", path: "/profile/:id" },
  ],

  bulkUpload: [
    { method: "POST", path: "/students" },
    { method: "POST", path: "/colleges" },
    { method: "GET", path: "/template/students" },
    { method: "GET", path: "/template/colleges" },
    { method: "GET", path: "/history" },
    { method: "POST", path: "/test-email" },
  ],

  bulkStudents: [
    { method: "POST", path: "/upload" },
    { method: "GET", path: "/download-template" },
    { method: "POST", path: "/single-student" },
  ],

  bulkColleges: [
    { method: "GET", path: "/download-template" },
    { method: "POST", path: "/upload" },
  ],

  instituteRequests: [
    { method: "POST", path: "/submit" },
    { method: "GET", path: "/all" },
    { method: "GET", path: "/:id" },
    { method: "POST", path: "/:id/approve" },
    { method: "POST", path: "/:id/reject" },
  ],
};

// Comparison function
function checkConsistency() {
  console.log("🔍 API CONSISTENCY CHECK\n");
  console.log("=" .repeat(80));
  
  let totalFrontend = 0;
  let totalBackend = 0;
  let matched = 0;
  let mismatched = [];

  // Check each module
  for (const module in FRONTEND_API_CALLS) {
    const frontendCalls = FRONTEND_API_CALLS[module];
    const backendRoutes = BACKEND_ROUTES[module] || [];

    console.log(`\n📦 Module: ${module.toUpperCase()}`);
    console.log("-" .repeat(80));

    frontendCalls.forEach((call) => {
      totalFrontend++;
      const backendPath = call.path.replace(`/${module}`, "");
      const backendMatch = backendRoutes.find(
        (route) =>
          route.method === call.method &&
          (route.path === backendPath || 
           route.path === call.path.replace(`/${module}`, ""))
      );

      if (backendMatch) {
        console.log(`✅ ${call.method.padEnd(6)} ${call.path}`);
        matched++;
      } else {
        console.log(`❌ ${call.method.padEnd(6)} ${call.path} (MISSING IN BACKEND)`);
        mismatched.push({
          module,
          method: call.method,
          path: call.path,
          frontend: call.frontend,
          status: "missing_backend",
        });
      }
    });
  }

  // Check for backend routes not in frontend
  console.log("\n\n🔍 CHECKING BACKEND-ONLY ROUTES\n");
  console.log("=" .repeat(80));

  for (const module in BACKEND_ROUTES) {
    const backendRoutes = BACKEND_ROUTES[module];
    const frontendCalls = FRONTEND_API_CALLS[module] || [];

    backendRoutes.forEach((route) => {
      totalBackend++;
      const fullPath = `/${module}${route.path}`;
      const frontendMatch = frontendCalls.find(
        (call) =>
          call.method === route.method &&
          (call.path === fullPath || 
           call.path.includes(route.path.replace(/:(\w+)/g, ":$1")))
      );

      if (!frontendMatch && !route.path.includes("test") && !route.path.includes("add-admin")) {
        console.log(`⚠️  ${module.toUpperCase()}: ${route.method.padEnd(6)} ${route.path} (NOT USED IN FRONTEND)`);
        mismatched.push({
          module,
          method: route.method,
          path: route.path,
          status: "unused_backend",
        });
      }
    });
  }

  // Summary
  console.log("\n\n" + "=" .repeat(80));
  console.log("📊 SUMMARY");
  console.log("=" .repeat(80));
  console.log(`Total Frontend API Calls: ${totalFrontend}`);
  console.log(`Total Backend Routes: ${totalBackend}`);
  console.log(`Matched: ${matched}`);
  console.log(`Issues Found: ${mismatched.length}`);

  if (mismatched.length > 0) {
    console.log("\n⚠️  ISSUES FOUND:");
    mismatched.forEach((issue, index) => {
      console.log(
        `\n${index + 1}. ${issue.module.toUpperCase()} - ${issue.method} ${issue.path}`
      );
      console.log(`   Status: ${issue.status}`);
      if (issue.frontend) {
        console.log(`   Frontend: ${issue.frontend}`);
      }
    });
  }

  const consistencyPercentage = Math.round((matched / totalFrontend) * 100);
  console.log(`\n🎯 Consistency Rate: ${consistencyPercentage}%`);

  if (consistencyPercentage >= 90) {
    console.log("✅ EXCELLENT - Frontend and Backend are highly consistent!");
  } else if (consistencyPercentage >= 75) {
    console.log("⚠️  GOOD - Minor inconsistencies found. Review recommended.");
  } else {
    console.log("❌ NEEDS ATTENTION - Significant inconsistencies detected!");
  }

  console.log("\n" + "=" .repeat(80) + "\n");
}

// Run the check
checkConsistency();
