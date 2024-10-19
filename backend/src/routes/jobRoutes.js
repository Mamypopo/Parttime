import express from 'express';
import {
    createJob,
    getAllJobs,
    applyForJob,
    approveJobParticipation,
    markJobAsCompleted,
    deleteJob
} from '../controllers/jobController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// เส้นทางสาธารณะ
router.get('/', getAllJobs);

// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

router.post('/apply', applyForJob);
router.put('/mark-complete', markJobAsCompleted);

// เส้นทางสำหรับแอดมิน
router.post('/create', checkAdminRole, createJob);
router.put('/approve/:id', checkAdminRole, approveJobParticipation);
router.delete('/:jobId', checkAdminRole, deleteJob);

export default router;