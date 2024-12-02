import express from 'express'
import * as dashboardController from '../controllers/dashboardController.js'
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/stats', authMiddleware, checkAdminRole, dashboardController.getDashboardStats)

router.get('/calendar-events', authMiddleware, checkAdminRole, dashboardController.getCalendarEvents)

router.get('/users-ratings', authMiddleware, checkAdminRole, dashboardController.getTopUsersWithRatings);

router.get('/user/dashboard', authMiddleware, dashboardController.getUserDashboard);

export default router