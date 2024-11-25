import * as DashboardModel from '../models/dashboardModel.js'


async function calculateExpenses() {
    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // ย้อนไปวันอาทิตย์
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // ดึงข้อมูลตำแหน่งงานพร้อม JobParticipation
    const [dailyJobs, weeklyJobs, monthlyJobs] = await Promise.all([
        DashboardModel.getExpensesByDateRange(startOfDay, now),
        DashboardModel.getExpensesByDateRange(startOfWeek, now),
        DashboardModel.getExpensesByDateRange(startOfMonth, now)
    ])
    console.log('Monthly jobs:', monthlyJobs)
    return {
        daily: calculateTotalExpenses(dailyJobs),
        weekly: calculateTotalExpenses(weeklyJobs),
        monthly: calculateTotalExpenses(monthlyJobs)
    }
}

function calculateTotalExpenses(positions) {
    return positions.reduce((total, position) => {
        const wage = Number(position.wage) || 0
        // นับเฉพาะผู้สมัครที่ได้รับการอนุมัติหรือทำงานเสร็จแล้ว
        const approvedParticipants = position.JobParticipation.filter(p => {
            const isApprovedStatus = p.status === 'approved' || p.status === 'completed'
            // เช็คว่ามีประวัติการทำงานหรือไม่
            const hasWorkHistory = p.workHistories && p.workHistories.length > 0
            return isApprovedStatus && hasWorkHistory
        }).length

        const expense = wage * approvedParticipants
        console.log(`
            Position: ${position.id}
            Wage: ${wage}
            Approved Participants: ${approvedParticipants}
            Expense: ${expense}
            Job Status: ${position.job?.status}
            Work Date: ${position.job?.work_date}
        `)

        return total + expense
    }, 0)
}
export const getDashboardStats = async (req, res) => {
    try {
        // ดึงข้อมูลพื้นฐาน
        const [totalUsers, jobs, expenses] = await Promise.all([
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
            total: applications.length,
            approved: applications.filter(app => app.status === 'approved').length,
            rejected: applications.filter(app => app.status === 'rejected').length,
            pending: applications.filter(app => app.status === 'pending').length
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

            // เพิ่มคะแนนแต่ละด้าน
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

        // ส่งข้อมูลกลับ
        res.json({
            stats: {
                totalUsers,
                totalJobs: jobStats.total,
                jobs: jobStats,
                openJobs: jobStats.open,
                inProgressJobs: jobStats.inProgress,
                completedJobs: jobStats.completed,
                expenses,
                monthlyApplications: monthlyApplications.total,
                monthlyApplicationsDetails: {
                    approved: monthlyApplications.approved,
                    rejected: monthlyApplications.rejected,
                    pending: monthlyApplications.pending
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