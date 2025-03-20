import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginForm from "./Components/Auth/LoginForm";
import RegistrationForm from "./Components/Auth/RegistrationForm";
import User from "./Components/Pages/User";
import Admin from "./Components/Pages/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/user" element={<User />} />
        <Route path="/manager" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
