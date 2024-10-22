import * as jobModel from '../models/jobModel.js';
import { createLog } from '../models/logModel.js';
import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js'
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import * as notificationController from '../controllers/notificationController.js'

// ฟังก์ชันสร้างงานใหม่ (สำหรับแอดมิน)
export const createJob = async (req, res) => {
    const { title, work_date, location, start_time, end_time, details, positions } = req.body;
    const { id: adminId } = req.user;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    try {

        const admin = await adminModel.findAdminById(adminId)
        if (!admin) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ดูแลระบบ" });
        }

        const job = await jobModel.createJob({
            title, work_date, location, start_time, end_time, details, positions
        }, adminId);

        await createLog(
            null,
            adminId,
            'Create Job',
            req.originalUrl,
            req.method,
            `Job ID: ${job.id} created by Admin { Name: ${admin.first_name} ${admin.last_name} Email: ${admin.email} } `,
            ip,
            userAgent
        );
        res.status(201).json({ message: "สร้างงานสำเร็จ", job });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างงาน:', error);

        try {
            await createLog(
                null,
                adminId,
                'Create Job Failed',
                req.originalUrl,
                req.method,
                `Failed to create job. Admin ID: ${adminId}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการสร้างงานที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างงาน", error: error.message });
    }
};


// ฟังก์ชันสำหรับดึงงานทั้งหมด
export const getAllJobs = [
    cacheMiddleware(300), // cache นาน 5 นาที
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 20;

            const jobs = await jobModel.getAllJobs(page, pageSize);

            if (!jobs || jobs.length === 0) {
                return res.status(404).json({ message: 'ไม่พบงานในระบบ' });
            }

            return res.status(200).json({ jobs, page, pageSize, totalJobs: jobs.length });
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลงาน:', error);
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลงาน", error: error.message || 'Unknown error' });
        }
    }
];

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobModel.getJobById(id);

        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงาน' });
        }

        res.status(200).json(job);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลงานตาม ID:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน', error: error.message });
    }
};

// ฟังก์ชันสำหรับอัปเดตงาน
export const editJob = async (req, res) => {
    const { jobId } = req.params;
    const adminId = req.user.id;
    const updatedJobData = req.body;
    const ip = req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    try {
        const existingJob = await jobModel.getJobByIdforUpdate(parseInt(jobId));
        if (!existingJob) {
            return res.status(404).json({ message: 'ไม่พบงานที่ระบุ' });
        }
        if (existingJob.creator.id !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขงานนี้' });
        }

        // อัปเดตข้อมูลงานหลัก
        const updatedJob = await jobModel.updateJobMain(parseInt(jobId), updatedJobData);

        // อัปเดตตำแหน่งงาน
        if (updatedJobData.positions && updatedJobData.positions.length > 0) {
            const existingPositions = updatedJob.JobPositions;

            for (const pos of updatedJobData.positions) {
                if (pos.id) {
                    await jobModel.updateJobPosition(pos.id, pos);
                } else {
                    await jobModel.createJobPosition(parseInt(jobId), pos);
                }
            }

            // ลบตำแหน่งงานที่ไม่มีในข้อมูลใหม่
            const newPositionIds = updatedJobData.positions.filter(p => p.id).map(p => p.id);
            for (const existingPos of existingPositions) {
                if (!newPositionIds.includes(existingPos.id)) {
                    const participations = await jobModel.getJobParticipations(existingPos.id);
                    if (participations.length === 0) {
                        await jobModel.deleteJobPosition(existingPos.id);
                    }
                }
            }
        }
        const admin = await adminModel.findAdminById(adminId)
        // สร้าง log
        await createLog(
            null,
            adminId,
            'Edit Job',
            `/api/jobs/edit/${jobId}`,
            'PUT',
            ` Job ID: ${jobId} edited by Admin { Name: ${admin.first_name} ${admin.last_name} Email: ${admin.email} }`,
            ip,
            userAgent
        );

        // สร้างการแจ้งเตือนสำหรับผู้สมัครงาน
        const applicants = await jobModel.getJobApplicants(jobId);
        if (applicants.length > 0) {
            const notificationPromises = applicants.map(applicant =>
                notificationModel.createUserNotification(
                    applicant.id,
                    `งาน"${updatedJob.title}" ที่คุณสมัครได้รับการอัปเดต โปรดตรวจสอบรายละเอียด`,
                    'JOB_UPDATED',
                    { jobId: jobId }
                )
            );
            await Promise.all(notificationPromises);
        }

        const finalUpdatedJob = await jobModel.getJobByIdforUpdate(parseInt(jobId));
        res.status(200).json({
            message: 'แก้ไขงานสำเร็จ',
            job: finalUpdatedJob
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการแก้ไขงาน:', error);

        try {
            await createLog(
                null,
                adminId,
                'Edit Job Failed',
                `/api/jobs/edit/${jobId}`,
                'PUT',
                `Failed to edit Job ID: ${jobId}. Admin ID: ${adminId}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการแก้ไขงานที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: `เกิดข้อผิดพลาดในการแก้ไขงาน: ${error.message}` });
    }
};


