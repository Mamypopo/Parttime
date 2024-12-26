import express from 'express';
import * as authController from '../controllers/authController.js'

const router = express.Router();

// ลืมรหัสผ่าน
router.post('/forgot-password', authController.forgotPassword);

// รีเซ็ทรหัสผ่าน
router.post('/reset-password', authController.resetPassword);

export default router;