import prisma from '../config/prisma.js';


export const NOTIFICATION_TYPES = {
    JOB_APPLICATION_STATUS: 'job_status',    // แจ้งเตือนสถานะการสมัครงาน
    WORK_EVALUATION: 'evaluation',           // แจ้งเตือนผลการประเมิน
    WORK_EVALUATION_REJECTED: 'rejected',    // แจ้งเตือนไม่ผ่านการประเมิน
    SYSTEM: 'system',                        // แจ้งเตือนจากระบบ
    GENERAL: 'general',                      // แจ้งเตือนทั่วไป
    USER_APPROVAL: 'user_approval',
    JOB_APPLICATION_CANCELLED: 'job_application_cancelled',
    PAYMENT_COMPLETED: 'payment_completed',   // ประเภทแจ้งเตือนการจ่ายเงิน
}

export const NOTIFICATIONADMIN_TYPES = {
    JOB_APPLICATION: 'job_application',
    JOB_STATUS_UPDATE: 'job_status_update',
    USER_VERIFICATION: 'user_verification',
    EVALUATION: 'evaluation',
    SYSTEM: 'system',
    JOB_APPLICATION_CANCELLED_ADMIN: 'job_application_cancelled_admin',
    PAYMENT_PENDING: 'payment_pending'

};

// สร้างการแจ่้งเตือนสำหรับ users
export const createUserNotification = async (userId, message, type) => {
    if (!userId) {
        throw new Error('ต้องระบุ userId สำหรับการสร้างการแจ้งเตือน');
    }

    if (!message) {
        throw new Error('ต้องระบุเนื้อหาการแจ้งเตือน');
    }

    // ตรวจสอบ type ที่ถูกส่งมา
    if (type && !Object.values(NOTIFICATION_TYPES).includes(type)) {
        type = NOTIFICATION_TYPES.SYSTEM; // ถ้าไม่ตรงกับที่กำหนด ให้เป็น system
    }

    try {
        return await prisma.notification.create({
            data: {
                userId: parseInt(userId),
                message,
                type: type || NOTIFICATION_TYPES.SYSTEM,
                createdAt: new Date(),
                adminId: null // ระบุชัดเจนว่าเป็นการแจ้งเตือนของ user
            },
        });
    } catch (error) {
        console.error('Error creating user notification:', error);
        throw error;
    }
};

// สร้างการแจ่้งเตือนสำหรับแอดมิน
export const createAdminNotification = async ({ userId, content, jobId, adminId, type }) => {
    if (!adminId) {
        throw new Error('ต้องระบุ adminId สำหรับการสร้างการแจ้งเตือนสำหรับแอดมิน');
    }

    if (!content) {
        throw new Error('ต้องระบุเนื้อหาการแจ้งเตือน');
    }
    // ตรวจสอบ type ที่ถูกส่งมา
    if (type && !Object.values(NOTIFICATIONADMIN_TYPES).includes(type)) {
        type = NOTIFICATIONADMIN_TYPES.SYSTEM; // ถ้าไม่ตรงกับที่กำหนด ให้เป็น system
    }

    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                adminId,
                message: content,
                jobId,
                type: type || NOTIFICATIONADMIN_TYPES.SYSTEM,
                createdAt: new Date()
            }
        });
        return notification;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน:', error);
        throw error;
    }
};


// ของ user 
export const getUserNotifications = (userId) =>
    prisma.notification.findMany({
        where: {
            userId,
            adminId: null
        },
        orderBy: { createdAt: 'desc' },
    });

// อ่าน 1 การแจ้งเตือน
export const markUserNotificationAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId: userId,
            adminId: null
        }
    });

    if (!notification) {
        throw new Error('ไม่พบการแจ้งเตือน');
    }

    return await prisma.notification.update({
        where: {
            id: notificationId
        },
        data: {
            read: true
        }
    });
};

// อ่านการแจ้งเตือนทั้งหมด
export const markAllUserNotificationsAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: {
            userId: userId,
            adminId: null,
            read: false
        },
        data: {
            read: true
        }
    });
};


// ของแอดมิน
export const getAdminNotifications = (adminId) =>
    prisma.notification.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' }
    });



// อ่านการแจ้งเตือนแอดมิน
export const markAsRead = (notificationId, adminId) =>
    prisma.notification.updateMany({
        where: {
            id: notificationId,
            adminId
        },
        data: {
            read: true
        }
    });

// อ่านการแจ้งเตือนแอดมินทั้งหมด
export const markAllAsRead = (adminId) =>
    prisma.notification.updateMany({
        where: {
            adminId
        },
        data: {
            read: true
        }
    });

// แจ้งเตือนแอดมินเมื่องานมีการเปลี่ยนสถานะ
export const notifyAdminJobStatusChange = async (job, oldStatus, newStatus) => {
    try {
        await createAdminNotification(
            job.created_by,
            `งาน "${job.title}" เปลี่ยนสถานะจาก ${oldStatus} เป็น ${newStatus}`,
            'JOB_STATUS_AUTO_UPDATED',
            { jobId: job.id }
        );
    } catch (error) {
        console.error('Error notifying admin:', error);
    }
};