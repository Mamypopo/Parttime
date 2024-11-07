import { defineStore } from 'pinia'
import axios from 'axios'

export const useJobStore = defineStore('job', {
    state: () => ({
        jobs: [],
        loading: false,
        error: null,
        baseURL: import.meta.env.VITE_API_URL,
    }),

    getters: {
        getJobById: (state) => (id) => {
            return state.jobs.find(job => job.id === id)
        },

        // งานที่เปิดรับสมัคร
        openJobs: (state) => {
            return state.jobs.filter(job => job.status === 'open')
        },

        // งานที่ปิดรับสมัคร
        closedJobs: (state) => {
            return state.jobs.filter(job => job.status === 'closed')
        },

        // งานที่เต็มแล้ว
        fullJobs: (state) => {
            return state.jobs.filter(job => job.status === 'full')
        },

        // จำนวนงานทั้งหมด
        totalJobs: (state) => state.jobs.length,

        // จำนวนงานแต่ละสถานะ
        jobStats: (state) => {
            return {
                open: state.jobs.filter(job => job.status === 'open').length,
                closed: state.jobs.filter(job => job.status === 'closed').length,
                full: state.jobs.filter(job => job.status === 'full').length
            }
        },

    },

    actions: {
        // ดึงข้อมูลงานทั้งหมด
        async fetchJobs() {
            try {
                this.loading = true
                const response = await axios.get(`${this.baseURL}/api/jobs`)
                this.jobs = response.data.jobs || [] // ใช้ `response.data.jobs` ถ้ามี หรือไม่ก็ใช้ array ว่าง
                this.error = null
            } catch (error) {
                console.error('Error fetching jobs:', error)
                this.error = 'ไม่สามารถดึงข้อมูลงานได้'
            } finally {
                this.loading = false
            }
        },
        // // ดึงข้อมูลงานตาม ID
        // async fetchJobById(id) {
        //     try {
        //         this.loading = true
        //         const response = await axios.get(`/api/jobs/${id}`)
        //         // อัพเดทงานในรายการถ้ามีอยู่แล้ว
        //         const index = this.jobs.findIndex(job => job.id === id)
        //         if (index !== -1) {
        //             this.jobs[index] = response.data
        //         } else {
        //             this.jobs.push(response.data)
        //         }
        //         this.error = null
        //         return response.data
        //     } catch (error) {
        //         console.error('Error fetching job:', error)
        //         this.error = 'ไม่สามารถดึงข้อมูลงานได้'
        //         throw error
        //     } finally {
        //         this.loading = false
        //     }
        // },

        // // สร้างงานใหม่
        // async createJob(jobData) {
        //     try {
        //         this.loading = true
        //         const response = await axios.post('/api/jobs', jobData)
        //         this.jobs.push(response.data)
        //         this.error = null
        //         return response.data
        //     } catch (error) {
        //         console.error('Error creating job:', error)
        //         this.error = 'ไม่สามารถสร้างงานได้'
        //         throw error
        //     } finally {
        //         this.loading = false
        //     }
        // },

        // // อัพเดทข้อมูลงาน
        // async updateJob(id, jobData) {
        //     try {
        //         this.loading = true
        //         const response = await axios.put(`/api/jobs/${id}`, jobData)
        //         const index = this.jobs.findIndex(job => job.id === id)
        //         if (index !== -1) {
        //             this.jobs[index] = response.data
        //         }
        //         this.error = null
        //         return response.data
        //     } catch (error) {
        //         console.error('Error updating job:', error)
        //         this.error = 'ไม่สามารถอัพเดทข้อมูลงานได้'
        //         throw error
        //     } finally {
        //         this.loading = false
        //     }
        // },

        // // ลบงาน
        // async deleteJob(id) {
        //     try {
        //         this.loading = true
        //         await axios.delete(`/api/jobs/${id}`)
        //         this.jobs = this.jobs.filter(job => job.id !== id)
        //         this.error = null
        //     } catch (error) {
        //         console.error('Error deleting job:', error)
        //         this.error = 'ไม่สามารถลบงานได้'
        //         throw error
        //     } finally {
        //         this.loading = false
        //     }
        // },

        // // อัพเดทสถานะงาน
        // async updateJobStatus(id, status) {
        //     try {
        //         this.loading = true
        //         const response = await axios.patch(`/api/jobs/${id}/status`, { status })
        //         const index = this.jobs.findIndex(job => job.id === id)
        //         if (index !== -1) {
        //             this.jobs[index] = response.data
        //         }
        //         this.error = null
        //         return response.data
        //     } catch (error) {
        //         console.error('Error updating job status:', error)
        //         this.error = 'ไม่สามารถอัพเดทสถานะงานได้'
        //         throw error
        //     } finally {
        //         this.loading = false
        //     }
        // },

        // เคลียร์ error
        clearError() {
            this.error = null
        }
    }
})