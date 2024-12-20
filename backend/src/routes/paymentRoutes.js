import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import { uploadPaymentSlip, handleMulterError } from '../utils/fileUpload.js';

const router = express.Router();

// ต้องเป็น admin เท่านั้นถึงจะเข้าถึง routes เหล่านี้ได้
router.use(authMiddleware);
router.use(checkAdminRole);

// 1. Routes สำหรับดึงข้อมูลงาน
router.get('/completed', paymentController.getCompletedJobs); // ดึงงานที่เสร็จแล้วของแอดมิน
router.get('/job-participants/:jobId', paymentController.getUnpaidParticipantsByJob); // ดึงรายชื่อคนที่รอรับเงินในงานนั้นๆ
router.post('/bulk', paymentController.createBulkPayments)

// 2. Routes สำหรับจัดการรายการจ่ายเงิน
router.get('/', paymentController.getAllPayments); // ดึงรายการจ่ายเงินทั้งหมด
router.post('/', uploadPaymentSlip, handleMulterError, paymentController.createPayment); // สร้างรายการใหม่
router.get('/:id', paymentController.getPaymentById); // ดึงรายการตาม ID
router.put('/:id', uploadPaymentSlip, handleMulterError, paymentController.updatePayment); // อัพเดทรายการ

export default router;