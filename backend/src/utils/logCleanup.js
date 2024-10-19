import { PrismaClient } from '@prisma/client';


/**
 * ลบ log ที่เก่ากว่า 7 วัน
 * @returns {Promise<number>} จำนวน log ที่ถูกลบ
 */

export const initPrisma = () => {
    prisma = new PrismaClient();
};

export const logCleanup = async () => {
    if (!prisma) {
        initPrisma();
    }
    try {
        const result = await prisma.log.deleteMany({
            where: {
                timestamp: {
                    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });
        console.log(`ลบ log สำเร็จ: ${result.count} รายการถูกลบ`);
        return result.count;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบ log:', error);
        throw error;
    }
};