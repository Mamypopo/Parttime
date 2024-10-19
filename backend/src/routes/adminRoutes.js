import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    approveUser,
    getPendingUsers,
    getAdminById,
    getAdminNotifications
} from '../controllers/adminController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// ไม่ต้องการการยืนยันตัวตน
router.post('/login-admin', loginAdmin);
router.post('/register-admin', registerAdmin);

// ต้องการการยืนยันตัวตนเท่านั้น
router.get('/pending-users', authMiddleware, getPendingUsers);
router.get('/admin/:adminId', authMiddleware, getAdminById);

// ต้องการการยืนยันตัวตนและต้องเป็นแอดมิน
router.post('/approve-reject-user/:userId', authMiddleware, checkAdminRole, approveUser);
router.get('/notifications', authMiddleware, checkAdminRole, getAdminNotifications);

export default router;