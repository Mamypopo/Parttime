import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { deleteFile } from '../utils/fileUpload.js';
import { createLog } from '../models/logModel.js';
import { validateEmail, validateNationalId } from '../utils/validation.js';
import { hashPassword } from '../utils/auth.js';
import { calculateAge } from '../utils/calculateAge.js';
import { fileURLToPath } from 'url';

import path from 'path';

// register admin
export const registerAdmin = async (req, res) => {
    const { ip, headers: { 'user-agent': userAgent } } = req;
    let uploadedFile = null;
    try {
        uploadedFile = req.file;
        const { email, password, first_name, last_name, admin_secret, phone } = req.body;

        if (!email || !password || !first_name || !last_name || !admin_secret || !phone) {
            if (uploadedFile) {
                const filePath = path.join(uploadedFile.destination, uploadedFile.filename);
                await deleteFile(filePath);
            }
            return res.status(400).json({
                message: "กรุณากรอกข้อมูลให้ครบถ้วน"
            });
        }

        if (admin_secret !== process.env.ADMIN_SECRET) {
            if (uploadedFile) {
                const filePath = path.join(uploadedFile.destination, uploadedFile.filename);
                await deleteFile(filePath);
            }
            return res.status(403).json({ message: "รหัสลับของผู้ดูแลระบบไม่ถูกต้อง" });
        }

        const existingAdmin = await adminModel.checkExistingAdmin(email);
        if (existingAdmin) {
            if (uploadedFile) {
                const filePath = path.join(uploadedFile.destination, uploadedFile.filename);
                await deleteFile(filePath);
            }
            return res.status(400).json({ message: "อีเมลนี้มีอยู่ในระบบแล้ว" });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            if (uploadedFile) {
                const filePath = path.join(uploadedFile.destination, uploadedFile.filename);
                await deleteFile(filePath);
            }
            return res.status(400).json({ message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" });
        }

        const newAdmin = await adminModel.createAdmin({
            email,
            password,
            first_name,
            last_name,
            phone,
            profile_pic: uploadedFile ? uploadedFile.filename : null
        });


        await createLog(
            null,
            newAdmin.id,
            'Admin Registration successfully',
            req.originalUrl,
            req.method,
            `Admin { Name: ${newAdmin.first_name} ${newAdmin.last_name}  Email: ${newAdmin.email}  } registered successfully`,
            ip,
            userAgent
        );

        res.status(201).json({
            message: 'ลงทะเบียนแอดมินสำเร็จ',
            admin: {
                id: newAdmin.id,
                email: newAdmin.email,
                first_name: newAdmin.first_name,
                last_name: newAdmin.last_name,
                phone: newAdmin.phone,
                profile_pic: uploadedFile.filename
            }
        });
    } catch (error) {
        if (uploadedFile) {
            const filePath = path.join(uploadedFile.destination, uploadedFile.filename);
            await deleteFile(filePath);
        }

        try {
            await createLog(
                null,
                null,
                'Admin Registration Failed',
                req.originalUrl,
                req.method,
                `Failed to register new admin. Reason: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการลงทะเบียนแอดมินที่สำเร็จได้:', logError);
        }
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียนแอดมิน' });
    }
};

// login admin
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    const { ip, headers: { 'user-agent': userAgent } } = req;
    let admin;
    try {

        const admin = await adminModel.findAdminByEmail(email);
        if (!admin) {
            return res.status(404).json({ message: "ไม่พบแอดมิน" });
        }

        const isMatch = await adminModel.verifyPassword(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // สร้าง JWT token
        const token = jwt.sign(
            { userId: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );


        await createLog(
            null,
            admin.id,
            'Admin login successfully',
            req.originalUrl,
            req.method,
            `Admin { Name: ${admin.first_name} ${admin.last_name} Email: ${admin.email} } logged in successfully`,
            ip,
            userAgent
        );

        res.status(200).json({
            message: "แอดมินล็อคอินสำเร็จ",
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        try {
            await createLog(
                null,
                admin?.id || null,
                'Admin Login Failed',
                req.originalUrl,
                req.method,
                `Admin login attempt failed. Admin ID: ${admin?.id || 'Unknown'}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('Failed to create log for admin login failure:', logError);
        }
        res.status(500).json({ message: error.message });
    }
};

// get profile admin 
export const getAdminProfile = async (req, res) => {
    try {
        const { id } = req.user

        if (!id) {
            return res.status(400).json({
                message: 'Admin ID not found in token'
            })
        }

        const admin = await adminModel.findAdminById(id)

        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found'
            })
        }

        res.json(admin)

    } catch (error) {
        console.error('Error in getAdminProfile:', error)
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}


// getadmin ตาม id
export const getAdminById = async (req, res) => {
    const { adminId } = req.params;
    try {
        const id = parseInt(adminId);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'รหัสแอดมินไม่ถูกต้อง' });
        }

        const admin = await adminModel.findAdminById(id);
        if (!admin) {
            return res.status(404).json({ message: "ไม่พบแอดมิน" });
        }
        res.status(200).json(admin);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน' });
    }
};



