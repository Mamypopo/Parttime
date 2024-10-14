import { PrismaClient } from '@prisma/client';
import { createJob as createJobModel } from '../models/jobModel.js';
import {
    updateJobParticipationStatus, createJobParticipation, getUserJobHistory,
    countApprovedParticipants,
    updateJobRequiredPeople,
    findExistingJobParticipation, findExistingDayApplication,
    updateJobParticipationStatusAfterJob
} from '../models/jobModel.js'
import jwt from 'jsonwebtoken'; // เพิ่มบรรทัดนี้เพื่อ import jwt

const prisma = new PrismaClient();

// ฟังก์ชันสร้างงานใหม่ (สำหรับแอดมิน)
export const createJob = async (req, res) => {
    const { title, position, work_date, location, start_time, end_time, wage, required_people, details } = req.body;

    try {
        // ดึง token จาก Authorization headers
        const token = req.headers.authorization.split(' ')[1];

        // ตรวจสอบและถอดรหัส JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ดึง id ของแอดมินที่สร้างงานจาก decoded token
        const adminId = decoded.id;

        // สร้างงานใหม่ในฐานข้อมูล
        const job = await prisma.job.create({
            data: {
                title,
                position,
                work_date: new Date(work_date),
                location,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                wage: parseFloat(wage),
                required_people: parseInt(required_people),
                details: details,
                created_by: adminId  // บันทึก id ของแอดมินที่สร้างงาน
            }
        });

        res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        res.status(500).json({ message: "Error creating job", error: error.message });
    }
};

// ฟังก์ชันดึงรายการงานทั้งหมด
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving jobs', error: error.message });
    }
};


// ฟังก์ชันสมัครงาน
export const applyForJob = async (req, res) => {
    const { userId, jobId } = req.body;

    try {
        // ค้นหาผู้ใช้
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // ตรวจสอบว่ามีการสมัครงานนี้แล้วหรือไม่
        const existingApplication = await findExistingJobParticipation(userId, jobId);
        if (existingApplication) {
            return res.status(400).json({ message: 'คุณได้สมัครงานนี้แล้ว' });
        }

        // ตรวจสอบการสมัครงานในวันเดียวกัน
        const existingDayApplication = await findExistingDayApplication(userId);
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

        // สร้างการสมัครงานใหม่
        const jobParticipation = await createJobParticipation(userId, jobId);
        res.status(200).json({ message: 'ส่งคำขอสมัครงานสำเร็จ', jobParticipation });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ฟังชั่นการอนุมัติเข้าทำงาน
export const approveJobParticipation = async (req, res) => {
    const { jobParticipationId, status } = req.body;

    if (!jobParticipationId || !status) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะ' });
    }

    try {
        // ตรวจสอบการสมัครงานในระบบ
        const jobParticipation = await updateJobParticipationStatus(jobParticipationId, status);

        if (!jobParticipation) {
            return res.status(404).json({ message: 'ไม่พบการสมัครงานนี้ในระบบ' });
        }

        // ตรวจสอบว่าการสมัครงานนี้ถูกอนุมัติไปแล้วหรือไม่
        if (jobParticipation.status === 'approved') {
            return res.status(400).json({ message: 'การสมัครงานนี้ได้รับการอนุมัติไปแล้ว' });
        }

        const job = jobParticipation.job;

        // ตรวจสอบว่าจำนวนผู้เข้าร่วมงานครบหรือยัง
        const approvedCount = await countApprovedParticipants(job.id);
        if (status === 'approved' && approvedCount >= job.required_people) {
            return res.status(400).json({ message: 'การสมัครงานนี้เต็มแล้ว' });
        }

        // อัปเดตสถานะการสมัครงาน
        const updatedJobParticipation = await prisma.jobParticipation.update({
            where: { id: jobParticipationId },
            data: { status },
        });

        // ถ้าอนุมัติสำเร็จ ให้ลดจำนวนผู้เข้าร่วมงานที่เหลือลง
        if (status === 'approved') {
            await updateJobRequiredPeople(job.id, job.required_people - 1);
        }

        res.status(200).json({ message: 'อัปเดตการสมัครงานสำเร็จ', updatedJobParticipation });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอนุมัติการสมัครงาน', error: error.message });
    }
};


// ฟังชั่นการอัพเดทสถานะหลังจากจบงาน
export const updateJobStatus = async (req, res) => {
    const { jobParticipationId, status } = req.body;

    if (!jobParticipationId || !status) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะ' });
    }

    try {
        // อัปเดตสถานะของการทำงานหลังจบงาน
        const updatedJobParticipation = await updateJobParticipationStatusAfterJob(jobParticipationId, status);

        res.status(200).json({ message: 'อัปเดตสถานะสำเร็จ', updatedJobParticipation });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะงาน', error: error.message });
    }
};


export const getUserHistory = async (req, res) => {
    const { userId } = req.params; // รับ userId จาก request parameters

    try {
        const jobHistory = await getUserJobHistory(userId);

        if (jobHistory.length === 0) {
            return res.status(404).json({ message: "No job history found for this user." });
        }

        res.status(200).json(jobHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
