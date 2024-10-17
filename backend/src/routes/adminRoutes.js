import express from 'express';
import { registerAdmin, approveUser, getPendingUsers, loginAdmin, getAdminById } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login-admin', loginAdmin);

// เส้นทางสำหรับการสมัครสมาชิกแอดมิน
router.post('/register-admin', registerAdmin);
// อนุมัติผู้ใช้
router.post('/approve-reject-user', authMiddleware, approveUser);

// ดูรายการผู้ใช้ที่รอการอนุมัติ
router.get('/pending-users', getPendingUsers);

router.get('/admin/:adminId', getAdminById);


export default router;
