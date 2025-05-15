import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginForm from "./Components/Auth/LoginForm";
import RegistrationForm from "./Components/Auth/RegistrationForm";
import EmployeeDashboard from "./Components/Pages/EmployeeDashboard";
import ManagerDashboard from "./Components/Pages/ManagerDashboard";
import { SuperAdminUser } from "./Components/Pages/SuperAdminUser";
import TaskDetail from "./Components/Pages/TaskDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/user" element={<EmployeeDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/superAdmin" element={<SuperAdminUser />} />
      </Routes>
    </Router>
  );
}

export default App;
