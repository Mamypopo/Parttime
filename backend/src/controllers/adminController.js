import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createLog } from '../models/logModel.js';
import * as notificationModel from '../models/notificationModel.js';



export const registerAdmin = async (req, res) => {
    const { email, password, first_name, last_name, admin_secret } = req.body;
    const { ip, headers: { 'user-agent': userAgent } } = req;
    try {

        if (admin_secret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: "รหัสลับของผู้ดูแลระบบไม่ถูกต้อง" });
        }

        const existingAdmin = await adminModel.checkExistingAdmin(email);
        if (existingAdmin) {
            return res.status(400).json({ message: "อีเมลนี้มีอยู่ในระบบแล้ว" });
        }


        const newAdmin = await adminModel.createAdmin({
            email,
            password,
            first_name,
            last_name
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
                last_name: newAdmin.last_name
            }
        });
    } catch (error) {
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
            { expiresIn: '1h' }
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


export const getAdminProfile = async (req, res) => {
    try {
        const { id } = req.user  // เปลี่ยนเป็น id

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

        res.json(admin)  // ข้อมูลที่ส่งกลับจะมี id แทน admin_id

    } catch (error) {
        console.error('Error in getAdminProfile:', error)
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}


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

// // ดึงผู้ใช้ที่รอการอนุมัติ
// export const getPendingUsers = async (req, res) => {
//     try {
//         const pendingUsers = await adminModel.findPendingUsers();
//         res.status(200).json({ users: pendingUsers });
//     } catch (error) {
//         console.error('เกิดข้อผิดพลาดในการโหลดผู้ใช้ที่รอการอนุมัติ:', error);
//         res.status(500).json({ message: 'เกิดข้อผิดพลาดในการโหลดผู้ใช้ที่รอการอนุมัติ' });
//     }
// };


// ดึงผู้ใช้ที่รอการอนุมัติ
export const getPendingUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const users = await adminModel.findPendingUsers(page, perPage);
        const total = await adminModel.countUsersByStatus('pending');

        res.json({
            users,
            pagination: {
                page,
                perPage,
                total: total._count
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงผู้ใช้ที่อนุมัติแล้ว
export const getApprovedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const users = await adminModel.findApprovedUsers(page, perPage);
        const total = await adminModel.countUsersByStatus('approved');

        res.json({
            users,
            pagination: {
                page,
                perPage,
                total: total._count
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงผู้ใช้ที่ถูกปฏิเสธ
export const getRejectedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const users = await adminModel.findRejectedUsers(page, perPage);
        const total = await adminModel.countUsersByStatus('rejected');

        res.json({
            users,
            pagination: {
                page,
                perPage,
                total: total._count
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงสถิติจำนวนผู้ใช้แต่ละสถานะ
export const getUserStats = async (req, res) => {
    try {
        const stats = await adminModel.countUsersByStatus();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
};


export const approveUser = async (req, res) => {
    const { status } = req.body;
    const { userId } = req.params;
    const adminId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
        // แปลง userId เป็นตัวเลข
        const userIdAsInt = Number(userId);

        // ตรวจสอบว่าผู้ใช้มีอยู่จริงและได้รับการยืนยันอีเมลแล้วหรือไม่
        const user = await userModel.getUserById(userIdAsInt);

        if (!user || !user.email_verified) {
            return res.status(400).json({ message: "ไม่พบผู้ใช้หรืออีเมลยังไม่ได้รับการยืนยัน กรุณาตรวจสอบและลองอีกครั้ง" });
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

        await notificationModel.createUserNotification(userIdAsInt, notificationMessage, adminId);


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
            message: `อัปเดตสถานะผู้ใช้เป็น ${status} สำเร็จ`,
            user: {
                id: updatedUser.id,
                status: updatedUser.approved
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
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงการแจ้งเตือนของแอดมิน:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน' });
    }
};


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
        console.error('Error details:', error); // เพิ่ม log error
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะทักษะ',
            error: error.message
        });
    }
};