// ดึงผู้ใช้ที่รอการอนุมัติ เข้าใช้งาน
export const getPendingUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // รับค่าการค้นหาจาก query parameters
        const searchParams = {
            userId: req.query.userId,
            idCard: req.query.idCard,
            name: req.query.name
        }

        // ส่ง searchParams ไปยัง Model
        const [users, counts] = await Promise.all([
            adminModel.findPendingUsers(limit, offset, searchParams),
            adminModel.countUsersPending(searchParams)
        ]);

        const totalPages = Math.ceil(counts.total / limit);

        res.json({
            users,
            pagination: {
                total: counts.total,
                page,
                limit
            },

        })
    } catch (error) {
        console.error('Controller Error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงผู้ใช้ที่อนุมัติแล้ว
export const getApprovedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // รับค่าการค้นหาจาก query parameters
        const searchParams = {
            userId: req.query.userId,
            idCard: req.query.idCard,
            name: req.query.name
        }

        // ส่ง searchParams ไปยัง Model
        const users = await adminModel.findApprovedUsers(limit, offset, searchParams)
        const total = await adminModel.countUsersApproved(searchParams)

        res.json({
            users,
            pagination: {
                total,
                page,
                limit
            }
        })
    } catch (error) {
        console.error('Controller Error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงผู้ใช้ที่ถูกปฏิเสธ
export const getRejectedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // รับค่าการค้นหาจาก query parameters
        const searchParams = {
            userId: req.query.userId,
            idCard: req.query.idCard,
            name: req.query.name
        }

        // ส่ง searchParams ไปยัง Model
        const users = await adminModel.findRejectedUsers(limit, offset, searchParams)
        const total = await adminModel.countUsersRejected(searchParams)

        res.json({
            users,
            pagination: {
                total,
                page,
                limit
            }
        })
    } catch (error) {
        console.error('Controller Error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};



// อนุมัติผู้ใช้งานในระบบ
export const approveUser = async (req, res) => {
    const { status } = req.body;
    const { userId } = req.params;
    const userIdAsInt = parseInt(userId);
    const adminId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {

        // ตรวจสอบว่าผู้ใช้
        const user = await userModel.getUserById(userIdAsInt);

        if (!user) {
            return res.status(400).json({ message: "ไม่พบผู้ใช้ กรุณาตรวจสอบและลองอีกครั้ง" });
        }

        if (user.approved === "approved") {
            return res.status(400).json({ message: 'ผู้ใช้นี้ได้รับการอนุมัติไปแล้ว' });
        }
        if (user.approved === "rejected" && status === "rejected") {
            return res.status(400).json({ message: 'ผู้ใช้นี้ถูกปฏิเสธไปแล้ว' });
        }
        // ตรวจสอบสถานะที่ส่งมาให้เป็น approved หรือ rejected
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "สถานะไม่ถูกต้อง กรุณาระบุ 'approved' หรือ 'rejected'"
            });
        }

        const updatedUser = await adminModel.updateUserApprovalStatus(userIdAsInt, status);
        if (!updatedUser) {
            throw new Error('ไม่สามารถอัปเดตสถานะผู้ใช้ได้');
        }


        const notificationMessage = status === 'approved'
            ? 'ยินดีด้วย! บัญชีของคุณได้รับการอนุมัติแล้ว คุณสามารถเข้าใช้งานระบบได้ทันที โปรดเข้าสู่ระบบเพื่อเริ่มใช้งาน'
            : 'ขออภัย บัญชีของคุณไม่ได้รับการอนุมัติในขณะนี้ โปรดติดต่อฝ่ายสนับสนุนเพื่อขอข้อมูลเพิ่มเติมหรือยื่นคำร้องใหม่';

        await notificationModel.createUserNotification(userIdAsInt, notificationMessage, adminId, notificationModel.NOTIFICATION_TYPES.SYSTEM);

        const admin = await adminModel.findAdminById(adminId);
        if (!admin) {
            throw new Error('ไม่พบข้อมูลผู้ดูแลระบบ');
        }

        const adminName = `${admin.first_name} ${admin.last_name}`;
        const logMessage = `User { Name: ${user.first_name} ${user.last_name} } Status: ${status} by Admin { Name: ${adminName} }`;
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

        res.status(200).json({
            message: `อัปเดตสถานะผู้ใช้เป็น ${status} สำเร็จ`,
            user: {
                id: updatedUser.id,
                status: updatedUser.approved,
            }
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอนุมัติ/ปฏิเสธผู้ใช้:', error);
        await createLog(
            userIdAsInt,
            adminId,
            `User ${status} Failed`,
            req.originalUrl,
            req.method,
            `Failed to ${status} user. User ID: ${userIdAsInt}. Error: ${error.message}`,
            ip,
            userAgent
        );
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ', error: error.message });
    }
};


// ดึงการแจ้งเตือนของแอดมิน
export const getAdminNotifications = async (req, res) => {

    try {
        if (!req.user?.id) {
            return res.status(400).json({ message: 'ไม่พบรหัสแอดมิน' });
        }
        const adminId = parseInt(req.user.id, 10);

        const admin = await adminModel.findAdminById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลแอดมิน' });
        }

        const notifications = await notificationModel.getAdminNotifications(adminId);


        res.status(200).json({
            notifications: notifications || [],
            message: notifications?.length ? undefined : 'ไม่พบการแจ้งเตือน'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงการแจ้งเตือนของแอดมิน:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน' });
    }
};


// อ่าน 1 การแจ้งเตือนของแอดมิน
export const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id, 10);
        const adminId = req.user.id;

        await notificationModel.markAsRead(notificationId, adminId);
        res.status(200).json({ message: 'อัพเดทสถานะการอ่านเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะการอ่าน' });
    }
};

// อ่านการแจ้งเตือนทั้งหมดของแอดมิน
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const adminId = req.user.id;

        await notificationModel.markAllAsRead(adminId);
        res.status(200).json({ message: 'อัพเดทสถานะการอ่านทั้งหมดเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะการอ่าน' });
    }
};


