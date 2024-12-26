import express from 'express';
import {
    generateEvaluationExcel,
} from '../controllers/evaluationController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js'

const router = express.Router();


//  สำหรับ Export Excel
router.get('/evaluations/:jobId/excel', authMiddleware, checkAdminRole, generateEvaluationExcel);

export default router;
