import * as notificationModel from '../models/notificationModel.js'
import * as jobModel from '../models/jobModel.js';


export const createNewApplicationNotification = async (jobId, userId) => {
    try {
        const job = await jobModel.getJobById(jobId);
        // console.log('Job data:', JSON.stringify(job, null, 2)); 
        if (!job) {
            throw new Error('ไม่พบงานที่ระบุ');
        }

        if (!job.creator) {
            throw new Error('ไม่พบข้อมูลผู้สร้างงาน');
        }

        const jobPosition = job.JobPositions && job.JobPositions[0];
        if (!jobPosition) {
            throw new Error('ไม่พบตำแหน่งงานที่ระบุ');
        }

        const content = `มีการสมัครงานใหม่สำหรับตำแหน่ง ${jobPosition.position_name} ในงาน "${job.title}"`;
        return notificationModel.createAdminNotification({
            userId,
            content,
            jobId,
            adminId: job.created_by,
            type: 'job'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือนการสมัครงานใหม่:', error);
        throw error;
    }
};

export const getUserNotifications = async (req, res) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'ไม่พบรหัสผู้ใช้' });
        }

        const notifications = await notificationModel.getUserNotifications(req.user.id);

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน:', error);
        res.status(500).json({ message: 'ไม่สามารถโหลดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง' });
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        return await prisma.notification.update({
            where: {
                id: parseInt(notificationId)
            },
            data: {
                is_read: true,
                updated_at: new Date()
            }
        })
    } catch (error) {
        console.error('Error marking notification as read:', error)
        throw new Error('ไม่สามารถอัพเดทสถานะการแจ้งเตือนได้')
    }
}