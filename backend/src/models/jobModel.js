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

export const getAllJobs = async (page = 1, pageSize = 20, filters = {}) => {
    const skip = (page - 1) * pageSize;

    // สร้าง where clause สำหรับ filters
    const where = {
        AND: []
    };
    if (filters.id) {
        where.AND.push({
            id: parseInt(filters.id)
        });
    }
    if (filters.title) {
        where.AND.push({
            title: { contains: filters.title, mode: 'insensitive' }
        });
    }

    if (filters.location) {
        where.AND.push({
            location: { contains: filters.location, mode: 'insensitive' }
        });
    }

    if (filters.dateFrom || filters.dateTo) {
        where.AND.push({
            work_date: {
                gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                lte: filters.dateTo ? new Date(filters.dateTo) : undefined
            }
        });
    }

    if (filters.status !== undefined) {
        where.AND.push({
            completed: filters.status === 'completed'
        });
    }

    if (filters.position) {
        where.AND.push({
            JobPositions: {
                some: {
                    position_name: { contains: filters.position, mode: 'insensitive' }
                }
            }
        });
    }

    if (filters.minWage || filters.maxWage) {
        where.AND.push({
            JobPositions: {
                some: {
                    wage: {
                        gte: filters.minWage || 0,
                        lte: filters.maxWage || 999999
                    }
                }
            }
        });
    }

    return prisma.job.findMany({
        skip,
        take: pageSize,
        where: where.AND.length > 0 ? where : undefined,
        select: {
            id: true,
            title: true,
            work_date: true,
            location: true,
            start_time: true,
            end_time: true,
            completed: true,
            details: true,
            created_by: true,
            created_at: true,
            creator: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true
                }
            },
            JobPositions: {
                select: {
                    id: true,
                    position_name: true,
                    wage: true,
                    details: true,
                    required_people: true,
                    status: true
                }
            }
        },
        orderBy: [
            { created_at: 'desc' },
            { work_date: 'desc' }
        ]
    });
};

// เพิ่มฟังก์ชันสำหรับนับจำนวนงานทั้งหมดที่ตรงกับ filters
export const getJobsCount = async (filters = {}) => {
    const where = {};

    // เพิ่มเงื่อนไขการค้นหาตาม filters
    if (filters.id) {
        where.id = parseInt(filters.id);
    }

    if (filters.title) {
        where.title = {
            contains: filters.title,
            mode: 'insensitive'
        };
    }

    if (filters.work_date) {
        where.work_date = filters.work_date;
    }

    if (filters.location) {
        where.location = {
            contains: filters.location,
            mode: 'insensitive'
        };
    }

    if (filters.start_time) {
        where.start_time = filters.start_time;
    }

    if (filters.end_time) {
        where.end_time = filters.end_time;
    }

    if (filters.completed !== undefined) {
        where.completed = filters.completed;
    }

    // ค้นหาใน JobPositions
    if (filters.position_name || filters.wage || filters.required_people || filters.status) {
        where.JobPositions = {
            some: {} // ใช้ some เพื่อค้นหาใน relation
        };

        if (filters.position_name) {
            where.JobPositions.some.position_name = {
                contains: filters.position_name,
                mode: 'insensitive'
            };
        }

        if (filters.wage) {
            where.JobPositions.some.wage = filters.wage;
        }

        if (filters.required_people) {
            where.JobPositions.some.required_people = filters.required_people;
        }

        if (filters.status) {
            where.JobPositions.some.status = filters.status;
        }
    }

    return prisma.job.count({ where });
};


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
            JobParticipation: {
                where: {
                    status: 'approved'
                },
                select: {
                    id: true,
                    created_at: true,
                    jobPositionId: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                            profile_image: true,
                            skills: true
                        }
                    },
                    jobPosition: {
                        select: {
                            id: true,
                            position_name: true,
                            wage: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            },
            creator: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true
                }
            },

            JobParticipation: {
                where: {
                    status: 'approved'
                },
                select: {
                    id: true,
                    created_at: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                            skills: true
                        }
                    },
                    jobPosition: {
                        select: {
                            id: true,
                            position_name: true,
                            required_people: true,
                            wage: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            }
        }
    });


