import * as DashboardModel from '../models/dashboardModel.js'
import * as workHistoryModel from '../models/workHistoryModel.js'

// คำนวณรายจ่ายเป็นช่วงเวลา
async function calculateExpenses() {
    try {
        // กำหนดช่วงเวลา
        const now = new Date()

        // วันนี้ (00:00:00 - 23:59:59)
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(startOfDay)
        endOfDay.setHours(23, 59, 59, 999)
        // สัปดาห์นี้ (7 วันย้อนหลัง)
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - 6) // นับ 7 วันย้อนหลัง (รวมวันนี้)
        startOfWeek.setHours(0, 0, 0, 0)

        // เดือนนี้
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        startOfMonth.setHours(0, 0, 0, 0)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        // ดึงข้อมูลค่าใช้จ่ายแต่ละช่วง
        const [dailyExp, weeklyExp, monthlyExp] = await Promise.all([
            DashboardModel.getExpensesByDateRange(startOfDay, endOfDay),
            DashboardModel.getExpensesByDateRange(startOfWeek, now),
            DashboardModel.getExpensesByDateRange(startOfMonth, endOfMonth)
        ])
        // คำนวณยอดรวม
        const expenses = {
            daily: dailyExp.reduce((sum, payment) => sum + Number(payment.amount), 0),
            weekly: weeklyExp.reduce((sum, payment) => sum + Number(payment.amount), 0),
            monthly: monthlyExp.reduce((sum, payment) => sum + Number(payment.amount), 0)
        }
        return expenses
    } catch (error) {
        console.error('Error calculating expenses:', error)
        throw new Error('ไม่สามารถคำนวณค่าใช้จ่ายได้')
    }
}



// ดึงข้อมูลต่างๆไปแสดงที่ dashboard ( รายจ่ายหลังจากคำนวณแล้ว งานทั้งหมด ผู้ใช้ทั้งหมด )
export const getDashboardStats = async (req, res) => {
    try {
        // ดึงข้อมูลพื้นฐาน
        const [userStats, jobs, expenses] = await Promise.all([
            DashboardModel.getTotalUsers(),
            DashboardModel.getAllJobs(),
            calculateExpenses()
        ])
        // คำนวณสถิติงาน
        const jobStats = {
            total: jobs.length,
            open: jobs.filter(job => job.status === 'published').length,
            inProgress: jobs.filter(job => job.status === 'in_progress').length,
            completed: jobs.filter(job => job.status === 'completed').length
        }

        // ตั้งค่าวันที่เริ่มต้นเดือนปัจจุบัน
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        // ดึงข้อมูลการเงินและการสมัคร
        const positions = await DashboardModel.getCurrentMonthExpenses(startOfMonth)

        const applications = await DashboardModel.getMonthlyApplicationsWithStatus(startOfMonth)
        const monthlyApplications = {
            total: applications.total,
            approved: applications.approved,
            rejected: applications.rejected,
            pending: applications.pending,
            completed: applications.completed,
            cancelled: applications.cancelled
        }

        // ดึงข้อมูลผู้ใช้ที่ลงทะเบียนล่าสุด
        const recentRegistrations = await DashboardModel.getRecentRegistrations()
        const pendingRegistrations = recentRegistrations.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            avatar: user.profile_image,
            registeredAt: user.created_at,
            status: user.approved
        }))

        // ดึงและคำนวณข้อมูลการให้คะแนน
        const workHistories = await DashboardModel.getRatedWorkHistories()
        // คำนวณคะแนนเฉลี่ยของแต่ละผู้ใช้
        const userRatings = workHistories.reduce((acc, history) => {
            const userId = history.jobParticipation.user.id
            if (!acc[userId]) {
                acc[userId] = {
                    user: history.jobParticipation.user,
                    totalScore: 0,
                    jobCount: 0,
                    scores: {
                        appearance: 0,
                        quality: 0,
                        quantity: 0,
                        manner: 0,
                        punctuality: 0
                    },
                    ratingCount: 0
                }
            }

            // คะแนนแต่ละด้าน
            if (history.appearance_score) {
                acc[userId].scores.appearance += history.appearance_score
            }
            if (history.quality_score) {
                acc[userId].scores.quality += history.quality_score
            }
            if (history.quantity_score) {
                acc[userId].scores.quantity += history.quantity_score
            }
            if (history.manner_score) {
                acc[userId].scores.manner += history.manner_score
            }
            if (history.punctuality_score) {
                acc[userId].scores.punctuality += history.punctuality_score
            }

            acc[userId].jobCount += 1
            acc[userId].ratingCount += 1
            return acc
        }, {})

        // คำนวณคะแนนเฉลี่ยและจัดอันดับ
        const topUsers = Object.values(userRatings)
            .map(data => ({
                id: data.user.id,
                name: `${data.user.first_name} ${data.user.last_name}`,
                profile_image: data.user.profile_image,
                jobCount: data.jobCount,
                rating: data.ratingCount ?
                    ((data.scores.appearance + data.scores.quality +
                        data.scores.quantity + data.scores.manner +
                        data.scores.punctuality) / (data.ratingCount * 5)) * 2 : 0,
                appearance_score: data.ratingCount ? (data.scores.appearance / data.ratingCount) : 0,
                quality_score: data.ratingCount ? (data.scores.quality / data.ratingCount) : 0,
                quantity_score: data.ratingCount ? (data.scores.quantity / data.ratingCount) : 0,
                manner_score: data.ratingCount ? (data.scores.manner / data.ratingCount) : 0,
                punctuality_score: data.ratingCount ? (data.scores.punctuality / data.ratingCount) : 0
            }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)

        // คำนวณคะแนนเฉลี่ยรวม
        const averageRating = topUsers.length ?
            topUsers.reduce((sum, user) => sum + user.rating, 0) / topUsers.length : 0



        // เพิ่มการดึงข้อมูลรายงานค่าใช้จ่าย
        const jobExpenses = await DashboardModel.getJobExpensesReport(
            new Date().getMonth(),
            new Date().getFullYear()
        )

        // แปลงข้อมูลให้เหมาะกับการใช้งาน
        const formattedJobExpenses = jobExpenses.map(job => {
            if (!job) return null
            let totalPeople = 0
            let totalExpense = 0

            const positions = job.positions?.map(position => {
                if (!position) return null
                totalPeople += position.required_people || 0
                totalExpense += position.total_paid || 0
                return {
                    position_name: position.position_name || '',
                    required_people: position.required_people || 0,
                    approved_workers: position.approved_workers || 0,
                    wage: position.wage || 0,
                    subtotal: position.total_paid || 0
                }
            }).filter(Boolean) || []  // กรอง null ออกและป้องกัน undefined
            return {
                id: job.id || '',
                title: job.title || '',
                location: job.location || '',
                work_date: job.work_date || null,
                start_time: job.start_time || null,
                end_time: job.end_time || null,
                positions: positions,
                total_people: totalPeople,
                total_expense: totalExpense
            }
        }).filter(Boolean) || []

        // ส่งข้อมูลกลับ
        res.json({
            stats: {
                totalUsers: userStats.total,
                userDetails: userStats.userDetails,
                totalJobs: jobStats.total,
                jobs: jobStats,
                openJobs: jobStats.open,
                inProgressJobs: jobStats.inProgress,
                completedJobs: jobStats.completed,
                expenses,
                jobExpenses: formattedJobExpenses,
                monthlyApplications: monthlyApplications.total,
                monthlyApplicationsDetails: {
                    approved: monthlyApplications.approved,
                    rejected: monthlyApplications.rejected,
                    pending: monthlyApplications.pending,
                    completed: monthlyApplications.completed,
                    cancelled: monthlyApplications.cancelled
                },
                recentRegistrations: pendingRegistrations
            },
            topUsers,
            averageRating
        })

    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard'
        })
    }
}

