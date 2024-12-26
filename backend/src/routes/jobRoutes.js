import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import * as jobParticipationController from '../controllers/jobParticipationController.js'

const router = express.Router();




// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

router.get('/', jobController.getAllJobs);

// ฟังชั่นขอสมัครงาน
router.post('/apply', jobController.applyForJob);

// ฟั่งชั่น user ขอยกเลิกการสมัครงาน
router.post('/cancel', jobController.cancelJobApplication);

// สร้างงาน  (เส้นทางสำหรับแอดมิน)
router.post('/create', checkAdminRole, jobController.createJob);

// ค้นหางาน
router.get('/search', jobController.searchJobs);

// ลบงาน (เส้นทางสำหรับแอดมิน
router.delete('/delete-job/:jobId', checkAdminRole, jobController.deleteJob);

// แก้ไขงาน (เส้นทางสำหรับแอดมิน
router.put('/editJob/:jobId', checkAdminRole, jobController.editJob);

// อัพเดท สถานะงาน (เส้นทางสำหรับแอดมิน
router.patch('/:id/status', checkAdminRole, jobController.updateJobStatus);

// ดึงงานที่ตัวเองสร้าง (เส้นทางสำหรับแอดมิน
router.get('/my-created-jobs', checkAdminRole, jobController.getMyCreatedJobs);

// ดึงงานที่มีผู้ใช้งานสมัครเข้ามาเพื่อรออนุมัติ (เส้นทางสำหรับแอดมิน
router.get('/getJobsWithParticipants', checkAdminRole, jobParticipationController.getJobsWithParticipants);

// อนุมัติการสมัครงาน (เส้นทางสำหรับแอดมิน
router.put('/:id/approved-rejected', checkAdminRole, jobParticipationController.approveJobParticipation);

// ให้คะแนนหลังจบงาน (เส้นทางสำหรับแอดมิน
router.put('/participation/:jobParticipationId/evaluate', checkAdminRole, jobParticipationController.updateWorkHistory);

// ดึง ไฟล์ ต่างๆของ user  (เส้นทางสำหรับแอดมิน
router.get('/:jobId/documents', checkAdminRole, jobController.downloadParticipantDocuments)


export default router;