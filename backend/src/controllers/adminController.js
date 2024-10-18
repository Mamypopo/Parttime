import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createLog } from '../models/logModel.js';
import { PrismaClient } from '@prisma/client';
import { createNotification } from '../models/notificationModel.js';


const prisma = new PrismaClient();

export const registerAdmin = async (req, res) => {
    const { email, password, first_name, last_name, admin_secret } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    // ตรวจสอบ admin_secret ก่อน
    if (admin_secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret." });
    }

    // ตรวจสอบว่ามีอีเมลซ้ำหรือไม่
    const existingAdmin = await adminModel.checkExistingAdmin(email);
    if (existingAdmin) {
        return res.status(400).json({ message: "Email already exists in the system" });
    }

    // เข้ารหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างแอดมินใหม่
    try {
        const newAdmin = await adminModel.createAdmin({ email, password: hashedPassword, first_name, last_name });
        await createLog(null, newAdmin.id, 'Admin registration successful', req.originalUrl, req.method, `Admin ${newAdmin.first_name} ${newAdmin.last_name} registered successfully`, ip, userAgent);
        res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error registering admin', error: error.message });
    }
};

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    try {

        const admin = await adminModel.findAdminByEmail(email);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await adminModel.verifyPassword(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // สร้าง JWT token

        const token = jwt.sign(
            {
                userId: admin.id, // ใช้ userId แทน id
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        // บันทึก log ของการเข้าสู่ระบบ
        const logDetails = `Admin ${admin.first_name} ${admin.last_name} (${admin.email}) logged in successfully`;
        await createLog(null, admin.id, 'Admin login', req.originalUrl, req.method, logDetails, ip, userAgent);

        res.status(200).json({
            message: "Admin login successful",
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getAdminById = async (req, res) => {
    const { adminId } = req.params;
    try {
        const id = parseInt(adminId);
        if (isNaN(id)) {
            throw new Error('Invalid admin ID');
        }

        const admin = await adminModel.findAdminById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: `Error fetching admin: ${error.message}` });
    }
};

// ดึงผู้ใช้ที่รอการอนุมัติ
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await userModel.findPendingUsers();
        res.status(200).json({ users: pendingUsers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load pending users.' });
    }
};


export const approveUser = async (req, res) => {
    const { status } = req.body;  // อาจจะต้องแก้เป็น params
    const { userId } = req.params;
    const adminId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
        const userIdAsInt = Number(userId);
        // ตรวจสอบว่าผู้ใช้มีอยู่จริงและได้รับการยืนยันอีเมลแล้วหรือไม่
        const user = await userModel.getUserById(userIdAsInt);

        if (!user || !user.email_verified) {
            return res.status(400).json({ message: "User not found or email not verified." });
        }
        if (user.approved) {
            return res.status(400).json({ message: 'User has already been approved' });
        }

        // ตรวจสอบสถานะที่ส่งมาให้เป็น approved หรือ rejected
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Please use 'approved' or 'rejected'." });
        }

        // อัปเดตสถานะผู้ใช้ (true สำหรับ approved, false สำหรับ rejected)
        const isApproved = status === 'approved';
        await adminModel.updateUserApprovalStatus(userIdAsInt, isApproved);


        // สร้างการแจ้งเตือนให้ผู้ใช้ตามสถานะที่ได้รับ
        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
            throw new Error('Invalid user ID');
        }
        const notificationMessage = isApproved
            ? 'Your account has been approved!'
            : 'Your account has been rejected.';

        await createNotification(userIdInt, notificationMessage);


        // ดึงข้อมูลแอดมิน
        const admin = await adminModel.findAdminById(adminId);
        const adminName = `${admin.first_name} ${admin.last_name}`;
        // บันทึก log พร้อมสถานะที่ได้รับ
        const logMessage = `User ${user.first_name} ${user.last_name} ${status} by Admin ${adminName}`;
        await createLog(
            userIdAsInt,
            adminId,
            `User ${status} successfully`,
            req.originalUrl,
            req.method,
            logMessage,
            ip,
            userAgent
        );

        res.status(200).json({ message: `User ${status} successfully.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminNotifications = async (req, res) => {
    try {
        console.log('req.user:', req.user); // เพิ่ม log นี้เพื่อตรวจสอบค่า req.user

        if (!req.user || (!req.user.id && !req.user.email)) {
            return res.status(400).json({ message: 'Admin ID or email is missing' });
        }

        let adminWhereClause = {};
        if (req.user.id) {
            adminWhereClause.id = parseInt(req.user.id, 10);
        } else if (req.user.email) {
            adminWhereClause.email = req.user.email;
        }

        const admin = await prisma.admin.findUnique({
            where: adminWhereClause
        });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const notifications = await prisma.notification.findMany({
            where: { adminId: admin.id },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};


// export const getAdminNotifications = async (req, res) => {
//     const adminId = req.user.id;
//     console.log('req.user:', req.user);
//     console.log('adminId:', adminId);
//     if (!adminId) {
//         console.error('Admin ID not found in request');
//         return res.status(400).json({ message: "Admin ID not found in request" });
//     }

//     try {
//         const admin = await prisma.admin.findUnique({ where: { id: adminId } });
//         if (!admin) {
//             console.error(`Admin with ID ${adminId} not found`);
//             return res.status(404).json({ message: "Admin not found" });
//         }

//         const notifications = await prisma.notification.findMany({
//             where: { adminId: adminId },
//             orderBy: { createdAt: 'desc' }
//         });

//         if (notifications.length === 0) {
//             return res.status(404).json({ message: 'ไม่พบการแจ้งเตือนสำหรับแอดมินคนนี้' });
//         }

//         res.status(200).json({ notifications });
//     } catch (error) {
//         console.error('Error loading notifications:', error);
//         res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน' });
//     }
// };


