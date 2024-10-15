import { PrismaClient } from '@prisma/client';
import * as jobModel from '../models/jobModel.js';
import { createLog } from '../models/logModel.js';
const prisma = new PrismaClient();

// ฟังก์ชันสร้างงานใหม่ (สำหรับแอดมิน)
export const createJob = async (req, res) => {
    const { title, work_date, location, start_time, end_time, details, positions } = req.body;
    const adminId = req.user.id; // ดึง adminId จาก authMiddleware
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    try {
        // ดึงข้อมูลแอดมินจากตาราง admin
        const admin = await prisma.admin.findUnique({
            where: { id: adminId }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const adminName = `${admin.first_name} ${admin.last_name}`;
        const adminEmail = admin.email;
        // สร้างงานใหม่ผ่าน jobModel
        const job = await jobModel.createJob({ title, work_date, location, start_time, end_time, details, positions }, adminId);

        await createLog(adminId, 'Job created', req.originalUrl, req.method, `Job created by ${adminName} (${adminEmail})`, ip, userAgent);
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
        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs", error: error.message });
    }
};

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = async (req, res) => {
    const { id } = req.params;

    try {
        const job = await jobModel.getJobById(id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ job });
    } catch (error) {
        res.status(500).json({ message: "Error fetching job by ID", error: error.message });
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
    const { id } = req.params;

    try {
        await jobModel.deleteJob(id);
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting job", error: error.message });
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
        const user = await prisma.user.findUnique({ where: { id: userId } });  // ตรวจสอบว่า id ถูกต้อง
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }
        // ตรวจสอบข้อมูลตำแหน่งงาน
        const jobPosition = await prisma.jobPosition.findUnique({
            where: { id: jobPositionId }
        });

        if (!jobPosition) {
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงาน' });
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
        await createLog(userId, 'Apply Job', '/api/jobs/apply', 'POST', `User ${userName} (${userEmail}) applied for job with ID: ${jobId}`, ip, userAgent);
        res.status(200).json({ message: 'ส่งคำขอสมัครงานสำเร็จ', jobParticipation });

    } catch (error) {
        res.status(500).json({ message: `เกิดข้อผิดพลาด: ${error.message}` });
    }
};


// ฟังก์ชันการอนุมัติเข้าทำงาน
export const approveJobParticipation = async (req, res) => {
    const { jobParticipationId, status } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    if (!jobParticipationId || !status) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะ' });
    }

    try {
        // ค้นหาข้อมูลการสมัครงาน พร้อมกับดึงข้อมูลตำแหน่งงานและผู้ใช้
        const jobParticipation = await prisma.jobParticipation.findUnique({
            where: { id: jobParticipationId },
            include: {
                jobPosition: true,   // ดึงข้อมูลตำแหน่งงานที่สมัคร
                user: true           // ดึงข้อมูลผู้ใช้
            },
        });

        // ตรวจสอบว่าพบการสมัครงานหรือไม่
        if (!jobParticipation) {
            return res.status(404).json({ message: 'ไม่พบการสมัครงานในระบบ' });
        }

        // ตรวจสอบว่าการสมัครงานนี้ได้รับการอนุมัติไปแล้วหรือไม่
        if (jobParticipation.status === 'approved') {
            return res.status(400).json({ message: 'การสมัครงานนี้ได้รับการอนุมัติไปแล้ว' });
        }

        // ค้นหาข้อมูลตำแหน่งงานที่สมัคร
        const jobPosition = jobParticipation.jobPosition;
        if (!jobPosition) {
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงานในระบบ' });
        }

        // ตรวจสอบว่าข้อมูลผู้ใช้ถูกดึงมาได้หรือไม่
        const user = jobParticipation.user;
        if (!user) {
            return res.status(404).json({ message: "User not found for this job participation" });
        }

        const userName = `${user.first_name} ${user.last_name}`;
        const userEmail = user.email;

        // อัปเดตสถานะการสมัครงาน
        const updatedJobParticipation = await prisma.jobParticipation.update({
            where: { id: jobParticipationId },
            data: { status }
        });

        // ถ้าอนุมัติสำเร็จ ให้ลดจำนวนผู้เข้าร่วมงานที่เหลือลง
        let remainingSlots = jobPosition.required_people;
        if (status === 'approved') {
            remainingSlots = jobPosition.required_people - 1;
            await prisma.jobPosition.update({
                where: { id: jobPosition.id },
                data: { required_people: remainingSlots }
            });
        }
        // บันทึก log การอนุมัติการเข้าร่วมงาน พร้อมชื่อและอีเมลของผู้ใช้
        await createLog(req.user.id, 'Approve Job Participation', '/api/jobs/approve', 'PUT',
            `Job participation  ID: ${jobParticipationId} approved  ${userName} (${userEmail}). Status  ${status}.`, ip, userAgent);

        // ส่ง response กลับไปเมื่ออนุมัติสำเร็จ
        res.status(200).json({
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
        res.status(500).json({ message: `เกิดข้อผิดพลาดในการอนุมัติการสมัครงาน: ${error.message}` });
    }
};





// ฟังก์ชันอัปเดตสถานะการสมัครงานเมื่อเสร็จสิ้น
export const markJobAsCompleted = async (req, res) => {
    const { jobParticipationId } = req.body;

    // ตรวจสอบว่ามีการส่งค่า jobParticipationId หรือไม่
    if (!jobParticipationId) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID' });
    }

    try {
        // ดึงข้อมูลการสมัครงานปัจจุบัน
        const currentJobParticipation = await prisma.jobParticipation.findUnique({
            where: { id: jobParticipationId },
            include: {
                jobPosition: { include: { job: true } },  // ดึงข้อมูล Job ผ่าน JobPosition
                user: true  // ดึงข้อมูลผู้ใช้
            }
        });

        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }

        // ตรวจสอบสถานะปัจจุบัน
        if (currentJobParticipation.status === 'successful') {
            return res.status(400).json({ message: 'การสมัครงานนี้ได้รับการอัปเดตสถานะเป็น successful แล้ว' });
        }

        // อัปเดตสถานะการสมัครงานเป็น 'successful'
        const updatedJobParticipation = await prisma.jobParticipation.update({
            where: { id: jobParticipationId },
            data: { status: 'successful' },
            include: {
                jobPosition: { include: { job: true } },  // ดึงข้อมูล Job ผ่าน JobPosition
                user: true  // ดึงข้อมูลผู้ใช้
            }
        });

        // ดึง jobId จากการสมัครงานและข้อมูลผู้ใช้เพื่อใช้ใน log
        const jobId = updatedJobParticipation.jobPosition.job.id;
        const userName = `${updatedJobParticipation.user.first_name} ${updatedJobParticipation.user.last_name}`;
        const userEmail = updatedJobParticipation.user.email;

        // บันทึก log การอัปเดตสถานะ พร้อมชื่อและอีเมลผู้ใช้
        await createLog(req.user.id, 'Update Job Status', '/api/jobs/update-status', 'PUT',
            `Job ID: ${jobId} status updated to successful for user ${userName} (${userEmail})`,
            req.ip || 'Unknown IP', req.headers['user-agent'] || 'Unknown User Agent');

        // ส่ง response กลับไปเมื่ออัปเดตสถานะสำเร็จ
        res.status(200).json({
            message: 'อัปเดตสถานะการสมัครงานสำเร็จ',
            jobParticipation: updatedJobParticipation
        });
    } catch (error) {
        // จัดการกับข้อผิดพลาด
        res.status(500).json({ message: `เกิดข้อผิดพลาดในการอัปเดตสถานะงาน: ${error.message}` });
    }
};




export const getUserHistory = async (req, res) => {
    const { userId } = req.params; // รับ userId จาก request parameters

    try {
        const jobHistory = await jobModel.getUserJobHistory(userId);

        if (jobHistory.length === 0) {
            return res.status(404).json({ message: "No job history found for this user." });
        }

        res.status(200).json(jobHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
