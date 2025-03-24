import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js'
import * as jobParticipationModel from '../models/jobParticipationModel.js'
import { calculateAge } from '../utils/calculateAge.js';
import { createLog } from '../models/logModel.js';
import * as  notificationController from '../controllers/notificationController.js'
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as adminModel from '../models/adminModel.js'
import * as fileUploadUtils from '../utils/fileUpload.js'
const prisma = new PrismaClient(); // สร้าง PrismaClient

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ผู้ใช้ลงทะเบียน
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

        const existingUser = await userModel.checkExistingUser(email, national_id);
        if (existingUser) {
            return res.status(400).json({ message: "อีเมลหรือเลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว" });
        }

        const age = calculateAge(birth_date);
        const skillsString = Array.isArray(skills) ? skills.join(',') : skills;

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
            education_certificate: educationCertificatePath || undefined,
            phone_number,
            line_id,
            profile_image: profileImagePath || undefined,
            user_documents: userDocumentsPaths.length ? JSON.stringify(userDocumentsPaths) : undefined,
            skills: skillsString,
            role: 'user',
        });

        await notificationController.createNewUserRegistrationNotification(user.id);
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


// login ผู้ใช้
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
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
            { expiresIn: '24h' }
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

// แก้ไขข้อมูลส่วนตัว
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            first_name, last_name,
            phone_number, line_id
        } = req.body;

        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        const existingUser = await userModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        // จัดการการอัปโหลดไฟล์ (หากมีไฟล์ใหม่)
        const newProfileImagePath = req.files?.profile_image ? req.files.profile_image[0].filename : null;
        const newEducationCertificatePath = req.files?.education_certificate ? req.files.education_certificate[0].filename : null;
        const newUserDocumentsPaths = req.files?.user_documents ? req.files.user_documents.map(file => file.filename) : [];

        // ลบไฟล์เก่าถ้ามีการอัปโหลดไฟล์ใหม่
        if (newProfileImagePath && existingUser.profile_image) {
            try {
                const oldImagePath = path.join(req.files.profile_image[0].destination, existingUser.profile_image);
                console.log('Full path of old image:', oldImagePath);
                await fileUploadUtils.deleteFile(oldImagePath);
            } catch (deleteError) {
                console.error('Error deleting old profile image:', deleteError);
            }
        }

        if (newEducationCertificatePath && existingUser.education_certificate) {
            try {
                const oldCertPath = path.join(req.files.education_certificate[0].destination, existingUser.education_certificate);
                await fileUploadUtils.deleteFile(oldCertPath);
            } catch (error) {
                console.error('Error deleting old certificate:', error);
            }
        }

        // ลบไฟล์เอกสารเก่า ถ้ามีการอัปโหลดเอกสารใหม่
        if (newUserDocumentsPaths.length && existingUser.user_documents) {
            try {
                const oldUserDocumentsPaths = JSON.parse(existingUser.user_documents);
                for (const oldDoc of oldUserDocumentsPaths) {
                    const oldDocPath = path.join(req.files.user_documents[0].destination, oldDoc);
                    await fileUploadUtils.deleteFile(oldDocPath);
                }
            } catch (error) {
                console.error('Error deleting old documents:', error);
            }
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

// ดึงประวัติการทำงานของ user
export const getUserHistory = async (req, res) => {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    try {
        const offset = (page - 1) * limit;
        const jobHistory = await userModel.getUserJobHistory(userId, parseInt(limit), offset);
        const totalJobs = await userModel.getTotalJobHistoryCount(userId);
        const totalPages = Math.ceil(totalJobs / limit);

        res.status(200).json({
            jobHistory: jobHistory || [],
            currentPage: parseInt(page),
            totalPages,
            totalJobs
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงประวัติการทำงาน:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงประวัติการทำงาน กรุณาลองใหม่อีกครั้ง' });
    }
};

// ดึงข้อมูลการประเมินของผู้ใช้งาน
export const getJobEvaluation = async (req, res) => {
    try {
        const { jobId, userId } = req.params;

        // ตรวจสอบว่า jobId และ userId ถูกส่งมาหรือไม่
        if (!jobId || !userId) {
            return res.status(400).json({
                status: 'INVALID_REQUEST',
                message: 'กรุณาระบุ jobId และ userId ให้ครบถ้วน'
            });
        }

        // หา participation
        const participation = await jobParticipationModel.findParticipationByUserAndJob(userId, jobId);

        if (!participation) {
            return res.status(404).json({
                status: 'NO_PARTICIPATION',
                message: 'ไม่พบประวัติการเข้าร่วมงานนี้'
            });
        }

        // ตรวจสอบว่ามีผลการประเมินใน workHistories หรือไม่
        if (!participation.workHistories || participation.workHistories.length === 0) {
            return res.status(404).json({
                status: 'NO_EVALUATION',
                message: 'ยังไม่มีผลการประเมินสำหรับงานนี้'
            });
        }

        // ดึงข้อมูลการประเมินจาก workHistories
        const evaluation = participation.workHistories[0];

        res.json({
            scores: {
                appearance: evaluation.appearance_score || 0,
                quality: evaluation.quality_score || 0,
                quantity: evaluation.quantity_score || 0,
                manner: evaluation.manner_score || 0,
                punctuality: evaluation.punctuality_score || 0,
                total: evaluation.total_score || 0
            },
            comment: evaluation.comment || 'ไม่มีความคิดเห็น',
            isPassed: evaluation.is_passed_evaluation || false,
            jobTitle: participation.jobPosition?.job?.title || 'ไม่ระบุชื่องาน'
        });
    } catch (error) {
        console.error('Error in getJobEvaluation:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'ไม่สามารถดึงข้อมูลการประเมินได้'
        });
    }
};

// ดึงการแจ้งเตือนของ user
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

// อ่าน 1 การแจ้งเตือน
export const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        await notificationModel.markUserNotificationAsRead(notificationId, userId);
        res.status(200).json({ message: 'อัพเดทสถานะการอ่านเรียบร้อย' });
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะการอ่าน' });
    }
};

// อ่านการแจ้งเตือนทั้งหมด
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await notificationModel.markAllUserNotificationsAsRead(userId);
        res.status(200).json({ message: 'อัพเดทสถานะการอ่านทั้งหมดเรียบร้อย' });
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะการอ่าน' });
    }
};

// ดึง profile ของ user
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const fields = req.query.fields;

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

