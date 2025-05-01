// controllers/TaskController.ts
import { Request, Response } from "express";
import Task from "../Models/Task";
import mongoose from "mongoose";

// Create a new task
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, estimatedTime, assignedTo, priority, status } = req.body;

    // Validate assignedTo before creating the task
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      res.status(400).json({ message: "Invalid assignedTo ID" });
      return;
    }

    const newTask = new Task({
      title,
      estimatedTime,
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      priority,
      status,
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
    // const tasks = await Task.find().populate("assignedTo", "name email"); // Fetch all tasks
    // res.status(200).json(tasks);
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo as string)) {
      filter = {
        assignedTo: new mongoose.Types.ObjectId(assignedTo as string),
      };
    }

    const tasks = await Task.find(filter).populate("assignedTo", "name email");
    res.status(200).json(tasks);
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

    // if (!updatedTask) {
    //   res.status(404).json({ message: "Task not found" });
    //   return;
    // }

    // res
    //   .status(200)
    //   .json({ message: "Task updated successfully", task: updatedTask });

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

    // if (!deletedTask) {
    //   res.status(404).json({ message: "Task not found" });
    //   return;
    // }

    // res.status(200).json({ message: "Task deleted successfully" });

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
