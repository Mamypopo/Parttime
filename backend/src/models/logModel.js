import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ฟังก์ชันสำหรับบันทึก Log ลงในฐานข้อมูล
export const createLog = async (userId, action, requestUrl, method, details, ipAddress, userAgent) => {
    try {
        await prisma.log.create({
            data: {
                user_id: userId,
                action,
                request_url: requestUrl,
                method,
                details,
                ip_address: ipAddress || 'Unknown IP', // ตรวจสอบ ipAddress ถ้าไม่มีให้ใช้ 'Unknown IP'
                user_agent: userAgent || 'Unknown User Agent' // ตรวจสอบ userAgent ถ้าไม่มีให้ใช้ 'Unknown User Agent'
            },
        });
    } catch (error) {
        console.error("Error creating log:", error);
    }
};


