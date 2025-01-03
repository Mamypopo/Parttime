import * as notificationModel from '../models/notificationModel.js'
import * as jobModel from '../models/jobModel.js';
import * as userModel from '../models/userModel.js';
import * as adminModel from '../models/adminModel.js';
import { NOTIFICATIONADMIN_TYPES } from '../models/notificationModel.js';

// ฟั่งชั่นสร้างการแจ้งเตือนเมื่อมีคนมาสมัครงานใหม่
export const createNewApplicationNotification = async (jobId, userId) => {
    try {
        const job = await jobModel.getJobById(jobId);

        if (!job) {
            throw new Error('ไม่พบงานที่ระบุ');
        }

        if (!job.creator) {
            throw new Error('ไม่พบข้อมูลผู้สร้างงาน');
        }

        const jobPosition = job.JobPositions && job.JobPositions[0];
        if (!jobPosition) {
            throw new Error('ไม่พบตำแหน่งงานที่ระบุ');
        }

        // ส่งการแจ้งเตือนไปที่แอดมินที่สร้างงาน
        const content = `มีการสมัครงานใหม่สำหรับตำแหน่ง ${jobPosition.position_name} ในงาน "${job.title}"`;
        return notificationModel.createAdminNotification({
            userId,
            content,
            jobId,
            adminId: job.created_by,
            type: 'job_application'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือนการสมัครงานใหม่:', error);
        throw error;
    }
};



// ฟังก์ชันสร้างการแจ้งเตือนเมื่อมีผู้สมัครสมาชิกใหม่
export const createNewUserRegistrationNotification = async (newUserId) => {
    try {
        // ดึงข้อมูล user ที่สมัครใหม่
        const newUser = await userModel.getUserById(newUserId);
        if (!newUser) {
            throw new Error('ไม่พบข้อมูลผู้ใช้ที่สมัครใหม่');
        }

        // ดึงรายการ admin ทั้งหมด
        const admins = await adminModel.findAllAdmins();
        if (!admins || admins.length === 0) {
            throw new Error('ไม่พบข้อมูลแอดมินในระบบ');
        }

        // สร้างเนื้อหาการแจ้งเตือน
        const content = `มีผู้ใช้งานใหม่ในระบบรอการอนุมัติ: ${newUser.first_name} ${newUser.last_name}`;

        // สร้างการแจ้งเตือนสำหรับแอดมินทุกคน
        const notificationPromises = admins.map(admin =>
            notificationModel.createAdminNotification({
                userId: newUserId,
                content,
                adminId: admin.id,
                type: NOTIFICATIONADMIN_TYPES.USER_VERIFICATION
            })
        );

        // รอให้สร้างการแจ้งเตือนทั้งหมดเสร็จ
        await Promise.all(notificationPromises);

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือนผู้สมัครใหม่:', error);
        throw error;
    }
};
