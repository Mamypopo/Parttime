import { defineStore } from 'pinia'
import axios from 'axios'

export const useJobStore = defineStore('job', {
    state: () => ({
        jobs: [],
        loading: false,
        error: null,
        selectedJob: null,
        filters: {
            status: 'all',
            date: null
        },
        pagination: {
            page: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0
        },
        baseURL: import.meta.env.VITE_API_URL,

    }),

    getters: {
        hasJobs: (state) => Array.isArray(state.jobs) && state.jobs.length > 0,

        // แยกงานตามสถานะ
        openJobs: (state) => state.jobs.filter(job => job.status === 'open'),
        closedJobs: (state) => state.jobs.filter(job => job.status === 'closed'),
        fullJobs: (state) => state.jobs.filter(job => job.status === 'full'),

        // นับจำนวนงานแต่ละสถานะ
        jobCounts: (state) => ({
            total: state.jobs.length,
            open: state.jobs.filter(job => job.status === 'open').length,
            closed: state.jobs.filter(job => job.status === 'closed').length,
            full: state.jobs.filter(job => job.status === 'full').length
        }),

        // กรองงานตามเงื่อนไข
        filteredJobs: (state) => {
            return state.jobs.filter(job => {
                // กรองตามสถานะ
                if (state.filters.status !== 'all' && job.status !== state.filters.status) {
                    return false
                }
                // กรองตามวันที่
                if (state.filters.date && job.work_date !== state.filters.date) {
                    return false
                }
                return true
            })
        }
    },

    actions: {
        // ดึงข้อมูลงานทั้งหมด
        async fetchJobs() {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get(`${this.baseURL}/api/jobs?pageSize=1000`)
                if (response.data && Array.isArray(response.data.jobs)) {
                    this.jobs = response.data.jobs
                    // อัพเดทข้อมูล pagination
                    this.pagination = {
                        page: response.data.page || 1,
                        pageSize: response.data.pageSize || 10,
                        totalCount: response.data.totalCount || 0,
                        totalPages: response.data.totalPages || 0
                    }
                } else {
                    this.jobs = []
                    console.warn('Invalid response format:', response.data)
                }
                // console.log('Jobs fetched:', this.jobs)
            } catch (error) {
                this.error = 'ไม่สามารถโหลดข้อมูลงานได้'
                console.error('Error fetching jobs:', error)
                this.jobs = []
            } finally {
                this.loading = false
            }
        },

        // ดึงข้อมูลงานตาม ID
        async fetchJobById(id) {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get(`/api/jobs/${id}`)
                this.selectedJob = response.data
                return response.data
            } catch (error) {
                this.error = 'ไม่สามารถโหลดข้อมูลงานได้'
                console.error('Error fetching job:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        // เพิ่มงานใหม่
        async addJob(jobData) {
            this.loading = true
            this.error = null
            try {
                const response = await axios.post('/api/jobs', jobData)
                this.jobs.push(response.data)
                return response.data
            } catch (error) {
                this.error = 'ไม่สามารถเพิ่มงานได้'
                console.error('Error adding job:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        // อัพเดทข้อมูลงาน
        async updateJob(id, jobData) {
            this.loading = true
            this.error = null
            try {
                const response = await axios.put(`/api/jobs/${id}`, jobData)
                const index = this.jobs.findIndex(job => job.id === id)
                if (index !== -1) {
                    this.jobs[index] = response.data
                }
                return response.data
            } catch (error) {
                this.error = 'ไม่สามารถอัพเดทข้อมูลงานได้'
                console.error('Error updating job:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        // ลบงาน
        async deleteJob(id) {
            this.loading = true
            this.error = null
            try {
                await axios.delete(`/api/jobs/${id}`)
                this.jobs = this.jobs.filter(job => job.id !== id)
                return true
            } catch (error) {
                this.error = 'ไม่สามารถลบงานได้'
                console.error('Error deleting job:', error)
                return false
            } finally {
                this.loading = false
            }
        },

        // ตั้งค่าฟิลเตอร์
        setFilter(filterType, value) {
            this.filters[filterType] = value
        },

        // รีเซ็ตฟิลเตอร์
        resetFilters() {
            this.filters = {
                status: 'all',
                date: null
            }
        },

        // เคลียร์ข้อผิดพลาด
        clearError() {
            this.error = null
        }
    }
})