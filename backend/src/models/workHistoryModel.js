import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createWorkHistory = async (data) => {
    return prisma.workHistory.create({
        data: {
            jobParticipationId: data.jobParticipationId,
            work_status: data.work_status,
            comment: data.comment || null,
            rating: data.rating || null
        },
        include: {
            jobParticipation: {
                include: {
                    user: true,
                    jobPosition: true,
                    Job: true
                }
            }
        }
    });
};

export const getWorkHistoryByUserId = async (userId) => {
    return prisma.workHistory.findMany({
        where: {
            jobParticipation: {
                user_id: userId
            }
        },
        include: {
            jobParticipation: {
                include: {
                    jobPosition: true,
                    Job: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

export const findByJobParticipationId = async (jobParticipationId) => {
    return prisma.workHistory.findFirst({
        where: {
            jobParticipationId
        },
        include: {
            jobParticipation: {
                include: {
                    jobPosition: true,
                    Job: true
                }
            }
        }
    });
};