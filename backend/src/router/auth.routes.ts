import express from 'express';
import { getAllUsers, login, register } from '../Controllers/AuthController';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login); // ✅ Correct method for login 
router.get('/auth/getAllUsers', getAllUsers); 

export default router;