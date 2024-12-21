import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import { uploadPaymentSlip } from '../utils/fileUpload.js';

const router = express.Router();

// Middleware สำหรับตรวจสอบสิทธิ์ (ต้องเป็นผู้ที่ล็อกอินและเป็น Admin เท่านั้น)
router.use(authMiddleware); // ตรวจสอบการล็อกอิน
router.use(checkAdminRole); // ตรวจสอบสิทธิ์ Admin

// ดึงงานที่เสร็จและมีการประเมิน
router.get('/jobs', paymentController.getJobsWithEvaluation);

// ดึงรายการที่รอจ่ายเงินของงาน
router.get(
    '/job/:jobId/payments',
    paymentController.getPendingPayments
);

router.get(
    '/job/:jobId/paid',
    paymentController.getPendingPayments
);

router.get('/:jobId/history', paymentController.getPaymentHistory);

router.get('/participant/:participationId/history', paymentController.getPaymentHistoryByParticipant);

// อัพเดทสถานะการจ่ายเงิน
router.patch(
    '/:id/status',
    uploadPaymentSlip,
    paymentController.updatePaymentStatus
);
export default router;
