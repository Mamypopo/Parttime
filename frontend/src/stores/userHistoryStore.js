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

                if (response.data) {
                    const formattedJobs = response.data.jobHistory.map((job) => ({
                        id: job.id || undefined,
                        title: job.jobPosition?.job?.title || 'ไม่ระบุชื่องาน',
                        position_name: job.jobPosition?.position_name || 'ไม่ระบุตำแหน่ง',
                        location: job.jobPosition?.job?.location || 'ไม่ระบุสถานที่',
                        created_at: job.created_at,
                        updated_at: job.updated_at,
                        wage: job.jobPosition?.wage || 0,
                        work_date: job.jobPosition?.job?.work_date || null,
                        workHistories: job.workHistories || []
                    }))

                    this.jobHistory = {
                        data: formattedJobs,
                        totalJobs: response.data.totalJobs || 0,
                        currentPage: response.data.currentPage || 1,
                        totalPages: response.data.totalPages || 1
                    }
                }
                return true
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
    }
})