import express from 'express'
import * as dashboardController from '../controllers/dashboardController.js'
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// ดึงสถิติที่เกี่ยวข้องกับแดชบอร์ด (เฉพาะแอดมิน)
router.get('/stats', authMiddleware, checkAdminRole, dashboardController.getDashboardStats)

// ดึงข้อมูลอีเวนต์ในปฏิทิน (เฉพาะแอดมิน)
router.get('/calendar-events', authMiddleware, checkAdminRole, dashboardController.getCalendarEvents)

// ดึงรายชื่อผู้ใช้พร้อมคะแนนสูงสุด (เฉพาะแอดมิน)
router.get('/users-ratings', authMiddleware, checkAdminRole, dashboardController.getTopUsersWithRatings);

// ดึงแดชบอร์ดของผู้ใช้ทั่วไป (ผู้ใช้)
router.get('/user/dashboard', authMiddleware, dashboardController.getUserDashboard);

export default router