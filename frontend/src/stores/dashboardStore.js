import { defineStore } from 'pinia'
import api from '@/service/axios'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        loading: false,
        error: null,
        // ข้อมูลสถิติต่างๆ
        stats: {
            totalUsers: 0,
            userDetails: {
                normal: 0,
                admin: 0,
                pending: 0,
                rejected: 0
            },
            jobExpenses: [],
            jobs: {
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
                pending: 0,
                completed: 0,
                cancelled: 0

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
                const [dashboardResponse, eventsResponse,] = await Promise.all([
                    api.get('/api/dashboard/stats'),
                    api.get('/api/dashboard/calendar-events', {
                        params: { month, year }
                    })
                ])

                // อัพเดทข้อมูลทั่วไป
                const stats = dashboardResponse.data.stats
                // ตรวจสอบและแปลงข้อมูลให้ถูกต้อง
                this.stats = {
                    totalUsers: Number(stats.totalUsers) || 0,
                    userDetails: {  // เพิ่มการแปลงข้อมูลผู้ใช้
                        normal: Number(stats.userDetails?.normal) || 0,
                        admin: Number(stats.userDetails?.admin) || 0,
                        pending: Number(stats.userDetails?.pending) || 0,
                        rejected: Number(stats.userDetails?.rejected) || 0
                    },
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
                    jobExpenses: stats.jobExpenses || [],
                    monthlyApplications: Number(stats.monthlyApplications) || 0,
                    monthlyApplicationsDetails: {
                        approved: Number(stats.monthlyApplicationsDetails?.approved) || 0,
                        rejected: Number(stats.monthlyApplicationsDetails?.rejected) || 0,
                        pending: Number(stats.monthlyApplicationsDetails?.pending) || 0,
                        completed: Number(stats.monthlyApplicationsDetails?.completed) || 0,
                        cancelled: Number(stats.monthlyApplicationsDetails?.cancelled) || 0
                    }
                }


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
                const response = await api.get(`/api/jobs/${eventId}`)
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
                const response = await api.get('/api/dashboard/users-ratings');
                if (response.data.data) {

                    this.averageRating = response.data.data.averageScore;


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
                creator: event.creator ? {
                    id: event.creator.id,
                    first_name: event.creator.first_name || 'ไม่ระบุ',
                    last_name: event.creator.last_name || 'ไม่ระบุ',
                    phone: event.creator.phone
                } : null,
                created_at: event.created_at,
                updated_at: event.updated_at,
                JobAdmins: event.JobAdmins?.map(item => ({
                    id: item.id || item.admin.id,
                    admin: item.admin
                })) || []
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
            return `${this.baseApiUrl}/uploads/profiles/${profileImage}`
        }
    },






    getters: {

        baseApiUrl: () => import.meta.env.VITE_API_URL,

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
            // สร้างชื่อเดือนภาษาไทย
            const currentDate = new Date()
            const thaiYear = currentDate.getFullYear() + 543
            const thaiMonth = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(currentDate)
            const monthYear = `${thaiMonth} ${thaiYear}`
            return {
                daily: {
                    amount: formatter.format(state.stats.expenses.daily),
                    date: new Date().toLocaleDateString('th-TH', { day: 'numeric' })
                },
                weekly: {
                    amount: formatter.format(state.stats.expenses.weekly),
                    week: `สัปดาห์ที่ ${Math.ceil(currentDate.getDate() / 7)}`
                },
                monthly: {
                    amount: formatter.format(state.stats.expenses.monthly),
                    month: monthYear
                },
                raw: { // เก็บข้อมูลดิบสำหรับ export
                    daily: state.stats.expenses.daily,
                    weekly: state.stats.expenses.weekly,
                    monthly: state.stats.expenses.monthly,
                    date: currentDate,
                    monthYear: monthYear
                }
            }
        }


    }
})