import express from 'express';
import * as userController from '../controllers/userController.js';
import * as userJobController from '../controllers/userJobController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/fileUpload.js'


const router = express.Router();

// สมัครสมาชิกผู้ใช้ พร้อมอัปโหลดรูปหรือข้อมูลไฟล์
router.post('/register', upload, userController.registerUser);

// เข้าสู่ระบบผู้ใช้
router.post('/login', userController.loginUser);

// เส้นทางที่ต้องการการยืนยันตัวตน
router.use(authMiddleware);

// ดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/users', userController.getUser);

// ดึงข้อมูลโปรไฟล์
router.get('/profile', userController.getProfile);

// อัปเดตข้อมูลโปรไฟล์
router.put('/update-profile', upload, userController.updateUserProfile);

// ดึงประวัติการใช้งานของผู้ใช้ที่ระบุ userId
router.get('/history/:userId', userController.getUserHistory);

// ดึงข้อมูลงานที่ผู้ใช้สมัคร
router.get('/my-jobs', userJobController.getMyJobs);

// ดึงข้อมูลการประเมินงานของผู้ใช้ในงานที่ระบุ jobId และ userId
router.get('/evaluation/:jobId/:userId', userController.getJobEvaluation);

// ดึงการแจ้งเตือนของผู้ใช้
router.get('/notifications', userController.getUserNotifications);

// ทำเครื่องหมายว่าแจ้งเตือนแจ้งว่าอ่านแล้วแบบเจาะจง
router.patch('/notifications/:id/read', userController.markNotificationAsRead);

// ทำเครื่องหมายว่าแจ้งเตือนทั้งหมดว่าอ่านแล้ว
router.patch('/notifications/mark-all-read', userController.markAllNotificationsAsRead);


export default router;