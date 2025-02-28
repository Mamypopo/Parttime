import { defineStore } from 'pinia'
import api from '@/service/axios'

export const useUserHistoryStore = defineStore('userHistory', {
    state: () => ({
        jobHistory: {
            data: [],
            totalJobs: 0,
            currentPage: 1,
            totalPages: 1
        },
        history: [],
        loading: false,
        error: null
    }),

    actions: {
        // สำหรับดูประวัติทั้งหมด
        async fetchUserHistory(userId) {
            this.loading = true
            this.error = null

            try {
                const response = await api.get(`/api/users/history/${userId}`)

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

        // สำหรับดูผลประเมินเฉพาะงาน 
        async fetchJobEvaluation(userId, jobId) {
            try {
                this.loading = true
                const response = await api.get(
                    `/api/users/evaluation/${jobId}/${userId}`
                )
                console.log('Evaluation Response:', response.data);
                if (!response.data) {
                    throw new Error('ไม่พบข้อมูลการประเมิน')
                }


                const { scores, comment, isPassed, jobTitle } = response.data

                return {
                    appearance_score: Number(scores.appearance || 0),
                    quality_score: Number(scores.quality || 0),
                    quantity_score: Number(scores.quantity || 0),
                    manner_score: Number(scores.manner || 0),
                    punctuality_score: Number(scores.punctuality || 0),
                    total_score: Number(scores.total || 0),
                    comment: comment || '',
                    is_passed_evaluation: Boolean(isPassed),
                    job_title: jobTitle || 'ไม่ระบุชื่องาน'
                }

            } catch (error) {
                console.error('Error:', error)
                throw new Error(
                    error.response?.data?.message ||
                    'ไม่สามารถดึงข้อมูลการประเมินได้'
                )
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