// controllers/TaskController.ts
import { Request, Response } from "express";
import Task, { ITaskComment, TaskCommentSchema } from "../Models/Task";
import mongoose from "mongoose";

// Create a new task
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, estimatedTime, assignedTo, priority, status, date } = req.body;

    // Validate assignedTo before creating the task
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      res.status(400).json({ message: "Invalid assignedTo ID" });
      return;
    }

    // Check if the user has permission to assign tasks to others
    const isManager = req.user && req.user.role.some(role => ['manager', 'superAdmin'].includes(role));
    if (!isManager && assignedTo !== req.user?.id) {
      res.status(403).json({ message: "You don't have permission to assign tasks to other users" });
      return;
    }

    const newTask = new Task({
      title,
      estimatedTime,
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      priority,
      status,
      date, // Add date field
      createdBy: req.user?.id, // Track who created the task
    });

    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignedTo } = req.query;
    let filter = {};
    
    // If a specific user is requested, filter by that user
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo as string)) {
      filter = {
        assignedTo: new mongoose.Types.ObjectId(assignedTo as string),
      };
    } 
    // If no specific assignee is requested but the user is not a manager/admin, only show their tasks
    else if (req.user && !req.user.role.some(role => ['manager', 'superAdmin'].includes(role))) {
      filter = {
        assignedTo: new mongoose.Types.ObjectId(req.user.id),
      };
    }
    // For managers/admins with no specific assignee filter, show all tasks

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .select(
        "title estimatedTime remainingTime assignedTo priority status date"
      ); // Include date in the response
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single task by ID
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate the task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid task ID format" });
      return;
    }

    const task = await Task.findById(id).populate("assignedTo", "name email");

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a task
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a task
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const TaskComment = mongoose.model<ITaskComment>(
  "TaskComment",
  TaskCommentSchema
);

// API: Add a comment to a task
export const addTaskComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { user, comment } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(user)
    ) {
      res.status(400).json({ message: "Invalid task or user ID" });
      return;
    }
    if (!comment) {
      res.status(400).json({ message: "Comment text is required" });
      return;
    }

    const newComment = new TaskComment({
      task: taskId,
      user,
      comment,
    });
    await newComment.save();

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// API: Get all comments for a task
export const getTaskComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      res.status(400).json({ message: "Invalid task ID" });
      return;
    }

    const comments = await TaskComment.find({ task: taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
