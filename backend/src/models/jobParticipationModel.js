import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันเพื่อค้นหา Job Participation ตาม ID
export const findJobParticipationById = async (jobParticipationId) => {

    const id = parseInt(jobParticipationId);

    if (isNaN(id)) {
        throw new Error('Invalid job participation ID');
    }

    return prisma.jobParticipation.findUnique({
        where: {
            id: id
        },
        include: {
            jobPosition: {
                include: {
                    job: true
                }
            },
            user: true
        }
    });
};

export const findParticipationByUserAndJob = async (userId, jobId) => {
    try {
        return await prisma.jobParticipation.findFirst({
            where: {
                user_id: parseInt(userId),
                jobPosition: {
                    job_id: parseInt(jobId)
                },
                status: 'completed', // เพิ่มเงื่อนไข completed
                workHistories: {
                    some: {} // ต้องมี workHistory
                }
            },
            include: {
                workHistories: true,
                jobPosition: {
                    include: {
                        job: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error in findParticipationByUserAndJob:', error)
        throw error
    }
}

// อัพเดทสถานะ JobParticipation
export const updateJobParticipationStatus = async (jobParticipationId, status) => {
    const id = parseInt(jobParticipationId);

    if (isNaN(id)) {
        throw new Error('Invalid job participation ID');
    }

    try {
        return await prisma.jobParticipation.update({
            where: { id: id },
            data: { status }
        });
    } catch (error) {
        throw new Error(`ไม่สามารถอัพเดทสถานะได้: ${error.message}`);
    }
};


// ดึงข้อมูลผู้สมัครรายบุคคล
export const getParticipationById = async (participationId) => {
    return prisma.jobParticipation.findUnique({
        where: {
            id: parseInt(participationId)
        },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone_number: true,
                    profile_image: true
                }
            },
            jobPosition: {
                include: {
                    job: true
                }
            }
        }
    });
};


// ฟังก์ชันดึงงานที่มีผู้ใช้งานสมัครเข้ามาเพื่อรออนุมัติ
export const getJobsWithParticipants = async (adminId) => {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                created_by: adminId,
            },
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
                                        phone_number: true,
                                        profile_image: true
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
                                        is_passed_evaluation: true,
                                        created_at: true
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    },
                                    take: 1 // เอาแค่อันล่าสุด
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return jobs;

    } catch (error) {
        console.error('Error in getJobsWithParticipants:', error);
        throw error;
    }
};