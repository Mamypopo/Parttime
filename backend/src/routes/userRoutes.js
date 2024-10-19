import express from 'express';
import {
    registerUser,
    getUser,
    loginUser,
    verifyEmail,
    getUserHistory,
    getUserNotifications,
    getProfile
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// เส้นทางสาธารณะ
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);

// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

router.get('/users', getUser);
router.get('/profile', getProfile); // ใช้ฟังก์ชัน getUser สำหรับการดึงโปรไฟล์ของตัวเอง

router.get('/history/:userId', getUserHistory);
router.get('/notifications', getUserNotifications);

export default router;