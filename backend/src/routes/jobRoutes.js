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

// สร้างงาน  
router.post('/create', checkAdminRole, jobController.createJob);

// ค้นหางาน
router.get('/search', jobController.searchJobs);

// ลบงาน 
router.delete('/delete-job/:jobId', checkAdminRole, jobController.deleteJob);

// แก้ไขงาน 
router.put('/editJob/:jobId', checkAdminRole, jobController.editJob);

// อัพเดท สถานะงาน 
router.patch('/:id/status', checkAdminRole, jobController.updateJobStatus);

// ดึงงานที่ตัวเองสร้าง 
router.get('/my-created-jobs', checkAdminRole, jobController.getMyCreatedJobs);

// ดึงงานที่มีผู้ใช้งานสมัครเข้ามาเพื่อรออนุมัติ 
router.get('/getJobsWithParticipants', checkAdminRole, jobParticipationController.getJobsWithParticipants);

// อนุมัติการสมัครงาน 
router.put('/:id/approved-rejected', checkAdminRole, jobParticipationController.approveJobParticipation);

// ให้คะแนนหลังจบงาน 
router.put('/participation/:jobParticipationId/evaluate', checkAdminRole, jobParticipationController.updateWorkHistory);

// ดึง ไฟล์ ต่างๆของ user  
router.get('/:jobId/documents', checkAdminRole, jobController.downloadParticipantDocuments)

// ดึงงานที่ได้รับมอบหมาย
router.get('/assigned', checkAdminRole, jobController.getAssignedJobs);

// เพิ่ม/ลบแอดมิน (เฉพาะผู้สร้างงาน)
router.post('/:jobId/admins', authMiddleware, jobController.addJobAdmin);
router.delete('/:jobId/admins/:adminId', authMiddleware, jobController.removeJobAdmin);

// ใช้ middleware ตรวจสอบสิทธิ์สำหรับ routes ที่ต้องการ
router.put('/:jobId', authMiddleware, jobController.checkJobPermission, jobController.editJob);

export default router;