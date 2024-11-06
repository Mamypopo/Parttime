import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createUserNotification = (userId, message) =>
    prisma.notification.create({
        data: {
            message,
            user: { connect: { id: userId } },
        },
    });


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



export const deleteOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const deletedNotifications = await prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate
                }
            }
        });

        return deletedNotifications;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบการแจ้งเตือนเก่า:', error);
        throw error;
    }
};


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

export const markAllAsRead = (adminId) =>
    prisma.notification.updateMany({
        where: {
            adminId
        },
        data: {
            read: true
        }
    });