import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import { uploadPaymentSlip, handleMulterError } from '../utils/fileUpload.js';

const router = express.Router();

// ต้องเป็น admin เท่านั้นถึงจะเข้าถึง routes เหล่านี้ได้
router.use(authMiddleware);
router.use(checkAdminRole);

// สร้างรายการจ่ายเงินใหม่
router.post(
    '/payments',
    uploadPaymentSlip,
    handleMulterError,
    paymentController.createPayment
);

// อัปเดตรายการจ่ายเงิน
router.put(
    '/payments/:id',
    uploadPaymentSlip,
    handleMulterError,
    paymentController.updatePayment
);

// ดึงข้อมูลรายการจ่ายเงินตาม ID
router.get('/payments/:id', paymentController.getPaymentById);

// ดึงรายการจ่ายเงินทั้งหมด (พร้อมฟิลเตอร์)
router.get('/payments', paymentController.getAllPayments);

export default router;