import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { logout } from "../../utils/auth";

// Define TypeScript interface for Task
interface Task {
  _id: string;
  title: string;
  estimatedTime: string;
  assignedTo: {
    _id: string;
    name: string;
    email?: string;
  };
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Completed";
  date?: string;
}

// Define TypeScript interface for User
interface User {
  _id: string;
  name: string;
  email?: string;
}

const ManagerDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // No longer need task detail modal as we use a separate page

  const navigate = useNavigate();
  useEffect(() => {
    Promise.all([fetchTasks(), fetchUsers()])
      .then(() => setLoading(false))
      .catch((error) => {
        console.error("Error initializing dashboard:", error);
        setLoading(false);
      });
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    employeeFilter,
    statusFilter,
    priorityFilter,
    startDateFilter,
    endDateFilter,
    searchTerm,
  ]);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get("/tasks");
      setTasks(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/auth/getAllUsers");
      setUsers(response.data.users);
      return response.data.users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const resetFilters = () => {
    setEmployeeFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setSearchTerm("");
    setCurrentPage(1); // Reset to first page when filters are reset
  };
  // View task details (now we navigate directly to the task detail page)
  // Comments are now handled in the TaskDetail component
  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    // Employee filter
    if (employeeFilter && task.assignedTo?._id !== employeeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter && task.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter && task.priority !== priorityFilter) {
      return false;
    }

    // Date range filter
    if (startDateFilter || endDateFilter) {
      if (!task.date) return false;

      const taskDate = new Date(task.date);
      if (isNaN(taskDate.getTime())) return false;

      if (startDateFilter) {
        const startDate = new Date(startDateFilter);
        if (taskDate < startDate) return false;
      }

      if (endDateFilter) {
        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59); // Include the entire end day
        if (taskDate > endDate) return false;
      }
    }

    // Search term (searches in title)
    if (
      searchTerm &&
      !task.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Pagination logic
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page tasks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  // Group tasks by employee for summary
  const tasksByEmployee: Record<
    string,
    {
      name: string;
      total: number;
      completed: number;
      inProgress: number;
      todo: number;
    }
  > = {};

  tasks.forEach((task) => {
    const employeeId = task.assignedTo?._id || "unknown";
    const employeeName = task.assignedTo?.name || "Unknown";

    if (!tasksByEmployee[employeeId]) {
      tasksByEmployee[employeeId] = {
        name: employeeName,
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
      };
    }

    tasksByEmployee[employeeId].total++;

    if (task.status === "Completed") {
      tasksByEmployee[employeeId].completed++;
    } else if (task.status === "In Progress") {
      tasksByEmployee[employeeId].inProgress++;
    } else {
      tasksByEmployee[employeeId].todo++;
    }
  });

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h2 className="text-3xl font-bold tracking-wide">Activity Tracker</h2>
        <div className="flex items-center gap-4">
          <span className="text-white mr-2">Manager Dashboard</span>{" "}
          <button
            onClick={logout}
            className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 py-10">
        <div className="max-w-7xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
            Manager Dashboard
          </h1>
          {/* Task Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">Total Tasks</h3>
              <p className="text-4xl font-bold text-white">{tasks.length}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">Completed</h3>
              <p className="text-4xl font-bold text-white">
                {tasks.filter((task) => task.status === "Completed").length}
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">In Progress</h3>
              <p className="text-4xl font-bold text-white">
                {tasks.filter((task) => task.status === "In Progress").length}
              </p>
            </div>
          </div>{" "}
          {/* Filter Panel - Accordion */}
          <div className="bg-gray-900 rounded-xl mb-8 shadow-lg">
            <div
              className="p-6 flex justify-between items-center cursor-pointer"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <h2 className="text-2xl font-bold text-white">Filter Tasks</h2>
              <div
                className="text-white text-2xl transform transition-transform duration-300"
                style={{
                  transform: isFilterOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </div>
            </div>

            {isFilterOpen && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Employee Filter */}
                  <div>
                    <label className="block text-gray-400 mb-2">Employee</label>
                    <select
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Employees</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-gray-400 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="To-Do">To-Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-gray-400 mb-2">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-gray-400 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Search Term */}
                  <div>
                    <label className="block text-gray-400 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search task title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Reset Filters Button */}
                <div className="flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Task Table */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg overflow-x-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Task Overview
            </h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Task Name</th>
                  <th className="px-4 py-3 text-left">Estimated Time</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No tasks match your filters.
                    </td>
                  </tr>
                ) : (
                  currentTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="px-4 py-4 text-gray-300">
                        {task.assignedTo?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-gray-300">{task.title}</td>
                      <td className="px-4 py-4 text-gray-300">
                        {task.estimatedTime}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-900 text-red-200"
                              : task.priority === "Medium"
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-blue-900 text-blue-200"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === "Completed"
                              ? "bg-green-900 text-green-200"
                              : task.status === "In Progress"
                              ? "bg-purple-900 text-purple-200"
                              : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-300">
                        {task.date ? formatDate(task.date) : "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`/manager/tasks/${task._id}`)}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!loading && filteredTasks.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-gray-400">
                  Showing {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems} tasks
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-800 text-white hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, idx) => {
                      // Show pages around current page
                      let pageToShow: number;
                      if (totalPages <= 5) {
                        pageToShow = idx + 1;
                      } else if (currentPage <= 3) {
                        pageToShow = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + idx;
                      } else {
                        pageToShow = currentPage - 2 + idx;
                      }

                      return (
                        <button
                          key={pageToShow}
                          onClick={() => paginate(pageToShow)}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageToShow
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-white hover:bg-gray-600"
                          }`}
                        >
                          {pageToShow}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-800 text-white hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-400">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="bg-gray-800 text-white border border-gray-600 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          {/* Employee Performance Summary */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              Employee Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(tasksByEmployee).map((employeeId) => {
                const employee = tasksByEmployee[employeeId];
                const completionRate =
                  employee.total > 0
                    ? Math.round((employee.completed / employee.total) * 100)
                    : 0;

                return (
                  <div
                    key={employeeId}
                    className="bg-gray-800 rounded-lg p-4 shadow"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {employee.name}
                    </h3>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Completion Rate:</span>
                      <span className="text-white">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-green-400 font-medium">
                          {employee.completed}
                        </div>
                        <div className="text-gray-500">Completed</div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-medium">
                          {employee.inProgress}
                        </div>
                        <div className="text-gray-500">In Progress</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-medium">
                          {employee.todo}
                        </div>
                        <div className="text-gray-500">To-Do</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>{" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
