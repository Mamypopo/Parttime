import * as jobParticipationModel from '../models/jobParticipationModel.js'
import * as jobModel from '../models/jobModel.js';
import * as notificationModel from '../models/notificationModel.js'
import * as notificationController from './notificationController.js'
import { createLog } from '../models/logModel.js';

// ฟังชั่นอนุมัติเข้าทำงาน
export const approveJobParticipation = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        // ตรวจสอบค่าที่จำเป็น
        if (!id || !['approved', 'rejected'].includes(status)) {
            console.log(id)
            return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });

        }
        const jobParticipationIdInt = parseInt(id, 10);

        // ดึงข้อมูลการสมัครงาน
        const jobParticipation = await jobParticipationModel.findJobParticipationById(jobParticipationIdInt);

        // ตรวจสอบว่าพบการสมัครงานหรือไม่
        if (!jobParticipation) {
            return res.status(404).json({ message: 'ไม่พบการสมัครงานในระบบ' });
        }

        const job = await jobModel.getJobById(jobParticipation.jobId);
        if (!job || job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์อนุมัติการสมัครงานนี้' });
        }

        // ตรวจสอบว่าการสมัครงานนี้ได้รับการอนุมัติหรือปฏิเสธไปแล้วหรือไม่
        if (['approved', 'rejected'].includes(jobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการ ${jobParticipation.status} ไปแล้ว` });
        }

        // ค้นหาข้อมูลตำแหน่งงานที่สมัคร
        const { jobPosition, user } = jobParticipation;

        if (!jobPosition) {
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงานในระบบ' });
        }

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้สำหรับการสมัครงานนี้' });
        }

        let remainingSlots;
        // อัปเดตสถานะการสมัครงาน
        const updatedJobParticipation = await jobParticipationModel.updateJobParticipationStatus(jobParticipationIdInt, status);

        // ถ้าอนุมัติสำเร็จ ให้ลดจำนวนผู้เข้าร่วมงานที่เหลือลง
        if (status === 'approved') {
            remainingSlots = jobPosition.required_people - 1;
            await jobModel.decreaseJobPositionSlots(jobPosition.id, remainingSlots);
        } else {
            // ถ้าไม่ได้อนุมัติ ให้ใช้จำนวนที่ต้องการเดิม
            remainingSlots = jobPosition.required_people;
        }

        // สร้างข้อความแจ้งเตือนตามสถานะ
        const notificationMessage = status === 'approved'
            ? `คุณได้รับการอนุมัติให้เข้าร่วมงาน ${job.title} ในตำแหน่ง ${jobPosition.position_name}`
            : `คำขอเข้าร่วมงาน ${job.title} ในตำแหน่ง ${jobPosition.position_name} ของคุณไม่ได้รับการอนุมัติ`;

        // สร้างการแจ้งเตือนสำหรับผู้ใช้
        await notificationModel.createUserNotification(user.id, notificationMessage, 'JOB_APPLICATION_STATUS');

        // บันทึก log การอนุมัติการเข้าร่วมงาน พร้อมชื่อและอีเมลของผู้ใช้
        await createLog(user.id, adminId, 'Approve Job Participation successfully', '/api/jobs/approve', 'PUT',
            `Job participation ID: ${jobParticipationIdInt} approved for User: { Name: ${user.first_name} ${user.last_name} Email: ${user.email} } Status: ${status}.`, ip, userAgent);

        // ส่ง response กลับไปเมื่ออนุมัติสำเร็จ
        return res.status(200).json({
            message: `อัปเดตสถานะการสมัครงานสำเร็จ: ${status}`,
            details: {
                jobParticipation: {
                    id: updatedJobParticipation.id,
                    status: updatedJobParticipation.status
                },
                jobPosition: {
                    position_name: jobPosition.position_name,
                    remaining_slots: remainingSlots
                },

            }
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอนุมัติการเข้าร่วมงาน:', error);
        try {
            await createLog(
                req.user?.id || null,
                adminId,
                'Approve Job Participation Failed',
                '/api/jobs/approve',
                'PUT',
                `Failed to approve Job participation ID: ${id}. Status: ${status}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการอนุมัติการเข้าร่วมงานที่ล้มเหลวได้:', logError);
        }
        return res.status(500).json({ message: `เกิดข้อผิดพลาดในการอนุมัติการสมัครงาน: ${error.message}` });
    }
};


