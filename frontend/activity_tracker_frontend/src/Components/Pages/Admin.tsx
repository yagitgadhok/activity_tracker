import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
          Task Manager
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-md shadow hover:shadow-lg transition duration-300 font-medium"
        >
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <div className="min-h-screen bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] text-white py-10 px-6 flex justify-center items-start">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Admin Dashboard
          </h1>

          {/* Centered and Larger User Management Card */}
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
            <h2 className="text-4xl font-semibold mb-4 text-teal-300 text-center">
              User Management
            </h2>
            <p className="text-gray-300 text-center mb-6 text-xl">
              View, edit, and manage users.
            </p>
            <div className="flex justify-center">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition duration-300">
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
