import express from 'express';
import { registerAdmin, approveUser, getPendingUsers, loginAdmin, getAdminById, getAdminNotifications } from '../controllers/adminController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login-admin', loginAdmin);

// เส้นทางสำหรับการสมัครสมาชิกแอดมิน
router.post('/register-admin', registerAdmin);
// อนุมัติผู้ใช้
router.post('/approve-reject-user/:userId', authMiddleware, approveUser);

// ดูรายการผู้ใช้ที่รอการอนุมัติ
router.get('/pending-users', getPendingUsers);

router.get('/admin/:adminId', getAdminById);

router.get('/notifications', authMiddleware, checkAdminRole, getAdminNotifications);
export default router;
