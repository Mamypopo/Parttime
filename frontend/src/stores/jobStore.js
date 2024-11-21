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
        loading: false,
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
            currentPage: 1,
            perPage: 10,
            totalItems: 0
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
        },

        totalPages: (state) => {

            if (!state.pagination.totalItems || isNaN(state.pagination.totalItems)) {
                return 1
            }
            return Math.max(1, Math.ceil(state.pagination.totalItems / state.pagination.perPage))
        },
        hasMorePages: (state) => state.pagination.currentPage < state.totalPages,

        totalJobs: (state) => state.jobs?.length || 0,

        pendingJobs: (state) => state.jobs?.filter(job => {
            if (!job) return false
            if (job.status === 'completed') return false
            const now = new Date()
            const workDate = new Date(job.work_date)
            return workDate > now
        }).length || 0,

        inProgressJobs: (state) => state.jobs?.filter(job => {
            if (!job) return false
            if (job.status === 'completed') return false
            const now = new Date()
            const workDate = new Date(job.work_date)
            return workDate.toDateString() === now.toDateString()
        }).length || 0,

        completedJobs: (state) => state.jobs?.filter(job => {
            if (!job) return false
            if (job.status === 'completed') return true
            const now = new Date()
            const workDate = new Date(job.work_date)
            return workDate < now && workDate.toDateString() !== now.toDateString()
        }).length || 0

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
            try {
                const headers = this.getAuthHeaders()
                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.perPage,
                    offset: (this.pagination.currentPage - 1) * this.pagination.perPage,
                    ...this.searchFilters
                }

                // ลบ params ที่เป็นค่าว่าง เหมือน adminUserStore
                Object.keys(params).forEach(key => {
                    if (params[key] === '') delete params[key]
                })



                const response = await axios.get(
                    `${this.baseURL}/api/jobs?${params.toString()}`,
                    {
                        params,
                        headers
                    }
                )


                if (response.data) {
                    this.jobs = response.data.jobs
                    if (response.data.pagination) {
                        this.pagination.totalItems = parseInt(response.data.pagination.total)
                    }
                }
            } catch (error) {
                console.error('Error fetching jobs:', error)
                this.jobs = []
                this.pagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        async fetchJobsAndParticipants() {
            this.loading = true;

            try {
                const headers = this.getAuthHeaders();
                const params = new URLSearchParams();

                // เพิ่มเงื่อนไขการค้นหาจาก searchFilters
                if (this.searchFilters.id) params.append('id', this.searchFilters.id);
                if (this.searchFilters.title) params.append('title', this.searchFilters.title);
                if (this.searchFilters.location) params.append('location', this.searchFilters.location);
                if (this.searchFilters.position) params.append('position', this.searchFilters.position);
                if (this.searchFilters.status) params.append('status', this.searchFilters.status);
                if (this.searchFilters.dateFrom) params.append('dateFrom', this.searchFilters.dateFrom);
                if (this.searchFilters.dateTo) params.append('dateTo', this.searchFilters.dateTo);
                if (this.searchFilters.minWage) params.append('minWage', this.searchFilters.minWage);
                if (this.searchFilters.maxWage) params.append('maxWage', this.searchFilters.maxWage);
                if (this.searchFilters.peopleCount) params.append('peopleCount', this.searchFilters.peopleCount);

                const queryString = params.toString();
                const endpoint = queryString ? `?${queryString}` : '';

                // เรียก API พร้อมกัน
                const [jobsResponse, participantsResponse] = await Promise.all([
                    axios.get(`${this.baseURL}/api/jobs/my-created-jobs${endpoint}`, { headers }),
                    axios.get(`${this.baseURL}/api/jobs/getJobsWithParticipants`, { headers })
                ]);

                // ตรวจสอบว่า jobsResponse มีข้อมูลและเป็น array
                this.jobs = Array.isArray(jobsResponse.data?.jobs) ? jobsResponse.data.jobs : [];

                if (this.jobs.length > 0) {
                    this.jobs = this.jobs.map(job => {
                        const jobWithParticipants = participantsResponse.data?.data?.find(p => p.id === job.id);

                        const updatedJobPositions = Array.isArray(job.JobPositions)
                            ? job.JobPositions.map(position => {
                                const participations = jobWithParticipants?.JobPositions?.find(p => p.id === position.id)?.JobParticipation || [];

                                // อัพเดทให้รวม workHistories
                                const updatedParticipations = participations.map(participation => {
                                    // เก็บ ID ของการสมัครที่มีสถานะ pending เป็น "ใหม่"
                                    if (participation.status === 'pending') {
                                        this.newParticipations.add(participation.id);
                                    }

                                    return {
                                        ...participation,
                                        workHistories: participation.workHistories || []
                                    };
                                });

                                return {
                                    ...position,
                                    JobParticipation: updatedParticipations
                                };
                            })
                            : [];

                        return {
                            ...job,
                            JobPositions: updatedJobPositions
                        };
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                this.error = error.message || 'ไม่สามารถโหลดข้อมูลงานได้';
                throw error;
            } finally {
                this.loading = false;
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


        async updateWorkStatus(jobParticipationId, data) {
            try {
                const headers = this.getAuthHeaders();
                await axios.put(
                    `${this.baseURL}/api/jobs/participations/${jobParticipationId}/evaluate`,
                    {
                        rating: data.rating,
                        comment: data.comment || ''
                    },
                    { headers }
                );

                await this.fetchJobsAndParticipants();

            } catch (error) {
                console.error('Error updating work status:', error);
                throw new Error(error.response?.data?.message || 'ไม่สามารถอัพเดทสถานะได้');
            }
        },


        // เพิ่มงานใหม่
        async createJob(jobData) {
            this.loading = true;
            this.error = null;
            try {
                const adminStore = useAdminStore();
                const response = await axios.post(`${this.baseURL}/api/jobs/create`, jobData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${adminStore.token}`
                    }
                });

                // ตรวจสอบรูปแบบของ response ก่อน
                if (response.data && response.data.job) {
                    // ตรวจสอบว่า this.jobs เป็น array ก่อนทำการ push
                    if (Array.isArray(this.jobs)) {
                        this.jobs.push(response.data.job);
                    } else {
                        console.error('Error: this.jobs is not an array');
                        this.jobs = [response.data.job];
                    }
                } else {
                    console.warn('Unexpected response format:', response.data);
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงาน';
                console.error('Error creating job:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },


        // แก้ไขงาน
        async editJob(jobId, jobData) {
            this.loading = true
            try {
                // ตรวจสอบข้อมูลก่อนส่ง
                if (!jobData.start_time || !jobData.end_time) {
                    throw new Error('กรุณาระบุเวลาเริ่มต้นและสิ้นสุด')
                }
                const headers = this.getAuthHeaders()
                const response = await axios.put(`${this.baseURL}/api/jobs/editJob/${jobId}`, jobData, { headers })

                // อัพเดท state
                const index = this.jobs.findIndex(job => job.id === jobId)
                if (index !== -1) {
                    this.jobs[index] = response.data.job
                }

                return response.data
            } catch (error) {
                console.error('Error editing job:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // ลบงาน
        async deleteJob(jobId) {
            this.loading = true
            try {
                await axios.delete(`${this.baseURL}/api/jobs/delete-job/${jobId}`)
                // ลบออกจาก state
                this.jobs = this.jobs.filter(job => job.id !== jobId)

            } catch (error) {
                console.error('Error deleting job:', error)
                throw error
            } finally {
                this.loading = false
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
                throw new Error('กรุณากรอกข้อมูลให้ครบทุกช่อง')
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
            this.loading = false
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
        resetPagination() {
            this.pagination = {
                currentPage: 1,
                pageSize: 10,
                totalItems: 0
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
            this.pagination.currentPage = 1
        },
        // รีเซ็ต pagination
        // resetPagination() {
        //     this.pagination.currentPage = 1
        //     this.pagination.totalPages = 1
        // },
        setPage(page) {
            this.pagination.currentPage = page
            window.scrollTo(0, 0)
        },
        // เคลียร์ข้อผิดพลาด
        clearError() {
            this.error = null
        },

        hasNewParticipants(job) {
            if (!job?.JobPositions) return false
            return job.JobPositions.some(position => {
                if (!position?.JobParticipation) return false
                return position.JobParticipation.some(p => this.newParticipations.has(p.id))
            })
        },
        getPendingCount(job) {
            if (!job?.JobPositions) return 0
            return job.JobPositions.reduce((count, position) => {
                if (!position?.JobParticipation) return count
                return count + (position.JobParticipation.filter(p => p.status === 'pending').length || 0)
            }, 0)
        },

        getApprovedCount(job) {
            return job.JobPositions?.reduce((count, position) => {
                return count + (position.JobParticipation?.filter(p => p.status === 'approved').length || 0)
            }, 0) || 0
        },

        getTotalApplicants(job) {
            return job.JobPositions?.reduce((count, position) => {
                return count + (position.JobParticipation?.length || 0)
            }, 0) || 0
        },

        getCompletedWorkCount(job) {
            return job.JobPositions?.reduce((count, position) => {
                return count + (position.JobParticipation?.filter(p =>
                    p.status === 'approved' && p.work_status).length || 0)
            }, 0) || 0
        },

        getJobStatus(job) {
            if (!job) return null

            if (job.status === 'completed') return 'completed'

            const now = new Date()
            const workDate = new Date(job.work_date)

            if (workDate > now) return 'published'
            if (workDate.toDateString() === now.toDateString()) return 'in_progress'
            return 'completed'
        }
    }
})