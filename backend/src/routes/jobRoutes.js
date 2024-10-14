import express from 'express';
import { createJob, getAllJobs, applyForJob, approveJobParticipation, updateJobStatus, getUserHistory, } from '../controllers/jobController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// Route สร้างงานใหม่ (เฉพาะแอดมิน)
router.post('/create', createJob);

// Route ดึงรายการงานทั้งหมด
router.get('/', getAllJobs);

// Route สำหรับการสมัครงาน ของ user
router.post('/apply', authMiddleware, applyForJob);

// Route สำหรับอนุมัติการสมัครงาน
router.put('/approve', approveJobParticipation);

// Route สำหรับการอัปเดตสถานะหลังจบการทำงาน

router.put('/update-status', updateJobStatus);

// Route สำหรับการดูประวัติงาน user 
router.get('/history/:userId', getUserHistory);

export default router;
