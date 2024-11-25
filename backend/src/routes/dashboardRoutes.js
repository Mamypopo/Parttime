import express from 'express'
import { getDashboardStats, getCalendarEvents } from '../controllers/dashboardController.js'
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/stats', authMiddleware, checkAdminRole, getDashboardStats)



router.get('/calendar-events', authMiddleware, checkAdminRole, getCalendarEvents)
export default router