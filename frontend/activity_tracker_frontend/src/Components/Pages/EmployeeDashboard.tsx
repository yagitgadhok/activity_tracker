// filepath: c:\Users\nigkumar\Desktop\Project\ActvityTracker\activity_tracker\frontend\activity_tracker_frontend\src\Components\Pages\EmployeeDashboard.tsx
import { useState, useEffect } from "react";
import Modal from "react-modal";
import { logout } from "../../utils/auth";

import axios from "axios";

// Define TypeScript interface for Task
interface Task {
  _id: string;
  title: string;
  estimatedTime: string;
  remainingTime: string;
  assignedTo: any;
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Completed";
  date?: string;
}

interface TaskComment {
  _id: string;
  user: { name: string; _id: string };
  comment: string;
  createdAt: string;
}

const API_URL = "http://localhost:5000/api/v1/tasks";

const EmployeeDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [taskData, setTaskData] = useState<Omit<Task, "_id">>({
    title: "",
    estimatedTime: "",
    remainingTime: "",
    assignedTo: "",
    priority: "Low",
    status: "To-Do",
    date: "",
  });
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [comments, setComments] = useState<{ [taskId: string]: TaskComment[] }>(
    {}
  );

  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  const loggedInUserId = localStorage.getItem("userId");

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);
  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(
        `${API_URL}?assignedTo=${loggedInUserId}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchComments = async (taskId: string) => {
    try {
      const response = await axios.get<TaskComment[]>(
        `http://localhost:5000/api/v1/tasks/${taskId}/comments`
      );
      setComments((prev) => ({ ...prev, [taskId]: response.data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const confirmDelete = (id: string) => {
    setTaskToDeleteId(id);
    setConfirmDeleteModal(true);
  };

  // Open modal for adding a task
  const openModal = () => {
    setEditMode(false);
    setTaskData({
      title: "",
      estimatedTime: "",
      remainingTime: "",
      assignedTo: loggedInUserId || "",
      priority: "Low",
      status: "To-Do",
      date: "",
    });
    setModalIsOpen(true);
  };

  // Open modal for editing a task
  const openEditModal = (task: Task) => {
    setEditMode(true);
    setEditTaskId(task._id);
    setTaskData({
      title: task.title,
      estimatedTime: task.estimatedTime,
      remainingTime: task.remainingTime,
      assignedTo: task.assignedTo._id,
      priority: task.priority,
      status: task.status,
      date: task.date,
    });
    setModalIsOpen(true);
  };

  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };
  // Add or update task
  const handleSubmit = async () => {
    try {
      if (!taskData.title || !taskData.estimatedTime) {
        alert("Please fill all required fields!");
        return;
      }

      const dataToSubmit = {
        ...taskData,
        assignedTo: loggedInUserId, // Ensure the task is assigned to the current user
      };

      if (editMode && editTaskId) {
        // Update existing task
        await axios.put(`${API_URL}/${editTaskId}`, dataToSubmit);
      } else {
        // Create new task
        await axios.post(API_URL, dataToSubmit);
      }

      fetchTasks();
      setModalIsOpen(false);
      setEditMode(false);
      setEditTaskId(null);
      setTaskData({
        title: "",
        estimatedTime: "",
        remainingTime: "",
        assignedTo: "",
        priority: "Low",
        status: "To-Do",
        date: "",
      });
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };
  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task._id !== id)); // Immediately update UI
    } catch (error) {
      console.error("Error deleting task:", error);
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

  // Filter tasks based on search term and status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page tasks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  // Check if task can be edited or deleted (only To-Do or In Progress tasks)
  const canEditOrDelete = (status: string) => {
    return status === "To-Do" || status === "In Progress";
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h2 className="text-3xl font-bold tracking-wide">Activity Tracker</h2>
        <div className="flex items-center gap-4">
          <span className="text-white mr-2">Employee Dashboard</span>{" "}
          <button
            onClick={logout}
            className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12">
        <div className="max-w-7xl mx-auto p-10 bg-gray-800 shadow-2xl rounded-xl">
          <h1 className="text-5xl font-extrabold text-center mb-10 text-white">
            My Tasks
          </h1>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="To-Do">To-Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                onClick={openModal}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-teal-600 hover:to-teal-700 transition font-semibold"
              >
                + Add Task
              </button>
            </div>
          </div>

          {/* Task Cards Grid - Alternative to Table */}
          {/* Task Cards Grid - Show only "In Progress" tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tasks.filter((task) => task.status === "In Progress").length >
            0 ? (
              tasks
                .filter((task) => task.status === "In Progress")
                .map((task) => (
                  <div
                    key={task._id}
                    className={`bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden ${
                      task.priority === "High"
                        ? "border-l-4 border-l-red-500"
                        : task.priority === "Medium"
                        ? "border-l-4 border-l-yellow-500"
                        : "border-l-4 border-l-blue-500"
                    }`}
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {task.title}
                      </h3>

                      <div className="text-sm text-gray-400 mb-4">
                        <p>
                          Estimated Time:{" "}
                          <span className="text-gray-300">
                            {task.estimatedTime}
                          </span>
                        </p>
                        <p>
                          Remaining Time:{" "}
                          <span className="text-gray-300">
                            {task.remainingTime || "0"}
                          </span>
                        </p>
                        <p>
                          Due Date:{" "}
                          <span className="text-gray-300">
                            {formatDate(task.date || "")}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
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
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        {canEditOrDelete(task.status) && (
                          <>
                            <button
                              onClick={() => openEditModal(task)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(task._id)}
                              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <button
                          onClick={async () => {
                            setShowCommentsFor(
                              showCommentsFor === task._id ? null : task._id
                            );
                            if (!comments[task._id]) {
                              await fetchComments(task._id);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg shadow-md hover:from-cyan-700 hover:to-cyan-800 transition font-medium"
                        >
                          {showCommentsFor === task._id
                            ? "Hide Comments"
                            : "Show Comments"}
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showCommentsFor === task._id && (
                        <div className="mt-4 bg-gray-800 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-teal-300 mb-2">
                            Comments
                          </h4>
                          {comments[task._id] &&
                          comments[task._id].length > 0 ? (
                            <ul className="space-y-2">
                              {comments[task._id].map((c) => (
                                <li
                                  key={c._id}
                                  className="border-b border-gray-700 pb-2"
                                >
                                  <span className="text-teal-400 font-medium">
                                    {c.user?.name || "User"}:
                                  </span>{" "}
                                  <span className="text-gray-200">
                                    {c.comment}
                                  </span>
                                  <div className="text-xs text-gray-400">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-400">
                              No comments yet.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No "In Progress" tasks found.
              </div>
            )}
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTasks.length > 0 && currentItems.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                No tasks on this page. Try changing the page or adjusting your filters.
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((task) => (
                <div 
                  key={task._id} 
                  className={`bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden ${
                    task.priority === "High" 
                      ? "border-l-4 border-l-red-500" 
                      : task.priority === "Medium" 
                      ? "border-l-4 border-l-yellow-500" 
                      : "border-l-4 border-l-blue-500"
                  }`}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                    
                    <div className="text-sm text-gray-400 mb-4">
                      <p>Estimated Time: <span className="text-gray-300">{task.estimatedTime}</span></p>
                      <p>Due Date: <span className="text-gray-300">{formatDate(task.date || "")}</span></p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.priority === "High" 
                          ? "bg-red-900 text-red-200" 
                          : task.priority === "Medium" 
                          ? "bg-yellow-900 text-yellow-200" 
                          : "bg-blue-900 text-blue-200"
                      }`}>
                        {task.priority}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === "Completed" 
                          ? "bg-green-900 text-green-200" 
                          : task.status === "In Progress" 
                          ? "bg-purple-900 text-purple-200" 
                          : "bg-gray-700 text-gray-200"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      {canEditOrDelete(task.status) && (
                        <>
                          <button
                            onClick={() => openEditModal(task)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(task._id)}
                            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No tasks found. Create a new task to get started.
              </div>
            )}
          </div> */}

          {/* Task Table - Alternative View */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700 bg-gray-900 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white">
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Task Name
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Estimated Time
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Remaining Time
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Priority
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Status
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Due Date
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 && currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-700 p-6 text-center text-gray-400"
                    >
                      No tasks on this page. Try changing the page or adjusting
                      your filters.
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((task) => (
                    <tr
                      key={task._id}
                      className="border border-gray-700 hover:bg-gray-800"
                    >
                      <td className="border border-gray-700 p-4 text-gray-300">
                        {task.title}
                      </td>
                      <td className="border border-gray-700 p-4 text-gray-300">
                        {task.estimatedTime}
                      </td>
                      <td className="border border-gray-700 p-4 text-gray-300">
                        {task.remainingTime || "0"}
                      </td>
                      <td className="border border-gray-700 p-4 text-gray-300">
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
                      <td className="border border-gray-700 p-4 text-gray-300">
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
                      <td className="border border-gray-700 p-4 text-gray-300">
                        {task.date ? formatDate(task.date) : "N/A"}
                      </td>
                      <td className="border border-gray-700 p-4">
                        {canEditOrDelete(task.status) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(task)}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition font-medium text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(task._id)}
                              className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-700 p-6 text-center text-gray-400"
                    >
                      No tasks found. Create a new task to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredTasks.length > 0 && (
            <div className="mt-8 bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-400 mb-4 md:mb-0">
                  Showing{" "}
                  <span className="font-medium text-teal-400">
                    {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, filteredTasks.length)}{" "}
                  </span>
                  of{" "}
                  <span className="font-medium text-teal-400">
                    {filteredTasks.length}
                  </span>{" "}
                  tasks
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {/* Page Number Buttons */}
                  <div className="flex">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-l ${
                        currentPage === 1
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-teal-700 text-white hover:bg-teal-600"
                      }`}
                    >
                      &laquo;
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 ${
                        currentPage === 1
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-teal-700 text-white hover:bg-teal-600"
                      }`}
                    ></button>

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
                            onClick={() => setCurrentPage(pageToShow)}
                            className={`px-3 py-1 ${
                              currentPage === pageToShow
                                ? "bg-teal-500 text-white font-bold"
                                : "bg-gray-700 text-white hover:bg-gray-600"
                            }`}
                          >
                            {pageToShow}
                          </button>
                        );
                      }
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 ${
                        currentPage === totalPages
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-teal-700 text-white hover:bg-teal-600"
                      }`}
                    ></button>

                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-r ${
                        currentPage === totalPages
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-teal-700 text-white hover:bg-teal-600"
                      }`}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <label className="text-gray-400">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page
                    }}
                    className="bg-gray-800 text-white border border-gray-600 rounded p-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Task Modal */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-[28rem] mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-white text-center">
              {editMode ? "Edit Task" : "Add New Task"}
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                name="title"
                placeholder="Task Name"
                value={taskData.title}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              />
              <input
                type="text"
                name="estimatedTime"
                placeholder="Estimated Time (e.g., 2 hrs)"
                value={taskData.estimatedTime}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              />
              <input
                type="text"
                name="remainingTime"
                placeholder="Remaining Time (e.g., 1 hr)"
                value={taskData.remainingTime}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              />
              <input
                type="date"
                name="date"
                placeholder="Due Date"
                value={taskData.date}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              />
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                name="status"
                value={taskData.status}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              >
                <option value="To-Do">To-Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setModalIsOpen(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-medium text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition font-medium text-lg"
              >
                {editMode ? "Update" : "Add"}
              </button>
            </div>
          </Modal>

          {/* Confirm Delete Modal */}
          <Modal
            isOpen={confirmDeleteModal}
            onRequestClose={() => setConfirmDeleteModal(false)}
            className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Delete Task</h2>
            <p className="mb-6 text-gray-400">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-700 hover:to-gray-800 transition font-medium"
              >
                No
              </button>
              <button
                onClick={async () => {
                  if (taskToDeleteId) {
                    await deleteTask(taskToDeleteId);
                    setConfirmDeleteModal(false);
                    setTaskToDeleteId(null);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition font-medium"
              >
                Yes
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
