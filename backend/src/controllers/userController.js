import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';  // เพิ่มการใช้งาน bcrypt สำหรับ hash password
import jwt from 'jsonwebtoken';  // เพิ่มการใช้งาน JWT
import * as userModel from '../models/userModel.js';
import { calculateAge } from '../utils/calculateAge.js';
import { sendVerificationEmail } from '../utils/email.js';
import { createLog } from '../models/logModel.js';
import * as notificationModel from '../models/notificationModel.js'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as adminModel from '../models/adminModel.js'
import * as fileUploadUtils from '../utils/fileUpload.js'
const prisma = new PrismaClient(); // สร้าง PrismaClient

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res) => {
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
        const {
            email, password, prefix, first_name, last_name, national_id,
            gender, birth_date, phone_number,
            line_id, skills
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

        const uploadBasePath = path.join(__dirname, '../../uploads');
        // อัปโหลดไฟล์ก่อนการสร้างผู้ใช้
        const profileImagePath = req.files?.profile_image ? req.files.profile_image[0].filename : null;
        const educationCertificatePath = req.files?.education_certificate ? req.files.education_certificate[0].filename : null;
        const userDocumentsPaths = req.files?.user_documents
            ? req.files.user_documents.map(file => file.filename)
            : [];

        const fullProfileImagePath = profileImagePath ? path.join(uploadBasePath, 'profiles', profileImagePath) : null;
        const fullEducationCertificatePath = educationCertificatePath ? path.join(uploadBasePath, 'certificates', educationCertificatePath) : null;
        const fullUserDocumentsPaths = userDocumentsPaths.map(doc => path.join(uploadBasePath, 'documents', doc));

        const user = await userModel.createUser({
            email,
            password,
            prefix,
            first_name,
            last_name,
            national_id,
            gender,
            birth_date: new Date(birth_date),
            age,
            education_certificate: educationCertificatePath || undefined,  // เช็คก่อนบันทึก
            phone_number,
            line_id,
            profile_image: profileImagePath || undefined,  // เช็คก่อนบันทึก
            user_documents: userDocumentsPaths.length ? JSON.stringify(userDocumentsPaths) : undefined,  // เช็คก่อนบันทึก
            skills: skillsString,
            role: 'user',
            verification_token: verificationToken
        });


        await sendVerificationEmail(user, verificationToken);

        // เก็บ log การลงทะเบียนสำเร็จ
        await createLog(
            user.id,
            null,
            'Register successfully',
            '/api/users/register',
            'POST',
            `User { Name: ${first_name} ${last_name} Email: ${email} } registered success`,
            userIp,
            userAgent
        );
        res.status(201).json({
            message: 'ลงทะเบียนผู้ใช้สำเร็จ',
            user, profile_image_url: fullProfileImagePath,
            education_certificate_url: fullEducationCertificatePath,
            user_documents_url: fullUserDocumentsPaths,
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error);
        await createLog(
            null,
            null,
            'User Registration Failed',
            '/api/users/register',
            'POST',
            `Registration attempt failed. Error: ${error.message}`,
            userIp,
            userAgent
        );
        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' });
    }
};

// ฟังก์ชันยืนยันอีเมล
export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    const ip = req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

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
        await createLog(
            user.id,
            null,
            'Email Verification successfully',
            '/api/users/verify-email',
            'GET',
            `Email verified successfully for User ID ${user.id}`,
            req.ip,
            userAgent
        );

        res.status(200).json({ message: 'ยืนยันอีเมลสำเร็จ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการยืนยัน:", error);

        let responseMessage = 'โทเค็นไม่ถูกต้องหรือหมดอายุ';
        let statusCode = 400;

        if (error.name === 'TokenExpiredError') {
            responseMessage = 'โทเค็นหมดอายุ กรุณาขอโทเค็นใหม่';
            statusCode = 401;
        }

        try {
            await createLog(
                null,
                null,
                'Email Verification Failed',
                '/api/users/verify-email',
                'GET',
                `Email verification failed: ${error.message}`,
                req.ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการยืนยันอีเมลที่ล้มเหลวได้:', logError);
        }

        res.status(statusCode).json({ message: responseMessage });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'ไม่มีผู้ใช้ในระบบ' });
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


        const userDetails = `User { Name: ${user.first_name} ${user.last_name} Email: ${user.email} Phone: ${user.phone_number} }  logged in successfully`;
        await createLog(user.id, null, 'Login successfully', '/api/users/login', 'POST', userDetails, req.ip, req.headers['user-agent']);

        res.status(200).json({ token, message: 'เข้าสู่ระบบสำเร็จ' });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);

        try {
            await createLog(
                null,
                null,
                'User Login Failed',
                '/api/users/login',
                'POST',
                `Login attempt failed. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการเข้าสู่ระบบที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // สมมติว่าเรามี middleware ที่เก็บข้อมูลผู้ใช้ใน req.user
        const {
            first_name, last_name,
            phone_number, line_id
        } = req.body;

        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        const existingUser = await userModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        const uploadBasePath = path.join(__dirname, '../../uploads');
        // จัดการการอัปโหลดไฟล์ (หากมีไฟล์ใหม่)
        const newProfileImagePath = req.files?.profile_image ? req.files.profile_image[0].filename : null;
        const newEducationCertificatePath = req.files?.education_certificate ? req.files.education_certificate[0].filename : null;
        const newUserDocumentsPaths = req.files?.user_documents ? req.files.user_documents.map(file => file.filename) : [];

        // ลบไฟล์เก่าถ้ามีการอัปโหลดไฟล์ใหม่
        if (newProfileImagePath && existingUser.profile_image) {
            const oldProfileImagePath = path.join(uploadBasePath, 'profiles', existingUser.profile_image);
            fileUploadUtils.deleteFile(oldProfileImagePath); // ลบไฟล์รูปโปรไฟล์เก่า
        }

        if (newEducationCertificatePath && existingUser.education_certificate) {
            const oldEducationCertificatePath = path.join(uploadBasePath, 'certificates', existingUser.education_certificate);
            fileUploadUtils.deleteFile(oldEducationCertificatePath); // ลบไฟล์วุฒิการศึกษาเก่า
        }

        // ลบไฟล์เอกสารเก่า ถ้ามีการอัปโหลดเอกสารใหม่
        if (newUserDocumentsPaths.length && existingUser.user_documents) {
            const oldUserDocumentsPaths = JSON.parse(existingUser.user_documents); // Assume it's stored as JSON array
            oldUserDocumentsPaths.forEach((docPath) => {
                const fullOldDocumentPath = path.join(uploadBasePath, 'documents', docPath);
                fileUploadUtils.deleteFile(fullOldDocumentPath); // ลบไฟล์เอกสารเก่า
            });
        }




        const updatedUser = await userModel.updateUser(userId, {

            first_name: first_name || existingUser.first_name,
            last_name: last_name || existingUser.last_name,
            education_certificate: newEducationCertificatePath || existingUser.education_certificate,
            phone_number: phone_number || existingUser.phone_number,
            line_id: line_id || existingUser.line_id,
            profile_image: newProfileImagePath || existingUser.profile_image,
            user_documents: newUserDocumentsPaths.length ? JSON.stringify(newUserDocumentsPaths) : existingUser.user_documents,

        });

        // เก็บ log การอัปเดตโปรไฟล์สำเร็จ
        await createLog(
            userId,
            null,
            'Update Profile successfully',
            '/api/users/update-profile',
            'PUT',
            `User { Name: ${updatedUser.first_name} ${updatedUser.last_name} Email: ${updatedUser.email} } updated profile`,
            req.ip,
            req.headers['user-agent'],
        );

        res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ', user: updatedUser });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:', error);

        try {
            await createLog(
                req.user.id,
                null,
                'User Profile Update Failed',
                '/api/users/update-profile',
                'PUT',
                `Profile update attempt failed. Error: ${error.message}`,
                req.ip,
                req.headers['user-agent']
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการอัปเดตโปรไฟล์ที่ล้มเหลวได้:', logError);
        }

        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง' });
    }
};

// สำหรับเพิ่มทักษะ
export const addUserSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skills } = req.body;  // รับเป็น array ของทักษะใหม่

        // ตรวจสอบว่า skills เป็น array และไม่ว่างเปล่า
        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                message: 'กรุณาระบุทักษะที่ต้องการเพิ่ม'
            });
        }
        const user = await userModel.getUserById(userId);

        // ตรวจสอบการขอในรอบสัปดาห์
        const recentRequest = await adminModel.checkWeeklySkillRequest(userId);
        if (recentRequest) {
            const nextAvailableDate = new Date(recentRequest.created_at); // แก้เป็น created_at
            nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);

            return res.status(400).json({
                message: 'คุณสามารถขอเพิ่มสกิลได้สัปดาห์ละ 1 ครั้งเท่านั้น',
                nextAvailableDate: nextAvailableDate.toISOString(),
                currentRequest: {
                    skill: recentRequest.skill,
                    status: recentRequest.status,
                    requestedAt: recentRequest.created_at.toISOString() // แก้เป็น created_at
                }
            });
        }
        const existingUser = await userModel.getUserById(userId);
        const existingSkills = existingUser.skills ? existingUser.skills.split(',') : [];


        // กรองเฉพาะทักษะที่ยังไม่มี
        const newSkills = skills.filter(skill =>
            !existingSkills.includes(skill.trim())
        );
        if (newSkills.length === 0) {
            return res.status(400).json({
                message: 'ทักษะที่ระบุมีอยู่ในระบบแล้วทั้งหมด'
            });
        }

        // สร้าง pending skills
        const pendingSkillPromises = newSkills.map(skill =>
            userModel.createPendingSkill(userId, skill.trim())
        );

        const createdPendingSkills = await Promise.all(pendingSkillPromises);


        for (const skill of newSkills) {
            await createLog(
                userId,
                null,
                'Request new skill',
                '/api/users/skills',
                'POST',
                `User { Name: ${user.first_name} ${user.last_name}  Email: ${user.email} } requested to add new skill: ${skill}`,
                req.ip,
                req.headers['user-agent']
            );
        }


        res.status(200).json({
            message: 'ส่งคำขอเพิ่มทักษะสำเร็จ กรุณารอการอนุมัติ',
            pendingSkills: createdPendingSkills
        });
    } catch (error) {
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการเพิ่มทักษะ'
        });
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



// แสดงผลหรือดาวน์โหลดไฟล์
export const getProfileImage = (req, res) => {
    try {
        const { filename } = req.params;

        // สร้างเส้นทางเต็มของไฟล์ที่เก็บอยู่บนเซิร์ฟเวอร์
        const filePath = path.join(__dirname, '../../uploads/profiles', filename);

        // ตรวจสอบว่าไฟล์มีอยู่จริง
        if (fs.existsSync(filePath)) {
            // ส่งไฟล์กลับไปยังผู้ใช้เพื่อดาวน์โหลดหรือแสดงผล
            res.sendFile(filePath);
        } else {
            res.status(404).json({ message: 'ไม่พบไฟล์ที่ร้องขอ' });
        }
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าถึงไฟล์' });
    }
};


export const getUserJobStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // ตรวจสอบว่ามีผู้ใช้อยู่จริง
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        // ดึงสถิติทั้งหมด
        const jobStats = await userModel.getUserJobStatistics(userId);

        // ดึงสถิติรายเดือนของปีปัจจุบัน
        const currentYear = new Date().getFullYear();
        const monthlyStats = await userModel.getMonthlyJobStats(userId, currentYear);

        // รวมข้อมูลทั้งหมด
        const response = {
            overall_stats: jobStats,
            monthly_stats: monthlyStats,
            user_info: {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงสถิติงาน:', error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงสถิติงาน กรุณาลองใหม่อีกครั้ง",
            error: error.message
        });
    }
};

// เพิ่มฟังก์ชันสำหรับดึงสถิติรายเดือน
export const getMonthlyStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        const monthlyStats = await userModel.getMonthlyJobStats(userId, year);

        res.status(200).json({
            year,
            monthly_stats: monthlyStats
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงสถิติรายเดือน:', error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงสถิติรายเดือน กรุณาลองใหม่อีกครั้ง",
            error: error.message
        });
    }
};