// ฟังก์ชันอัปเดตสถานะการสมัครงานเมื่อเสร็จสิ้น
export const updateApplicationStatus = async (req, res) => {
    const { jobParticipationId, status } = req.body;
    const adminId = req.user && req.user.role === 'admin' ? req.user.id : null;

    if (!adminId) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้' });
    }
    if (!jobParticipationId || !['successful', 'needs improvement', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });
    }

    try {
        const currentJobParticipation = await jobParticipationModel.findJobParticipationById(jobParticipationId);
        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }

        const job = await jobModel.getJobById(currentJobParticipation.jobId);
        if (!job || job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการอัปเดตสถานะงานนี้' });
        }

        const userId = currentJobParticipation.user_id;

        if (['successful', 'needs improvement', 'failed'].includes(currentJobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการอัปเดตสถานะเป็น ${currentJobParticipation.status} แล้ว` });
        }

        const updatedJobParticipation = await jobParticipationModel.updateJobParticipationStatus(jobParticipationId, status);

        const jobPosition = await jobModel.findJobPositionById(currentJobParticipation.job_position_id);
        const positionName = jobPosition?.position_name || 'ไม่ระบุตำแหน่ง';

        const user = updatedJobParticipation.user || { id: userId, first_name: '', last_name: '', email: '' };

        const notificationMessages = {
            successful: `ยินดีด้วย! คุณได้ทำงาน "${job.title}" (ตำแหน่ง: ${positionName}) เสร็จสมบูรณ์แล้ว`,
            'needs improvement': `งาน "${job.title}" (ตำแหน่ง: ${positionName}) ของคุณต้องการการปรับปรุง`,
            failed: `ขออภัย งาน "${job.title}" (ตำแหน่ง: ${positionName}) ของคุณไม่ผ่านการประเมิน`
        };

        const notificationMessage = notificationMessages[status] || `สถานะงาน ${job.title} ของคุณได้รับการอัปเดตเป็น ${status}`;

        await Promise.all([
            notificationModel.createUserNotification(user.id, notificationMessage, 'JOB_COMPLETION_STATUS'),
            createLog(
                user.id,
                adminId,
                'Update Job Status successfully',
                '/api/jobs/update-status',
                'PUT',
                `Job ID: ${job.id} Position: ${positionName} status updated to ${status} for User { Name: ${user.first_name} ${user.last_name} Email: ${user.email} }`,
                req.ip || 'Unknown IP',
                req.headers['user-agent'] || 'Unknown User Agent'
            )
        ]);

        res.status(200).json({
            message: `อัปเดตสถานะการสมัครงานสำเร็จ: ${status}`,
            jobParticipation: updatedJobParticipation
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะงาน:', error);

        const user = req.user || { id: null }; // กำหนด user object เป็น fallback
        const job = currentJobParticipation ? { id: currentJobParticipation.jobId } : { id: null };

        try {
            await createLog(
                user.id,
                adminId,
                'Update Job Status Failed',
                '/api/jobs/update-status',
                'PUT',
                `Failed to update Job ID: ${job.id} status to ${status}. User ID: ${user.id}, Admin ID: ${adminId}. Error: ${error.message}`,
                req.ip || 'Unknown IP',
                req.headers['user-agent'] || 'Unknown User Agent'
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการอัปเดตสถานะงานที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: `เกิดข้อผิดพลาดในการอัปเดตสถานะงาน: ${error.message}` });
    }
};


// ฟังก์ชันดึงงานที่มีผู้ใช้งานสมัครเข้ามาเพื่อรออนุมัติ
export const getJobsWithParticipants = async (req, res) => {
    try {
        const adminId = req.user.id;

        const jobs = await jobParticipationModel.getJobsWithParticipants(adminId);


        return res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching jobs with participants:', error);
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: error.message
        });
    }
};