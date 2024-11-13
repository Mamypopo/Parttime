import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    getUserWorkHistory,
    getWorkHistoryByParticipationId
} from '../controllers/workHistoryController.js';

const router = express.Router();

// ดึงประวัติการทำงานทั้งหมดของผู้ใช้
router.get('/user/:userId', authMiddleware, getUserWorkHistory);

// ดึงประวัติการทำงานตาม participation ID
router.get('/participation/:participationId', authMiddleware, getWorkHistoryByParticipationId);

export default router;