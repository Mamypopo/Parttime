import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import * as jobParticipationController from '../controllers/jobParticipationController.js'

const router = express.Router();




// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

router.get('/', jobController.getAllJobs);
// ฟังชั่นสมัครงาน
router.post('/apply', jobController.applyForJob);
// ฟั่งชั่น user ขอยกเลิกการสมัครงาน
router.post('/cancel', jobController.cancelJobApplication);
// เส้นทางสำหรับแอดมิน
router.post('/create', checkAdminRole, jobController.createJob);
// ค้นหางาน
router.get('/search', jobController.searchJobs);
// ลบงาน
router.delete('/delete-job/:jobId', checkAdminRole, jobController.deleteJob);
// แก้ไขงาน
router.put('/editJob/:jobId', checkAdminRole, jobController.editJob);
// เส้นอัพเดท สถานะงาน
router.patch('/:id/status', checkAdminRole, jobController.updateJobStatus);
// ดึงงานที่ตัวเองสร้าง
router.get('/my-created-jobs', checkAdminRole, jobController.getMyCreatedJobs);
// ดึงงาน
router.get('/getJobsWithParticipants', checkAdminRole, jobParticipationController.getJobsWithParticipants);
// อนุมัติการสมัครงาน
router.put('/:id/approved-rejected', checkAdminRole, jobParticipationController.approveJobParticipation);

// ให้คะแนนหลังจบงาน
router.put('/participation/:jobParticipationId/evaluate', checkAdminRole, jobParticipationController.updateWorkHistory);

router.put(
    '/work-history/:jobParticipationId', checkAdminRole,
    jobParticipationController.updateWorkHistory
);
export default router;