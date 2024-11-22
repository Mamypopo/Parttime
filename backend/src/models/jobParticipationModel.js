import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันเพื่อค้นหา Job Participation ตาม ID
export const findJobParticipationById = (jobParticipationId) =>
    prisma.jobParticipation.findUnique({
        where: { id: jobParticipationId },
        include: {
            jobPosition: true,
            user: true
        }
    });

// อัพเดทสถานะ JobParticipation เป็น approved
export const updateJobParticipationStatus = async (jobParticipationId, status) => {
    try {
        return await prisma.jobParticipation.update({
            where: { id: jobParticipationId },
            data: { status }
        });
    } catch (error) {
        throw new Error('ไม่สามารถอัพเดทสถานะได้');
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
                                        is_rejected: true,
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