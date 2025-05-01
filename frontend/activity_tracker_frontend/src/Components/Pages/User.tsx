import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define TypeScript interface for Task
interface Task {
  _id: string;
  title: string;
  estimatedTime: string;
  assignedTo: any;
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Completed";
}

const API_URL = "http://localhost:5000/api/v1/tasks";

const UserDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [taskData, setTaskData] = useState<Omit<Task, "_id">>({
    title: "",
    estimatedTime: "",
    assignedTo: "",
    priority: "Low",
    status: "To-Do",
  });
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const loggedInUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/auth/getAllUsers"
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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
      assignedTo: "",
      priority: "Low",
      status: "To-Do",
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
      assignedTo: task.assignedTo._id,
      priority: task.priority,
      status: task.status,
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
      if (!taskData.title || !taskData.estimatedTime || !taskData.assignedTo) {
        alert("Please fill all fields!");
        return;
      }

      if (editMode && editTaskId) {
        // Update existing task
        await axios.put(`${API_URL}/${editTaskId}`, taskData);
        fetchTasks();
      } else {
        // Create new task
        await axios.post(API_URL, taskData);
        fetchTasks();
      }

      setModalIsOpen(false);
      setEditMode(false);
      setEditTaskId(null);
      setTaskData({
        title: "",
        estimatedTime: "",
        assignedTo: "",
        priority: "Low",
        status: "To-Do",
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

  return (
    <>
      <nav className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h2 className="text-3xl font-bold tracking-wide">Task Manager</h2>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium"
        >
          Logout
        </button>
      </nav>
      <div
        className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12"
      >
        <div className="max-w-7xl mx-auto p-10 bg-gray-800 shadow-2xl rounded-xl">
          <h1 className="text-5xl font-extrabold text-center mb-10 text-white">
            User Dashboard
          </h1>

          {/* Add Task Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={openModal}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-teal-600 hover:to-teal-700 transition font-semibold"
            >
              + Add Task
            </button>
          </div>

          {/* Task Table */}
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
                    Assigned To
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Priority
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Status
                  </th>
                  <th className="border border-gray-700 p-4 text-left text-lg font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border border-gray-700 hover:bg-gray-800">
                    <td className="border border-gray-700 p-4 text-gray-300">{task.title}</td>
                    <td className="border border-gray-700 p-4 text-gray-300">{task.estimatedTime}</td>
                    <td className="border border-gray-700 p-4 text-gray-300">{task.assignedTo?.name}</td>
                    <td className="border border-gray-700 p-4 text-gray-300">{task.priority}</td>
                    <td className="border border-gray-700 p-4 text-gray-300">{task.status}</td>
                    <td className="border border-gray-700 p-4 flex space-x-3">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
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
                placeholder="Estimated Time"
                value={taskData.estimatedTime}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              />
              <select
                name="assignedTo"
                value={taskData.assignedTo}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select
                name="status"
                value={taskData.status}
                onChange={handleChange}
                className="w-full border border-gray-600 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg bg-gray-700 text-white"
              >
                <option>To-Do</option>
                <option>In Progress</option>
                <option>Completed</option>
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

export default UserDashboard;
