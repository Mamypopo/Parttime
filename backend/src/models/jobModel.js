import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันสร้างงานใหม่
export const createJob = async (jobData) => {
    try {
        const newJob = await prisma.job.create({
            data: jobData
        });
        return newJob;
    } catch (error) {
        throw new Error("Error creating job: " + error.message);
    }
};


// ดึงข้อมูลงานทั้งหมด
export const getAllJobs = async () => {
    try {
        const jobs = await prisma.job.findMany();
        return jobs;
    } catch (error) {
        throw new Error("Error retrieving jobs: " + error.message);
    }
};

// สมัครงาน
export const applyForJob = async (userId, jobId) => {
    try {
        const jobParticipation = await prisma.jobParticipation.create({
            data: {
                user_id: userId,
                job_id: jobId,
                status: 'pending'
            }
        });
        return jobParticipation;
    } catch (error) {
        throw new Error("Error applying for job: " + error.message);
    }
};

/// ขั้นตอนการสมัครงาน
// ฟังก์ชันสำหรับการบันทึกการสมัครงาน
export const createJobParticipation = async (userId, jobId) => {
    try {
        const jobParticipation = await prisma.jobParticipation.create({
            data: {
                user_id: userId,
                job_id: jobId,
                status: 'pending'
            }
        });
        return jobParticipation;
    } catch (error) {
        throw new Error('Error creating job participation: ' + error.message);
    }
};

// ฟังก์ชันตรวจสอบการสมัครงานที่มีอยู่แล้ว
export const findExistingJobParticipation = async (userId, jobId) => {
    return await prisma.jobParticipation.findFirst({
        where: {
            user_id: userId,
            job_id: jobId,
        },
    });
};

// ฟังก์ชันตรวจสอบการสมัครงานที่เกิดในวันเดียวกัน
export const findExistingDayApplication = async (userId) => {
    const today = new Date();
    return await prisma.jobParticipation.findFirst({
        where: {
            user_id: userId,
            job: {
                work_date: today,
            },
        },
    });
};

//จบขั้นตอนการสมัครงาน



// ฟังก์ชันสำหรับการอัปเดตสถานะการทำงานหลัวจากจบงาน
export const updateJobParticipationStatusAfterJob = async (jobParticipationId, status) => {
    return await prisma.jobParticipation.update({
        where: { id: jobParticipationId },
        data: { status }
    });
};



// ฟังก์ชันเพื่ออัปเดตสถานะการสมัครงาน
export const updateJobParticipationStatus = async (jobParticipationId, status) => {
    const jobParticipation = await prisma.jobParticipation.findUnique({
        where: { id: jobParticipationId },
        include: { job: true },
    });
    return jobParticipation;
};

// ฟังก์ชันเพื่อตรวจสอบจำนวนผู้เข้าร่วมงานที่อนุมัติแล้ว
export const countApprovedParticipants = async (jobId) => {
    const approvedCount = await prisma.jobParticipation.count({
        where: {
            job_id: jobId,
            status: 'approved',
        },
    });
    return approvedCount;
};

// ฟังก์ชันเพื่ออัปเดตจำนวนคนที่ต้องการในงาน
export const updateJobRequiredPeople = async (jobId, requiredPeople) => {
    const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: { required_people: requiredPeople },
    });
    return updatedJob;
};

//ดึงประวัติงานทั้งหมดของ user
export const getUserJobHistory = async (userId) => {
    try {
        const jobHistory = await prisma.jobParticipation.findMany({
            where: {
                user_id: parseInt(userId)
            },
            select: {
                status: true, // สถานะการสมัครงาน
                job: {  // ดึงข้อมูลงานที่เคยสมัคร
                    select: {
                        title: true,
                        position: true,
                        work_date: true,
                        location: true
                    }
                }
            }
        });
        return jobHistory;
    } catch (error) {
        throw new Error('Error retrieving job history: ' + error.message);
    }
};
