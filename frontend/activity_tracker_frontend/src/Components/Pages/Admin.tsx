import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState("date"); // "date" or "name"
  const [filterValue, setFilterValue] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/v1/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

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
        <div className="w-full max-w-5xl">
          <h1 className="text-5xl md:text-5xl font-bold text-center mb-10">
            Admin Dashboard
          </h1>

          {/* Task Overview Table */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg overflow-x-auto">
            <h2 className="text-4xl font-semibold text-teal-300 mb-6 text-center">
              Task Overview
            </h2>

            {/* Filter Section */}

            <div className="mb-6 text-center flex flex-col md:flex-row items-center justify-center gap-4">
              <label className="font-semibold text-2xl">Filter by:</label>

              <select
                className="text-teal-500 font-semibold text-xl px-3 py-2 rounded-full border border-teal-500 bg-black focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterValue(""); // reset value when filter type changes
                }}
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
              </select>

              {filterType === "date" ? (
                <input
                  type="date"
                  className="text-teal-500 text-xl font-semibold px-3 py-2 rounded-full border border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter user name"
                  className="text-teal-500 text-xl font-semibold px-3 py-2 rounded-full border border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              )}
              <button
                onClick={() => {
                  setFilterValue("");
                  setFilterType("date");
                }}
                className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition duration-300"
              >
                Clear Filter
              </button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="py-3 px-4 border-b">User</th>
                  <th className="py-3 px-4 border-b">Task Assigned</th>
                  <th className="py-3 px-4 border-b">Priority</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Date</th>
                  <th className="py-3 px-4 border-b">Remaining Time</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {tasks
                  .filter((task) => {
                    if (!filterValue) return true;

                    if (filterType === "date") {
                      if (!task.date) return false;
                      const taskDateObj = new Date(task.date);
                      if (isNaN(taskDateObj.getTime())) return false;
                      const taskDate = taskDateObj.toISOString().split("T")[0];
                      return taskDate === filterValue;
                    }

                    if (filterType === "name") {
                      const name = task.assignedTo?.name?.toLowerCase() || "";
                      return name.includes(filterValue.toLowerCase());
                    }

                    return true;
                  })
                  .map((task) => (
                    <tr key={task._id} className="hover:bg-slate-700">
                      <td className="py-3 px-4 border-b">
                        {task.assignedTo?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4 border-b">{task.title}</td>
                      <td className="py-3 px-4 border-b">{task.priority}</td>
                      <td className="py-3 px-4 border-b">{task.status}</td>
                      <td className="py-3 px-4 border-b">
                        {task.date ? formatDate(task.date) : "N/A"}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {task.remainingTime || "N/A"}
                      </td>
                      <td
                        onClick={() => navigate(`/admin/tasks/${task._id}`)}
                        className="py-3 px-4 border-b text-blue-400 hover:underline cursor-pointer"
                      >
                        View
                      </td>
                    </tr>
                  ))}

                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      No tasks available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
