import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { createLog } from '../models/logModel.js';

const prisma = new PrismaClient();

export const cleanupLogs = async () => {
    console.log('=== Log Cleanup Started ===');
    console.log(`Time: ${new Date().toLocaleString()}`);
    try {
        const daysToKeep = 7;
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

        console.log(`Deleting logs older than: ${cutoffDate.toLocaleString()}`);

        const result = await prisma.log.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate
                }
            }
        });

        // บันทึก log การทำงาน
        await createLog(
            null,
            null,
            'Log Cleanup',
            'CRON',
            'DELETE',
            `Deleted ${result.count} logs older than ${daysToKeep} days`,
            'SYSTEM',
            'CRON Job'
        );

        console.log(`
=== Log Cleanup Results ===
- เวลาที่ทำงาน: ${new Date().toLocaleString()}
- จำนวนที่ลบ: ${result.count} รายการ
- เก็บข้อมูลย้อนหลัง: ${daysToKeep} วัน
- ลบข้อมูลก่อนวันที่: ${cutoffDate.toLocaleString()}
=== Cleanup Completed Successfully ===
        `);

        return result.count;
    } catch (error) {
        console.error(`
=== Log Cleanup Failed ===
- เวลาที่เกิดข้อผิดพลาด: ${new Date().toLocaleString()}
- สาเหตุ: ${error.message}
=== Error Details ===
`, error);

        // บันทึก log กรณีเกิดข้อผิดพลาด
        await createLog(
            null,
            null,
            'Log Cleanup Failed',
            'CRON',
            'DELETE',
            `Failed to delete old logs: ${error.message}`,
            'SYSTEM',
            'CRON Job'
        );

        throw error;
    }
};
// ตั้งเวลาทำงาน
export const startLogCleanup = () => {
    cron.schedule('0 0 * * *', cleanupLogs);
};
// สำหรับทดสอบ
export const runlogCleanupNow = async () => {
    console.log('=== Manual Log Cleanup Started ===');
    return await cleanupLogs();
};