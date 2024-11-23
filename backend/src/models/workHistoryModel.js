import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ฟังชั่นสร้างประวัติการทำงานหลังจาก ให้คะแนน
export const createWorkHistory = async (data) => {
    try {
        const workHistoryData = {
            jobParticipation: {
                connect: {
                    id: data.jobParticipationId
                }
            },
            comment: data.comment,
            is_rejected: data.is_rejected
        };

        // เพิ่มคะแนนเฉพาะเมื่อไม่ใช่การ reject
        if (!data.is_rejected) {
            workHistoryData.appearance_score = data.appearance_score;
            workHistoryData.quality_score = data.quality_score;
            workHistoryData.quantity_score = data.quantity_score;
            workHistoryData.manner_score = data.manner_score;
            workHistoryData.punctuality_score = data.punctuality_score;
            workHistoryData.total_score = data.total_score;
        }

        return await prisma.workHistory.create({
            data: workHistoryData,
            include: {
                jobParticipation: {
                    include: {
                        jobPosition: true,
                        Job: true,
                        user: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating work history:', error);
        throw error;
    }
};

// ฟังชั่นดึงประวัติเป็นรายบุคคล
export const getWorkHistoryByUserId = async (userId) => {
    return prisma.workHistory.findMany({
        where: {
            jobParticipation: {
                user_id: userId
            }
        },
        select: {
            id: true,
            // เพิ่มการดึงคะแนนแต่ละประเภท
            appearance_score: true,
            quality_score: true,
            quantity_score: true,
            manner_score: true,
            punctuality_score: true,
            total_score: true,
            comment: true,
            created_at: true,
            jobParticipation: {
                include: {
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            profile_image: true
                        }
                    },
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
    return prisma.workHistory.findUnique({
        where: {
            jobParticipationId: jobParticipationId
        },
        include: {
            jobParticipation: {
                include: {
                    jobPosition: true,
                    Job: true,
                    user: true
                }
            }
        }
    });
};



// ฟังชั่นดึง Top Users ใหม่ โดยใช้ total_score
export const getTopUsersWithRatings = async () => {
    // หาคะแนนเฉลี่ยรวมทั้งหมด
    const averageScore = await prisma.workHistory.aggregate({
        _avg: {
            total_score: true
        }
    });

    // ดึงข้อมูลผู้ใช้พร้อมคะแนนและจำนวนงาน
    const users = await prisma.user.findMany({
        select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image: true,
            JobParticipation: {
                include: {
                    workHistories: {
                        select: {
                            total_score: true,
                            appearance_score: true,
                            quality_score: true,
                            quantity_score: true,
                            manner_score: true,
                            punctuality_score: true
                        }
                    }
                }
            }
        }
    });


    // คำนวณคะแนนเฉลี่ยของแต่ละคนและจำนวนงาน
    const topUsers = users
        .map(user => {
            // กรองเฉพาะงานที่มีการประเมินและไม่ถูก reject
            const workHistories = user.JobParticipation
                .flatMap(jp => jp.workHistories)
                .filter(wh =>
                    wh !== null &&
                    wh.total_score !== null &&
                    !wh.is_rejected // เพิ่มเงื่อนไขนี้
                );

            // ถ้าไม่มีงานที่ผ่านการประเมิน ให้คะแนนเป็น 0
            if (workHistories.length === 0) {
                return {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    profile_image: user.profile_image,
                    averageScores: {
                        appearance: 0,
                        quality: 0,
                        quantity: 0,
                        manner: 0,
                        punctuality: 0,
                        total: 0
                    },
                    jobCount: 0
                };
            }

            // คำนวณคะแนนเฉลี่ยแต่ละประเภท
            const calculateAverage = (field) => {
                const scores = workHistories
                    .map(wh => wh[field])
                    .filter(score => score != null);
                return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            };

            return {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                profile_image: user.profile_image,
                averageScores: {
                    appearance: calculateAverage('appearance_score'),
                    quality: calculateAverage('quality_score'),
                    quantity: calculateAverage('quantity_score'),
                    manner: calculateAverage('manner_score'),
                    punctuality: calculateAverage('punctuality_score'),
                    total: calculateAverage('total_score')
                },
                jobCount: workHistories.length // นับเฉพาะงานที่ผ่านการประเมิน
            };
        })
        .filter(user => user.jobCount > 0) // กรองเฉพาะคนที่มีงานที่ผ่านการประเมิน
        .sort((a, b) => b.averageScores.total - a.averageScores.total)
        .slice(0, 10);
    return {
        averageScore: averageScore._avg.total_score || 0,
        topUsers: topUsers
    };
};