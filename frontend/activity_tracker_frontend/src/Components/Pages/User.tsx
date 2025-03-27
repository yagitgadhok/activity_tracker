import { useState, useEffect } from "react";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
  status: "Pending" | "Completed";
}

const UserDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Add task
  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/v1/tasks", {
        title: newTask,
        status: "Pending",
      });
      setTasks([...tasks, response.data.task]);
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Mark task as completed
  const completeTask = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/tasks/${id}`, {
        status: "Completed",
      });
      setTasks(tasks.map((task) => (task._id === id ? { ...task, status: "Completed" } : task)));
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">User Dashboard</h1>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Enter new task"
          className="flex-1 p-2 border rounded-lg"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
          Add Task
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li key={task._id} className="flex justify-between items-center p-2 border-b">
            <span className={task.status === "Completed" ? "line-through" : ""}>{task.title} - {task.status}</span>
            <div>
              {task.status === "Pending" && (
                <button
                  onClick={() => completeTask(task._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg mr-2"
                >
                  Complete
                </button>
              )}
              <button onClick={() => deleteTask(task._id)} className="px-3 py-1 bg-red-500 text-white rounded-lg">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
