import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createUserNotification = (userId, message) =>
    prisma.notification.create({
        data: {
            message,
            user: { connect: { id: userId } },
        },
    });


// export const createAdminNotification = async ({ userId, message, adminId, jobId }) => {
//     if (!adminId) {
//         throw new Error('ต้องระบุ adminId สำหรับการแจ้งเตือนที่เกี่ยวข้องกับแอดมิน');
//     }
//     return prisma.notification.create({
//         data: {
//             userId,
//             message,
//             adminId,
//             jobId,
//         },
//     });
// };

export const createAdminNotification = async ({ userId, content, jobId }) => {
    if (!userId) {
        throw new Error('ต้องระบุ userId สำหรับการสร้างการแจ้งเตือน');
    }

    if (!content) {
        throw new Error('ต้องระบุเนื้อหาการแจ้งเตือน');
    }

    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                message: content,
                jobId,
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