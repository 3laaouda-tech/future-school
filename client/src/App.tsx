import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import AddUser from "./pages/admin/AddUser";
import UsersList from "./pages/admin/UsersList";
import ClassesList from "./pages/admin/ClassesList";
import AcademicYears from "./pages/admin/AcademicYears";
import SubjectsList from "./pages/admin/SubjectsList";
import ClassSubjects from "./pages/admin/ClassSubjects";
import Enrollments from "./pages/admin/Enrollments";
import ParentStudents from "./pages/admin/ParentStudents";
import TeacherDashboard from "./pages/teacher/Dashboard";
import Attendance from "./pages/teacher/Attendance";
import Grades from "./pages/teacher/Grades";
import StudentDashboard from "./pages/student/Dashboard";
import ParentDashboard from "./pages/parent/Dashboard";

function App() {
  return (
    <Routes>
      {/* Public site: shares Navbar + Footer via PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth: standalone page, no navbar/footer */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated area: shares navbar + logout via AppLayout */}
      <Route element={<AppLayout />}>
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/new"
          element={
            <ProtectedRoute allowedRole="admin">
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRole="admin">
              <ClassesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academic-years"
          element={
            <ProtectedRoute allowedRole="admin">
              <AcademicYears />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute allowedRole="admin">
              <SubjectsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/class-subjects"
          element={
            <ProtectedRoute allowedRole="admin">
              <ClassSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <ProtectedRoute allowedRole="admin">
              <Enrollments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parent-students"
          element={
            <ProtectedRoute allowedRole="admin">
              <ParentStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/:classId/attendance"
          element={
            <ProtectedRoute allowedRole="teacher">
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/:classId/subjects/:subjectId/grades"
          element={
            <ProtectedRoute allowedRole="teacher">
              <Grades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
