import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/fileUpload.js'
import { trackUserActivity } from '../middleware/trackUserActivity.js'
import * as userJobController from '../controllers/userJobController.js';

const router = express.Router();

router.post('/register', upload, userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/verify-email', userController.verifyEmail);

// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);
router.use(trackUserActivity)

router.get('/users', userController.getUser);

router.get('/profile', userController.getProfile);

router.put('/update-profile', upload, userController.updateUserProfile);

router.post('/skills', userController.addUserSkills);

router.post('heartbeat', userController.updateUserOnlineStatus);

router.get('/history/:userId', userController.getUserHistory);

router.get('/my-jobs', userJobController.getMyJobs);

router.get('/evaluation/:jobId/:userId', userController.getJobEvaluation);

router.get('/notifications', userController.getUserNotifications);

router.patch('/notifications/:id/read', userController.markNotificationAsRead);


router.patch('/notifications/mark-all-read', userController.markAllNotificationsAsRead);
export default router;