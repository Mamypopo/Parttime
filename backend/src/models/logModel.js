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
