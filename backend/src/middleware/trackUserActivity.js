import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const trackUserActivity = async (req, res, next) => {
    try {
        // เช็คว่ามี user id และเป็นตัวเลขหรือไม่
        const userId = parseInt(req.user?.id);

        if (userId) {
            // เช็คก่อนว่ามี user อยู่จริงไหม
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (user) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        last_active: new Date()
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error updating user activity:', error);
    }
    next();
};