import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ฟังชั่นสร้างประวัติการทำงานหลังจาก ให้คะแนน
export const createWorkHistory = async (data) => {
    return prisma.workHistory.create({
        data: {
            jobParticipationId: data.jobParticipationId,
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

// ฟังชั่นดึงประวัติเป็นรายบุคคล
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

// ฟังชั่นตรวจสอบว่ามี WorkHistory อยู่แล้วหรือไม่
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