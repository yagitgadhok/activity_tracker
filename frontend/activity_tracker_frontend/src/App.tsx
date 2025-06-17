import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginForm from "./Components/Auth/LoginForm";
import RegistrationForm from "./Components/Auth/RegistrationForm";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import EmployeeDashboard from "./Components/Pages/EmployeeDashboard";
import ManagerDashboard from "./Components/Pages/ManagerDashboard";
import { SuperAdminUser } from "./Components/Pages/SuperAdminUser";
import TaskDetail from "./Components/Pages/TaskDetail";
import UnauthorizedPage from "./Components/Pages/UnauthorizedPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected Routes - User Role */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user" element={<EmployeeDashboard />} />
        </Route>
        
        {/* Protected Routes - Manager Role */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/tasks/:taskId" element={<TaskDetail />} />
        </Route>
        
        {/* Protected Routes - SuperAdmin Role */}
        <Route element={<ProtectedRoute allowedRoles={["superAdmin"]} />}>
          <Route path="/superAdmin" element={<SuperAdminUser />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
