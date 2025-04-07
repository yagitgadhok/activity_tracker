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
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-semibold">Task Manager</h2>
        <button
          onClick={() => {
            localStorage.removeItem("token"); // or your auth key
            navigate("/"); // navigate to login
          }}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </nav>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg relative">
        <h1 className="text-3xl font-bold text-center mb-6">
          User Dashboard - Task Table
        </h1>

        {/* Add Task Button */}
        <button
          onClick={openModal}
          className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition"
        >
          + Add Task
        </button>

        {/* Task Table */}
        <table className="w-full border-collapse border border-gray-300 mt-10">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-2">Task Name</th>
              <th className="border p-2">Estimated Time</th>
              <th className="border p-2">Assigned To</th>
              <th className="border p-2">Priority</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className="border">
                <td className="border p-2">{task.title}</td>
                <td className="border p-2">{task.estimatedTime}</td>
                <td className="border p-2">{task.assignedTo?.name}</td>
                <td className="border p-2">{task.priority}</td>
                <td className="border p-2">{task.status}</td>
                <td className="border p-2 flex space-x-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(task._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-2xl font-semibold mb-4">
            {editMode ? "Edit Task" : "Add New Task"}
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              name="title"
              placeholder="Task Name"
              value={taskData.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="estimatedTime"
              placeholder="Estimated Time"
              value={taskData.estimatedTime}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <select
              name="assignedTo"
              value={taskData.assignedTo}
              onChange={handleChange}
              className="w-full border p-2 rounded"
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
              className="w-full border p-2 rounded"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option>To-Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setModalIsOpen(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {editMode ? "Update" : "Add"}
            </button>
          </div>
        </Modal>

        {/* Confirm Delete Modal */}
        <Modal
          isOpen={confirmDeleteModal}
          onRequestClose={() => setConfirmDeleteModal(false)}
          className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-xl font-semibold mb-4">Delete Task</h2>
          <p className="mb-4">Are you sure you want to delete this task?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setConfirmDeleteModal(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
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
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Yes
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default UserDashboard;
