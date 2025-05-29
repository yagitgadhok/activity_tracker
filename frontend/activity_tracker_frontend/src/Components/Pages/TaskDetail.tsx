import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { logout } from "../../utils/auth";

interface Task {
  _id: string;
  title: string;
  estimatedTime: string;
  remainingTime: string;
  assignedTo: {
    _id: string;
    name: string;
    email?: string;
  };
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Completed";
  date?: string;
}

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/tasks/${taskId}`
        );
        setTask(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching task details:", err);
        setError("Failed to load task details");
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      // Get userId from localStorage or your auth context
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not found. Please log in again.");
        return;
      }

      if (!task) {
        alert("Task not found. Please try again.");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/v1/tasks/${task._id}/comments`,
        {
          user: userId,
          comment,
        }
      );

      alert("Comment added!");
      setComment("");
      // Optionally, refresh comments here if you display them
    } catch (err) {
      alert("Failed to add comment.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
        <div className="text-white text-xl mb-4">
          {error || "Failed to load task"}
        </div>
        <button
          onClick={() => navigate("/manager")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h2 className="text-3xl font-bold tracking-wide">Activity Tracker</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/manager")}
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>{" "}
          <button
            onClick={logout}
            className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 transition font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 py-10">
        <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
            Task Details
          </h1>

          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Task Name</h3>
                <p className="text-white text-lg font-medium">{task.title}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Assigned To</h3>
                <p className="text-white text-lg font-medium">
                  {task.assignedTo?.name || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Estimated Time</h3>
                <p className="text-white text-lg font-medium">
                  {task.estimatedTime}
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Remaining Time</h3>
                <p className="text-white text-lg font-medium">
                  {task.remainingTime || "0"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Due Date</h3>
                <p className="text-white text-lg font-medium">
                  {task.date ? formatDate(task.date) : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Priority</h3>
                <div className="mt-1">
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
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Status</h3>
                <div className="mt-1">
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
              </div>
            </div>
          </div>

          {/* Manager Comments Section */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Manager Feedback
            </h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your feedback or notes about this task..."
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAddComment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                Add Comment
              </button>
            </div>
          </div>

          {/* Task History Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Task History
            </h2>
            <div className="text-gray-400 italic">
              <p>
                In a production environment, this would show task status
                changes, edits, and comments over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetail;
