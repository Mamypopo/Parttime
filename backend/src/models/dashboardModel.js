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

// ฟังก์ชันสำหรับรายงานค่าใช้จ่าย
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

// ฟังก์ชันสำหรับดึงข้อมูลการสมัครพร้อมสถานะ
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



// ดึงข้อมูลสถิติของ User
export const getUserDashboardStats = async (userId) => {
    try {
        const [averageRating, completedJobs, monthlyIncome] = await Promise.all([
            // คะแนนเฉลี่ย
            prisma.workHistory.aggregate({
                where: {
                    jobParticipation: {
                        user_id: userId,
                        status: 'completed'
                    }
                },
                _avg: {
                    total_score: true
                }
            }),

            // จำนวนงานที่เสร็จสิ้นและได้รับการประเมิน
            prisma.jobParticipation.count({
                where: {
                    user_id: userId,
                    status: 'completed',
                    workHistories: {
                        some: {} // มีประวัติการประเมิน
                    }
                }
            }),

            // รายได้เดือนนี้ (เฉพาะงานที่ได้รับการประเมิน)
            prisma.jobParticipation.findMany({
                where: {
                    user_id: userId,
                    status: 'completed',
                    workHistories: {
                        some: {} // มีประวัติการประเมิน
                    },
                    created_at: {
                        gte: new Date(new Date().setDate(1)) // ตั้งแต่วันที่ 1 ของเดือนนี้
                    }
                },
                select: {
                    jobPosition: {
                        select: {
                            wage: true // ค่าแรงต่อวัน
                        }
                    },
                    workHistories: {
                        select: {
                            is_passed_evaluation: true // สถานะการประเมิน
                        }
                    }
                }
            })
        ]);

        // คำนวณรายได้จากงานที่ผ่านการประเมิน
        const totalMonthlyIncome = monthlyIncome.reduce((total, job) => {
            // ตรวจสอบว่างานผ่านการประเมินหรือไม่
            const isPassedEvaluation = job.workHistories.some(
                history => history.is_passed_evaluation
            );

            // เพิ่มรายได้เฉพาะงานที่ผ่านการประเมิน
            if (isPassedEvaluation) {
                return total + Number(job.jobPosition.wage);
            }
            return total;
        }, 0);

        return {
            averageRating: Number(averageRating._avg.total_score || 0).toFixed(1),
            completedJobs,
            monthlyIncome: totalMonthlyIncome
        };
    } catch (error) {
        console.error('Error in getUserDashboardStats:', error);
        throw error;
    }
};


// ดึงรายได้ล่าสุด (ปรับปรุงให้ดึงเฉพาะงานที่ผ่านการประเมิน)
export const getRecentIncomes = async (userId) => {
    try {
        return await prisma.jobParticipation.findMany({
            where: {
                user_id: userId,
                status: 'completed',
                workHistories: {
                    some: {
                        is_passed_evaluation: true // เฉพาะงานที่ผ่านการประเมิน
                    }
                }
            },
            select: {
                id: true,
                created_at: true,
                jobPosition: {
                    select: {
                        position_name: true,
                        wage: true,
                        job: {
                            select: {
                                title: true,
                                location: true,
                                work_date: true,
                                start_time: true,
                                end_time: true
                            }
                        }
                    }
                },
                workHistories: {
                    select: {
                        created_at: true,
                        total_score: true
                    },
                    where: {
                        is_passed_evaluation: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5
        });
    } catch (error) {
        console.error('Error in getRecentIncomes:', error);
        throw error;
    }
};

// ดึงตารางงานวันนี้
export const getTodaySchedule = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await prisma.jobParticipation.findMany({
            where: {
                user_id: userId,
                jobPosition: {
                    job: {
                        work_date: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                }
            },
            select: {
                id: true,
                status: true,
                jobPosition: {
                    select: {
                        position_name: true,
                        job: {
                            select: {
                                title: true,
                                location: true,
                                start_time: true,
                                end_time: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                jobPosition: {
                    job: {
                        start_time: 'asc'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in getTodaySchedule:', error);
        throw error;
    }
};

// ฟังก์ชันดึงงานที่ใกล้ถึงกำหนด
export const getUpcomingDeadlines = async (userId) => {
    try {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return await prisma.jobParticipation.findMany({
            where: {
                user_id: userId,
                status: {
                    in: ['approved', 'in_progress']
                },
                jobPosition: {
                    job: {
                        work_date: {
                            gte: today,
                            lte: nextWeek
                        }
                    }
                }
            },
            select: {
                id: true,
                status: true,
                jobPosition: {
                    select: {
                        position_name: true,
                        job: {
                            select: {
                                title: true,
                                work_date: true,
                                start_time: true,
                                end_time: true,
                                location: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                jobPosition: {
                    job: {
                        work_date: 'asc'
                    }
                }
            },
            take: 5  // แสดง 5 รายการล่าสุด
        });
    } catch (error) {
        console.error('Error in getUpcomingDeadlines:', error);
        throw error;
    }
};