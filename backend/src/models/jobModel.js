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


// // ฟังก์ชันสำหรับดึงงานตาม ID
// export const getJobById = (jobId) =>
//     prisma.job.findUnique({
//         where: { id: jobId },
//         include: {
//             JobPositions: true,
//             creator: true
//         }
//     });

export const getJobByIdforUpdate = (jobId) =>
    prisma.job.findUnique({
        where: { id: jobId },
        include: {
            JobPositions: true,
            creator: {
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true
                }
            }
        }
    });

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = (jobId) =>
    prisma.job.findUnique({
        where: { id: jobId },
        include: {
            JobPositions: {
                select: {
                    position_name: true,
                    required_people: true
                }
            },
            creator: {
                select: {
                    id: true
                }
            }
        }
    });

// ฟังก์ชันสำหรับอัปเดตงาน
export const updateJobMain = (jobId, jobData) =>
    prisma.job.update({
        where: { id: jobId },
        data: {
            title: jobData.title,
            work_date: new Date(jobData.work_date),
            location: jobData.location,
            start_time: new Date(jobData.start_time),
            end_time: new Date(jobData.end_time),
            details: jobData.details
        },
        include: {
            JobPositions: true
        }
    });

export const updateJobPosition = (positionId, positionData) =>
    prisma.jobPosition.update({
        where: { id: positionId },
        data: {
            position_name: positionData.name,
            wage: positionData.wage,
            details: positionData.details,
            required_people: positionData.required_people
        }
    });

export const createJobPosition = (jobId, positionData) =>
    prisma.jobPosition.create({
        data: {
            job_id: parseInt(jobId),
            position_name: positionData.name,
            wage: parseInt(positionData.wage),
            details: positionData.details,
            required_people: parseInt(positionData.required_people)
        }
    });

export const deleteJobPosition = (positionId) =>
    prisma.jobPosition.delete({
        where: { id: positionId }
    });

export const getJobParticipations = (positionId) =>
    prisma.jobParticipation.findMany({
        where: { job_position_id: positionId }
    });

export const getJobApplicants = async (jobId) => {
    const applicants = await prisma.jobParticipation.findMany({
        where: {
            jobPosition: {
                job_id: parseInt(jobId)
            }
        },
        select: {
            user_id: true
        },
        distinct: ['user_id']
    });
    return applicants.map(a => ({ id: a.user_id }));
};

// ฟังก์ชันสำหรับลบงาน
export const deleteJobById = (jobId) =>
    prisma.$transaction([
        prisma.jobParticipation.deleteMany({ where: { jobPosition: { job_id: jobId } } }),
        prisma.jobPosition.deleteMany({ where: { job_id: jobId } }),
        prisma.job.delete({ where: { id: jobId } })
    ]);


// ฟังก์ชันสำหรับการบันทึกการสมัครงาน
export const createJobParticipation = async (userId, jobId, jobPositionId) => {
    // ตรวจสอบ skills ก่อน
    const hasMatchingSkills = await checkUserSkillsMatch(userId, jobPositionId);

    if (!hasMatchingSkills) {
        throw new Error('คุณไม่มีทักษะที่จำเป็นสำหรับตำแหน่งงานนี้');
    }

    return prisma.jobParticipation.create({
        data: {
            user_id: userId,
            jobId,
            job_position_id: jobPositionId,
            status: 'pending',
            created_at: new Date()
        }
    });
};

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


export const checkUserSkillsMatch = async (userId, jobPositionId) => {
    // ดึงข้อมูล skills ของผู้ใช้
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true }
    });

    // ดึงข้อมูลตำแหน่งงาน
    const jobPosition = await prisma.jobPosition.findUnique({
        where: { id: jobPositionId },
        select: { position_name: true }
    });

    if (!jobPosition || !jobPosition.required_skills || jobPosition.required_skills.length === 0) {
        return true; // ถ้าตำแหน่งงานไม่ได้ระบุ skills ที่ต้องการ ให้ผ่าน
    }

    if (!user || !user.skills || user.skills.length === 0) {
        return false; // ถ้าผู้ใช้ไม่มี skills
    }

    const userSkills = user.skills.map(skill => skill.toLowerCase());
    const positionName = jobPosition.position_name.toLowerCase();
    // ตรวจสอบว่าผู้ใช้มี skills ที่จำเป็นทั้งหมดหรือไม่
    return userSkills.some(skill => positionName.includes(skill));
};
