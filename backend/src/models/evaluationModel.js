import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ดึงข้อมูลการประเมินทั้งหมด
export const getEvaluationByJobId = async (jobId) => {
    return await prisma.job.findUnique({
        where: { id: Number(jobId) },
        include: {
            JobPositions: {
                include: {
                    JobParticipation: {
                        include: {
                            user: true,
                            workHistories: true,
                        },
                    },
                },
            },
        },
    });
};
