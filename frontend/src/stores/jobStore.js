import { defineStore } from 'pinia'
import axios from 'axios'
import { useAdminStore } from './adminStore'
export const useJobStore = defineStore('job', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        jobs: [],
        jobParticipants: [],
        jobsWithParticipants: [],
        newParticipations: new Set(),
        loading: {
            jobs: false,
            participants: false
        },
        error: null,
        selectedJob: null,
        searchFilters: {
            id: '',
            title: '',
            location: '',
            position: '',
            status: '',
            dateFrom: '',
            dateTo: '',
            minWage: null,
            maxWage: null,
            peopleCount: ''
        },
        pagination: {
            page: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0
        },


    }),

    getters: {
        pendingApplicationsCount(state) {
            return state.jobs.reduce((count, job) => {
                return count + job.JobPositions.reduce((posCount, position) => {
                    return (
                        posCount +
                        (position.JobParticipation?.filter(p => p.status === 'pending').length || 0)
                    );
                }, 0);
            }, 0);
        }
    },
    actions: {

        getAuthHeaders() {
            const adminStore = useAdminStore()
            const token = adminStore.token

            if (!token) {
                throw new Error('กรุณาเข้าสู่ระบบใหม่')
            }

            return {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        },

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

        async fetchJobsAndParticipants() {
            this.loading = true
            try {
                const headers = this.getAuthHeaders()
                // ใช้ searchFilters จาก state โดยตรง
                // สร้าง query parameters จาก filters
                const params = new URLSearchParams()

                // เพิ่มเงื่อนไขการค้นหาต่างๆ
                if (this.searchFilters.id) params.append('id', this.searchFilters.id)
                if (this.searchFilters.title) params.append('title', this.searchFilters.title)
                if (this.searchFilters.location) params.append('location', this.searchFilters.location)
                if (this.searchFilters.position) params.append('position', this.searchFilters.position)
                if (this.searchFilters.status) params.append('status', this.searchFilters.status);
                if (this.searchFilters.dateFrom) params.append('dateFrom', this.searchFilters.dateFrom)
                if (this.searchFilters.dateTo) params.append('dateTo', this.searchFilters.dateTo)
                if (this.searchFilters.minWage) params.append('minWage', this.searchFilters.minWage)
                if (this.searchFilters.maxWage) params.append('maxWage', this.searchFilters.maxWage)
                if (this.searchFilters.peopleCount) params.append('peopleCount', this.searchFilters.peopleCount)

                const queryString = params.toString()
                const endpoint = queryString ? `?${queryString}` : ''

                // เรียก API พร้อมกัน
                const [jobsResponse, participantsResponse] = await Promise.all([
                    axios.get(`${this.baseURL}/api/jobs/my-created-jobs${endpoint}`, { headers }),
                    axios.get(`${this.baseURL}/api/jobs/getJobsWithParticipants`, { headers })
                ])

                this.jobs = []
                // อัพเดท state
                if (jobsResponse.data?.jobs) {
                    // รวมข้อมูล JobParticipation และเก็บสถานะ "ใหม่"
                    this.jobs = jobsResponse.data.jobs.map(job => {
                        const jobWithParticipants = participantsResponse.data.data.find(p => p.id === job.id)

                        // สร้าง job object ใหม่พร้อม JobParticipation
                        const updatedJob = {
                            ...job,
                            JobPositions: job.JobPositions.map(position => {
                                const participations = jobWithParticipants?.JobPositions?.find(p => p.id === position.id)?.JobParticipation || []

                                // เก็บ ID ของการสมัครที่มีสถานะ pending เป็น "ใหม่"
                                participations.forEach(participation => {
                                    if (participation.status === 'pending') {
                                        this.newParticipations.add(participation.id)
                                    }
                                })

                                return {
                                    ...position,
                                    JobParticipation: participations
                                }
                            })
                        }

                        return updatedJob
                    })

                }

            } catch (error) {
                console.error('Error fetching data:', error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },


        // อนุมัติหรือปฏิเสธผู้สมัคร
        async approveOrRejectParticipation(id, status) {
            this.loading = true
            try {
                const headers = this.getAuthHeaders()



                const response = await axios.put(
                    `${this.baseURL}/api/jobs/${id}/approved-rejected`,
                    { status },
                    { headers }
                )

                const updatedJobs = this.jobs.map(job => ({
                    ...job,
                    JobPositions: job.JobPositions.map(position => ({
                        ...position,
                        JobParticipation: position.JobParticipation.map(p =>
                            p.id === parseInt(id)
                                ? { ...p, status }
                                : p
                        )
                    }))
                }))


                this.jobs = updatedJobs
                this.markAsViewed(id)

                try {

                    await this.fetchJobsAndParticipants()

                } catch (fetchError) {
                    console.error('8. Error ตอนดึงข้อมูลใหม่:', fetchError)
                }
                return response.data


            } catch (error) {
                console.error('9. Error ทั้งหมด:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                })

                throw new Error(error.response?.data?.message || 'ไม่สามารถอัพเดทสถานะได้')
            } finally {
                this.loading = false

            }
        },

        // เพิ่มงานใหม่
        async createJob(jobData) {
            this.loading.jobs = true
            this.error = null
            try {
                const adminStore = useAdminStore()
                const response = await axios.post(`${this.baseURL}/api/jobs/create`, jobData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${adminStore.token}`
                    }
                })

                if (response.status === 201) {
                    // เพิ่มงานใหม่เข้าไปใน state
                    this.jobs.push(response.data)
                    this.updateJobCountsByStatus()
                    return response.data
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงาน'
                throw error
            } finally {
                this.loading.jobs = false
            }
        },


        // แก้ไขงาน
        async editJob(jobId, jobData) {
            this.loading = true
            try {
                const response = await axios.put(`${this.baseURL}/api/jobs/editJob/${jobId}`, jobData)

                // อัพเดท state
                const index = this.jobs.findIndex(job => job.id === jobId)
                if (index !== -1) {
                    this.jobs[index] = response.data.job
                }

                return response.data
            } catch (error) {
                console.error('Error editing job:', error)
                throw error
            }
        },

        // ลบงาน
        async deleteJob(jobId) {
            try {
                await axios.delete(`${this.baseURL}/api/jobs/delete-job/${jobId}`)
                // ลบออกจาก state
                this.jobs = this.jobs.filter(job => job.id !== jobId)
                this.updateJobCountsByStatus()
            } catch (error) {
                console.error('Error deleting job:', error)
                throw error
            }
        },

        // Utility functions
        formatDate(date) {
            return new Date(date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },

        formatTime(time) {
            return new Date(time).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        },

        getProfileImage(image) {
            return image ? `${this.baseURL}/uploads/profiles/${image}` : '/default-avatar.png'
        },

        calculateTotalWage(job) {
            if (!job.JobPositions?.length) return 0;

            return job.JobPositions.reduce((sum, position) => {
                // แปลงค่าจ้างต่อคน
                const wage = Number(position.wage) || 0;

                // คำนวณจำนวนคนที่ได้รับการอนุมัติ
                const approvedCount = position.JobParticipation
                    ? position.JobParticipation.filter(participant => participant.status === 'approved').length
                    : 0;

                // เพิ่มค่าใช้จ่ายของตำแหน่งนี้เข้าไปในผลรวม
                return sum + (wage * approvedCount);
            }, 0).toLocaleString('th-TH');
        },

        // Utility functions
        formatDateTime(date, time) {
            if (!date || !time) return null
            const [hours, minutes] = time.split(':')
            const dateObj = new Date(date)
            dateObj.setHours(hours)
            dateObj.setMinutes(minutes)
            return dateObj.toISOString()
        },

        validateJobData(form, positions) {
            if (positions.length === 0) {
                throw new Error('กรุณาเพิ่มตำแหน่งงานอย่างน้อย 1 ตำแหน่ง')
            }

            if (!form.title || !form.date || !form.startDate ||
                !form.endDate || !form.location) {
                throw new Error('กรุณากรอ���ข้อมูลให้ครบทุกช่อง')
            }

            return true
        },

        markAsViewed(participationId) {
            this.newParticipations.delete(participationId)
        },
        resetStore() {
            // Reset all state to initial values
            this.jobs = []
            this.jobParticipants = []
            this.jobsWithParticipants = []
            this.newParticipations = new Set()
            this.loading = {
                jobs: false,
                participants: false
            }
            this.error = null
            this.selectedJob = null
            this.searchFilters = {
                search: '',
                status: '',
                date: null
            }
            this.pagination = {
                page: 1,
                pageSize: 10,
                totalCount: 0,
                totalPages: 0
            }
        },
        updateSearchFilters(filters) {
            this.searchFilters = { ...filters }
        },

        clearSearchFilters() {
            this.searchFilters = {
                id: '',
                title: '',
                location: '',
                position: '',
                status: '',
                dateFrom: '',
                dateTo: '',
                minWage: null,
                maxWage: null,
                peopleCount: ''
            }
        },
        // รีเซ็ต pagination
        resetPagination() {
            this.pagination.currentPage = 1
            this.pagination.totalPages = 1
        },

        // เคลียร์ข้อผิดพลาด
        clearError() {
            this.error = null
        }
    }
})