import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ฟังชั่นสร้างประวัติการทำงานหลังจาก ให้คะแนน
export const createWorkHistory = async (data) => {
    if (!data.jobParticipationId) {
        throw new Error('jobParticipationId is required');
    }

    return prisma.workHistory.create({
        data: {
            jobParticipationId: parseInt(data.jobParticipationId),
            appearance_score: parseInt(data.appearance_score),
            quality_score: parseInt(data.quality_score),
            quantity_score: parseInt(data.quantity_score),
            manner_score: parseInt(data.manner_score),
            punctuality_score: parseInt(data.punctuality_score),
            total_score: parseInt(data.total_score),
            comment: data.comment,
            is_rejected: Boolean(data.is_rejected)
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



export const getTopUsersWithRatings = async () => {
    // หาคะแนนเฉลี่ยรวมทั้งหมด
    const averageRating = await prisma.workHistory.aggregate({
        _avg: {
            rating: true
        },
        where: {
            rating: {
                not: null
            }
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
                    workHistories: {  // แก้จาก workHistory เป็น workHistories
                        select: {
                            rating: true
                        }
                    }
                }
            }
        }
    });

    // คำนวณคะแนนเฉลี่ยต่อคนและจำนวนงาน
    const topUsers = users
        .map(user => {
            const ratings = user.JobParticipation
                .map(jp => jp.workHistories[0]?.rating)  // แก้ตรงนี้ด้วย เพราะเป็น array
                .filter(rating => rating != null);

            return {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                profile_image: user.profile_image,
                rating: ratings.length > 0
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                    : 0,
                jobCount: user.JobParticipation.length
            };
        })
        .filter(user => user.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);

    return {
        averageRating: averageRating._avg.rating || 0,
        topUsers: topUsers
    };
};