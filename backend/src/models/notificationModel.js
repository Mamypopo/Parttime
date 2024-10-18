import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createNotification = async (userId, message) => {
    return await prisma.notification.create({
        data: {
            message,
            user: { connect: { id: userId } },
        },
    });
};

