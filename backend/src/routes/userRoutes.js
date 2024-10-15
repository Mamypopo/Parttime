// src/routes/userRoutes.js
import express from 'express';
import { registerUser, getUser, loginUser, verifyEmail } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { registerAdmin } from '../controllers/adminController.js';

const router = express.Router();

// user/???
router.post('/login', loginUser);

router.post('/register', registerUser);
router.get('/getuser', getUser);
router.get('/verify-email', verifyEmail);


export default router;