// ฟังก์ชันดึงงานที่แอดมินสร้าง
export const getMyCreatedJobs = async (page = 1, pageSize = 10, filters = {}) => {
    const skip = (page - 1) * pageSize;

    // สร้าง where clause สำหรับ filters
    const where = {
        AND: [
            { created_by: filters.createdBy } // filter ตาม adminId
        ]
    };

    if (filters.title) {
        where.AND.push({
            title: { contains: filters.title, mode: 'insensitive' }
        });
    }

    if (filters.location) {
        where.AND.push({
            location: { contains: filters.location, mode: 'insensitive' }
        });
    }

    if (filters.dateFrom || filters.dateTo) {
        where.AND.push({
            work_date: {
                gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                lte: filters.dateTo ? new Date(filters.dateTo) : undefined
            }
        });
    }

    if (filters.status !== undefined) {
        where.AND.push({
            completed: filters.status === 'completed'
        });
    }

    if (filters.position) {
        where.AND.push({
            JobPositions: {
                some: {
                    position_name: { contains: filters.position, mode: 'insensitive' }
                }
            }
        });
    }

    if (filters.minWage || filters.maxWage) {
        where.AND.push({
            JobPositions: {
                some: {
                    wage: {
                        gte: filters.minWage || 0,
                        lte: filters.maxWage || 999999
                    }
                }
            }
        });
    }

    return prisma.job.findMany({
        skip,
        take: pageSize,
        where,
        select: {
            id: true,
            title: true,
            work_date: true,
            location: true,
            start_time: true,
            end_time: true,
            completed: true,
            details: true,
            created_by: true,
            created_at: true,
            JobPositions: {
                select: {
                    id: true,
                    position_name: true,
                    wage: true,
                    details: true,
                    required_people: true,
                    status: true,
                }
            },
            // แยก JobParticipation ออกมาเป็น field แยก
            JobParticipation: {
                where: {
                    status: 'approved'  // ดึงเฉพาะที่อนุมัติแล้ว
                },
                select: {
                    id: true,
                    status: true,
                    job_position_id: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            profile_image: true  // เพิ่ม profile_image
                        }
                    }
                }
            }
        },
        orderBy: [
            { created_at: 'desc' },
            { work_date: 'desc' }
        ]
    });
};

// ฟังก์ชันนับจำนวนงานที่แอดมินสร้าง
export const getMyCreatedJobsCount = async (adminId, filters = {}) => {
    const where = {
        AND: [
            { created_by: adminId }
        ]
    };

    // เพิ่มเงื่อนไขการค้นหาตาม filters
    if (filters.title) {
        where.AND.push({
            title: { contains: filters.title, mode: 'insensitive' }
        });
    }

    if (filters.location) {
        where.AND.push({
            location: { contains: filters.location, mode: 'insensitive' }
        });
    }
    if (filters.title) {
        where.AND.push({
            title: { contains: filters.title, mode: 'insensitive' }
        });
    }

    if (filters.location) {
        where.AND.push({
            location: { contains: filters.location, mode: 'insensitive' }
        });
    }

    if (filters.dateFrom || filters.dateTo) {
        where.AND.push({
            work_date: {
                gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                lte: filters.dateTo ? new Date(filters.dateTo) : undefined
            }
        });
    }

    if (filters.status !== undefined) {
        where.AND.push({
            completed: filters.status === 'completed'
        });
    }

    if (filters.position) {
        where.AND.push({
            JobPositions: {
                some: {
                    position_name: { contains: filters.position, mode: 'insensitive' }
                }
            }
        });
    }

    if (filters.minWage || filters.maxWage) {
        where.AND.push({
            JobPositions: {
                some: {
                    wage: {
                        gte: filters.minWage || 0,
                        lte: filters.maxWage || 999999
                    }
                }
            }
        });
    }


    return prisma.job.count({ where });
};

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

    // ถ้าผู้ใช้ไม่มีทักษะ
    if (!user?.skills) return false;

    // แปลง skills เป็น array
    const userSkills = Array.isArray(user.skills)
        ? user.skills
        : JSON.parse(user.skills);

    // เช็คว่าสกิลของ user ตรงกับชื่อตำแหน่งหรือไม่
    const positionName = jobPosition.position_name.toLowerCase();
    return userSkills.some(skill =>
        positionName.includes(skill.toLowerCase())
    );
};

export const getJobParticipantsByJobId = async (jobId) => {
    return prisma.jobParticipation.findMany({
        where: {
            Job: {  // เปลี่ยนจาก jobId เป็น Job
                id: parseInt(jobId)
            },
            status: 'approved'
        },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone_number: true,
                    skills: true
                }
            },
            jobPosition: {
                select: {
                    position_name: true,
                    wage: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};