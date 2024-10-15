import { createAdmin, checkExistingAdmin } from '../models/adminModel.js';
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
    const existingAdmin = await checkExistingAdmin(email);
    if (existingAdmin) {
        return res.status(400).json({ message: "Email already exists in the system" });
    }

    // เข้ารหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างแอดมินใหม่
    try {
        const newAdmin = await createAdmin({ email, password: hashedPassword, first_name, last_name });
        await createLog(newAdmin.id, 'Admin registration successful', req.originalUrl, req.method, `Admin ${newAdmin.first_name} ${newAdmin.last_name} registered successfully`, ip, userAgent);
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
        // ค้นหาแอดมินใน table แยกของแอดมิน
        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // สร้าง JWT token
        const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await createLog(admin.id, 'login', req.originalUrl, req.method, `ข้อมูล = ${admin.first_name} ${admin.last_name}  ${admin.email} `, ip, userAgent);

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
    const { userId } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    try {
        // ตรวจสอบว่าผู้ใช้มีอยู่จริงและได้รับการยืนยันอีเมลแล้วหรือไม่
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.email_verified) {
            return res.status(400).json({ message: "User not found or email not verified." });
        }

        // อัปเดตสถานะ approved เป็น true
        await prisma.user.update({
            where: { id: userId },
            data: { approved: true }
        });
        await createLog(userId, 'User approved successfully', req.originalUrl, req.method, `User ${user.first_name} ${user.last_name} approved successfully`, ip, userAgent);

        res.status(200).json({ message: "User approved successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// export const applyForJob = async (req, res) => {
//     const { userId, jobId } = req.body;
//     const ip = req.ip;
//     const userAgent = req.headers['user-agent'];
//     try {
//         const user = await prisma.user.findUnique({ where: { id: userId } });

//         // ตรวจสอบว่าผู้ใช้ได้รับการยืนยันอีเมลและได้รับการอนุมัติหรือไม่
//         if (!user.email_verified) {
//             return res.status(400).json({ message: "Please verify your email first." });
//         }

//         if (!user.approved) {
//             return res.status(400).json({ message: "Your account is pending admin approval." });
//         }

//         // สมัครงาน
//         const jobParticipation = await prisma.jobParticipation.create({
//             data: {
//                 user_id: userId,
//                 job_id: jobId,
//                 status: 'pending'
//             }
//         });
//         await logAction(userId, 'Job application submitted', req.originalUrl, req.method, `Job application submitted for userId: ${userId}, jobId: ${jobId}`, ip, userAgent);
//         res.status(200).json({ message: "Job application submitted successfully." });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

