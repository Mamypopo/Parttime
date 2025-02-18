import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js';
import { deleteFile } from '../utils/fileUpload.js';
import { createLog } from '../models/logModel.js';


// register admin
export const registerAdmin = async (req, res) => {
    const { ip, headers: { 'user-agent': userAgent } } = req;
    let uploadedFile = null;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาอัปโหลดรูปโปรไฟล์' });
        }
        uploadedFile = req.file;
        const { email, password, first_name, last_name, admin_secret, phone } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!email || !password || !first_name || !last_name || !admin_secret || !phone) {
            // ลบไฟล์ถ้าข้อมูลไม่ครบ
            deleteFile(`uploads/admin-profiles/${uploadedFile.filename}`);
            return res.status(400).json({
                message: "กรุณากรอกข้อมูลให้ครบถ้วน"
            });
        }

        if (admin_secret !== process.env.ADMIN_SECRET) {
            deleteFile(`uploads/admin-profiles/${uploadedFile.filename}`);
            return res.status(403).json({ message: "รหัสลับของผู้ดูแลระบบไม่ถูกต้อง" });
        }

        const existingAdmin = await adminModel.checkExistingAdmin(email);
        if (existingAdmin) {
            deleteFile(`uploads/admin-profiles/${uploadedFile.filename}`);
            return res.status(400).json({ message: "อีเมลนี้มีอยู่ในระบบแล้ว" });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            deleteFile(`uploads/admin-profiles/${uploadedFile.filename}`);
            return res.status(400).json({ message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" });
        }


        // สร้างแอดมินใหม่
        const newAdmin = await adminModel.createAdmin({
            email,
            password,
            first_name,
            last_name,
            phone,
            profile_pic: uploadedFile.filename
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
            deleteFile(`uploads/admin-profiles/${uploadedFile.filename}`);
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

        res.json({
            users,
            pagination: {
                total: counts.total,
                page,
                limit
            },
            stats: {
                totalVerified: counts.totalVerified,
                totalNotVerified: counts.totalNotVerified
            }
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
        if (status === 'approved' && !user.email_verified) {
            return res.status(400).json({
                message: "ไม่สามารถอนุมัติได้เนื่องจากผู้ใช้ยังไม่ได้ยืนยันอีเมล กรุณารอให้ผู้ใช้ยืนยันอีเมลก่อน",
                email_verified: false
            });
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


        // ดึงข้อมูลแอดมิน
        const admin = await adminModel.findAdminById(adminId);
        if (!admin) {
            throw new Error('ไม่พบข้อมูลผู้ดูแลระบบ');
        }

        const adminName = `${admin.first_name} ${admin.last_name}`;
        // บันทึก log พร้อมสถานะที่ได้รับ
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
            message: `อัปเดตสถานะผู้ใช้เป็น ${status} สำเร็จ${!user.email_verified && status === 'approved' ? ' (รอการยืนยันอีเมล)' : ''}`,
            user: {
                id: updatedUser.id,
                status: updatedUser.approved,
                email_verified: updatedUser.email_verified
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


// แอดมินดึงสกิลที่รออนุมัติ ทำทีหลัง
export const getAdminPendingSkills = async (req, res) => {
    try {
        const pendingSkills = await adminModel.getAllPendingSkillsForAdmin();

        if (!pendingSkills || pendingSkills.length === 0) {
            return res.status(200).json({
                message: 'ไม่พบทักษะที่รออนุมัติ',
                pendingSkills: []
            });
        }

        res.status(200).json({
            pendingSkills
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลทักษะที่รออนุมัติ:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลทักษะที่รออนุมัติ'
        });
    }
};


// อัพเดทสกิล ทำทีหลัง
export const updatePendingSkillStatus = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const skillId = parseInt(req.params.id || req.params.pendingSkillId);
        const { action } = req.body;


        if (!skillId) {
            return res.status(400).json({
                message: 'กรุณาระบุ ID'
            });
        }

        // ตรวจสอบ action
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                message: 'Action ไม่ถูกต้อง กรุณาระบุ approve หรือ reject'
            });
        }


        const pendingSkill = await adminModel.getPendingSkillById(skillId);
        if (!pendingSkill) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลทักษะที่รอดำเนินการ' });
        }

        // ดึงข้อมูล user และ admin
        const user = await userModel.getUserById(pendingSkill.user.id);
        const admin = await adminModel.getAdminById(adminId);

        if (!req.admin || !req.admin.id) {
            return res.status(401).json({
                message: 'ไม่พบข้อมูลผู้ดูแลระบบ กรุณาเข้าสู่ระบบอีกครั้ง'
            });
        }
        const status = action === 'approve' ? 'approved' : 'rejected';
        // อัปเดตสถานะ
        const updatedPendingSkill = await adminModel.updatePendingSkillStatus(skillId, status);
        // ถ้าอนุมัติ อัพเดทสกิลของผู้ใช้
        if (action === 'approve') {
            const currentSkills = user.skills ? user.skills.split(',').filter(Boolean) : [];
            if (!currentSkills.includes(pendingSkill.skill)) {
                currentSkills.push(pendingSkill.skill);
                await adminModel.updateUserSkills(user.id, currentSkills.join(','));
            }
        }

        // บันทึก log
        const logTitle = action === 'approve' ? 'Skill approved' : 'Skill rejected';
        const logDescription = `Admin { Name: ${admin.first_name} ${admin.last_name} Email: ${admin.email} } ${action}ed skill: ${pendingSkill.skill} for User { Name: ${user.first_name} ${user.last_name} Email: ${user.email} }`;

        await createLog(
            pendingSkill.user.id,
            adminId,
            logTitle,
            req.originalUrl,
            req.method,
            logDescription,
            req.ip,
            req.headers['user-agent']
        );
        try {
            const notificationMessage = `Skill "${pendingSkill.skill}" has been ${action === 'approve' ? 'approved' : 'rejected'} by administrator`;
            await notificationModel.createUserNotification(
                pendingSkill.user.id,
                notificationMessage
            );
        } catch (notificationError) {
            console.error('Failed to create notification:', notificationError);
        }

        res.status(200).json({
            message: `${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}ทักษะเรียบร้อยแล้ว`,
            pendingSkill: updatedPendingSkill
        });

    } catch (error) {
        console.error('Error details:', error); ห
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะทักษะ',
            error: error.message
        });
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

// นับ user ที่ออนไลน์
export const getOnlineUsersCount = async (req, res) => {
    try {
        const count = await adminModel.getOnlineUsersCount();
        res.status(200).json({ onlineCount: count });
    } catch (error) {
        console.error('Controller - getOnlineUsersCount error:', error);
        res.status(500).json({
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ออนไลน์'
        });
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

