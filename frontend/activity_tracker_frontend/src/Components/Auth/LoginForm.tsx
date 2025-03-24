import axios from "axios";
import { useState, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    console.log("Submitting form data:", formData); // Debugging
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        formData,
        { headers: { "Content-Type": "application/json" } } // ✅ Ensures JSON format
      );
  
      console.log("Response from API:", response); // Debugging
  
      setFormData({ email: "", password: "" });

      if(response.data.user.role[0] === "user"){
        if(response.data.user.role[1] === "manager"){
          navigate("/superAdmin")
        }else{
          navigate("/user")
        }
      }else if( response.data.user.role[0] === "manager"){
        navigate("/manager")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log("Error response:", err.response); // Debugging
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <h1 className="text-5xl font-semibold text-center mb-6 pt-8 bg-gradient-to-r from-red-800 to-amber-400 bg-clip-text text-transparent">
        Activity Tracker
      </h1>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Login
            </button>
          </form>
          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
