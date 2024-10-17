import { PrismaClient } from '@prisma/client';
import * as jobModel from '../models/jobModel.js';
import { createLog } from '../models/logModel.js';
import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import { notifyUser } from '../utils/wsServer.js';
const prisma = new PrismaClient();

// ฟังก์ชันสร้างงานใหม่ (สำหรับแอดมิน)
export const createJob = async (req, res) => {
    const { title, work_date, location, start_time, end_time, details, positions } = req.body;
    const adminId = req.user.id; // ดึง adminId จาก authMiddleware
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    try {
        // ดึงข้อมูลแอดมินจากตาราง admin
        const admin = await adminModel.findAdminById(adminId)

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const adminName = `${admin.first_name} ${admin.last_name}`;
        const adminEmail = admin.email;
        // สร้างงานใหม่ผ่าน jobModel
        const job = await jobModel.createJob({ title, work_date, location, start_time, end_time, details, positions }, adminId);

        await createLog(null, adminId, 'CREATE', req.originalUrl, req.method, `Job ID: ${job.id} created by ${adminName} (${adminEmail})`, ip, userAgent,);

        // ส่ง response กลับไปเมื่อสร้างงานสำเร็จ
        res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        res.status(500).json({ message: "Error creating job", error: error.message });
    }
};


// ฟังก์ชันสำหรับดึงงานทั้งหมด
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await jobModel.getAllJobs();
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: 'ไม่พบงานในระบบ' });
        }

        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs", error: error.message });
    }
};

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = async (id) => {
    try {
        const job = await jobModel.getJobById(id); // ดึงงานจากฐานข้อมูลตาม ID

        if (!job) {
            throw new Error('Job not found'); // ถ้าไม่พบงาน ให้แสดงข้อผิดพลาด
        }

        return job;
    } catch (error) {
        console.error('Error fetching job by ID:', error);
        throw error; // โยนข้อผิดพลาดกลับไป
    }
};


// ฟังก์ชันสำหรับอัปเดตงาน
export const updateJob = async (req, res) => {
    const { id } = req.params;
    const { title, work_date, location, start_time, end_time, details, positions } = req.body;

    try {
        const updatedJob = await jobModel.updateJob(id, { title, work_date, location, start_time, end_time, details, positions });
        res.status(200).json({ message: "Job updated successfully", updatedJob });
    } catch (error) {
        res.status(500).json({ message: "Error updating job", error: error.message });
    }
};

// ฟังก์ชันสำหรับลบงาน
export const deleteJob = async (req, res) => {
    const { jobId } = req.params;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    const adminId = req.user.id;
    try {
        const jobIdInt = parseInt(jobId);
        if (isNaN(jobIdInt)) {
            return res.status(400).json({ message: 'Job ID ต้องเป็นตัวเลข' });
        }

        const job = await jobModel.findJobById(jobIdInt);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่ต้องการลบ' });
        }

        await jobModel.deleteJobById(jobIdInt);

        const admin = await adminModel.findAdminById(adminId);

        const adminName = `${admin.first_name} ${admin.last_name}`;
        const adminEmail = admin.email;
        await createLog(
            null,
            adminId,
            'Delete Job',
            `/api/jobs/${jobIdInt}`,
            'DELETE',
            `Job ID: ${jobIdInt} titled "${job.title}" deleted by Admin ${adminName} (${adminEmail})`,
            ip,
            userAgent
        );


        res.status(200).json({ message: 'ลบงานสำเร็จ', job });
    } catch (error) {
        res.status(500).json({ message: `เกิดข้อผิดพลาดในการลบงาน: ${error.message}` });
    }
};



