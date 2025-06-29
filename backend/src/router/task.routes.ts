import express from "express";
import {
  addTaskComment,
  createTask,
  deleteTask,
  getTaskById,
  getTaskComments,
  getTasks,
  updateTask,
} from "../Controllers/TaskController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = express.Router();

// Apply authentication middleware to all task routes
router.use("/tasks", authenticateToken);

// RESTful Task Routes
router.post("/tasks", createTask); // Create a new task
router.get("/tasks", getTasks); // Get all tasks
router.get("/tasks/:id", getTaskById); // Get a single task by ID
router.put("/tasks/:id", updateTask); // Update a task by ID
router.delete("/tasks/:id", deleteTask); // Delete a task by ID
router.post("/tasks/:taskId/comments", addTaskComment); // Add a comment to a task
router.get("/tasks/:taskId/comments", getTaskComments); // Get all comments for a task

router.delete(
  "/tasks/:id",
  authorizeRoles(["manager", "superAdmin"]),
  deleteTask
);

export default router;
