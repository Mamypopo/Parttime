import * as notificationModel from '../models/notificationModel.js';
import * as jobModel from '../models/jobModel.js';


export const createNewApplicationNotification = async (jobId, userId) => {
    try {
        const job = await jobModel.getJobById(jobId);
        if (!job) {
            throw new Error('ไม่พบงานที่ระบุ');
        }

        const jobPosition = job.JobPositions && job.JobPositions[0];
        if (!jobPosition) {
            throw new Error('ไม่พบตำแหน่งงานที่ระบุ');
        }

        const content = `มีผู้สมัครใหม่สำหรับงาน "${job.title || 'ไม่ระบุชื่องาน'}" ตำแหน่ง "${jobPosition.position_name || 'ไม่ระบุตำแหน่ง'}" `;

        return notificationModel.createAdminNotification({
            userId,
            content,
            jobId,
            adminId: job.creator?.id
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือนการสมัครงานใหม่:', error);
        throw error;
    }
};