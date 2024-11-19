import { defineStore } from 'pinia'
import axios from 'axios'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        loading: false,
        error: null,
        stats: {
            totalUsers: 0,
            totalJobs: 0,
            openJobs: 0,
            inProgressJobs: 0,
            completedJobs: 0,
            totalExpenses: 0,
            monthlyApplications: 0
        },
        calendarEvents: [],
        topUsers: [],
        averageRating: 0
    }),

    actions: {
        async fetchDashboardData() {
            try {
                this.loading = true
                const [dashboardResponse, eventsResponse] = await Promise.all([
                    axios.get(`${this.baseURL}/api/dashboard/stats`),
                    axios.get(`${this.baseURL}/api/dashboard/calendar-events`)
                ])

                // อัพเดทข้อมูลทั่วไป
                this.stats = dashboardResponse.data.stats
                this.topUsers = dashboardResponse.data.topUsers
                this.averageRating = dashboardResponse.data.averageRating

                // อัพเดทข้อมูลปฏิทิน
                this.calendarEvents = eventsResponse.data.events

                this.error = null
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                this.error = 'ไม่สามารถโหลดข้อมูล Dashboard ได้'
            } finally {
                this.loading = false
            }
        }
    },

    getters: {
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
        }
    }
})