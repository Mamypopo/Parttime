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
            payment_id: data.payment_id,
            admin_id: data.admin_id,
            action: data.action,
            action_detail: data.action_detail,
            checklist_status: data.checklist_status,
            ip_address: data.ip_address,
            user_agent: data.user_agent,
        },
    });
};
