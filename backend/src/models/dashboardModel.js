import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ดึงจำนวนผู้ใช้งานทั้งหมด
export const getTotalUsers = () => {
    return prisma.user.count()
}

// ดึงข้อมูลงานทั้งหมดพร้อมความสัมพันธ์
export const getAllJobs = () => {
    return prisma.job.findMany({
        where: {
            status: {
                in: ['published', 'in_progress', 'completed']
            }
        },

    })
}

// ดึงค่าใช้จ่ายรวมของเดือนปัจจุบัน
export const getCurrentMonthExpenses = (startOfMonth) => {
    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)
    endOfMonth.setDate(0)
    endOfMonth.setHours(23, 59, 59, 999)

    return prisma.jobPosition.findMany({
        where: {
            job: {
                work_date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        },
        select: {
            wage: true,
            JobParticipation: {
                where: {
                    status: 'approved'
                }
            }
        }
    })
}

// เพิ่มฟังก์ชันดึงค่าใช้จ่ายตามช่วงเวลา
export const getExpensesByDateRange = async (startDate, endDate) => {
    return prisma.jobPosition.findMany({
        where: {
            job: {
                work_date: {
                    gte: startDate,
                    lte: endDate
                },

            }
        },
        include: {
            JobParticipation: {
                where: {
                    status: {
                        in: ['approved', 'completed']
                    }
                },
                include: {
                    workHistories: true, // แก้จาก workHistory เป็น workHistories
                    user: {  // เพิ่มข้อมูลผู้ใช้
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            },
            job: {
                select: {
                    status: true,
                    work_date: true
                }
            }
        }
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

// เพิ่มฟังก์ชันใหม่สำหรับดึงข้อมูลการสมัครพร้อมสถานะ
export const getMonthlyApplicationsWithStatus = (startOfMonth) => {
    return prisma.jobParticipation.findMany({
        where: {
            created_at: { gte: startOfMonth }
        },
        select: {
            status: true
        }
    })
}

// ดึงประวัติการทำงานที่มีการให้คะแนน
export const getRatedWorkHistories = () => {
    return prisma.workHistory.findMany({
        where: {
            OR: [
                { appearance_score: { not: null } },
                { quality_score: { not: null } },
                { quantity_score: { not: null } },
                { manner_score: { not: null } },
                { punctuality_score: { not: null } }
            ],
            jobParticipation: {
                OR: [
                    { status: 'completed' },
                    { status: 'approved' }
                ]
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
                    jobPosition: {  // เพิ่มข้อมูลงาน
                        include: {
                            job: {
                                select: {
                                    title: true,
                                    work_date: true
                                }
                            }
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




export const getEvents = (month = new Date().getMonth(), year = new Date().getFullYear()) => {
    try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)

        return prisma.job.findMany({
            select: {
                id: true,
                title: true,
                work_date: true,
                start_time: true,
                end_time: true,
                location: true,
                status: true,
                JobPositions: {
                    select: {
                        id: true,
                        position_name: true,
                        required_people: true,
                        wage: true,
                        status: true,
                        JobParticipation: {
                            select: {
                                id: true,
                                status: true
                            }
                        }
                    }
                }
            },
            where: {
                work_date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                work_date: 'asc'
            }
        })
    } catch (error) {
        throw new Error('ไม่สามารถดึงข้อมูลปฏิทินได้')
    }
}



export const getRecentRegistrations = () => {
    return prisma.user.findMany({
        where: {
            approved: 'pending'
        },
        select: {
            first_name: true,
            last_name: true,
            email: true,
            profile_image: true,
            created_at: true,
            approved: true
        },
        orderBy: {
            created_at: 'desc'
        },
        take: 5  // แสดง 5 รายการล่าสุด
    })
}