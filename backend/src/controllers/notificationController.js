import * as notificationModel from '../models/notificationModel.js'
import * as jobModel from '../models/jobModel.js';


// ฟั่งชั่นสร้างการแจ้งเตือนเมื่อมีคนมาสมัครงานใหม่
export const createNewApplicationNotification = async (jobId, userId) => {
    try {
        const job = await jobModel.getJobById(jobId);

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

        // ส่งการแจ้งเตือนไปที่แอดมินที่สร้างงาน
        const content = `มีการสมัครงานใหม่สำหรับตำแหน่ง ${jobPosition.position_name} ในงาน "${job.title}"`;
        return notificationModel.createAdminNotification({
            userId,
            content,
            jobId,
            adminId: job.created_by,
            type: 'job_application'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างการแจ้งเตือนการสมัครงานใหม่:', error);
        throw error;
    }
};

