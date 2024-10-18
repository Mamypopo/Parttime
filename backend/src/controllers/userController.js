import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';  // เพิ่มการใช้งาน bcrypt สำหรับ hash password
import jwt from 'jsonwebtoken';  // เพิ่มการใช้งาน JWT
import * as userModel from '../models/userModel.js';
import { calculateAge } from '../utils/calculateAge.js';
import { sendVerificationEmail } from '../utils/email.js';
import { createLog } from '../models/logModel.js';
import * as adminModel from '../models/adminModel.js'
const prisma = new PrismaClient(); // สร้าง PrismaClient

export const registerUser = async (req, res) => {
    try {
        const {
            email,
            password,
            prefix,
            first_name,
            last_name,
            national_id,
            gender,
            birth_date,
            education_level_url,
            phone_number,
            line_id,
            profile_image,
            skills
        } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // ตรวจสอบว่าผู้ใช้มีในระบบแล้วหรือไม่
        const existingUser = await userModel.checkExistingUser(email, national_id);
        if (existingUser) {
            return res.status(400).json({ message: "Email or National ID already exists in the system" });
        }

        // คำนวณอายุจากวันเกิด
        const age = calculateAge(birth_date);

        // จัดการกับ skills array
        const skillsString = Array.isArray(skills) ? skills.join(',') : skills;

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้าง verification token สำหรับส่ง email ยืนยันตัวตน
        const verificationToken = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const user = await userModel.createUser({
            email,
            password: hashedPassword,
            prefix,
            first_name,
            last_name,
            national_id,
            gender,
            birth_date: new Date(birth_date),
            age,
            education_level_url,
            phone_number,
            line_id,
            profile_image,
            skills: skillsString,
            role: 'user',
            verification_token: verificationToken
        });

        // ส่ง email ยืนยันตัวตน
        await sendVerificationEmail(user, verificationToken);
        const userId = user.id;



        // เก็บ log การลงทะเบียนสำเร็จ
        await createLog(user.id, null, 'Register', '/api/users/register', 'POST', `User ${first_name} ${last_name} ${email} registered successfully`, req.ip, req.headers['user-agent']);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        // ตรวจสอบว่าโทเค็นตรงกันหรือไม่
        if (user.verification_token !== token) {
            return res.status(400).json({ message: 'Token mismatch.' });
        }

        // ตรวจสอบว่าผู้ใช้ยืนยันอีเมลแล้วหรือไม่
        if (user.email_verified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }

        // อัปเดตสถานะการยืนยันอีเมล และลบ verification token
        await userModel.verifyUserEmail(decoded.email);

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error("Error during verification:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please request a new one.' });
        }
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ค้นหาผู้ใช้ตามอีเมล
        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // ตรวจสอบรหัสผ่าน
        const isMatch = await userModel.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET, // ใช้ environment variable สำหรับ key
            { expiresIn: '1h' } // Token หมดอายุใน 1 ชั่วโมง
        );

        // เก็บรายละเอียดเพิ่มเติมของ user เช่น ชื่อ, นามสกุล, เบอร์โทรศัพท์
        const userDetails = `User ${user.email} (Name: ${user.first_name} ${user.last_name}, Phone: ${user.phone_number}) logged in successfully`;
        await createLog(user.id, null, 'Login', '/api/users/login', 'POST', userDetails, req.ip, req.headers['user-agent']);
        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม ID หรือ Email หรือทั้งหมด
export const getUser = async (req, res) => {
    try {
        const { id, email } = req.query;  // รับ id หรือ email จาก query parameters

        let user;
        if (id) {
            // ดึงข้อมูลตาม ID
            user = await userModel.getUserById(id);
        } else if (email) {
            // ดึงข้อมูลตาม Email
            user = await userModel.getUserByEmail(email);
        } else {
            // หากไม่มี id หรือ email ให้ดึงผู้ใช้ทั้งหมด
            user = await userModel.getAllUsers();
        }

        if (!user || (Array.isArray(user) && user.length === 0)) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getUserHistory = async (req, res) => {
    const { userId } = req.params; // รับ userId จาก request parameters

    try {
        const jobHistory = await userModel.getUserJobHistory(userId);

        if (!jobHistory || jobHistory.length === 0) {
            return res.status(404).json({ message: 'No job history found for this user' });
        }

        res.status(200).json(jobHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ดึงการแจ้งเตือนของผู้ใช้
export const getUserNotifications = async (req, res) => {
    try {
        console.log('req.user:', req.user); // เพิ่ม log เพื่อตรวจสอบ

        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'User ID is missing.' });
        }

        const userId = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
                adminId: null
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error loading user notifications:', error);
        res.status(500).json({ message: 'Failed to load notifications.', error: error.message });
    }
};