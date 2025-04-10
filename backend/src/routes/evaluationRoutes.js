import express from 'express';
import * as evaluationController from '../controllers/evaluationController.js';

const router = express.Router();

// ดึงข้อมูลการประเมินตาม ID
router.get('/work-history/:workHistoryId', evaluationController.getEvaluationById);

// อัปเดตข้อมูลการประเมิน
router.put('/work-history/:workHistoryId', evaluationController.updateEvaluation);

export default router;