// ฟังก์ชันสำหรับลบงาน
export const deleteJob = async (req, res) => {
    const { jobId } = req.params;
    const { id: adminId } = req.user;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    try {
        const jobIdInt = parseInt(jobId);
        if (isNaN(jobIdInt)) {
            return res.status(400).json({ message: 'Job ID ต้องเป็นตัวเลข' });
        }

        const job = await jobModel.getJobById(jobIdInt);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่ต้องการลบ' });
        }

        // ตรวจสอบว่าแอดมินที่กำลังลบงานเป็นผู้สร้างงานหรือไม่
        if (job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบงานนี้ เนื่องจากคุณไม่ใช่ผู้สร้างงาน' });
        }


        const applicants = await jobModel.getJobApplicants(jobIdInt);

        await jobModel.deleteJobById(jobIdInt);

        const admin = await adminModel.findAdminById(adminId);
        const { first_name, last_name, email } = admin;

        await createLog(
            null,
            adminId,
            'Delete Job successfully',
            `/api/jobs/${jobIdInt}`,
            'DELETE',
            `Job ID: ${jobIdInt} titled: ${job.title} deleted by Admin { Name: ${first_name} ${last_name} Email: ${email} }`,
            ip,
            userAgent
        );

        // ส่งการแจ้งเตือนไปยังผู้สมัครงานทุกคน
        if (applicants.length > 0) {
            const notificationPromises = applicants.map(applicant =>
                notificationModel.createUserNotification(
                    applicant.id,
                    `งาน "${job.title}" ที่คุณสมัครได้ถูกยกเลิก`,
                    'JOB_DELETED',
                    { jobId: jobIdInt }
                )
            );
            await Promise.all(notificationPromises);
        }

        res.status(200).json({ message: 'ลบงานสำเร็จ', job });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบงาน:', error);

        try {
            await createLog(
                null,
                adminId,
                'Delete Job Failed',
                `/api/jobs/${jobId}`,
                'DELETE',
                `Failed to delete Job ID: ${jobId}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการลบงานที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบงาน' });
    }
};


// ฟังก์ชันสมัครงานของ user
export const applyForJob = async (req, res) => {
    const { jobId, jobPositionId } = req.body;
    const userId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    try {

        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'ไม่พบ userId กรุณาเข้าสู่ระบบใหม่' });
        }

        const jobPosition = await jobModel.findJobPositionById(jobPositionId);
        if (!jobPosition) {
            return res.status(404).json({ message: 'ตำแหน่งงานไม่ถูกต้อง' });
        }

        if (jobPosition.required_people <= 0) {
            return res.status(400).json({ message: 'จำนวนผู้เข้าร่วมงานเต็มแล้ว' });
        }

        // ตรวจสอบว่าผู้ใช้สมัครตำแหน่งนี้ในงานนี้แล้วหรือไม่
        const existingApplication = await jobModel.findExistingJobParticipation(userId, jobId, jobPositionId);
        if (existingApplication) {
            return res.status(400).json({ message: 'คุณได้สมัครตำแหน่งนี้ในงานนี้แล้ว' });
        }

        // ตรวจสอบการสมัครงานในวันเดียวกัน
        const existingDayApplication = await jobModel.findExistingDayApplication(userId);
        if (existingDayApplication) {
            return res.status(400).json({ message: 'คุณสามารถสมัครงานได้เพียงหนึ่งงานต่อวันเท่านั้น' });
        }

        if (!user.email_verified || !user.approved) {
            return res.status(400).json({ message: 'กรุณายืนยันอีเมลและรอการอนุมัติจากแอดมิน' });
        }

        // สร้างการสมัครงานใหม่ในตำแหน่งที่เลือก
        const jobParticipation = await jobModel.createJobParticipation(userId, jobId, jobPositionId);
        // ดึงข้อมูลงานเพื่อดูว่าใครเป็นคนสร้างงาน
        const job = await jobModel.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่ระบุ' });
        }


        await notificationController.createNewApplicationNotification(jobId, userId);

        await createLog(userId, null, 'Apply Job successfully', '/api/jobs/apply', 'POST', `User { Name: ${user.first_name} ${user.last_name} Email: ${user.email} }  applied for Job ID: ${jobId}`, ip, userAgent);
        res.status(200).json({ message: 'สมัครงานสำเร็จ กรุณารอการอนุมัติจากแอดมินผู้สร้างงาน', jobParticipation });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสมัครงาน:', error);
        try {
            await createLog(
                userId,
                null,
                'Apply Job Failed',
                '/api/jobs/apply',
                'POST',
                `Failed to apply for Job ID: ${jobId}, Position ID: ${jobPositionId}. User ID: ${userId}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการสมัครงานที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: `เกิดข้อผิดพลด: ${error.message}` });
    }
};


