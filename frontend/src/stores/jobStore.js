import { defineStore } from 'pinia'
import axios from 'axios'
import { useAdminStore } from './adminStore'
export const useJobStore = defineStore('job', {
    state: () => ({
        jobs: [],
        jobsWithParticipants: [],
        loading: {
            jobs: false,
            participants: false
        },
        error: null,
        selectedJob: null,
        currentJobId: null,
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



        participantCounts: (state) => {
            const counts = {
                all: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                successful: 0,
                failed: 0
            };

            if (!state.jobsWithParticipants) return counts;

            state.jobsWithParticipants.forEach(job => {
                if (!job.JobPositions) return;

                job.JobPositions.forEach(position => {
                    if (!position.JobParticipation) return;

                    position.JobParticipation.forEach(participant => {
                        if (participant && participant.status) {
                            counts.all++;
                            counts[participant.status] = (counts[participant.status] || 0) + 1;
                        }
                    });
                });
            });

            return counts;
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


        // ดึงข้อมูลผู้สมัครงานทั้งหมด
        async fetchJobsWithParticipants() {
            this.loading.participants = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/jobs/my-created-jobs/participants`,
                    {
                        headers: {
                            Authorization: `Bearer ${useAdminStore().token}`
                        }
                    }
                );

                this.jobsWithParticipants = response.data.data;
                return response.data.data;
            } catch (error) {
                console.error('Error:', error);
                this.error = error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้สมัครงานได้';
                throw error;
            } finally {
                this.loading.participants = false;
            }
        },
        // อนุมัติหรือปฏิเสธผู้สมัคร
        async approveOrRejectParticipation(participationId, status) {
            try {
                const response = await axios.put(
                    `${this.baseURL}/api/jobs/${participationId}/approved-rejected`,
                    { status },
                    {
                        headers: {
                            Authorization: `Bearer ${useAdminStore().token}`
                        }
                    }
                );

                // อัพเดทข้อมูลในสโตร์
                const updatedParticipation = response.data.data;
                this.updateParticipationInStore(participationId, updatedParticipation);

                return response.data.data;
            } catch (error) {
                console.error('Error:', error);
                throw new Error(error.response?.data?.message || 'ไม่สามารถอัพเดทสถานะได้');
            }
        },

        // อัพเดทสถานะการทำงาน
        async updateParticipationStatus(participationId, status) {
            try {
                const response = await axios.patch(
                    `${this.baseURL}/api/jobs/participation/${participationId}/status`,
                    { status },
                    {
                        headers: {
                            Authorization: `Bearer ${useAdminStore().token}`
                        }
                    }
                );

                // อัพเดทข้อมูลในสโตร์
                const updatedParticipation = response.data.data;
                this.updateParticipationInStore(participationId, updatedParticipation);

                return response.data.data;
            } catch (error) {
                console.error('Error:', error);
                throw new Error(error.response?.data?.message || 'ไม่สามารถอัพเดทสถานะได้');
            }
        },

        // Helper method สำหรับอัพเดทข้อมูลใน store
        updateParticipationInStore(participationId, updatedParticipation) {
            this.jobsWithParticipants = this.jobsWithParticipants.map(job => ({
                ...job,
                JobPositions: job.JobPositions.map(position => ({
                    ...position,
                    JobParticipation: position.JobParticipation.map(participation =>
                        participation.id === participationId ? updatedParticipation : participation
                    )
                }))
            }));
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
                    return response.data
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงาน'
                throw error
            } finally {
                this.loading.jobs = false
            }
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

        resetStore() {
            this.jobs = [];
            this.jobsWithParticipants = [];
            this.error = null;
            this.loading = {
                jobs: false,
                participants: false
            };
        },


        // เคลียร์ข้อผิดพลาด
        clearError() {
            this.error = null
        }
    }
})