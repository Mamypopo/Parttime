import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import { uploadPaymentSlip } from '../utils/fileUpload.js';

const router = express.Router();


router.use(authMiddleware); // ตรวจสอบการล็อกอิน

// ฝั่ง user
router.get('/user/payments', paymentController.getUserPayments);
router.get('/user/payments/:paymentId', paymentController.getUserPaymentDetail);

router.use(checkAdminRole); // ตรวจสอบสิทธิ์ Admin

// ดึงงานที่เสร็จและมีการประเมิน
router.get('/jobs', paymentController.getJobsWithEvaluation);

// ดึงรายการที่รอจ่ายเงินของงาน
router.get(
    '/job/:jobId/payments',
    paymentController.getPendingPayments
);

// ดึงรายการที่จ่ายเงินแล้วของงาน
router.get(
    '/job/:jobId/paid',
    paymentController.getPendingPayments
);

// อัพเดทสถานะการจ่ายเงิน
router.patch(
    '/:id/status',
    uploadPaymentSlip,
    paymentController.updatePaymentStatus
);

// สรุปการเงิน
router.get('/jobs/:jobId/payment-summary', paymentController.getJobPaymentSummary);

// ดึงประวัติการจ่ายเงินแต่ละงาน
router.get('/:jobId/history', paymentController.getPaymentHistory);

// ดึงประวัติการจ่าเงิน แต่ละ user
router.get('/participant/:participationId/history', paymentController.getPaymentHistoryByParticipant);


export default router;
