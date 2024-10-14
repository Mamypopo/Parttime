import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ฟังก์ชันสำหรับบันทึก Log กิจกรรมของผู้ใช้
export const logAction = async (userId, action, requestUrl, method, details, req) => {
    try {
        // สร้าง Log ใหม่ในฐานข้อมูล
        const log = await prisma.log.create({
            data: {
                user_id: userId || null, // ถ้ามี userId ให้ใส่ ถ้าไม่มีใส่เป็น null
                action: action,
                request_url: requestUrl,
                method: method,
                details: details,
                timestamp: new Date(), // บันทึกเวลาปัจจุบัน
                ip_address: req.ip, // ดึง IP Address จาก request
                user_agent: req.headers['user-agent'], // ดึงข้อมูลเบราว์เซอร์จาก request
            }
        });
        console.log("Log created:", log);
    } catch (error) {
        console.error("Error creating log:", error);
    }
};
