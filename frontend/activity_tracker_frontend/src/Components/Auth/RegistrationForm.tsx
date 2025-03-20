import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const roles = [
  { label: "User", value: "user" },
  { label: "Manager", value: "manager" },
] as const;

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: [] as ("user" | "manager")[],
  });

  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSelection = (value: "user" | "manager") => {
    setFormData((prev) => ({
      ...prev,
      role: prev.role.includes(value)
        ? prev.role.filter((r) => r !== value)
        : [...prev.role, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/auth/register",
        formData
      );
      setFormData({ name: "", email: "", password: "", role: [] });
      alert(data.message); // Display API response
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <h1 className="text-5xl font-semibold text-center mb-6 pt-8 bg-gradient-to-r from-red-800 to-amber-400 bg-clip-text text-transparent">
        Activity Tracker
      </h1>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSubmit}>
            {["name", "email", "password"].map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-gray-700 capitalize">
                  {field}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
            ))}

            <div className="relative mb-4">
              <label className="block text-gray-700 mb-2">Role</label>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 border rounded-lg bg-white shadow-sm text-left focus:outline-none"
              >
                {formData.role.length
                  ? formData.role.join(", ")
                  : "Select Roles"}
              </button>

              {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg">
                  <ul className="max-h-48 overflow-auto">
                    {roles.map(({ label, value }) => (
                      <li key={value} className="px-4 py-2 hover:bg-gray-100">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.role.includes(value)}
                            onChange={() => toggleSelection(value)}
                            className="form-checkbox"
                          />
                          <span>{label}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Register
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;
