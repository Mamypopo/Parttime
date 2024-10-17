import express from 'express';
import { createJob, getAllJobs, applyForJob, approveJobParticipation, markJobAsCompleted, deleteJob } from '../controllers/jobController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// Route สร้างงานใหม่ (เฉพาะแอดมิน)
router.post('/create', authMiddleware, createJob);

// Route ดึงรายการงานทั้งหมด
router.get('/', getAllJobs);

// Route สำหรับการสมัครงาน ของ user
router.post('/apply', authMiddleware, applyForJob);

// Route สำหรับอนุมัติการสมัครงาน
router.put('/approve/:id', authMiddleware, approveJobParticipation);

// Route สำหรับการอัปเดตสถานะหลังจบการทำงาน

router.put('/mark-complete', authMiddleware, markJobAsCompleted);

// Route สำหรับการลบงาน

router.delete('/:jobId', authMiddleware, deleteJob);

export default router;
