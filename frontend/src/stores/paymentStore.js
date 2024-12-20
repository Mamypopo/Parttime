import { defineStore } from 'pinia';
import axios from 'axios';
import { useAdminStore } from './adminStore';
import { useUserStore } from './userStore';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        payments: [],
        jobParticipants: {},
        completedJobs: [],
        currentPayment: null,
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        isLoading: false,
        selectedJobId: null,
        error: null,
        filters: {
            status: '',
            method: '',
            dateFrom: '',
            dateTo: ''
        }
    }),

    actions: {
        // สร้าง headers สำหรับ authentication
        getAuthHeaders(isFormData = false) {
            const adminStore = useAdminStore();
            const userStore = useUserStore();
            const token = adminStore.token || userStore.token;

            if (!token) {
                throw new Error('กรุณาเข้าสู่ระบบใหม่');
            }

            return {
                Authorization: `Bearer ${token}`,
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            };
        },

        // ดึงรายการจ่ายเงินทั้งหมด
        async fetchPayments() {
            try {
                this.isLoading = true;
                const params = {
                    page: this.currentPage,
                    limit: this.pageSize,
                    ...this.filters
                };
                const headers = this.getAuthHeaders()

                const response = await axios.get(`${this.baseURL}/api/payments`, {
                    params,
                    headers
                });

                if (response.data) {
                    this.payments = response.data.payments || [];
                    this.totalItems = response.data.total || 0;
                    this.totalPages = response.data.totalPages || 0;
                }

                return {
                    data: this.payments,
                    total: this.totalItems
                };

            } catch (error) {
                console.error('Error fetching payments:', error);
                this.error = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                return { data: [], total: 0 };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchCompletedJobs() {
            try {
                this.isLoading = true
                const headers = this.getAuthHeaders()
                const response = await axios.get(`${this.baseURL}/api/payments/completed`, {
                    headers, params: {
                        include: 'jobPositions' // ขอให้ backend ส่ง jobPositions มาด้วย
                    }
                })
                this.completedJobs = response.data
            } catch (error) {
                console.error('Failed to fetch completed jobs:', error)
                this.error = error.message
            } finally {
                this.isLoading = false
            }
        },

        async fetchJobParticipantsByJob(jobId) {
            try {
                this.isLoading = true
                const headers = this.getAuthHeaders()
                const response = await axios.get(`${this.baseURL}/api/payments/job-participants/${jobId}`, {
                    headers
                })
                // ตรวจสอบข้อมูลก่อนเก็บ
                if (response.data) {
                    this.jobParticipants[jobId] = response.data
                } else {
                    this.jobParticipants[jobId] = []
                }

            } catch (error) {
                console.error('Failed to fetch job participants:', error)
                this.error = error.message
                this.jobParticipants[jobId] = []
            } finally {
                this.isLoading = false
            }
        },

        // สร้างรายการจ่ายเงินใหม่
        async createPayment(paymentData) {
            try {
                this.isLoading = true;
                const formData = new FormData();

                Object.keys(paymentData).forEach(key => {
                    if (key === 'slip' && paymentData[key]) {
                        formData.append('payment_slip', paymentData[key]);
                    } else {
                        formData.append(key, paymentData[key]);
                    }
                });
                const headers = this.getAuthHeaders()
                const response = await axios.post(`${this.baseURL}/api/payments`, formData, {
                    headers
                });

                if (response.data) {
                    return {
                        success: true,
                        data: response.data,
                        message: 'สร้างรายการจ่ายเงินสำเร็จ'
                    };
                }

            } catch (error) {
                console.error('Error fetching payments:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    request: error.request
                });
                this.error = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการสร้างรายการ';
                return {
                    success: false,
                    message: this.error
                };
            } finally {
                this.isLoading = false;
            }
        },


        async handleBulkPayment(payload) {
            try {
                // แปลงข้อมูลให้ตรงกับที่ backend ต้องการ
                const requestData = {
                    job_id: parseInt(payload.job_id), // แปลงเป็น integer
                    participant_ids: payload.participant_ids.map(id => parseInt(id)), // แปลง array ของ id เป็น integer ทั้งหมด
                    payment_method: payload.payment_method || 'cash' // กำหนดค่าเริ่มต้นถ้าไม่มี
                }

                console.log('Store sending payload:', requestData)

                const response = await axios.post(`${this.baseURL}/api/payments/bulk`, requestData, {
                    headers: this.getAuthHeaders()
                })
                return response.data
            } catch (error) {
                console.error('Store error:', error)
                throw error
            }
        },
        // อัพเดทรายการจ่ายเงิน
        async updatePayment(id, paymentData) {
            try {
                this.isLoading = true;
                const formData = new FormData();

                Object.keys(paymentData).forEach(key => {
                    if (key === 'slip' && paymentData[key]) {
                        formData.append('payment_slip', paymentData[key]);
                    } else {
                        formData.append(key, paymentData[key]);
                    }
                });

                const response = await axios.put(`${this.baseURL}/api/payments/${id}`, formData, {
                    headers: this.getAuthHeaders(true)
                });

                return {
                    success: true,
                    data: response.data,
                    message: 'อัพเดทรายการจ่ายเงินสำเร็จ'
                };

            } catch (error) {
                console.error('Error updating payment:', error);
                this.error = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการอัพเดทรายการ';
                return {
                    success: false,
                    message: this.error
                };
            } finally {
                this.isLoading = false;
            }
        },

        formatDate(date) {
            if (!date) return ''
            return new Date(date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },

        // ตั้งค่าฟิลเตอร์
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.currentPage = 1;
            return this.fetchPayments();
        },

        // เปลี่ยนหน้า
        setPage(page) {
            this.currentPage = page;
            return this.fetchPayments();
        },

        // รีเซ็ตฟิลเตอร์
        resetFilters() {
            this.filters = {
                status: '',
                method: '',
                dateFrom: '',
                dateTo: ''
            };
            this.currentPage = 1;
            return this.fetchPayments();
        }
    }
});