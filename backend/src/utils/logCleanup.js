import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ฟังก์ชันลบ log ที่เก่ากว่า 7 วัน
export const logCleanup = async () => {
    try {
        const currentDate = new Date();
        const cutoffDate = new Date(currentDate.setDate(currentDate.getDate() - 7)); // เก็บ log 7 วัน

        // ลบ log ที่เก่ากว่า 7 วัน
        await prisma.log.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate
                }
            }
        });

        console.log('Log cleanup completed');
    } catch (error) {
        console.error('Error during log cleanup:', error);
    }
};
