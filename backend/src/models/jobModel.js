import prisma from '../config/prisma.js';


// ฟังก์ชันสำหรับสร้างงานใหม่
export const createJob = async (jobData, adminId) => {
    const { title, work_date, location, start_time, end_time, details, positions, admins } = jobData;

    // เช็คว่าวันที่ทำงานเป็นวันนี้หรือไม่
    const today = new Date();
    const workDate = new Date(work_date);
    today.setHours(0, 0, 0, 0);
    workDate.setHours(0, 0, 0, 0);

    // กำหนดสถานะเริ่มต้นตามวันที่
    let initialStatus;
    if (workDate.getTime() === today.getTime()) {
        initialStatus = 'in_progress';
    } else if (workDate > today) {
        initialStatus = 'published';
    } else {
        initialStatus = 'completed';
    }

    return await prisma.$transaction(async (prisma) => {
        // สร้างงาน
        const job = await prisma.job.create({
            data: {
                title,
                work_date: new Date(work_date),
                location,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                details,
                created_by: adminId,
                status: initialStatus,
            }
        });

        // สร้างตำแหน่งงานและเพิ่มผู้ใช้
        for (const position of positions) {
            const jobPosition = await prisma.jobPosition.create({
                data: {
                    position_name: position.name,
                    wage: position.wage,
                    details: position.details,
                    required_people: position.required_people,
                    job: {
                        connect: {
                            id: job.id
                        }
                    }
                }
            });

            // เพิ่มผู้ใช้ที่ถูกเลือกไว้ล่วงหน้า
            if (position.selected_users?.length > 0) {
                await prisma.jobParticipation.createMany({
                    data: position.selected_users.map(user => ({
                        jobId: job.id,
                        job_position_id: jobPosition.id,
                        user_id: parseInt(user.user_id),
                        status: 'approved',
                        created_at: new Date(),
                        updated_at: new Date()
                    }))
                });
            }
        }

        // เพิ่มแอดมินที่ดูแลงาน
        if (admins?.length > 0) {
            await prisma.jobAdmin.createMany({
                data: admins.map(admin => ({
                    job_id: job.id,
                    admin_id: parseInt(admin.id),
                    role: admin.role
                }))
            });
        }

        // ดึงข้อมูลงานที่สร้างพร้อมความสัมพันธ์ทั้งหมด
        return await prisma.job.findUnique({
            where: { id: job.id },
            include: {
                JobPositions: {
                    include: {
                        JobParticipation: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        first_name: true,
                                        last_name: true,
                                        email: true,
                                        profile_image: true
                                    }
                                }
                            }
                        }
                    }
                },
                JobAdmins: {
                    include: {
                        admin: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email: true,
                                profile_pic: true
                            }
                        }
                    }
                }
            }
        });
    });
};

