import * as DashboardModel from '../models/dashboardModel.js'



export const getDashboardStats = async (req, res) => {
    try {
        // ดึงข้อมูลพื้นฐาน
        const totalUsers = await DashboardModel.getTotalUsers()
        const jobs = await DashboardModel.getAllJobs()

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
        const totalExpenses = await DashboardModel.getCurrentMonthExpenses(startOfMonth)
        const monthlyApplications = await DashboardModel.getMonthlyApplications(startOfMonth)

        // ดึงและคำนวณข้อมูลการให้คะแนน
        const workHistories = await DashboardModel.getRatedWorkHistories()

        // คำนวณคะแนนเฉลี่ยของแต่ละผู้ใช้
        const userRatings = workHistories.reduce((acc, history) => {
            const userId = history.jobParticipation.user.id
            if (!acc[userId]) {
                acc[userId] = {
                    user: history.jobParticipation.user,
                    ratings: []
                }
            }
            acc[userId].ratings.push(history.rating)
            return acc
        }, {})

        // จัดอันดับผู้ใช้ที่มีคะแนนสูงสุด
        const topUsers = Object.values(userRatings)
            .map(data => ({
                id: data.user.id,
                name: `${data.user.first_name} ${data.user.last_name}`,
                avatar: data.user.profile_image,
                rating: +(data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
            }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)

        // คำนวณคะแนนเฉลี่ยรวม
        const averageRating = workHistories.length
            ? +(workHistories.reduce((sum, history) => sum + history.rating, 0) / workHistories.length).toFixed(1)
            : 0

        // ส่งข้อมูลกลับ
        res.json({
            stats: {
                totalUsers,
                totalJobs: jobStats.total,
                openJobs: jobStats.open,
                inProgressJobs: jobStats.inProgress,
                completedJobs: jobStats.completed,
                totalExpenses: totalExpenses._sum.wage || 0,
                monthlyApplications
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
        const events = await DashboardModel.getCalendarEvents()
        res.json({ events })
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        res.status(500).json({ error: error.message })
    }
}