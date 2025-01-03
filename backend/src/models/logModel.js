import prisma from '../config/prisma.js';

export const createLog = async (
    userId,
    adminId,
    action,
    requestUrl,
    method,
    details,
    ip,
    userAgent) => {
    try {
        const logData = {
            action: action,
            request_url: requestUrl,
            method: method,
            details: details,
            ip_address: ip,
            user_agent: userAgent,
            timestamp: new Date(),
        }
        if (userId) logData.user = { connect: { id: userId } };
        if (adminId) logData.admin = { connect: { id: adminId } };

        await prisma.log.create({ data: logData });
    } catch (error) {
        console.error("Error creating log:", error.message);
    }
};


// สร้างบันทึก Log การจ่ายเงิน
export const createPaymentLog = async (data) => {
    return await prisma.paymentLog.create({
        data: {
            payment_id: data.payment_id, // ID การจ่ายเงิน
            admin_id: data.admin_id, // ผู้ดำเนินการ
            action: data.action, // การกระทำ เช่น "update"
            action_detail: data.action_detail, // รายละเอียด
            checklist_status: data.checklist_status, // สถานะการตรวจสอบ
            ip_address: data.ip_address, // IP Address
            user_agent: data.user_agent, // User Agent
        },
    });
};
