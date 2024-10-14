import express from 'express';
import { registerAdmin, approveUser, getPendingUsers, loginAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login-admin', loginAdmin);

// เส้นทางสำหรับการสมัครสมาชิกแอดมิน
router.post('/register-admin', registerAdmin);
// อนุมัติผู้ใช้
router.post('/approve', approveUser);

// ดูรายการผู้ใช้ที่รอการอนุมัติ
router.get('/pending-users', getPendingUsers);

export default router;
