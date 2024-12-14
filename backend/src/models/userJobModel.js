import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ดึงงานที่ user สมัครไว้
export const getMyJobs = async (userId) => {
    try {
        const myJobs = await prisma.jobParticipation.findMany({
            where: {
                user_id: userId
            },
            select: {
                id: true,
                status: true,
                created_at: true,
                job_position_id: true,
                jobPosition: {
                    select: {
                        id: true,
                        position_name: true,
                        wage: true,
                        details: true,
                        job: {
                            select: {
                                id: true,
                                title: true,
                                location: true,
                                work_date: true,
                                start_time: true,
                                end_time: true,
                                status: true,
                                details: true,
                                created_by: true,
                                creator: {
                                    select: {
                                        phone: true,
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            }

                        }
                    }
                },
                workHistories: {
                    select: {
                        appearance_score: true,
                        quality_score: true,
                        quantity_score: true,
                        manner_score: true,
                        punctuality_score: true,
                        total_score: true,
                        comment: true,
                        is_passed_evaluation: true,
                        created_at: true,
                        updated_at: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return myJobs;
    } catch (error) {
        console.error('Error in getMyJobs:', error);
        throw error;
    }
};