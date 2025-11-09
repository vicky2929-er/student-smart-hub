import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Auth/Login";
import InstituteRegistration from "./components/Institute/InstituteRegistration";
import Dashboard from "./components/Dashboard/Dashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import StudentUpload from "./components/Student/StudentUpload";
import StudentPortfolio from "./components/Student/StudentPortfolio";
// import StudentRoadmap from "./components/Student/StudentRoadmap"; // Unused - using StudentRoadmapNew
import StudentRoadmapNew from "./components/Student/StudentRoadmapNew";
import StudentAnalytics from "./components/Student/StudentAnalytics";
import StudentAllEvents from "./components/Student/StudentAllEvents";
import StudentProfile from "./components/Student/StudentProfile";
import PDFViewer from "./components/Student/PDFViewer";
import FacultyDashboard from "./components/Faculty/FacultyDashboard";
import FacultyProfile from "./components/Faculty/FacultyProfile";
import FacultyReviews from "./components/Faculty/FacultyReviews";
import FacultyStudents from "./components/Faculty/FacultyStudents";
import FacultyAnalytics from "./components/Faculty/FacultyAnalytics";
import AllEvents from "./components/Faculty/AllEvents";
import CollegeProfile from "./components/College/CollegeProfile";
import DepartmentDashboard from "./components/Department/DepartmentDashboard";
import DepartmentFaculty from "./components/Department/DepartmentFaculty";
import DepartmentStudents from "./components/Department/DepartmentStudents";
import InstituteDashboard from "./components/Institute/InstituteDashboard";
import InstituteProfile from "./components/Institute/InstituteProfile";
import ManageColleges from './components/Institute/ManageColleges';
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard";
import SuperAdminAnalytics from './components/SuperAdmin/SuperAdminAnalytics';
import "./App.css";
import "./styles/animations.css";
import "./styles/utilities.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Standalone PDF Viewer Route - No Layout (no navbar/footer) */}
            <Route
              path="/pdf/:id"
              element={
                <div className="page-transition">
                  <PDFViewer />
                </div>
              }
            />
            
            {/* All other routes with Layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/institute-registration" element={<InstituteRegistration />} />
                    <Route path="/" element={<LandingPage />} />

                    {/* Protected Routes */}
              <Route
                path="/dashboard/superadmin"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <SuperAdminDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/analytics"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <SuperAdminAnalytics />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/:role"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/upload/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentUpload />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/portfolio/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentPortfolio />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/roadmap/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentRoadmapNew />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/analytics/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentAnalytics />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students/profile/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentProfile />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/events"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <StudentAllEvents />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
                path="/faculty/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/reviews/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyReviews />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/students/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyStudents />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/analytics/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyAnalytics />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/profile/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <FacultyProfile />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/events"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <AllEvents />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Department Routes */}
              <Route
                path="/department/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <DepartmentDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/department/faculty/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <DepartmentFaculty />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/department/students/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <DepartmentStudents />
                    </div>
                  </ProtectedRoute>
                }
              />


              {/* Institute Routes */}
              <Route
                path="/institute/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <InstituteDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/institute/profile/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <InstituteProfile />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/institute/manage-colleges/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <ManageColleges />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* College Routes */}
              <Route
                path="/college/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <div className="page-transition">
                      <CollegeProfile />
                    </div>
                  </ProtectedRoute>
                }
              />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
