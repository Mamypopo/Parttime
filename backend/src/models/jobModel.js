import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับสร้างงานใหม่
export const createJob = async (jobData, adminId) => {
    const { title, work_date, location, start_time, end_time, details, positions } = jobData;

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
};

// ฟังก์ชันสำหรับดึงงานทั้งหมด
export const getAllJobs = async () => {
    return await prisma.job.findMany({
        include: {
            JobPositions: true // ดึงข้อมูลตำแหน่งงานที่เชื่อมโยงกับแต่ละงาน
        }
    });
};

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = async (jobId) => {
    return await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            JobPositions: true // ดึงข้อมูลตำแหน่งงานที่เชื่อมโยงกับงานนี้
        }
    });
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



export const findJobById = async (jobId) => {
    return await prisma.job.findUnique({
        where: { id: jobId }
    });
};

// ฟังก์ชันสำหรับลบงาน
export const deleteJobById = async (jobId) => {
    // ลบ JobParticipation ที่เกี่ยวข้องกับงานนี้ก่อน
    await prisma.jobParticipation.deleteMany({
        where: { jobPosition: { job_id: jobId } }
    });

    // ลบ JobPosition ที่เกี่ยวข้องกับงานนี้
    await prisma.jobPosition.deleteMany({
        where: { job_id: jobId }
    });

    // ลบงานจากตาราง Job
    return await prisma.job.delete({
        where: { id: jobId }
    });
};

// ฟังก์ชันสำหรับการบันทึกการสมัครงาน
export const createJobParticipation = async (userId, jobId, jobPositionId) => {
    return prisma.jobParticipation.create({
        data: {
            user_id: userId,
            jobId: jobId,
            job_position_id: jobPositionId, // บันทึกตำแหน่งงานที่สมัคร
            status: 'pending',
            created_at: new Date()
        }
    });
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




// // ฟังก์ชันอัปเดตสถานะการสมัครงาน
// export const updateJobParticipationStatus = async (jobParticipationId, status) => {
//     try {
//         return await prisma.jobParticipation.update({
//             where: { id: jobParticipationId },
//             data: { status },
//         });
//     } catch (error) {
//         throw new Error('Error updating job participation status: ' + error.message);
//     }
// };

export const updateJobParticipationStatus = async (jobParticipationId, status) => {
    return prisma.jobParticipation.update({
        where: { id: jobParticipationId },
        data: { status },
        include: {
            jobPosition: { include: { job: true } },  // ดึงข้อมูล Job ผ่าน JobPosition
            user: true  // ดึงข้อมูลผู้ใช้
        }
    });
};
// ฟังก์ชันเพื่อค้นหา Job Participation ตาม ID
export const findJobParticipationById = async (jobParticipationId) => {
    return prisma.jobParticipation.findUnique({
        where: { id: jobParticipationId },
        include: {
            jobPosition: true,   // ดึงข้อมูลตำแหน่งงานที่สมัคร
            user: true           // ดึงข้อมูลผู้ใช้
        }
    });
};


// ฟังก์ชันเพื่ออัปเดตจำนวนคนที่เหลือใน JobPosition พร้อมอัปเดตสถานะ
export const updateJobPositionRemainingSlots = async (jobPositionId, remainingSlots) => {
    return prisma.jobPosition.update({
        where: { id: jobPositionId },
        data: {
            required_people: remainingSlots,
            status: remainingSlots === 0 ? 'closed' : 'open' // ปิดตำแหน่งถ้าจำนวนคนเหลือ 0
        }
    });
};

// ฟังก์ชันดึงข้อมูลตำแหน่งงานตาม jobPositionId
export const findJobPositionById = async (jobPositionId) => {
    return prisma.jobPosition.findUnique({
        where: { id: jobPositionId }
    });
};