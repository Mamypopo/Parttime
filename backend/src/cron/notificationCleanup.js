import cron from 'node-cron';
import * as notificationModel from '../models/notificationModel.js';
import { createLog } from '../models/logModel.js';

// ทำงานทุกวันเวลา 00:00 น.
export const startNotificationCleanup = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const daysToKeep = 3; // เก็บการแจ้งเตือน ... วัน
            const result = await notificationModel.deleteOldNotifications(daysToKeep);

            // บันทึก log
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

            console.log(`ลบการแจ้งเตือนเก่าสำเร็จ: ${result.count} รายการ`);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการลบการแจ้งเตือนเก่า:', error);

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
        }
    });
};