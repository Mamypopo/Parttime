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
            jobs: {           // เปลี่ยนโครงสร้างเป็น jobs object
                total: 0,
                open: 0,
                inProgress: 0,
                completed: 0
            },
            expenses: {
                daily: 0,
                weekly: 0,
                monthly: 0
            },
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
                const stats = dashboardResponse.data.stats
                // ตรวจสอบและแปลงข้อมูลให้ถูกต้อง
                this.stats = {
                    totalUsers: Number(stats.totalUsers) || 0,
                    jobs: {
                        total: Number(stats.jobs?.total) || 0,
                        open: Number(stats.jobs?.open) || 0,
                        inProgress: Number(stats.jobs?.inProgress) || 0,
                        completed: Number(stats.jobs?.completed) || 0
                    },
                    expenses: {
                        daily: Number(stats.expenses?.daily) || 0,
                        weekly: Number(stats.expenses?.weekly) || 0,
                        monthly: Number(stats.expenses?.monthly) || 0
                    },
                    monthlyApplications: Number(stats.monthlyApplications) || 0,
                    monthlyApplicationsDetails: {
                        approved: Number(stats.monthlyApplicationsDetails?.approved) || 0,
                        rejected: Number(stats.monthlyApplicationsDetails?.rejected) || 0,
                        pending: Number(stats.monthlyApplicationsDetails?.pending) || 0
                    }
                }

                console.log('Updated stats:', this.stats) // เพิ่ม log เพื่อตรวจสอบ

                this.calendarEvents = eventsResponse.data.events || []
                this.error = null
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                this.error = 'ไม่สามารถโหลดข้อมูล Dashboard ได้'
            } finally {
                this.loading = false
            }
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
                if (response.data.data) {
                    // รับค่า averageScore จาก API โดยตรง
                    this.averageRating = response.data.data.averageScore;

                    // แปลงข้อมูล topUsers ให้ตรงกับโครงสร้างที่ต้องการ
                    this.topUsers = response.data.data.topUsers.map(user => ({
                        id: user.id,
                        name: user.name,
                        profile_image: user.profile_image,
                        jobCount: user.jobCount,
                        averageScores: {
                            appearance: user.averageScores.appearance,
                            manner: user.averageScores.manner,
                            punctuality: user.averageScores.punctuality,
                            quality: user.averageScores.quality,
                            quantity: user.averageScores.quantity,
                            total: user.averageScores.total
                        }
                    }));
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
        formattedExpenses: (state) => {
            const formatter = new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            })
            return {
                daily: formatter.format(state.stats.expenses.daily),
                weekly: formatter.format(state.stats.expenses.weekly),
                monthly: formatter.format(state.stats.expenses.monthly)
            }
        }


    }
})