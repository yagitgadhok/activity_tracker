import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  status: "Pending" | "Completed";
  user: mongoose.Types.ObjectId; // Ensure user is linked to a specific user
}

const TaskSchema = new Schema<ITask>({
  title: { type: String },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  user: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Ensure user is required
});

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
