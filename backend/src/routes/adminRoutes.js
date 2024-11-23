import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import * as  jobParticipationController from '../controllers/jobParticipationController.js'
const router = express.Router();

// ไม่ต้องการการยืนยันตัวตน
router.post('/login-admin', adminController.loginAdmin);

router.post('/register-admin', adminController.registerAdmin);


router.use(authMiddleware);
// ต้องการการยืนยันตัวตนและต้องเป็นแอดมิน
router.get('/pending', checkAdminRole, adminController.getPendingUsers);

router.get('/approved', checkAdminRole, adminController.getApprovedUsers);

router.get('/rejected', checkAdminRole, adminController.getRejectedUsers);

router.get('/online-users', adminController.getOnlineUsersCount)

router.get('/admin/:adminId', adminController.getAdminById);

router.get('/profile', adminController.getAdminProfile)

router.post('/approve-reject-user/:userId', checkAdminRole, adminController.approveUser);

router.put(
    '/jobs/work-history/:jobParticipationId',
    checkAdminRole,
    jobParticipationController.updateWorkHistory
);

router.get('/notifications', checkAdminRole, adminController.getAdminNotifications);

router.patch('/notifications/:id/read', checkAdminRole, adminController.markNotificationAsRead);

router.patch('/notifications/mark-all-read', checkAdminRole, adminController.markAllNotificationsAsRead);

router.get('/pending-skills', checkAdminRole, adminController.getAdminPendingSkills);

router.put('/pending-skills/:pendingSkillId', checkAdminRole, adminController.updatePendingSkillStatus);


export default router;