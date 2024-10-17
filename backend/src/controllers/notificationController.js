import { getNotifications, markNotificationAsRead } from '../models/notificationModel.js';

// ฟังก์ชันสำหรับดึงการแจ้งเตือน
export const fetchNotifications = async (req, res) => {
    const { userId, adminId } = req.query;

    try {
        const notifications = await getNotifications(userId, adminId);

        if (!notifications) {
            return res.status(400).json({ error: 'กรุณาระบุ userId หรือ adminId' });
        }

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน' });
    }
};

// ฟังก์ชันสำหรับมาร์คการแจ้งเตือนว่าอ่านแล้ว
export const markAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await markNotificationAsRead(id);

        if (!notification) {
            return res.status(404).json({ error: 'ไม่พบการแจ้งเตือน' });
        }

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการแจ้งเตือน' });
    }
};
