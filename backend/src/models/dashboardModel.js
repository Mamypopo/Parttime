import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ดึงจำนวนผู้ใช้งานทั้งหมด
export const getTotalUsers = () => {
    return prisma.user.count()
}

// ดึงข้อมูลงานทั้งหมดพร้อมความสัมพันธ์
export const getAllJobs = () => {
    return prisma.job.findMany({
        include: {
            JobPositions: true,
            JobParticipation: true
        }
    })
}

// ดึงค่าใช้จ่ายรวมของเดือนปัจจุบัน
export const getCurrentMonthExpenses = (startOfMonth) => {
    return prisma.jobPosition.aggregate({
        where: {
            job: {
                work_date: { gte: startOfMonth },
                status: 'completed'
            }
        },
        _sum: { wage: true }
    })
}

// ดึงจำนวนการสมัครงานในเดือนปัจจุบัน
export const getMonthlyApplications = (startOfMonth) => {
    return prisma.jobParticipation.count({
        where: {
            created_at: { gte: startOfMonth }
        }
    })
}

// ดึงประวัติการทำงานที่มีการให้คะแนน
export const getRatedWorkHistories = () => {
    return prisma.workHistory.findMany({
        where: {
            rating: { not: null }
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
                    }
                }
            }
        }
    })
}


export const getCalendarEvents = () => {
    try {
        return prisma.job.findMany({
            select: {
                id: true,
                title: true,
                work_date: true,
                start_time: true,
                end_time: true,
                location: true,
                details: true,
                status: true,
                created_at: true,
                updated_at: true,
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    }
                },
                JobPositions: {
                    select: {
                        id: true,
                        position_name: true,
                        wage: true,
                        required_people: true,
                        details: true,
                        status: true,
                        JobParticipation: {
                            select: {
                                id: true,
                                status: true,
                                user: {
                                    select: {
                                        id: true,
                                        first_name: true,
                                        last_name: true,
                                        email: true,
                                        profile_image: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                work_date: {
                    gte: new Date(new Date().setDate(1)),
                    lte: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
            }
        })
    } catch (error) {
        throw new Error('ไม่สามารถดึงข้อมูลปฏิทินได้')
    }
}
