import { defineStore } from 'pinia'
import axios from 'axios'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        loading: false,
        error: null,
        // ข้อมูลสถิติต่างๆ
        stats: {
            totalUsers: 0,
            totalJobs: 0,
            openJobs: 0,
            inProgressJobs: 0,
            completedJobs: 0,
            totalExpenses: 0,
            monthlyApplications: 0,
            monthlyApplicationsDetails: {
                approved: 0,
                rejected: 0,
                pending: 0
            }
        },
        // ข้อมูลงานในปฏิทิน
        calendarEvents: [],
        selectedEvent: null,
        // ข้อมูลผู้ใช้ที่มีคะแนนสูงสุด
        topUsers: [],
        averageRating: 0

    }),

    actions: {
        // ดึงข้อมูล Dashboard ทั้งหมด
        async fetchDashboardData(month, year) {
            try {
                this.loading = true
                const [dashboardResponse, eventsResponse] = await Promise.all([
                    axios.get(`${this.baseURL}/api/dashboard/stats`),
                    axios.get(`${this.baseURL}/api/dashboard/calendar-events`, {
                        params: { month, year }
                    })
                ])

                // อัพเดทข้อมูลทั่วไป
                this.stats = dashboardResponse.data.stats

                // อัพเดทข้อมูลปฏิทิน
                this.calendarEvents = eventsResponse.data.events

                this.error = null
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                this.error = 'ไม่สามารถโหลดข้อมูล Dashboard ได้'
            } finally {
                this.loading = false
            }
        },
        // ดึงข้อมูลสถิติ
        async fetchStats() {
            return await axios.get(`${this.baseURL}/api/dashboard/stats`)
        },

        // ดึงข้อมูลงานในปฏิทิน
        async fetchCalendarEvents(month, year) {
            return await axios.get(`${this.baseURL}/api/dashboard/calendar-events`, {
                params: { month, year }
            })
        },

        // ดึงรายละเอียดงาน
        async fetchEventDetails(eventId) {
            try {
                const response = await axios.get(`${this.baseURL}/api/jobs/${eventId}`)
                this.selectedEvent = this.formatEventDetails(response.data)
                return this.selectedEvent
            } catch (error) {
                console.error('Error fetching event details:', error)
                throw error
            }
        },
        async fetchTopUsersRatings() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`${this.baseURL}/api/work-history/users-ratings`);
                console.log('API Response:', response.data); // เพิ่ม log ดูข้อมูลที่ได้
                if (response.data.data) {
                    this.averageRating = response.data.data.averageScore;
                    this.topUsers = response.data.data.topUsers;
                }
                return true;
            } catch (error) {
                console.error('Error fetching ratings:', error);
                this.error = error.response?.data?.message || 'ไม่สามารถดึงข้อมูลคะแนนได้';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        // จัดรูปแบบข้อมูลงาน
        formatEventDetails(event) {
            return {
                id: event.id,
                title: event.title,
                location: event.location,
                work_date: event.work_date,
                start_time: event.start_time,
                end_time: event.end_time,
                details: event.details || '',
                status: event.status || 'PENDING',
                JobPositions: this.formatJobPositions(event.JobPositions),
                creator: event.creator,
                created_at: event.created_at,
                updated_at: event.updated_at
            }
        },

        // จัดรูปแบบข้อมูลตำแหน่งงาน
        formatJobPositions(positions) {
            return positions?.map(pos => ({
                id: pos.id,
                position_name: pos.position_name,
                wage: pos.wage,
                required_people: pos.required_people,
                details: pos.details || '',
                status: this.getPositionStatus(pos),
                JobParticipation: this.formatParticipations(pos.JobParticipation)
            })) || []
        },

        // จัดรูปแบบข้อมูลผู้สมัคร
        formatParticipations(participations) {
            return participations?.map(participation => ({
                id: participation.id,
                status: participation.status,
                user: participation.user
            })) || []
        },

        // แปลงสถานะตำแหน่งงาน
        getPositionStatus(position) {
            if (!position) return 'PENDING'
            return position.status?.toUpperCase() || 'PENDING'
        },
        getJobStatus(date) {
            const now = new Date()
            const workDate = new Date(date)

            // ถ้าเป็นวันในอดีต = เสร็จสิ้น
            if (workDate < now && workDate.toDateString() !== now.toDateString()) {
                return 'completed'
            }
            // ถ้าเป็นวันเดียวกัน = กำลังดำเนินงาน
            else if (workDate.toDateString() === now.toDateString()) {
                return 'in_progress'
            }
            // ถ้าเป็นวันในอนาคต = ประกาศรับสมัคร
            else {
                return 'published'
            }
        },
        getScoreItems(user) {
            return [
                {
                    title: 'การแต่งกาย',
                    value: user.appearance_score || 0,
                    icon: 'fas fa-tshirt'
                },
                {
                    title: 'คุณภาพงาน',
                    value: user.quality_score || 0,
                    icon: 'fas fa-star'
                },
                {
                    title: 'ปริมาณงาน',
                    value: user.quantity_score || 0,
                    icon: 'fas fa-chart-line'
                },
                {
                    title: 'มารยาท',
                    value: user.manner_score || 0,
                    icon: 'fas fa-smile'
                },
                {
                    title: 'การตรงต่อเวลา',
                    value: user.punctuality_score || 0,
                    icon: 'fas fa-clock'
                }
            ]
        },

        getScoreClass(score) {
            if (!score) return 'text-gray-400 dark:text-gray-500'
            return score === 2
                ? 'text-green-600 dark:text-green-400'
                : score === 1
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
        },

        getTotalScoreClass(rating) {
            if (rating >= 8) return 'text-green-600 dark:text-green-400'
            if (rating >= 6) return 'text-yellow-600 dark:text-yellow-400'
            return 'text-red-600 dark:text-red-400'
        },

        getMedalClass(index) {
            if (index === 0) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'
            if (index === 1) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            if (index === 2) return 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
            return ''
        },

        getBorderClass(index) {
            if (index === 0) return 'border-yellow-400 dark:border-yellow-500'
            if (index === 1) return 'border-gray-300 dark:border-gray-500'
            if (index === 2) return 'border-amber-400 dark:border-amber-500'
            return 'border-transparent'
        },
        getEventClasses(status) {
            const classes = {
                completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
                published: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            }
            return classes[status]
        },

        getStatusDot(date) {
            const status = this.getJobStatus(date)
            const colors = {
                completed: 'bg-green-500 dark:bg-green-400',
                in_progress: 'bg-yellow-500 dark:bg-yellow-400',
                published: 'bg-blue-500 dark:bg-blue-400'
            }
            return colors[status]
        },
        formatCurrency(value) {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            }).format(value)
        },
        getProfileImageUrl(profileImage) {
            if (!profileImage) return '/default-avatar.png'
            return `${this.baseURL}/uploads/profiles/${profileImage}`
        }
    },






    getters: {
        sortedUsers: (state) => (sortOption) => {
            if (!state.topUsers?.length) return []

            return [...state.topUsers].sort((a, b) => {
                if (sortOption === 'rating') {

                    const scoreA = a.averageScores?.total || 0
                    const scoreB = b.averageScores?.total || 0
                    return scoreB - scoreA
                }
                if (sortOption === 'jobCount') {
                    return (b.jobCount || 0) - (a.jobCount || 0)
                }
                return 0
            })
        },
        eventsByDate: (state) => {
            const eventMap = {}
            state.calendarEvents.forEach(event => {
                const dateKey = new Date(event.work_date).toDateString()
                if (!eventMap[dateKey]) {
                    eventMap[dateKey] = []
                }
                eventMap[dateKey].push(event)
            })
            return eventMap
        },
        // แปลงค่าเงินเป็นรูปแบบสกุลเงินบาท
        formattedTotalExpenses: (state) => {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            }).format(state.stats.totalExpenses)
        },

        // คำนวณเปอร์เซ็นต์งานแต่ละสถานะ
        jobStatusPercentages: (state) => {
            const total = state.stats.totalJobs
            if (total === 0) return { open: 0, inProgress: 0, completed: 0 }

            return {
                open: Math.round((state.stats.openJobs / total) * 100),
                inProgress: Math.round((state.stats.inProgressJobs / total) * 100),
                completed: Math.round((state.stats.completedJobs / total) * 100)
            }
        },

        // จัดรูปแบบคะแนนเฉลี่ย
        formattedAverageRating: (state) => {
            return state.averageRating.toFixed(1)
        },

        // เช็คว่ามีข้อมูลพร้อมแสดงผลหรือยัง
        isDataReady: (state) => {
            return !state.loading && !state.error
        },

    }
})