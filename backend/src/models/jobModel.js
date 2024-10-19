import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับสร้างงานใหม่
export const createJob = async (jobData, adminId) => {
    const { title, work_date, location, start_time, end_time, details, positions } = jobData;

    return prisma.job.create({
        data: {
            title,
            work_date: new Date(work_date),
            location,
            start_time: new Date(start_time),
            end_time: new Date(end_time),
            details,
            created_by: adminId,
            JobPositions: {
                create: positions.map(({ name, wage, details, required_people }) => ({
                    position_name: name,
                    wage,
                    details,
                    required_people
                }))
            }
        },
        include: { JobPositions: true }
    });
};


// // ฟังก์ชันสำหรับดึงงานทั้งหมด
// export const getAllJobs = () =>
//     prisma.job.findMany({
//         include: { JobPositions: true }
//     });

// ฟังก์ชันสำหรับดึงงานทั้งหมด
export const getAllJobs = async (page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    return prisma.job.findMany({
        skip,
        take: pageSize,
        select: {
            id: true,
            title: true,
            work_date: true,
            location: true,
            start_time: true,
            end_time: true,
            completed: true,
            JobPositions: {
                select: {
                    id: true,
                    position_name: true,
                    wage: true,
                    required_people: true,
                    status: true
                }
            }
        },
        orderBy: { work_date: 'desc' }
    });
};


// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = (jobId) =>
    prisma.job.findUnique({
        where: { id: jobId },
        include: {
            JobPositions: true,
            creator: true
        }
    });


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

        // ดึงข้อมูลงานที่อัปเดตแล้วพร้อมตำแหน่งงาน
        const updatedJob = await prisma.job.findUnique({
            where: { id: jobId },
            include: { JobPositions: true }
        });

        return updatedJob;
    } catch (error) {
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตงาน: ' + error.message);
    }
};




// export const findJobById = (jobId) =>
//     prisma.job.findUnique({ where: { id: jobId } });


// ฟังก์ชันสำหรับลบงาน
export const deleteJobById = (jobId) =>
    prisma.$transaction([
        prisma.jobParticipation.deleteMany({ where: { jobPosition: { job_id: jobId } } }),
        prisma.jobPosition.deleteMany({ where: { job_id: jobId } }),
        prisma.job.delete({ where: { id: jobId } })
    ]);


// ฟังก์ชันสำหรับการบันทึกการสมัครงาน
export const createJobParticipation = (userId, jobId, jobPositionId) =>
    prisma.jobParticipation.create({
        data: {
            user_id: userId,
            jobId,
            job_position_id: jobPositionId,
            status: 'pending',
            created_at: new Date()
        }
    });

// ฟังก์ชันตรวจสอบการสมัครงานที่มีอยู่แล้ว
export const findExistingJobParticipation = (userId, jobId, jobPositionId) =>
    prisma.jobParticipation.findFirst({
        where: { user_id: userId, jobId, job_position_id: jobPositionId }
    });


// ฟังก์ชันตรวจสอบการสมัครงานที่เกิดในวันเดียวกัน
export const findExistingDayApplication = (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.jobParticipation.findFirst({
        where: {
            user_id: userId,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });
};

export const updateJobParticipationStatus = (jobParticipationId, status) =>
    prisma.jobParticipation.update({
        where: { id: jobParticipationId },
        data: { status },
        include: {
            jobPosition: { include: { job: true } },
            user: true
        }
    });


// ฟังก์ชันเพื่อค้นหา Job Participation ตาม ID
export const findJobParticipationById = (jobParticipationId) =>
    prisma.jobParticipation.findUnique({
        where: { id: jobParticipationId },
        include: {
            jobPosition: true,
            user: true
        }
    });

// ฟังก์ชันเพื่ออัปเดตจำนวนคนที่เหลือใน JobPosition พร้อมอัปเดตสถานะ
export const decreaseJobPositionSlots = (jobPositionId, remainingSlots) =>
    prisma.jobPosition.update({
        where: { id: jobPositionId },
        data: {
            required_people: remainingSlots,
            status: remainingSlots === 0 ? 'closed' : 'open'
        }
    });

// ดึงข้อมูลตำแหน่งงานตาม JobPositionId พร้อมข้อมูลงานที่เกี่ยวข้อง
export const findJobPositionById = (jobPositionId) =>
    prisma.jobPosition.findUnique({
        where: { id: jobPositionId },
        include: { job: true }
    });