import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  estimatedTime: string;
  assignedTo: mongoose.Types.ObjectId; // Reference to the User model
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Completed";
}

const TaskSchema = new Schema<ITask>({
  title: { type: String },
  estimatedTime: { type: String }, // Example: "2 hrs", "1.5 hrs"
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, // Reference to User model
  priority: { type: String, enum: ["High", "Medium", "Low"] },
  status: { type: String, enum: ["To-Do", "In Progress", "Completed"], default: "To-Do" },
});

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
