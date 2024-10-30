import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/fileUpload.js'
const router = express.Router();


router.post('/register', upload, userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/verify-email', userController.verifyEmail);
// สถิติงานทั้งหมด
router.get('/job-stats', userController.getUserJobStats);

// สถิติรายเดือน
router.get('/monthly-stats', userController.getMonthlyStats);
// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

router.get('/users', userController.getUser);
router.get('/profile', userController.getProfile); // ใช้ฟังก์ชัน getUser สำหรับการดึงโปรไฟล์ของตัวเอง
router.put('/update-profile', authMiddleware, upload, userController.updateUserProfile);
router.post('/skills', authMiddleware, userController.addUserSkills);

router.get('/history/:userId', userController.getUserHistory);
router.get('/notifications', userController.getUserNotifications);

export default router;