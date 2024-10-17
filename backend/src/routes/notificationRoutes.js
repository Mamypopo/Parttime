import express from 'express';
import { fetchNotifications, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// เส้นทางสำหรับดึงการแจ้งเตือน
router.get('/notifications', fetchNotifications);

// เส้นทางสำหรับมาร์คการแจ้งเตือนว่าอ่านแล้ว
router.put('/notifications/:id/read', markAsRead);

export default router;
