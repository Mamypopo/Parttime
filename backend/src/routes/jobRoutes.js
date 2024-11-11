import express from 'express';
import {
    createJob,
    getAllJobs,
    applyForJob,

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

router.post('/apply', applyForJob);
// router.put('/mark-complete', markJobAsCompleted);

// เส้นทางสำหรับแอดมิน
router.post('/create', checkAdminRole, createJob);
router.get('/my-created-jobs', checkAdminRole, getMyCreatedJobs);
router.get('/my-created-jobs/participants', checkAdminRole, jobParticipationController.getJobsWithParticipants);
router.put('/:id/approved-rejected', checkAdminRole, jobParticipationController.approveJobParticipation);
router.delete('/delete-job/:jobId', checkAdminRole, deleteJob);
router.put('/editJob/:jobId', checkAdminRole, editJob);




// routes  job participation
router.put('/participants/:jobParticipationId/complete',
    checkAdminRole,
    jobParticipationController.updateApplicationStatus
)
export default router;