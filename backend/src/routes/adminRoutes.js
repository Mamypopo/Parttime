import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    approveUser,
    getPendingUsers,
    getAdminById,
    getAdminNotifications,
    getAdminPendingSkills,
    updatePendingSkillStatus,
    getAdminProfile,
    getApprovedUsers,
    getRejectedUsers
} from '../controllers/adminController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// ไม่ต้องการการยืนยันตัวตน
router.post('/login-admin', loginAdmin);
router.post('/register-admin', registerAdmin);

// ต้องการการยืนยันตัวตนเท่านั้น
// router.get('/pending-users', authMiddleware, getPendingUsers);
router.get('/pending', authMiddleware, checkAdminRole, getPendingUsers);
router.get('/approved', authMiddleware, checkAdminRole, getApprovedUsers);
router.get('/rejected', authMiddleware, checkAdminRole, getRejectedUsers);
router.get('/admin/:adminId', authMiddleware, getAdminById);
router.get('/profile', authMiddleware, getAdminProfile)

// ต้องการการยืนยันตัวตนและต้องเป็นแอดมิน
router.post('/approve-reject-user/:userId', authMiddleware, checkAdminRole, approveUser);
router.get('/notifications', authMiddleware, checkAdminRole, getAdminNotifications);
router.get('/pending-skills', authMiddleware, checkAdminRole, getAdminPendingSkills);
router.put('/pending-skills/:pendingSkillId', authMiddleware, checkAdminRole, updatePendingSkillStatus);
export default router;