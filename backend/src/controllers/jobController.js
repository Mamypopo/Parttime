import * as jobModel from '../models/jobModel.js';
import { createLog } from '../models/logModel.js';
import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js'
import * as notificationController from './notificationController.js'
import archiver from 'archiver'
import path from 'path'
import fs from 'fs'

// ฟังก์ชันสร้างงานใหม่ 
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

// ดึงงานทั้งหมด
export const getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const userId = req.user?.id;

        const filters = {
            id: req.query.id,
            title: req.query.title,
            location: req.query.location,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            status: req.query.status,
            minWage: req.query.minWage ? parseInt(req.query.minWage) : undefined,
            maxWage: req.query.maxWage ? parseInt(req.query.maxWage) : undefined,
            position: req.query.position,
        };

        const jobs = await jobModel.getAllJobs(page, pageSize, filters, userId);
        const totalCount = await jobModel.getJobsCount(filters);

        return res.status(200).json({
            jobs,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลงาน:', error);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลงาน",
            error: error.message
        });
    }
};

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

// ฟังก์ชันดึงงานที่แอดมินสร้าง
export const getMyCreatedJobs = async (req, res) => {
    try {
        const adminId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // เพิ่ม query parameters สำหรับการค้นหา
        const filters = {
            title: req.query.title,
            location: req.query.location,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            status: req.query.status,
            minWage: req.query.minWage ? parseInt(req.query.minWage) : undefined,
            maxWage: req.query.maxWage ? parseInt(req.query.maxWage) : undefined,
            position: req.query.position,
            createdBy: adminId
        };

        const jobs = await jobModel.getMyCreatedJobs(page, pageSize, filters);
        const totalCount = await jobModel.getMyCreatedJobsCount(adminId, filters);

        return res.status(200).json({
            jobs,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลงานที่สร้าง:', error);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลงาน",
            error: error.message
        });
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

            // อัพเดทสถานะของตำแหน่งงานตามสถานะของงานหลัก
            const positionStatus = (updatedJob.status === 'completed') ? 'closed' : 'open';
            for (const position of updatedJob.JobPositions) {
                await jobModel.updateJobPositionStatus(position.id, positionStatus);
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

        // ดำเนินการลบ
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



        if (!user.email_verified) {
            return res.status(400).json({
                message: 'กรุณายืนยันอีเมลก่อนสมัครงาน',

            });
        }


        // แก้ไขการตรวจสอบสถานะการอนุมัติ
        if (user.approved !== 'approved') {
            let message = 'ไม่สามารถสมัครงานได้ เนื่องจาก';
            switch (user.approved) {
                case 'pending':
                    message += 'บัญชีของคุณยังอยู่ระหว่างการตรวจสอบ';
                    break;
                case 'rejected':
                    message += 'บัญชีของคุณไม่ได้รับการอนุมัติ';
                    break;
                default:
                    message += 'บัญชีของคุณยังไม่ได้รับการอนุมัติ';
            }
            return res.status(400).json({ message });
        }


        const job = await jobModel.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่ระบุ' });
        }

        // เพิ่มการเช็คสถานะงาน
        if (job.status === 'completed') {
            return res.status(400).json({
                message: 'ไม่สามารถสมัครงานนี้ได้ เนื่องจากงานสำเร็จแล้ว'
            });
        }

        // เช็ควันที่ทำงาน
        const workDate = new Date(job.work_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        workDate.setHours(0, 0, 0, 0);

        if (workDate < today) {
            return res.status(400).json({
                message: 'ไม่สามารถสมัครงานที่ผ่านไปแล้วได้'
            });
        }

        const jobPosition = await jobModel.findJobPositionById(jobPositionId);
        if (!jobPosition) {
            return res.status(404).json({ message: 'ตำแหน่งงานไม่ถูกต้อง' });
        }

        // การตรวจสอบ skills
        const hasMatchingSkills = await jobModel.checkUserSkillsMatch(userId, jobPositionId);
        if (!hasMatchingSkills) {
            return res.status(400).json({
                message: 'คุณไม่มีทักษะที่เหมาะสมกับตำแหน่งงานนี้',
                position: jobPosition.position_name
            });
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
        const existingDayApplication = await jobModel.findExistingDayApplication(userId, job.work_date);
        if (existingDayApplication) {
            const status = existingDayApplication.status === 'approved' ? 'ได้รับการอนุมัติ' : 'รอการอนุมัติ';
            const jobTitle = existingDayApplication.Job?.title || 'ไม่ระบุชื่องาน';
            const positionName = existingDayApplication.jobPosition?.position_name || 'ไม่ระบุตำแหน่ง';
            return res.status(400).json({
                success: false,
                message: `คุณมีงานในวันที่ ${new Date(job.work_date).toLocaleDateString('th-TH')} ที่${status}แล้ว (${jobTitle} - ตำแหน่ง: ${positionName})`
            });
        }




        // สร้างการสมัครงานใหม่ในตำแหน่งที่เลือก
        const jobParticipation = await jobModel.createJobParticipation(userId, jobId, jobPositionId);


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

// ฟังก์ชันยกเลิกคำขอสมัครงาน
export const cancelJobApplication = async (req, res) => {
    const { jobId, jobPositionId } = req.body;
    const userId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        // ตรวจสอบว่าผู้ใช้มีคำขอสมัครงานนี้หรือไม่
        const application = await jobModel.findExistingJobParticipation(userId, jobId, jobPositionId);
        if (!application) {
            return res.status(404).json({ message: 'ไม่พบคำขอสมัครงานที่ระบุ' });
        }

        // ตรวจสอบสถานะของคำขอสมัครงาน
        if (application.status !== 'pending') {
            return res.status(400).json({ message: 'ไม่สามารถยกเลิกคำขอสมัครงานที่มีสถานะนี้ได้' });
        }

        // อัปเดตสถานะเป็น 'cancelled'
        await jobModel.updateJobParticipationStatus(application.id, 'cancelled');

        // สร้าง log การยกเลิก
        await createLog(
            userId,
            null,
            'Cancel Job Application',
            '/api/jobs/cancel',
            'POST',
            `User { ID: ${userId} } cancelled application for Job ID: ${jobId}, Position ID: ${jobPositionId}, Job Title: ${application.jobPosition.job.title}`,
            ip,
            userAgent
        );

        // ส่งการแจ้งเตือน
        await notificationModel.createUserNotification(
            userId,
            `คุณได้ยกเลิกคำขอสมัครงานสำหรับงาน Titie: ${application.jobPosition.job.title} ID: ${jobId} โปรดตรวจสอบรายละเอียด`,
            notificationModel.NOTIFICATION_TYPES.JOB_APPLICATION_CANCELLED,

        );

        // ตรวจสอบว่า creator มีค่า id
        const adminId = application.jobPosition.job.created_by;
        if (!adminId) {
            return res.status(404).json({ message: 'ไม่พบแอดมินที่สร้างงาน' });
        }

        const user = await userModel.getUserById(userId);

        // ส่งการแจ้งเตือนไปยังแอดมิน
        await notificationModel.createAdminNotification({
            userId,
            content: `ผู้ใช้ ${user.first_name} ${user.last_name} ID: ${userId} ได้ยกเลิกคำขอสมัครงานสำหรับงาน "${application.jobPosition.job.title}" ตำแหน่ง: ${application.jobPosition.position_name}`,
            jobId,
            adminId,
            type: 'job_application_cancelled_admin',
        });


        res.status(200).json({ message: 'ยกเลิกคำขอสมัครงานสำเร็จ' });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการยกเลิกคำขอสมัครงาน:', error);
        try {
            await createLog(
                userId,
                null,
                'Cancel Job Application Failed',
                '/api/jobs/cancel',
                'POST',
                `Failed to cancel application for Job ID: ${jobId}, Position ID: ${jobPositionId}. User ID: ${userId}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการยกเลิกคำขอสมัครงานที่ล้มเหลวได้:', logError);
        }

        res.status(500).json({ message: `เกิดข้อผิดพลาด: ${error.message}` });
    }
};



// ฟังก์ชันอัพเดท สถานะงาน
export const updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
        const job = await jobModel.getJobById(parseInt(id));

        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงาน' });
        }

        if (job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขงานนี้' });
        }

        const validStatuses = ['published', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
        }

        const updatedJob = await jobModel.updateJobStatus(parseInt(id), status);

        // สร้าง log การอัพเดทสถานะ
        await createLog(
            null,
            adminId,
            'Update Job Status',
            req.originalUrl,
            req.method,
            `Job ID: ${id} status updated to ${status}`,
            ip,
            userAgent
        );

        // สร้างการแจ้งเตือนสำหรับผู้สมัครงาน
        const applicants = await jobModel.getJobApplicants(id);
        if (applicants.length > 0) {
            const notificationPromises = applicants.map(applicant =>
                notificationModel.createUserNotification(
                    applicant.id,
                    `งาน "${job.title}" มีการเปลี่ยนสถานะเป็น ${status}`,
                    'JOB_STATUS_UPDATED',
                    { jobId: id, status }
                )
            );
            await Promise.all(notificationPromises);
        }

        res.json({
            message: 'อัพเดทสถานะงานสำเร็จ',
            job: updatedJob
        });
    } catch (error) {
        console.error('Error updating job status:', error);

        // สร้าง log กรณีเกิดข้อผิดพลาด
        await createLog(
            null,
            adminId,
            'Update Job Status Failed',
            req.originalUrl,
            req.method,
            `Failed to update job status. Job ID: ${id}. Error: ${error.message}`,
            ip,
            userAgent
        );

        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
    }
};


// ฟังก์ชันค้นหางานสำหรับ User
export const searchJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const userId = req.user?.id; // ดึง user ID จาก token


        // สร้าง filters object จาก query parameters
        const filters = {
            title: req.query.title,
            location: req.query.location,
            position: req.query.position,
            minWage: req.query.minWage ? parseInt(req.query.minWage) : undefined,
            maxWage: req.query.maxWage ? parseInt(req.query.maxWage) : undefined,
            workDate: req.query.workDate,
            status: req.query.status, // 'all', 'published', 'in_progress', 'completed'
            matchSkills: req.query.matchSkills === 'true', // ค้นหาเฉพาะงานที่ตรงกับทักษะ
            userId: userId // ส่ง userId ไปด้วยถ้าต้องการกรองตามทักษะ
        };

        // เรียกใช้ฟังก์ชันจาก Model
        const jobs = await jobModel.searchJobs(page, pageSize, filters);
        const totalCount = await jobModel.searchJobsCount(filters);

        return res.status(200).json({
            jobs,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount
        });

    } catch (error) {
        console.error('Error searching jobs:', error);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการค้นหางาน",
            error: error.message
        });
    }
};


// ดาวน์โหลดไฟล zip เอกสาร ของ user ที่สมัครงานนั้นๆ
export const downloadParticipantDocuments = async (req, res) => {
    try {
        const { jobId } = req.params
        const participants = await jobModel.getJobParticipantsDocuments(jobId)
        console.log('Participants data:', JSON.stringify(participants, null, 2))

        if (!participants.length) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลผู้เข้าร่วมงานที่ได้รับการอนุมัติ' })
        }

        // สร้าง zip file
        const archive = archiver('zip', {
            zlib: { level: 9 }
        })

        // Set response headers
        res.setHeader('Content-Type', 'application/zip')
        res.setHeader('Content-Disposition', `attachment; filename=job_${jobId}_documents.zip`)

        // Pipe archive data to response
        archive.pipe(res)

        for (const participant of participants) {
            const { user, Job, jobPosition } = participant
            // สร้างชื่อโฟลเดอร์ที่มีชื่องานและตำแหน่ง
            const userFolder = `${Job.title}/${jobPosition.position_name}/${user.first_name}_${user.last_name}`

            // เอกสารทั่วไป
            if (user.user_documents) {
                const documents = JSON.parse(user.user_documents)
                for (const doc of documents) {
                    const docPath = path.resolve('uploads/documents', doc)
                    if (fs.existsSync(docPath)) {
                        archive.file(docPath, {
                            name: `${userFolder}/documents${path.extname(doc)}`
                        })
                    }
                }
            }

            // วุฒิการศึกษา
            if (user.education_certificate) {
                const eduPath = path.resolve('uploads/certificates', user.education_certificate)
                if (fs.existsSync(eduPath)) {
                    archive.file(eduPath, {
                        name: `${userFolder}/education${path.extname(user.education_certificate)}`
                    })
                }
            }
        }

        // Finalize archive
        await archive.finalize()

    } catch (error) {
        console.error('Error downloading documents:', error)
        res.status(500).json({ error: 'ไม่สามารถดาวน์โหลดเอกสารได้' })
    }
}