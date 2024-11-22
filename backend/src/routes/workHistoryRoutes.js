import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as workHistoryController from '../controllers/workHistoryController.js';

const router = express.Router();


router.use(authMiddleware);
// ดึงประวัติการทำงานทั้งหมดของผู้ใช้
router.get('/user/:userId', workHistoryController.getUserWorkHistory);

// ดึงประวัติการทำงานตาม participation ID
router.get('/participation/:participationId', workHistoryController.getWorkHistoryByParticipationId);


router.get('/users-ratings', workHistoryController.getTopUsersWithRatings);
export default router;