// ดึงตารางงาน
export const getCalendarEvents = async (req, res) => {
    try {
        const { month, year } = req.query
        const events = await DashboardModel.getEvents(
            month ? parseInt(month) : undefined,
            year ? parseInt(year) : undefined
        )
        res.json({ events })
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        res.status(500).json({ error: error.message })
    }
}

// จัดอันดับผู้ใช้ที่มีคะแนนมากที่สุด
export const getTopUsersWithRatings = async (req, res) => {
    try {
        const data = await workHistoryModel.getTopUsersWithRatings();
        res.status(200).json({
            message: 'ดึงข้อมูลสำเร็จ',
            data: data
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: error.message
        });
    }
};



export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // ดึงข้อมูลทั้งหมดพร้อมกัน
        const [stats, todaySchedule, paidIncomes, pendingIncomes, upcomingDeadlines] = await Promise.all([
            DashboardModel.getUserDashboardStats(userId),
            DashboardModel.getTodaySchedule(userId),
            DashboardModel.getRecentPaidIncomes(userId),
            DashboardModel.getPendingIncomes(userId),
            DashboardModel.getUpcomingDeadlines(userId)
        ]);

        // แปลงข้อมูลตารางงานให้อยู่ในรูปแบบที่ต้องการ
        const formattedSchedule = todaySchedule.map(job => ({
            id: job.id,
            start_time: job.jobPosition.job.start_time,
            end_time: job.jobPosition.job.end_time,
            title: job.jobPosition.position_name,
            workplace: job.jobPosition.job.title,
            location: job.jobPosition.job.location,
            status: job.status,

        }));

        // แปลงข้อมูลงานที่ใกล้ถึงกำหนด
        const formattedDeadlines = upcomingDeadlines.map(job => {
            const workDate = new Date(job.jobPosition.job.work_date);
            const today = new Date();
            const daysLeft = Math.ceil((workDate - today) / (1000 * 60 * 60 * 24));

            return {
                id: job.id,
                title: job.jobPosition.position_name,
                workplace: job.jobPosition.job.title,
                workDate: job.jobPosition.job.work_date,
                daysLeft: daysLeft, // จำนวนวันที่เหลือ
                location: job.jobPosition.job.location,
                startTime: job.jobPosition.job.start_time,
                endTime: job.jobPosition.job.end_time,
                status: job.status
            };
        });

        // แปลงข้อมูลรายได้ที่จ่ายแล้ว
        const formattedPaidIncomes = paidIncomes.map(income => ({
            id: income.id,
            jobTitle: income.jobPosition.position_name,
            workplace: income.jobPosition.job.title,
            date: income.PaymentHistory[0].paid_at,
            amount: Number(income.PaymentHistory[0].amount)
        }));

        // แปลงข้อมูลรายได้ที่รอจ่าย
        const formattedPendingIncomes = pendingIncomes.map(income => ({
            id: income.id,
            jobTitle: income.jobPosition.position_name,
            workplace: income.jobPosition.job.title,
            date: income.jobPosition.job.work_date,
            amount: Number(income.jobPosition.wage)
        }));

        res.status(200).json({
            stats,
            todaySchedule: formattedSchedule,
            paidIncomes: formattedPaidIncomes,
            pendingIncomes: formattedPendingIncomes,
            upcomingDeadlines: formattedDeadlines
        });

    } catch (error) {
        console.error('Error in getUserDashboard:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard'
        });
    }
};


