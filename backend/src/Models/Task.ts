import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  estimatedTime: string;
  remainingTime: string; // Optional field for remaining time
  assignedTo: mongoose.Types.ObjectId; // Reference to the User model
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Completed";
  date?: Date; // Add date field
  createdBy?: mongoose.Types.ObjectId; // Reference to the User who created the task
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    estimatedTime: { type: String }, // Example: "2 hrs", "1.5 hrs"
    remainingTime: { type: String }, // Example: "1 hr", "30 mins"
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
    priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
    status: {
      type: String,
      enum: ["To-Do", "In Progress", "Completed"],
      default: "To-Do",
    },
    date: { type: Date }, // Add date field
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Track who created the task
  },
  { timestamps: true }
); // Add automatic createdAt and updatedAt timestamps

// Comment schema for task detail comments
export interface ITaskComment extends Document {
  task: mongoose.Types.ObjectId; // Reference to the Task
  user: mongoose.Types.ObjectId; // Reference to the User who commented
  comment: string;
  createdAt: Date;
}

export const TaskCommentSchema = new Schema<ITaskComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
