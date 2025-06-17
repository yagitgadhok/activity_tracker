import express from 'express';
import { getAllUsers, getCurrentUser, login, register } from '../Controllers/AuthController';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected routes
router.get('/auth/me', authenticateToken, getCurrentUser); // Get current user info
router.get('/auth/getAllUsers', authenticateToken, authorizeRoles(['manager', 'superAdmin']), getAllUsers); // Only managers and super admins can get all users

export default router;