// ดึงรายชื่อแอดมินที่สามารถเพิ่มเป็นผู้ดูแลงานได้
export const getAvailableAdmins = async (req, res) => {
    try {
        const admins = await adminModel.findAvailableAdmins();
        res.json(admins);
    } catch (error) {
        console.error('Error getting available admins:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงรายชื่อแอดมิน'
        });
    }
};


// ดึงรายการผู้ใช้ทั้งหมด
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const searchParams = {
            search: req.query.search || '',
            status: req.query.status
        };

        const [users, total] = await Promise.all([
            adminModel.findUsers(limit, offset, searchParams),
            adminModel.countUsers(searchParams)
        ]);

        res.json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const createUser = async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    try {

        const birthDate = new Date(req.body.birth_date);
        if (isNaN(birthDate.getTime())) {
            return res.status(400).json({
                message: 'รูปแบบวันที่ไม่ถูกต้อง'
            });
        }

        const uploadBasePath = process.env.DOCKER
            ? '/app/uploads'
            : path.join(__dirname, '../../uploads');

        const profileImagePath = req.files?.profile_image?.[0]?.filename || null;
        const educationCertificatePath = req.files?.education_certificate?.[0]?.filename;
        const userDocumentsPaths = req.files?.user_documents
            ? req.files.user_documents.map(file => file.filename)
            : [];
        const fullProfileImagePath = profileImagePath ? path.join(uploadBasePath, 'profiles', profileImagePath) : null;
        const fullEducationCertificatePath = educationCertificatePath ? path.join(uploadBasePath, 'certificates', educationCertificatePath) : null;
        const fullUserDocumentsPaths = userDocumentsPaths.map(doc => path.join(uploadBasePath, 'documents', doc));


        const age = calculateAge(req.body.birth_date);
        const hashedPassword = await hashPassword(req.body.password);

        const userData = {
            prefix: req.body.prefix,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            national_id: req.body.national_id,
            phone_number: req.body.phone_number,
            gender: req.body.gender,
            age: age,
            birth_date: birthDate.toISOString(),
            line_id: req.body.line_id,
            skills: req.body.skills,
            approved: 'approved',
            profile_image: profileImagePath,
            education_certificate: educationCertificatePath,
            user_documents: userDocumentsPaths.length ? JSON.stringify(userDocumentsPaths) : undefined,
            role: 'user'
        };

        if (req.files) {
            if (req.files.profile_image?.[0]) {
                userData.profile_image = req.files.profile_image[0].filename;
            }
            if (req.files.education_certificate?.[0]) {
                userData.education_certificate = req.files.education_certificate[0].filename;
            }
            if (req.files.user_documents?.[0]) {
                userData.user_documents = req.files.user_documents[0].filename;
            }
        }

        if (!userData.email || !userData.password || !userData.national_id ||
            !userData.first_name || !userData.last_name || !userData.phone_number) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                receivedData: userData
            });
        }

        if (!validateEmail(userData.email)) {
            return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
        }

        if (!validateNationalId(userData.national_id)) {
            return res.status(400).json({ message: 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง' });
        }

        const existingUser = await userModel.checkExistingUser(userData.email, userData.national_id);
        if (existingUser) {
            return res.status(400).json({ message: 'อีเมลหรือเลขบัตรประชาชนนี้มีในระบบแล้ว' });
        }

        const newUser = await adminModel.createUserByAdmin(userData);

        await createLog(
            null,
            req.user.id,
            'Create User by Admin',
            req.originalUrl,
            req.method,
            `Admin created new user: ${newUser.first_name} ${newUser.last_name} (${newUser.email})`,
            ip,
            userAgent
        );

        res.status(201).json({
            message: 'สร้างผู้ใช้สำเร็จ',
            user: {
                id: newUser.id,
                prefix: newUser.prefix,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                national_id: newUser.national_id,
                phone_number: newUser.phone_number,
                profile_image_url: fullProfileImagePath,
                education_certificate_url: fullEducationCertificatePath,
                user_documents_url: fullUserDocumentsPaths,
                approved: newUser.approved,
                created_at: newUser.created_at
            }
        });
    } catch (error) {
        console.error('Error in createUser:', error);

        try {
            await createLog(
                null,
                req.user.id,
                'Create User Failed',
                req.originalUrl,
                req.method,
                `Failed to create user. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('Error creating log:', logError);
        }

        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' });
    }
};

// อัพเดทข้อมูลผู้ใช้
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = { ...req.body };

        delete userData.id;
        delete userData.created_at;
        delete userData.updated_at;
        delete userData.email;

        // ตรวจสอบว่ามีผู้ใช้นี้ในระบบหรือไม่
        const existingUser = await userModel.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้ในระบบ' });
        }

        if (userData.skills) {
            try {
                const skillsArray = JSON.parse(userData.skills);
                userData.skills = JSON.stringify(skillsArray);
            } catch (e) {
                console.error('Error parsing skills:', e);
                userData.skills = '[]';
            }
        }


        if (req.files?.profile_image?.[0]) {
            userData.profile_image = req.files.profile_image[0].filename;
        }
        if (req.files?.education_certificate?.[0]) {
            userData.education_certificate = req.files.education_certificate[0].filename;
        }
        if (req.files?.user_documents?.[0]) {
            userData.user_documents = req.files.user_documents[0].filename;
        }

        const updatedUser = await adminModel.updateUserByAdmin(parseInt(id), userData);

        res.json({
            message: 'อัพเดทข้อมูลสำเร็จ',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' });
    }
};

