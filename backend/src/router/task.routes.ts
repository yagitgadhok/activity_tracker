import express from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../Controllers/TaskController';
const router = express.Router();

router.post('/tasks', createTask); // Create a new task
router.get('/tasks', getTasks); // Get all tasks
router.put('/tasks/:id', updateTask); // Update a task by ID
router.delete('/tasks/:id', deleteTask); // Delete a task by ID

export default router;
