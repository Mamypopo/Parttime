import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ดึงจำนวนผู้ใช้งานทั้งหมด
export const getTotalUsers = async () => {
    const [admins, users] = await Promise.all([
        // นับ admin จาก admin table
        prisma.admin.count(),
        // นับ user จาก user table พร้อมแยกตามสถานะ
        Promise.all([
            // นับ user ทั้งหมด
            prisma.user.count(),
            // นับ user ที่อนุมัติแล้ว
            prisma.user.count({
                where: {
                    approved: 'approved'
                }
            }),
            // นับ user ที่รอการอนุมัติ
            prisma.user.count({
                where: {
                    approved: 'pending'
                }
            }),
            // นับ user ที่ไม่อนุมัติ
            prisma.user.count({
                where: {
                    approved: 'rejected'
                }
            })
        ])
    ])

    const [totalUsers, normalUsers, pendingUsers, rejectedUsers] = users

    return {
        total: totalUsers + admins, // รวมจำนวนทั้งหมด
        userDetails: {
            normal: normalUsers,
            admin: admins,
            pending: pendingUsers,
            rejected: rejectedUsers
        }
    }
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

// ฟังก์ชันดึงค่าใช้จ่ายตามช่วงเวลา
export const getExpensesByDateRange = async (startDate, endDate) => {
    return prisma.job.findMany({
        where: {
            work_date: {
                gte: startDate,
                lte: endDate
            },
            status: {
                in: ['in_progress', 'completed']
            }
        },
        select: {
            id: true,
            work_date: true,
            JobPositions: {
                select: {
                    id: true,
                    wage: true,
                    JobParticipation: {
                        where: {
                            status: {
                                in: ['approved', 'completed']
                            }
                        },
                        select: {
                            id: true,
                            workHistories: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}

// ฟังก์ชันใหม่สำหรับรายงานค่าใช้จ่าย
export const getJobExpensesReport = async (month = new Date().getMonth(), year = new Date().getFullYear()) => {
    try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)

        return prisma.job.findMany({
            where: {
                work_date: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    in: ['in_progress', 'completed']
                }
            },
            select: {
                id: true,
                title: true,
                location: true,
                work_date: true,
                start_time: true,
                end_time: true,
                JobPositions: {
                    select: {
                        id: true,
                        position_name: true,
                        wage: true,
                        required_people: true,
                        JobParticipation: {
                            where: {
                                status: {
                                    in: ['approved', 'completed']
                                }
                            },
                            select: {
                                id: true,
                                status: true,

                            }
                        }
                    }
                }
            },
            orderBy: {
                work_date: 'asc'
            }
        })
    } catch (error) {
        console.error('Error in getJobExpensesReport:', error)
        throw new Error('ไม่สามารถดึงข้อมูลรายงานค่าใช้จ่ายได้')
    }
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
export const getMonthlyApplicationsWithStatus = async (startOfMonth) => {
    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)
    endOfMonth.setDate(0)

    // แก้ไขการ query เพื่อนับจำนวนตามสถานะโดยตรง
    const [total, approved, rejected, pending, completed] = await Promise.all([
        // นับทั้งหมด
        prisma.jobParticipation.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        }),
        // นับที่อนุมัติแล้ว
        prisma.jobParticipation.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: 'approved'
            }
        }),
        // นับที่ไม่อนุมัติ
        prisma.jobParticipation.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: 'rejected'
            }
        }),
        // นับที่รอพิจารณา
        prisma.jobParticipation.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: 'pending'
            }
        }),
        // นับที่รอพิจารณา
        prisma.jobParticipation.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: 'completed'
            }
        })
    ])

    return {
        total,
        approved,
        rejected,
        pending,
        completed
    }
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
            id: true,
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