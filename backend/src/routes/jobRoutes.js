import express from 'express';
import {
    createJob,
    getAllJobs,
    applyForJob,
    updateJobStatus,
    deleteJob,
    editJob,
    getMyCreatedJobs,
} from '../controllers/jobController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import * as jobParticipationController from '../controllers/jobParticipationController.js'

const router = express.Router();

// เส้นทางสาธารณะ
router.get('/', getAllJobs);

// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

// ฟังชั่นสมัครงาน
router.post('/apply', applyForJob);

// เส้นทางสำหรับแอดมิน
router.post('/create', checkAdminRole, createJob);
router.delete('/delete-job/:jobId', checkAdminRole, deleteJob);
router.put('/editJob/:jobId', checkAdminRole, editJob);

// routes  job participation
// เส้นอัพเดท สถานะงาน
router.patch('/:id/status', checkAdminRole, updateJobStatus);
// ดึงงานที่ตัวเองสร้าง
router.get('/my-created-jobs', checkAdminRole, getMyCreatedJobs);
// ดึงงาน
router.get('/getJobsWithParticipants', checkAdminRole, jobParticipationController.getJobsWithParticipants);
// อนุมัติการสมัครงาน
router.put('/:id/approved-rejected', checkAdminRole, jobParticipationController.approveJobParticipation);
// อัพเดทสถานะหลังจบงาน
router.put('/participations/:jobParticipationId/evaluate',
    checkAdminRole,
    jobParticipationController.updateWorkHistory
)
export default router;