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
            is_passed_evaluation: data.is_passed_evaluation // ใช้ค่าที่ส่งมาจาก data โดยตรง
        };

        // เพิ่มคะแนนเฉพาะเมื่อผ่านการประเมิน
        if (data.is_passed_evaluation === true) {
            workHistoryData.appearance_score = data.appearance_score;
            workHistoryData.quality_score = data.quality_score;
            workHistoryData.quantity_score = data.quantity_score;
            workHistoryData.manner_score = data.manner_score;
            workHistoryData.punctuality_score = data.punctuality_score;
            workHistoryData.total_score = data.total_score;
        } else {
            // ถ้าไม่ผ่านการประเมิน ให้เซ็ตคะแนนเป็น null ทั้งหมด
            workHistoryData.appearance_score = null;
            workHistoryData.quality_score = null;
            workHistoryData.quantity_score = null;
            workHistoryData.manner_score = null;
            workHistoryData.punctuality_score = null;
            workHistoryData.total_score = null;
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
            // กรองเฉพาะงานที่มีการประเมิน
            const passedEvaluationJobs = user.JobParticipation
                .flatMap(jp => jp.workHistories)
                .filter(wh =>
                    wh !== null &&
                    wh.total_score !== null
                );

            // ถ้าไม่มีงานที่ผ่านการประเมิน ให้คะแนนเป็น 0
            if (passedEvaluationJobs.length === 0) {
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
                    jobCount: user.JobParticipation.length // นับจำนวนงานทั้งหมด
                };
            }

            // คำนวณคะแนนเฉลี่ยแต่ละประเภท
            const calculateAverage = (field) => {
                const allJobs = user.JobParticipation.flatMap(jp => jp.workHistories);
                const scores = allJobs
                    .map(wh => (wh && wh[field] !== null) ? wh[field] : 0); // งานที่ไม่ผ่านจะได้ 0 คะแนน
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
                jobCount: user.JobParticipation.length // นับจำนวนงานทั้งหมด
            };
        })
        .filter(user => user.jobCount > 0)
        .sort((a, b) => b.averageScores.total - a.averageScores.total)
        .slice(0, 10);

    // คำนวณคะแนนเฉลี่ยรวมจากคะแนนที่คำนวณใหม่
    const totalScores = topUsers.reduce((sum, user) => sum + user.averageScores.total, 0);
    const averageScore = topUsers.length > 0 ? totalScores / topUsers.length : 0;

    return {
        averageScore,
        topUsers
    };
};