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