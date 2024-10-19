import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';  // เพิ่มการใช้งาน bcrypt สำหรับ hash password
import jwt from 'jsonwebtoken';  // เพิ่มการใช้งาน JWT
import * as userModel from '../models/userModel.js';
import { calculateAge } from '../utils/calculateAge.js';
import { sendVerificationEmail } from '../utils/email.js';
import { createLog } from '../models/logModel.js';
import * as notificationModel from '../models/notificationModel.js'
const prisma = new PrismaClient(); // สร้าง PrismaClient

export const registerUser = async (req, res) => {
    try {
        const {
            email, password, prefix, first_name, last_name, national_id,
            gender, birth_date, education_level_url, phone_number,
            line_id, profile_image, skills
        } = req.body;

        if (!password) {
            return res.status(400).json({ message: "กรุณาระบุรหัสผ่าน" });
        }

        // ตรวจสอบว่าผู้ใช้มีในระบบแล้วหรือไม่
        const existingUser = await userModel.checkExistingUser(email, national_id);
        if (existingUser) {
            return res.status(400).json({ message: "อีเมลหรือเลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว" });
        }

        const age = calculateAge(birth_date);
        const skillsString = Array.isArray(skills) ? skills.join(',') : skills;


        // สร้าง verification token สำหรับส่ง email ยืนยันตัวตน
        const verificationToken = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const user = await userModel.createUser({
            email, password, prefix, first_name, last_name,
            national_id, gender, birth_date: new Date(birth_date), age,
            education_level_url, phone_number, line_id, profile_image,
            skills: skillsString, role: 'user', verification_token: verificationToken
        });

        await sendVerificationEmail(user, verificationToken);

        // เก็บ log การลงทะเบียนสำเร็จ
        await createLog(
            user.id,
            null,
            '/api/users/register',
            'POST',
            `ผู้ใช้ ${first_name} ${last_name} (${email}) ลงทะเบียนสำเร็จ`,
            req.ip,
            req.headers['user-agent'],
            'Register'
        );
        res.status(201).json({ message: 'ลงทะเบียนผู้ใช้สำเร็จ', user });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error);
        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' });
    }
};

// ฟังก์ชันยืนยันอีเมล
export const verifyEmail = async (req, res) => {
    const { token } = req.query; // รับ token จาก query string
    try {
        // ตรวจสอบความถูกต้องของ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.getUserByEmail(decoded.email)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verification_token !== token) {
            return res.status(400).json({ message: 'โทเค็นไม่ตรงกัน' });
        }

        if (user.email_verified) {
            return res.status(400).json({ message: 'อีเมลได้รับการยืนยันแล้ว' });
        }

        await userModel.verifyUserEmail(decoded.email);

        res.status(200).json({ message: 'ยืนยันอีเมลสำเร็จ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการยืนยัน:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'โทเค็นหมดอายุ กรุณาขอโทเค็นใหม่' });
        }
        res.status(400).json({ message: 'โทเค็นไม่ถูกต้องหรือหมดอายุ' });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        const isMatch = await userModel.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );


        const userDetails = `ผู้ใช้ ${user.email} (ชื่อ: ${user.first_name} ${user.last_name}, โทร: ${user.phone_number}) เข้าสู่ระบบสำเร็จ`;
        await createLog(user.id, null, 'Login', '/api/users/login', 'POST', userDetails, req.ip, req.headers['user-agent']);

        res.status(200).json({ token, message: 'เข้าสู่ระบบสำเร็จ' });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' });
    }
};


// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม ID หรือ Email หรือทั้งหมด
export const getUser = async (req, res) => {
    try {
        const { id, email, fields } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let user;
        if (id) {
            user = await userModel.getUserById(parseInt(id), fields);
        } else if (email) {
            user = await userModel.getUserByEmail(email, fields);
        } else {
            user = await userModel.getAllUsers(limit, offset, fields);
        }

        if (!user || (Array.isArray(user) && user.length === 0)) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        if (!id && !email) {
            const totalUsers = await userModel.getTotalUsersCount();
            const totalPages = Math.ceil(totalUsers / limit);
            res.status(200).json({
                users: user,
                currentPage: page,
                totalPages,
                totalUsers
            });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
        if (error.name === 'DatabaseError') {
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
        }
        res.status(400).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง" });
    }
};


export const getUserHistory = async (req, res) => {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    try {
        const offset = (page - 1) * limit;
        const jobHistory = await userModel.getUserJobHistory(userId, parseInt(limit), offset);

        if (!jobHistory || jobHistory.length === 0) {
            return res.status(404).json({ message: 'ไม่พบประวัติการทำงานของผู้ใช้นี้' });
        }

        const totalJobs = await userModel.getTotalJobHistoryCount(userId);
        const totalPages = Math.ceil(totalJobs / limit);

        res.status(200).json({
            jobHistory,
            currentPage: parseInt(page),
            totalPages,
            totalJobs
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงประวัติการทำงาน:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงประวัติการทำงาน กรุณาลองใหม่อีกครั้ง' });
    }
};

// ดึงการแจ้งเตือนของผู้ใช้
export const getUserNotifications = async (req, res) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'ไม่พบรหัสผู้ใช้' });
        }

        const notifications = await notificationModel.getUserNotifications(req.user.id);

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน:', error);
        res.status(500).json({ message: 'ไม่สามารถโหลดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง' });
    }
};



export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const fields = req.query.fields; // ถ้าต้องการให้ผู้ใช้สามารถเลือกฟิลด์ที่ต้องการได้

        const user = await userModel.getUserById(userId, fields);

        if (!user) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง" });
    }
};