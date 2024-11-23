import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserHistoryStore = defineStore('userHistory', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        jobHistory: {
            data: [],
            totalJobs: 0,
            currentPage: 1,
            totalPages: 1
        },

        loading: false,
        error: null
    }),

    actions: {
        async fetchUserHistory(userId) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.get(`${this.baseURL}/api/users/history/${userId}`)

                this.history = response.data.jobHistory.map(job => ({
                    id: job.id,
                    created_at: job.created_at,
                    status: job.status,
                    jobPosition: {
                        position_name: job.jobPosition?.position_name || 'ไม่ระบุตำแหน่ง',
                        wage: job.jobPosition?.wage || 0,
                        job: {
                            title: job.jobPosition?.job?.title || 'ไม่ระบุงาน',
                            location: job.jobPosition?.job?.location,
                            work_date: job.jobPosition?.job?.work_date
                        }
                    },
                    workHistories: job.workHistories || []
                }))

                this.currentPage = response.data.currentPage
                this.totalPages = response.data.totalPages
                this.totalJobs = response.data.totalJobs
            } catch (error) {
                console.error('Error fetching job history:', error)
                this.error = error.response?.data?.message || 'ไม่สามารถดึงข้อมูลประวัติการทำงานได้'
                throw error
            } finally {
                this.loading = false
            }
        },

        clearHistory() {
            this.jobHistory = {
                data: [],
                totalJobs: 0,
                currentPage: 1,
                totalPages: 1
            }
            this.error = null
        }
    },



})