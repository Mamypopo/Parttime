import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับดึงการแจ้งเตือนจากฐานข้อมูล
export const getNotifications = async (userId, adminId) => {
    if (userId) {
        return await prisma.notification.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
        });
    } else if (adminId) {
        return await prisma.notification.findMany({
            where: { adminId: parseInt(adminId) },
            orderBy: { createdAt: 'desc' },
        });
    }
    return null; // ถ้าไม่มี userId หรือ adminId ส่งค่า null กลับไป
};

// ฟังก์ชันสำหรับอัปเดตสถานะการแจ้งเตือนว่าอ่านแล้ว
export const markNotificationAsRead = async (id) => {
    return await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
    });
};