// ดึงงานทั้งหมด
export const getAllJobs = async (page = 1, pageSize = 20, filters = {}, userId = null) => {
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
    if (filters.status) {
        where.AND.push({
            status: filters.status
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
            details: true,
            created_by: true,
            created_at: true,
            status: true,
            creator: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    phone: true,
                    profile_pic: true,
                }
            },
            JobPositions: {
                include: {
                    JobParticipation: {
                        where: userId ? {
                            OR: [
                                { user_id: userId },  // ดึงเฉพาะการสมัครของ user นี้
                                { status: 'approved' },  // และดึงการสมัครที่ approved แล้วของทุกคน
                                { status: 'completed' }
                            ]
                        } : undefined,
                        select: {
                            id: true,
                            status: true,
                            created_at: true,
                            user_id: true,
                            workHistories: {
                                select: {
                                    id: true,
                                    total_score: true,
                                    is_passed_evaluation: true
                                }
                            }
                        }
                    }
                }
            },
            JobAdmins: {
                include: {
                    admin: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            profile_pic: true,
                            phone: true
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

// ฟังก์ชันสำหรับนับจำนวนงานทั้งหมดที่ตรงกับ filters
export const getJobsCount = async (filters = {}) => {
    const where = {};

    // เงื่อนไขการค้นหาตาม filters
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
            some: {}
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

// ดึง jobId เพื่ออัพเดท
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
            JobPositions: true,
            JobAdmins: true,
            JobParticipation: {
                where: {
                    status: 'approved'
                },
                select: {
                    id: true,
                    created_at: true,
                    job_position_id: true,
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
                            required_people: true,
                            wage: true
                        }
                    },
                    workHistories: {
                        select: {
                            id: true,
                            appearance_score: true,
                            quality_score: true,
                            quantity_score: true,
                            manner_score: true,
                            punctuality_score: true,
                            total_score: true,
                            comment: true,
                            created_at: true,
                            is_passed_evaluation: true
                        }
                    },
                    status: true,
                    updated_at: true
                },

                orderBy: {
                    created_at: 'desc'
                }
            },
            creator: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
            },


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

    if (filters.id) {
        where.AND.push({
            id: filters.id
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



    if (filters.position) {
        where.AND.push({
            JobPositions: {
                some: {
                    position_name: { contains: filters.position, mode: 'insensitive' }
                }
            }
        });
    }
    if (filters.status) {
        where.AND.push({
            status: filters.status
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
            details: true,
            created_by: true,
            created_at: true,
            status: true,
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
            JobAdmins: {
                include: {
                    admin: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            profile_pic: true,
                            phone: true
                        }
                    }
                }
            },
            JobParticipation: {
                // where: {
                //     status: 'approved'  // ดึงเฉพาะที่อนุมัติแล้ว
                // },
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
                            profile_image: true
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

    // เงื่อนไขการค้นหาตาม filters
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
export const updateJobMain = (jobId, jobData) => {

    // แยกข้อมูลที่ต้องการอัพเดท
    const { positions, ...mainJobData } = jobData;

    // เช็คสถานะตามวันที่ใหม่
    const today = new Date();
    const workDate = new Date(mainJobData.work_date);

    // Reset เวลาเป็น 00:00:00 เพื่อเปรียบเทียบเฉพาะวัน
    today.setHours(0, 0, 0, 0);
    workDate.setHours(0, 0, 0, 0);

    // กำหนดสถานะตามวันที่
    let status;
    if (workDate > today) {
        status = 'published';
    } else if (workDate.getTime() === today.getTime()) {
        status = 'in_progress';
    } else {
        status = 'completed';
    }


    try {
        // อัพเดทข้อมูลงานพร้อมสถานะ
        const updatedJob = prisma.job.update({
            where: {
                id: jobId
            },
            data: {
                title: mainJobData.title,
                location: mainJobData.location,
                work_date: workDate,
                start_time: new Date(mainJobData.start_time),
                end_time: new Date(mainJobData.end_time),
                details: mainJobData.details,
                status: status,  // อัพเดทสถานะ
                updated_at: new Date()  // อัพเดทเวลาแก้ไข
            },
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

        return updatedJob;

    } catch (error) {
        console.error('Error updating job:', error);
        throw error;
    }
};

// อัปเดตตำแหน่งงาน
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

// สร้างตำแหน่งใหม่
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

// ลบตำแหน่ง
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
export const deleteJobById = async (jobId) => {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. ลบ payment logs 
            await tx.paymentLog.deleteMany({
                where: {
                    payment: {
                        job_participation: {
                            jobPosition: {
                                job_id: jobId
                            }
                        }
                    }
                }
            });

            // 2. ลบ payment histories
            await tx.paymentHistory.deleteMany({
                where: {
                    job_participation: {
                        jobPosition: {
                            job_id: jobId
                        }
                    }
                }
            });

            // 3. ลบ work histories
            await tx.workHistory.deleteMany({
                where: {
                    jobParticipation: {
                        jobPosition: {
                            job_id: jobId
                        }
                    }
                }
            });

            // 4. ลบ notifications
            await tx.notification.deleteMany({
                where: {
                    jobId: jobId
                }
            });

            // 5. ลบ job participations
            await tx.jobParticipation.deleteMany({
                where: {
                    jobPosition: {
                        job_id: jobId
                    }
                }
            });

            // 6. ลบ job positions
            await tx.jobPosition.deleteMany({
                where: {
                    job_id: jobId
                }
            });

            // 7. ลบ job admins 
            await tx.JobAdmins.deleteMany({
                where: {
                    job_id: jobId
                }
            });

            // 8. ลบตัวงาน
            return await tx.job.delete({
                where: {
                    id: jobId
                }
            });
        });
    } catch (error) {
        console.error('Error in deleteJobById:', error);
        throw error;
    }
};

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
        where: {
            user_id: userId, jobId, job_position_id: jobPositionId,
            status: {
                in: ['pending', 'approved'] // สถานะที่สามารถยกเลิกได้
            }
        },
        include: {
            jobPosition: {
                include: {
                    job: true
                }
            }
        }
    });


// ฟังก์ชันตรวจสอบการสมัครงานที่เกิดในวันเดียวกัน
export const findExistingDayApplication = async (userId, workDate) => {
    const startOfDay = new Date(workDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(workDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const result = await prisma.jobParticipation.findFirst({
            where: {
                AND: [
                    { user_id: userId },
                    {
                        Job: {
                            work_date: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    },
                    {
                        status: {
                            in: ['approved', 'pending']
                        }
                    }
                ]
            },
            include: {
                Job: true,
                jobPosition: true
            }
        });
        return result;
    } catch (error) {
        console.error('Error in findExistingDayApplication:', error);
        return null;
    }
};

// ฟังก์ชันอัปเดตสถานะการสมัครงาน ยกเลิกคำขอสมัครงาน
export const updateJobParticipationStatus = async (participationId, newStatus) => {
    return prisma.jobParticipation.update({
        where: { id: participationId },
        data: { status: newStatus }
    });
};

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

// ฟังชั่นเช็คสกิลของผู้ใช้ว่าตรงกับงานหรือไม่
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




// ฟังชั่นอัพเดทสถานะงาน
export const getAllJobsForStatusUpdate = async () => {
    try {
        const jobs = await prisma.job.findMany({
            select: {
                id: true,
                title: true,
                work_date: true,
                status: true,
                created_by: true,
                JobPositions: {
                    include: {
                        JobParticipation: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            },
        });
        return jobs;
    } catch (error) {
        console.error('Error getting jobs for status update:', error);
        throw error;
    }
};

// ฟังชั่นอัพเดทสถานะงาน
export const updateJobStatus = async (jobId, status) => {
    try {
        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: {
                status: status,
                updated_at: new Date()
            },
            include: {
                JobPositions: {
                    include: {
                        JobParticipation: true,

                    }
                },
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });
        return updatedJob;
    } catch (error) {
        console.error('Error updating job status:', error);
        throw error;
    }
};

// อัพเดทสถานะของ ตำแหน่งด้วย
export const updateJobPositionStatus = async (positionId, status) => {
    try {
        const updatedPosition = await prisma.jobPosition.update({
            where: { id: positionId },
            data: {
                status: status,
            }
        });
        return updatedPosition;
    } catch (error) {
        console.error('Error updating job position status:', error);
        throw error;
    }
};

// ค้นหางานสำหรับ User
export const searchJobs = async (page = 1, pageSize = 10, filters = {}) => {
    const skip = (page - 1) * pageSize;

    const where = {
        AND: []
    };

    // กรองตามสถานะ
    if (filters.status && filters.status !== 'all') {
        where.AND.push({ status: filters.status });
    }

    // ค้นหาตามชื่องาน
    if (filters.title) {
        where.AND.push({
            title: { contains: filters.title, mode: 'insensitive' }
        });
    }

    // ค้นหาตามสถานที่
    if (filters.location) {
        where.AND.push({
            location: { contains: filters.location, mode: 'insensitive' }
        });
    }

    // ค้นหาตามตำแหน่ง
    if (filters.position) {
        where.AND.push({
            JobPositions: {
                some: {
                    position_name: { contains: filters.position, mode: 'insensitive' }
                }
            }
        });
    }

    // กรองตามค่าจ้าง
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

    // กรองตามวันที่
    if (filters.workDate) {
        where.AND.push({
            work_date: new Date(filters.workDate)
        });
    }

    // ถ้าต้องการค้นหาเฉพาะงานที่ตรงกับทักษะ
    if (filters.matchSkills && filters.userId) {
        const userSkills = await getUserSkills(filters.userId);
        if (userSkills?.length > 0) {
            where.AND.push({
                JobPositions: {
                    some: {
                        OR: userSkills.map(skill => ({
                            position_name: { contains: skill, mode: 'insensitive' }
                        }))
                    }
                }
            });
        }
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
            details: true,
            status: true,
            creator: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    phone: true,
                    profile_pic: true,
                }
            },
            JobPositions: {
                select: {
                    id: true,
                    position_name: true,
                    wage: true,
                    required_people: true,
                    details: true,
                    status: true,
                    JobParticipation: {
                        where: {
                            user_id: filters.userId
                        },
                        select: {
                            id: true,
                            status: true,
                            created_at: true,
                            user_id: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { work_date: 'asc' },
            { created_at: 'desc' }
        ]
    });
};

// Helper function สำหรับดึงทักษะของ user
const getUserSkills = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true }
    });

    if (!user?.skills) return [];

    return Array.isArray(user.skills) ? user.skills : JSON.parse(user.skills);
};

// นับจำนวนงานที่ค้นหาเจอ
export const searchJobsCount = async (filters = {}) => {
    const where = {
        AND: []
    };

    // กรองตามสถานะ
    if (filters.status && filters.status !== 'all') {
        where.AND.push({ status: filters.status });
    }

    // ค้นหาตามชื่องาน
    if (filters.title) {
        where.AND.push({
            title: { contains: filters.title, mode: 'insensitive' }
        });
    }

    // ค้นหาตามสถานที่
    if (filters.location) {
        where.AND.push({
            location: { contains: filters.location, mode: 'insensitive' }
        });
    }

    // ค้นหาตามตำแหน่ง
    if (filters.position) {
        where.AND.push({
            JobPositions: {
                some: {
                    position_name: { contains: filters.position, mode: 'insensitive' }
                }
            }
        });
    }

    // กรองตามค่าจ้าง
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

    // กรองตามวันที่
    if (filters.workDate) {
        where.AND.push({
            work_date: new Date(filters.workDate)
        });
    }

    // ถ้าต้องการค้นหาเฉพาะงานที่ตรงกับทักษะ
    if (filters.matchSkills && filters.userId) {
        const userSkills = await getUserSkills(filters.userId);
        if (userSkills?.length > 0) {
            where.AND.push({
                JobPositions: {
                    some: {
                        OR: userSkills.map(skill => ({
                            position_name: { contains: skill, mode: 'insensitive' }
                        }))
                    }
                }
            });
        }
    }
    return prisma.job.count({
        where: where.AND.length > 0 ? where : undefined
    });
};

export const getJobPaymentStatus = async (jobId) => {
    const participations = await prisma.jobParticipation.findMany({
        where: {
            jobPosition: {
                job_id: parseInt(jobId)
            },
            status: 'completed'
        },
        include: {
            PaymentHistory: {
                select: {
                    payment_status: true,
                    amount: true
                }
            }
        }
    });
    const totalRequired = participations.length;
    const totalPaid = participations.filter(p =>
        p.PaymentHistory?.payment_status === 'paid'
    ).length;
    // คำนวณเงินที่จ่ายไปแล้ว
    const paidAmount = participations.reduce((sum, p) => {
        if (p.PaymentHistory?.payment_status === 'paid') {
            return sum + (p.PaymentHistory.amount || 0);
        }
        return sum;
    }, 0);
    return {
        totalParticipants: totalRequired,
        paidParticipants: totalPaid,
        paidAmount: paidAmount,
        status: totalPaid === 0 ? 'pending'
            : totalPaid === totalRequired ? 'paid'
                : 'partially_paid'
    };
};



export const getJobParticipantsDocuments = async (jobId) => {
    try {
        const participants = await prisma.jobParticipation.findMany({
            where: {
                jobId: parseInt(jobId),
                status: 'completed'
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        user_documents: true,
                        education_certificate: true,

                    }
                },
                Job: {
                    select: {
                        title: true
                    }
                },
                jobPosition: {
                    select: {
                        position_name: true
                    }
                }
            }
        });

        return participants;
    } catch (error) {
        console.error('Error getting job participants documents:', error);
        throw error;
    }
};



// ดึงงานที่แอดมินได้รับมอบหมาย
export const getAssignedJobs = async (page = 1, pageSize = 10, adminId) => {
    const skip = (page - 1) * pageSize;

    return prisma.jobAdmins.findMany({
        skip,
        take: pageSize,
        where: {
            admin_id: adminId, // ดึงเฉพาะงานที่มอบหมายให้ adminId
        },
        select: {
            job: {
                select: {
                    id: true,
                    title: true,
                    work_date: true,
                    location: true,
                    start_time: true,
                    end_time: true,
                    details: true,
                    created_by: true,
                    created_at: true,
                    status: true,
                    creator: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true,
                        }
                    },
                    JobPositions: {
                        include: {
                            JobParticipation: {
                                include: {
                                    workHistories: {
                                        select: {
                                            id: true,
                                            appearance_score: true,
                                            quality_score: true,
                                            quantity_score: true,
                                            manner_score: true,
                                            punctuality_score: true,
                                            total_score: true,
                                            comment: true,
                                            is_passed_evaluation: true,
                                            created_at: true
                                        },
                                        orderBy: {
                                            created_at: 'desc'
                                        },
                                        take: 1
                                    },
                                    user: {
                                        select: {
                                            id: true,
                                            first_name: true,
                                            last_name: true,
                                            email: true,
                                            profile_image: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    JobAdmins: {
                        include: {
                            admin: { // ดึงข้อมูล admin แต่ละคนที่มอบหมายให้กับงาน
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true,
                                    phone: true,
                                    profile_pic: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: [
            { job: { created_at: "desc" } },
            { job: { work_date: "desc" } }
        ]
    });
};

// นับจำนวนงานที่ได้รับมอบหมาย
export const getAssignedJobsCount = async (adminId) => {
    return prisma.jobAdmins.count({
        where: {
            admin_id: adminId, // นับเฉพาะงานที่เกี่ยวข้องกับ adminId
        },
    });
};

// เพิ่มแอดมินให้กับงาน
export const addJobAdmin = async (jobId, adminId, role) => {
    return prisma.jobAdmins.create({
        data: {
            job_id: parseInt(jobId),
            admin_id: parseInt(adminId),
            role
        }
    });
};

// ลบแอดมินออกจากงาน
export const removeJobAdmin = async (jobId, adminId) => {
    return prisma.jobAdmins.delete({
        where: {
            job_id_admin_id: {
                job_id: parseInt(jobId),
                admin_id: parseInt(adminId)
            }
        }
    });
};

export const getAvailableUsers = async () => {
    return await prisma.user.findMany({
        where: {
            role: 'user'
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            skills: true,
            email: true,
            profile_image: true,
            phone_number: true,
            JobParticipation: {
                select: {
                    id: true,
                    status: true,
                    created_at: true,
                    Job: {
                        select: {
                            id: true,
                            title: true,
                            work_date: true
                        }
                    },
                    jobPosition: {
                        select: {
                            position_name: true,
                            wage: true
                        }
                    },
                    workHistories: {
                        select: {
                            total_score: true,
                            appearance_score: true,
                            quality_score: true,
                            quantity_score: true,
                            manner_score: true,
                            punctuality_score: true,
                            comment: true,
                            is_passed_evaluation: true,
                            created_at: true
                        },
                        take: 1,
                        orderBy: {
                            created_at: 'desc'
                        }
                    }
                },
                where: {
                    status: {
                        in: ['completed', 'approved']
                    }
                },
                take: 5,
                orderBy: {
                    created_at: 'desc'
                }
            }
        },
        orderBy: {
            first_name: 'asc'
        }
    });
};

export const formatUserData = (users) => {
    return users.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_image: user.profile_image,
        phone_number: user.phone_number,
        skills: user.skills ? JSON.parse(user.skills) : [],
        recent_jobs: user.JobParticipation.map(participation => ({
            status: participation.status,
            job_title: participation.Job?.title,
            work_date: participation.Job?.work_date,
            position: participation.jobPosition?.position_name,
            wage: participation.jobPosition?.wage,
            total_score: participation.workHistories[0]?.total_score,
            scores: {
                appearance: participation.workHistories[0]?.appearance_score,
                quality: participation.workHistories[0]?.quality_score,
                quantity: participation.workHistories[0]?.quantity_score,
                manner: participation.workHistories[0]?.manner_score,
                punctuality: participation.workHistories[0]?.punctuality_score
            },
            comment: participation.workHistories[0]?.comment,
            is_passed: participation.workHistories[0]?.is_passed_evaluation
        }))
    }));
};


export const searchAvailableUsers = async (query, selectedUserIds = []) => {
    return prisma.user.findMany({
        where: {
            OR: [
                { first_name: { contains: query, mode: 'insensitive' } },
                { last_name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ],
            AND: {
                id: { notIn: selectedUserIds },
                approved: 'approved'
            }
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_image: true
        },
        take: 10
    });
};