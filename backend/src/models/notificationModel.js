import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// สร้างการแจ่้งเตือนสำหรับ users
export const createUserNotification = (userId, message) =>
    prisma.notification.create({
        data: {
            message,
            user: { connect: { id: userId } },
        },
    });

// สร้างการแจ่้งเตือนสำหรับแอดมิน
export const createAdminNotification = async ({ userId, content, jobId, adminId, type }) => {
    if (!adminId) {
        throw new Error('ต้องระบุ adminId สำหรับการสร้างการแจ้งเตือนสำหรับแอดมิน');
    }

    if (!content) {
        throw new Error('ต้องระบุเนื้อหาการแจ้งเตือน');
    }

    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                adminId,
                message: content,
                jobId,
                type: type || 'notification',
                createdAt: new Date()
            }
        });
        return notification;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน:', error);
        throw error;
    }
};



export const getUserNotifications = (userId) =>
    prisma.notification.findMany({
        where: {
            userId,
            adminId: null
        },
        orderBy: { createdAt: 'desc' },
    });


export const getAdminNotifications = (adminId) =>
    prisma.notification.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' }
    });



// อ่านการแจ้งเตือน
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

// อ่านการแจ้งเตือนทั้งหมด
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