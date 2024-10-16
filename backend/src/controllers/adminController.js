import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createLog } from '../models/logModel.js';
import { PrismaClient } from '@prisma/client'; // นำเข้า Prisma Client

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ของ Prisma Client

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
        const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

// ฟังก์ชันสำหรับดึงผู้ใช้ที่ยังไม่ผ่านการอนุมัติ
export const getPendingUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { approved: false, email_verified: true },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
            }
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const approveUser = async (req, res) => {
    const { userId, status } = req.body;  // รับ status จาก frontend เช่น 'approved' หรือ 'rejected'
    const adminId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
        // ตรวจสอบว่าผู้ใช้มีอยู่จริงและได้รับการยืนยันอีเมลแล้วหรือไม่
        const user = await userModel.getUserById(userId);

        if (!user || !user.email_verified) {
            return res.status(400).json({ message: "User not found or email not verified." });
        }

        // ตรวจสอบสถานะที่ส่งมาให้เป็น approved หรือ rejected
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Please use 'approved' or 'rejected'." });
        }

        // อัปเดตสถานะผู้ใช้ (true สำหรับ approved, false สำหรับ rejected)
        const isApproved = status === 'approved';
        await adminModel.updateUserApprovalStatus(userId, isApproved);

        // ดึงข้อมูลแอดมิน
        const admin = await adminModel.findAdminById(adminId);
        const adminName = `${admin.first_name} ${admin.last_name}`;

        // บันทึก log พร้อมสถานะที่ได้รับ
        const logMessage = `User ${user.first_name} ${user.last_name} ${status} by Admin ${adminName}`;
        await createLog(
            userId,
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



