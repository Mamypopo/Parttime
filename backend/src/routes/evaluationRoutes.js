import express from 'express';
import {
    generateEvaluationExcel,
} from '../controllers/evaluationController.js';

const router = express.Router();


// Route สำหรับ Export Excel
router.get('/evaluations/:jobId/excel', generateEvaluationExcel);

export default router;