export const approveJobParticipation = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        // ตรวจสอบค่าที่จำเป็น
        if (!id || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });
        }

        const jobParticipationIdInt = parseInt(id, 10);

        // ดึงข้อมูลการสมัครงาน
        const jobParticipation = await jobModel.findJobParticipationById(jobParticipationIdInt);

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
        const updatedJobParticipation = await jobModel.updateJobParticipationStatus(jobParticipationIdInt, status);

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
export const markJobAsCompleted = async (req, res) => {
    const { jobParticipationId, status } = req.body;
    const adminId = req.user && req.user.role === 'admin' ? req.user.id : null;

    if (!adminId) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้' });
    }
    if (!jobParticipationId || !['successful', 'needs improvement', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });
    }

    try {
        // ดึงข้อมูลการสมัครงานปัจจุบัน
        const currentJobParticipation = await jobModel.findJobParticipationById(jobParticipationId);
        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }
        // ตรวจสอบว่าแอดมินที่กำลังดำเนินการเป็นผู้สร้างงานหรือไม่
        const job = await jobModel.getJobById(currentJobParticipation.jobId);
        if (!job || job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการอัปเดตสถานะงานนี้' });
        }

        const userId = currentJobParticipation.user_id; // ใช้ user_id แทน user.id

        // ตรวจสอบว่ามีการอัปเดตสถานะเป็น successful, needs improvement, หรือ failed ไปแล้วหรือไม่
        if (['successful', 'needs improvement', 'failed'].includes(currentJobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการอัปเดตสถานะเป็น ${currentJobParticipation.status} แล้ว` });
        }

        // อัปเดตสถานะการสมัครงานเป็น 'successful'
        const updatedJobParticipation = await jobModel.updateJobParticipationStatus(jobParticipationId, status);

        // const { jobPosition } = updatedJobParticipation;
        const jobPosition = await jobModel.findJobPositionById(currentJobParticipation.job_position_id);
        const positionName = jobPosition?.position_name || 'ไม่ระบุตำแหน่ง';

        const user = updatedJobParticipation.user || { id: userId };

        const notificationMessages = {
            successful: `ยินดีด้วย! คุณได้ทำงาน "${job.title}" (ตำแหน่ง: ${positionName}) เสร็จสมบูรณ์แล้ว`,
            'needs improvement': `งาน "${job.title}" (ตำแหน่ง: ${positionName}) ของคุณต้องการการปรับปรุง`,
            failed: `ขออภัย งาน "${job.title}" (ตำแหน่ง: ${positionName}) ของคุณไม่ผ่านการประเมิน`
        };


        const notificationMessage = notificationMessages[status] || `สถานะงาน ${job.title} ของคุณได้รับการอัปเดตเป็น ${status}`;
        // สร้างการแจ้งเตือนสำหรับผู้ใช้ และ บันทึก log
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