// ฟังก์ชันสมัครงาน
export const applyForJob = async (req, res) => {
    const { jobId, jobPositionId } = req.body; // jobId และตำแหน่งงานที่ผู้ใช้สมัคร
    const userId = req.user.userId;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        if (!userId) {
            return res.status(400).json({ message: 'ไม่พบ userId กรุณาเข้าสู่ระบบใหม่' });
        }

        // ค้นหาผู้ใช้
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }

        // ตรวจสอบข้อมูลตำแหน่งงาน
        const jobPosition = await jobModel.findJobPositionById(jobPositionId);
        if (!jobPosition) {
            return res.status(404).json({ message: 'Job position not found' });
        }

        // ตรวจสอบว่าจำนวนคนที่ต้องการเหลือ 0 หรือไม่
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

        // ตรวจสอบการยืนยันอีเมลและการอนุมัติจากแอดมิน
        if (!user.email_verified) {
            return res.status(400).json({ message: 'กรุณายืนยันอีเมลก่อน' });
        }

        if (!user.approved) {
            return res.status(400).json({ message: 'บัญชีของคุณกำลังรอการอนุมัติจากแอดมิน' });
        }
        const userName = `${user.first_name} ${user.last_name}`;
        const userEmail = user.email;

        // สร้างการสมัครงานใหม่ในตำแหน่งที่เลือก
        const jobParticipation = await jobModel.createJobParticipation(userId, jobId, jobPositionId);
        // ดึงข้อมูลงานเพื่อดูว่าใครเป็นคนสร้างงาน
        const job = await jobModel.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        // ส่งการแจ้งเตือนไปยัง admin ที่สร้างงานนั้น
        const message = JSON.stringify({
            type: 'job_application',
            message: `มีการสมัครงานใหม่ในงาน ${job.title}`,
            jobId: job.id,
            userId: userId,
        });

        notifyUser(job.created_by, message);

        // บันทึกการแจ้งเตือนในฐานข้อมูล
        await prisma.notification.create({
            data: {
                message,
                type: 'job_application',
                adminId: job.created_by,
            },
        });
        await createLog(userId, null, 'Apply Job', '/api/jobs/apply', 'POST', `User ${userName} (${userEmail}) applied for job with ID: ${jobId}`, ip, userAgent);
        res.status(200).json({ message: 'สมัครงานสำเร็จ กรุณารอการอนุมัติจากแอดมินผู้สร้างงาน', jobParticipation });
    } catch (error) {
        await createLog(userId, null, 'Apply Job', '/api/jobs/apply', 'POST', `Error applying for job: ${error.message}`, ip, userAgent, 'ERROR');
        res.status(500).json({ message: `เกิดข้อผิดพลาด: ${error.message}` });
    }
};


