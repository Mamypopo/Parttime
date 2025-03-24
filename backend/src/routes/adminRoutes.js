import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware, checkAdminRole } from '../middleware/authMiddleware.js';
import * as  jobParticipationController from '../controllers/jobParticipationController.js'
import { adminUpload, handleMulterError } from '../utils/fileUpload.js'
import { upload } from '../utils/fileUpload.js'

const router = express.Router();

// แอดมินล็อกอิน
router.post('/login-admin', adminController.loginAdmin);

// สมัครแอดมินใหม่ (อัปโหลดไฟล์ได้ เช่น รูปภาพ)
router.post('/register-admin', adminUpload, handleMulterError, adminController.registerAdmin);

/**
 * ส่วนนี้ต้องล็อกอินก่อนถึงจะเข้ามาใช้งานได้
 */

router.use(authMiddleware); // เช็กว่าล็อกอินแล้วหรือยัง เช็ค token
// ต้องการการยืนยันตัวตนและต้องเป็นแอดมิน

// ดึงข้อมูลคนที่รอยืนยันเข้าใช้งานระบบ (ต้องเป็นแอดมินเท่านั้น)
router.get('/pending', checkAdminRole, adminController.getPendingUsers);

// ดึงข้อมูลคนที่ผ่านการยืนยันแล้ว (ต้องเป็นแอดมินเท่านั้น)
router.get('/approved', checkAdminRole, adminController.getApprovedUsers);

// ดึงข้อมูลคนที่ถูกปฏิเสธ (ต้องเป็นแอดมินเท่านั้น)
router.get('/rejected', checkAdminRole, adminController.getRejectedUsers);

// ดูข้อมูลแอดมินคนอื่นจาก ID
router.get('/admin/:adminId', adminController.getAdminById);

// ดูข้อมูลโปรไฟล์แอดมิน
router.get('/profile', adminController.getAdminProfile)

// อนุมัติหรือปฏิเสธผู้ใช้ (ต้องเป็นแอดมินเท่านั้น)
router.post('/approve-reject-user/:userId', checkAdminRole, adminController.approveUser);

// แอดมินกดยกเลิกคำขอสมัครงาน  (ต้องเป็นแอดมินเท่านั้น)
router.post(
    '/jobs/participation/cancel',
    checkAdminRole,
    jobParticipationController.adminCancelJobApplication
);

// ดึงรายชื่อแอดมินที่สามารถเพิ่มเป็นผู้ดูแลงานได้
router.get('/available', checkAdminRole, adminController.getAvailableAdmins);


/**
 * จัดการแจ้งเตือน
 */

// ดึงแจ้งเตือนทั้งหมดของแอดมิน  (ต้องเป็นแอดมินเท่านั้น)
router.get('/notifications', checkAdminRole, adminController.getAdminNotifications);

// มาร์คแจ้งเตือนว่าอ่านแล้ว (เจาะจงทีละอัน)  (ต้องเป็นแอดมินเท่านั้น)
router.patch('/notifications/:id/read', checkAdminRole, adminController.markNotificationAsRead);

// มาร์คแจ้งเตือนทั้งหมดว่าอ่านแล้ว  (ต้องเป็นแอดมินเท่านั้น)
router.patch('/notifications/mark-all-read', checkAdminRole, adminController.markAllNotificationsAsRead);


// User management routes
router.get('/users', adminController.getUsers);
router.post('/create-users', checkAdminRole, upload, adminController.createUser);
router.put('/users/:id', checkAdminRole, upload, adminController.updateUser);


export default router;