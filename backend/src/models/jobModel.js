import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับสร้างงานใหม่
export const createJob = async (jobData, adminId) => {
    const { title, work_date, location, start_time, end_time, details, positions } = jobData;
    try {
        // สร้างงานในตาราง Job
        const job = await prisma.job.create({
            data: {
                title,
                work_date: new Date(work_date),
                location,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                details,
                created_by: adminId // ใช้ adminId ที่ได้จาก authMiddleware
            }
        });

        // สร้างตำแหน่งงานในตาราง JobPosition
        const jobPositions = positions.map(position => ({
            position_name: position.name,
            wage: position.wage,
            details: position.details,
            required_people: position.required_people,
            job_id: job.id
        }));

        await prisma.jobPosition.createMany({
            data: jobPositions
        });

        return job;
    } catch (error) {
        throw new Error('Error creating job: ' + error.message);
    }
};

// ฟังก์ชันสำหรับดึงงานทั้งหมด
export const getAllJobs = async () => {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                JobPositions: true // ดึงข้อมูลตำแหน่งงานที่เชื่อมโยงกับแต่ละงาน
            }
        });
        return jobs;
    } catch (error) {
        throw new Error('Error fetching jobs: ' + error.message);
    }
};

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = async (jobId) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                JobPositions: true // ดึงข้อมูลตำแหน่งงานที่เชื่อมโยงกับงานนี้
            }
        });
        return job;
    } catch (error) {
        throw new Error('Error fetching job by ID: ' + error.message);
    }
};
// ฟังก์ชันสำหรับอัปเดตงาน
export const updateJob = async (jobId, jobData) => {
    const { title, work_date, location, start_time, end_time, details, positions } = jobData;
    try {
        // อัปเดตข้อมูลงาน
        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                work_date: new Date(work_date),
                location,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                details
            }
        });

        // ลบตำแหน่งงานเก่าแล้วเพิ่มใหม่
        await prisma.jobPosition.deleteMany({
            where: { job_id: jobId }
        });

        const jobPositions = positions.map(position => ({
            position_name: position.name,
            wage: position.wage,
            details: position.details,
            required_people: position.required_people,
            job_id: job.id
        }));

        await prisma.jobPosition.createMany({
            data: jobPositions
        });

        return job;
    } catch (error) {
        throw new Error('Error updating job: ' + error.message);
    }
};

// ฟังก์ชันสำหรับลบงาน
export const deleteJob = async (jobId) => {
    try {
        await prisma.jobPosition.deleteMany({
            where: { job_id: jobId }
        });
        await prisma.job.delete({
            where: { id: jobId }
        });
    } catch (error) {
        throw new Error('Error deleting job: ' + error.message);
    }
};

/// ขั้นตอนการสมัครงาน
// ฟังก์ชันสำหรับการบันทึกการสมัครงาน
export const createJobParticipation = async (userId, jobId, jobPositionId) => {
    try {
        const jobParticipation = await prisma.jobParticipation.create({
            data: {
                user_id: userId,
                jobId: jobId,
                job_position_id: jobPositionId, // บันทึกตำแหน่งงานที่สมัคร
                status: 'pending',
                created_at: new Date()
            }
        });
        return jobParticipation;
    } catch (error) {
        throw new Error('Error creating job participation: ' + error.message);
    }
};

// ฟังก์ชันตรวจสอบการสมัครงานที่มีอยู่แล้ว
export const findExistingJobParticipation = async (userId, jobId, jobPositionId) => {
    return await prisma.jobParticipation.findFirst({
        where: {
            user_id: userId,
            jobId: jobId,
            job_position_id: jobPositionId
        },
    });
};

// ฟังก์ชันตรวจสอบการสมัครงานที่เกิดในวันเดียวกัน
export const findExistingDayApplication = async (userId) => {
    const today = new Date();
    return await prisma.jobParticipation.findFirst({
        where: {
            user_id: userId,
            created_at: {
                gte: new Date(today.setHours(0, 0, 0, 0)),
                lt: new Date(today.setHours(23, 59, 59, 999)),
            },
        },
    });
};

//จบขั้นตอนการสมัครงาน



// ฟังก์ชันอัปเดตสถานะการสมัครงาน
export const updateJobParticipationStatus = async (jobParticipationId, status) => {
    try {
        return await prisma.jobParticipation.update({
            where: { id: jobParticipationId },
            data: { status },
        });
    } catch (error) {
        throw new Error('Error updating job participation status: ' + error.message);
    }
};


// ฟังก์ชันอัปเดตจำนวนคนที่เหลือใน JobPosition
export const updateJobRequiredPeople = async (jobPositionId, requiredPeople) => {
    try {
        // อัปเดตจำนวนคนที่เหลือในตำแหน่งงาน
        await prisma.jobPosition.update({
            where: { id: jobPositionId },
            data: {
                required_people: requiredPeople,
                status: requiredPeople === 0 ? 'closed' : 'open', // ปิดตำแหน่งถ้าจำนวนคนเหลือ 0
            },
        });
    } catch (error) {
        throw new Error('Error updating job required people: ' + error.message);
    }
};
//ดึงประวัติงานทั้งหมดของ user
export const getUserJobHistory = async (userId) => {
    try {
        const jobHistory = await prisma.jobParticipation.findMany({
            where: {
                user_id: parseInt(userId)
            },
            select: {
                status: true,
                created_at: true,
                updated_at: true,
                jobPosition: {
                    select: {
                        position_name: true,
                        wage: true,
                        job: { // ดึงข้อมูลงานผ่าน jobPosition
                            select: {
                                title: true,
                                location: true,
                                work_date: true
                            }
                        }
                    }
                }
            }
        });
        return jobHistory;
    } catch (error) {
        throw new Error('Error retrieving job history: ' + error.message);
    }
};