export const approveJobParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
        const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
        const adminId = req.user.id;

        // const admin = await adminModel.findAdminById(adminId)

        // if (!admin) {
        //     console.log(`Admin with id ${adminId} not found`);
        //     throw new Error('Admin not found');
        // }
        // ตรวจสอบค่าที่จำเป็น
        if (!id || !status) {
            return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะ' });
        }

        const jobParticipationIdInt = parseInt(id, 10);

        // ดึงข้อมูลการสมัครงาน
        const jobParticipation = await jobModel.findJobParticipationById(jobParticipationIdInt, {
            include: {
                jobPosition: true, // ดึงข้อมูลตำแหน่งงานที่เกี่ยวข้อง
                user: true // ดึงข้อมูลผู้ใช้ที่เกี่ยวข้อง
            }
        });

        // ตรวจสอบว่าพบการสมัครงานหรือไม่
        if (!jobParticipation) {
            return res.status(404).json({ message: 'ไม่พบการสมัครงานในระบบ' });
        }

        const job = await getJobById(jobParticipation.jobId);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่เกี่ยวข้อง' });
        }

        // ตรวจสอบว่าแอดมินที่กำลังอนุมัติเป็นแอดมินผู้สร้างงานหรือไม่
        if (job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์อนุมัติการสมัครงานนี้' });
        }

        // ตรวจสอบว่าการสมัครงานนี้ได้รับการอนุมัติหรือปฏิเสธไปแล้วหรือไม่
        if (['approved', 'rejected'].includes(jobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการ ${jobParticipation.status} ไปแล้ว` });
        }

        // ตรวจสอบสถานะที่ส่งมาให้เป็น 'approved' หรือ 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Please use 'approved' or 'rejected'." });
        }

        // ค้นหาข้อมูลตำแหน่งงานที่สมัคร
        const { jobPosition, user } = jobParticipation;

        if (!jobPosition) {
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงานในระบบ' });
        }

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้สำหรับการสมัครงานนี้' });
        }

        // อัปเดตสถานะการสมัครงาน
        const updatedJobParticipation = await jobModel.updateJobParticipationStatus(jobParticipationIdInt, status);

        // ถ้าอนุมัติสำเร็จ ให้ลดจำนวนผู้เข้าร่วมงานที่เหลือลง
        let remainingSlots = jobPosition.required_people;
        if (status === 'approved') {
            remainingSlots -= 1;
            await jobModel.updateJobPositionRemainingSlots(jobPosition.id, remainingSlots);
        }
        const admin = await adminModel.findAdminById(adminId);
        if (!admin) {
            console.error(`Admin with id ${adminId} not found`);
            throw new Error('Admin not found');
        }
        // บันทึก log การอนุมัติการเข้าร่วมงาน พร้อมชื่อและอีเมลของผู้ใช้
        await createLog(user.id, adminId, 'Approve Job Participation', '/api/jobs/approve', 'PUT',
            `Job participation ID: ${jobParticipationIdInt} approved for ${user.first_name} ${user.last_name} (${user.email}). Status: ${status}.`, ip, userAgent);

        // ส่ง response กลับไปเมื่ออนุมัติสำเร็จ
        return res.status(200).json({
            message: `อัปเดตสถานะการสมัครงานสำเร็จ: ${status}`,
            details: {
                jobParticipation: updatedJobParticipation,
                jobPosition: {
                    position_name: jobPosition.position_name,
                    remaining_slots: remainingSlots // จำนวนคนที่เหลือหลังจากอนุมัติ
                }
            }
        });
    } catch (error) {
        // ตรวจสอบข้อผิดพลาดก่อนทำการอัปเดตสถานะ
        console.error('Error approving job participation:', error);
        return res.status(500).json({ message: `เกิดข้อผิดพลาดในการอนุมัติการสมัครงาน: ${error.message}` });
    }
};






// ฟังก์ชันอัปเดตสถานะการสมัครงานเมื่อเสร็จสิ้น
export const markJobAsCompleted = async (req, res) => {
    const { jobParticipationId, status } = req.body;

    // ตรวจสอบว่ามีการส่งค่า jobParticipationId หรือไม่
    if (!jobParticipationId || !status) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะ' });
    }
    try {
        // ดึงข้อมูลการสมัครงานปัจจุบัน
        const currentJobParticipation = await jobModel.findJobParticipationById(jobParticipationId);

        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }

        // ตรวจสอบว่ามีการอัปเดตสถานะเป็น successful, needs improvement, หรือ failed ไปแล้วหรือไม่
        if (['successful', 'needs improvement', 'failed'].includes(currentJobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการอัปเดตสถานะเป็น ${currentJobParticipation.status} แล้ว` });
        }
        // อัปเดตสถานะการสมัครงานเป็น 'successful'
        const updatedJobParticipation = await jobModel.updateJobParticipationStatus(jobParticipationId, status);

        // ดึง jobId จากการสมัครงานและข้อมูลผู้ใช้เพื่อใช้ใน log
        const jobId = updatedJobParticipation.jobPosition.job.id;
        const userName = `${updatedJobParticipation.user.first_name} ${updatedJobParticipation.user.last_name}`;
        const userEmail = updatedJobParticipation.user.email;
        const userId = req.user && req.user.role === 'user' ? req.user.id : null;
        const adminId = req.user && req.user.role === 'admin' ? req.user.id : null;
        // บันทึก log การอัปเดตสถานะ พร้อมชื่อและอีเมลผู้ใช้
        await createLog(
            userId, // ตรวจสอบว่ามี userId หรือไม่
            adminId, // ตรวจสอบว่ามี adminId หรือไม่
            'Update Job Status', // Action
            '/api/jobs/update-status', // request_url
            'PUT', // Method
            `Job ID: ${jobId} status updated to ${status} for user ${userName} (${userEmail})`, // รายละเอียด
            req.ip || 'Unknown IP', // IP address
            req.headers['user-agent'] || 'Unknown User Agent' // User agent
        );

        // ส่ง response กลับไปเมื่ออัปเดตสถานะสำเร็จ
        res.status(200).json({
            message: `อัปเดตสถานะการสมัครงานสำเร็จ: ${status}`,
            jobParticipation: updatedJobParticipation
        });
    } catch (error) {
        // จัดการกับข้อผิดพลาด
        res.status(500).json({ message: `เกิดข้อผิดพลาดในการอัปเดตสถานะงาน: ${error.message}` });
    }
};




