import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createLog = async (userId, adminId, action, requestUrl, method, details, ip, userAgent) => {
    try {
        await prisma.log.create({
            data: {
                user: userId ? { connect: { id: userId } } : undefined, // connect เฉพาะเมื่อมี userId
                admin: adminId ? { connect: { id: adminId } } : undefined, // connect เฉพาะเมื่อมี adminId
                action: action,
                request_url: requestUrl,
                method: method,
                details: details,
                ip_address: ip,
                user_agent: userAgent,
                timestamp: new Date(),
            }
        });
    } catch (error) {
        console.error("Error creating log:", error.message);
    }
};
