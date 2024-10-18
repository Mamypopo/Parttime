// src/routes/userRoutes.js
import express from 'express';
import { registerUser, getUser, loginUser, verifyEmail, getUserHistory, getUserNotifications } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// user/???
router.post('/login', loginUser);

router.post('/register', registerUser);

router.get('/getuser', getUser);

router.get('/verify-email', verifyEmail);

// Route สำหรับการดูประวัติงาน user 
router.get('/history/:userId', authMiddleware, getUserHistory);

router.get('/notifications', authMiddleware, getUserNotifications);
export default router;
