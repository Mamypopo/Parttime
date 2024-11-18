import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/fileUpload.js'
const router = express.Router();

router.post('/register', upload, userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/verify-email', userController.verifyEmail);

// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

router.get('/users', userController.getUser);

router.get('/profile', userController.getProfile);

router.put('/update-profile', upload, userController.updateUserProfile);

router.post('/skills', userController.addUserSkills);

router.post('heartbeat', userController.updateUserOnlineStatus);

router.get('/history/:userId', userController.getUserHistory);

router.get('/notifications', userController.getUserNotifications);

export default router;