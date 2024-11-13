import cron from 'node-cron';
import * as notificationModel from '../models/notificationModel.js';
import { createLog } from '../models/logModel.js';

// ฟังก์ชันหลัก
export const cleanupNotifications = async () => {
    console.log('=== Notification Cleanup Started ===');
    console.log(`Time: ${new Date().toLocaleString()}`);

    try {
        const daysToKeep = 3;
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

        console.log(`Deleting notifications older than: ${cutoffDate.toLocaleString()}`);

        const result = await notificationModel.deleteOldNotifications(daysToKeep);

        // บันทึก log สำเร็จ
        await createLog(
            null,
            null,
            'Notification Cleanup',
            'CRON',
            'DELETE',
            `Deleted ${result.count} old notifications older than ${daysToKeep} days`,
            'SYSTEM',
            'CRON Job'
        );

        console.log(`
=== Notification Cleanup Results ===
- เวลาที่ทำงาน: ${new Date().toLocaleString()}
- จำนวนที่ลบ: ${result.count} รายการ
- เก็บข้อมูลย้อนหลัง: ${daysToKeep} วัน
- ลบข้อมูลก่อนวันที่: ${cutoffDate.toLocaleString()}
=== Cleanup Completed Successfully ===
        `);

        return result;
    } catch (error) {
        console.error(`
=== Notification Cleanup Failed ===
- เวลาที่เกิดข้อผิดพลาด: ${new Date().toLocaleString()}
- สาเหตุ: ${error.message}
=== Error Details ===
        `, error);

        // บันทึก log กรณีเกิดข้อผิดพลาด
        await createLog(
            null,
            null,
            'Notification Cleanup Failed',
            'CRON',
            'DELETE',
            `Failed to delete old notifications: ${error.message}`,
            'SYSTEM',
            'CRON Job'
        );

        throw error;
    }
};

// ตั้งเวลาทำงาน (ทุกวันเวลา 00:00 น.)
export const startNotificationCleanup = () => {
    cron.schedule('0 0 * * *', cleanupNotifications);
    console.log('Notification cleanup cron initialized');
};

// สำหรับทดสอบ
export const runCleanupNow = async () => {
    console.log('=== Manual Notification Cleanup Started ===');
    return await cleanupNotifications();
};