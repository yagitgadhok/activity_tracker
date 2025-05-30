import express from 'express';
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '../Controllers/TaskController';

const router = express.Router();

// RESTful Task Routes
router.post('/tasks', createTask);        // Create a new task
router.get('/tasks', getTasks);           // Get all tasks
router.get('/tasks/:id', getTaskById);    // Get a single task by ID
router.put('/tasks/:id', updateTask);     // Update a task by ID
router.delete('/tasks/:id', deleteTask);  // Delete a task by ID

export default router;
