import prisma from '../config/prisma.js';


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
    return prisma.paymentHistory.findMany({
        where: {
            paid_at: {
                gte: startDate,
                lte: endDate
            },
            payment_status: 'paid'
        },
        select: {
            id: true,
            amount: true,
            paid_at: true,
            job_participation: {
                select: {
                    jobPosition: {
                        select: {
                            job: {
                                select: {
                                    id: true,
                                    title: true,
                                    work_date: true,
                                    location: true,
                                    start_time: true,
                                    end_time: true
                                }
                            },
                            position_name: true,
                            wage: true,
                            required_people: true
                        }
                    }
                }
            }
        },
        orderBy: {
            paid_at: 'desc'
        }
    })

}

// ฟังก์ชันสำหรับรายงานค่าใช้จ่าย
export const getJobExpensesReport = async (month = new Date().getMonth(), year = new Date().getFullYear()) => {
    try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59)
        const payments = await prisma.paymentHistory.findMany({
            where: {
                paid_at: {
                    gte: startDate,
                    lte: endDate
                },
                payment_status: 'paid'
            },
            select: {
                id: true,
                amount: true,
                paid_at: true,
                job_participation: {
                    select: {
                        id: true,
                        jobPosition: {
                            select: {
                                id: true,
                                position_name: true,
                                wage: true,
                                required_people: true,
                                job: {
                                    select: {
                                        id: true,
                                        title: true,
                                        location: true,
                                        work_date: true,
                                        start_time: true,
                                        end_time: true,
                                        status: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        const jobMap = new Map()
        for (const payment of payments) {
            // การตรวจสอบข้อมูล
            if (!payment?.job_participation?.jobPosition?.job) {
                continue // ข้ามรายการที่ไม่มีข้อมูลครบ
            }
            const jobData = payment.job_participation.jobPosition.job
            const jobId = jobData.id
            if (!jobMap.has(jobId)) {
                jobMap.set(jobId, {
                    id: jobId,
                    title: jobData.title,
                    location: jobData.location,
                    work_date: jobData.work_date,
                    start_time: jobData.start_time,
                    end_time: jobData.end_time,
                    status: jobData.status,
                    positions: new Map(),
                    total_expense: 0
                })
            }
            const job = jobMap.get(jobId)
            const position = payment.job_participation.jobPosition
            const positionId = position.id
            if (!job.positions.has(positionId)) {
                job.positions.set(positionId, {
                    position_name: position.position_name,
                    wage: position.wage,
                    required_people: position.required_people,
                    approved_workers: 0,
                    total_paid: 0
                })
            }
            const positionData = job.positions.get(positionId)
            positionData.approved_workers++
            positionData.total_paid += Number(payment.amount)
            job.total_expense += Number(payment.amount)
        }
        // ถ้าไม่มีข้อมูล ให้ return array ว่าง
        if (jobMap.size === 0) {
            return []
        }
        return Array.from(jobMap.values()).map(job => ({
            ...job,
            positions: Array.from(job.positions.values())
        })).sort((a, b) => new Date(a.work_date) - new Date(b.work_date))
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


    const [total, approved, rejected, pending, completed, cancelled] = await Promise.all([
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
        }),
        // นับที่ยกเลิก
        prisma.jobParticipation.count({
            where: {
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: 'cancelled'
            }
        })

    ])

    return {
        total,
        approved,
        rejected,
        pending,
        completed,
        cancelled
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
                    jobPosition: {
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
            where: {
                work_date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                id: true,
                title: true,
                work_date: true,
                start_time: true,
                end_time: true,
                location: true,
                details: true,
                status: true,
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true
                    }
                },
                JobPositions: {
                    select: {
                        id: true,
                        position_name: true,
                        required_people: true,
                        wage: true,
                        status: true,
                        details: true,
                        JobParticipation: {
                            select: {
                                id: true,
                                status: true
                            }
                        }
                    }
                },
                JobAdmins: {
                    select: {
                        id: true,
                        admin: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email: true,
                                profile_pic: true,
                                phone: true,
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
        const [workHistories, completedJobs, monthlyIncome] = await Promise.all([
            // คะแนนเฉลี่ย
            prisma.workHistory.findMany({
                where: {
                    jobParticipation: {
                        user_id: userId,
                        status: 'completed'
                    }
                },
                select: {
                    is_passed_evaluation: true,
                    appearance_score: true,
                    quality_score: true,
                    quantity_score: true,
                    manner_score: true,
                    punctuality_score: true,
                    total_score: true
                }
            }),

            // นับจำนวนงานที่เสร็จสิ้นทั้งหมด
            prisma.jobParticipation.count({
                where: {
                    user_id: userId,
                    status: 'completed'
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

            // ายได้เฉพาะงานที่ผ่านการประเมิน
            if (isPassedEvaluation) {
                return total + Number(job.jobPosition.wage);
            }
            return total;
        }, 0);


        const scores = workHistories.map(wh =>
            wh.is_passed_evaluation ? (wh.total_score || 0) : 0
        );

        const averageScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;
        return {
            averageRating: Number(averageScore).toFixed(1),
            completedJobs,
            monthlyIncome: totalMonthlyIncome
        };
    } catch (error) {
        console.error('Error in getUserDashboardStats:', error);
        throw error;
    }
};


// รายได้ที่จ่ายแล้ว
export const getRecentPaidIncomes = async (userId) => {
    try {
        return await prisma.jobParticipation.findMany({
            where: {
                user_id: userId,
                status: 'completed',
                PaymentHistory: {
                    some: {
                        payment_status: 'paid'
                    }
                }
            },
            select: {
                id: true,
                jobPosition: {
                    select: {
                        position_name: true,
                        wage: true,
                        job: {
                            select: {
                                title: true,
                                work_date: true
                            }
                        }
                    }
                },
                PaymentHistory: {
                    where: {
                        payment_status: 'paid'
                    },
                    select: {
                        amount: true,
                        paid_at: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5
        });
    } catch (error) {
        console.error('Error in getRecentPaidIncomes:', error);
        throw error;
    }
};

// รายได้ที่รอจ่าย
export const getPendingIncomes = async (userId) => {
    try {
        return await prisma.jobParticipation.findMany({
            where: {
                user_id: userId,
                status: 'completed',
                PaymentHistory: {
                    some: {
                        payment_status: 'pending'
                    }
                }
            },
            select: {
                id: true,
                jobPosition: {
                    select: {
                        position_name: true,
                        wage: true,
                        job: {
                            select: {
                                title: true,
                                work_date: true
                            }
                        }
                    }
                },
                PaymentHistory: {
                    where: {
                        payment_status: 'pending'
                    },
                    select: {
                        amount: true,
                        created_at: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5
        });
    } catch (error) {
        console.error('Error in getPendingIncomes:', error);
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