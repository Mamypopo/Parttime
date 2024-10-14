import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';  // เพิ่มการใช้งาน bcrypt สำหรับ hash password
import jwt from 'jsonwebtoken';  // เพิ่มการใช้งาน JWT
import { getUserById, getUserByEmail, getAllUsers, checkExistingUser } from '../models/userModel.js';
import { calculateAge } from '../utils/calculateAge.js';
import { sendVerificationEmail } from '../utils/email.js';

const prisma = new PrismaClient();

import { createUser } from '../models/userModel.js';



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
        console.log(req.body);
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }
        const existingUser = await checkExistingUser(email, national_id);

        if (existingUser) {
            return res.status(400).json({ message: "Email or National ID already exists in the system" });
        }
        // คำนวณอายุจากวันเกิด
        const age = calculateAge(birth_date);
        
        const skillsArray = skills.split(',').map(skill => skill.trim());  // แปลงเป็น array และตัดช่องว่างออก


        
        const hashedPassword = await bcrypt.hash(password, 10);
        // สร้าง verification token สำหรับส่ง email ยืนยันตัวตน
        const verificationToken = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // token หมดอายุใน 1 ชั่วโมง
        );

        const user = await createUser({
            email,
            password: hashedPassword,
            prefix,
            first_name,
            last_name,
            national_id,
            gender,
            birth_date: new Date(birth_date),  // ตรวจสอบฟิลด์ birth_date ว่าเป็น Date object
            age,  // ส่งอายุที่คำนวณได้ไปที่ Prisma
            education_level_url,
            phone_number,
            line_id,
            profile_image,
            skills: skillsArray.join(','),  // แปลง array ของทักษะเป็น String ที่คั่นด้วยจุลภาค
            verification_token: verificationToken
        });
        await sendVerificationEmail(user, verificationToken);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query; // รับ token จาก query string

    try {
        // ตรวจสอบความถูกต้องของ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ค้นหาผู้ใช้ตามอีเมลที่ถอดรหัสได้จาก token
        const user = await prisma.user.findUnique({
            where: { email: decoded.email }
        });

        // ถ้าไม่พบผู้ใช้
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // ตรวจสอบว่าผู้ใช้ยืนยันอีเมลแล้วหรือไม่
        if (user.email_verified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }

        // อัปเดตสถานะการยืนยันอีเมล
        await prisma.user.update({
            where: { email: decoded.email },
            data: { email_verified: true, verification_token: null }
        });

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ค้นหาผู้ใช้ตามอีเมล
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET, // ใช้ environment variable สำหรับ key
            { expiresIn: '1h' } // Token หมดอายุใน 1 ชั่วโมง
        );

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
            user = await getUserById(id);
        } else if (email) {
            // ดึงข้อมูลตาม Email
            user = await getUserByEmail(email);
        } else {
            // หากไม่มี id หรือ email ให้ดึงผู้ใช้ทั้งหมด
            user = await getAllUsers();
        }

        if (!user || (Array.isArray(user) && user.length === 0)) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
