import { defineStore } from 'pinia';
import axios from 'axios';
import { useAdminStore } from './adminStore';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        pendingPayments: [],
        paidPayments: [],
        jobs: [],
        payments: [],
        currentPayment: null,
        isLoading: false,
        error: null,
        totalPages: 1, // จำนวนหน้าทั้งหมด
        currentPage: 1, // หน้าปัจจุบัน
        paymentSummary: null
    }),

    actions: {
        getAuthHeaders() {
            const adminStore = useAdminStore();
            if (!adminStore.token) {
                throw new Error('กรุณาเข้าสู่ระบบใหม่');
            }

            return {
                Authorization: `Bearer ${adminStore.token}`
            };
        },

        // ดึงรายการงานที่เสร็จและมีการประเมิน
        async fetchJobs() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/jobs`,
                    { headers: this.getAuthHeaders() }
                );

                this.jobs = response.data.data || [];
                return this.jobs;
            } catch (error) {
                console.error('Error fetching jobs:', error);
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchAllJobPayments(jobId) {
            this.isLoading = true;
            try {
                const [pendingResponse, paidResponse] = await Promise.all([
                    axios.get(`${this.baseURL}/api/payments/job/${jobId}/payments`, {
                        headers: this.getAuthHeaders(),
                        params: { status: 'pending' }
                    }),
                    axios.get(`${this.baseURL}/api/payments/job/${jobId}/payments`, {
                        headers: this.getAuthHeaders(),
                        params: { status: 'paid' }
                    })
                ]);
                this.pendingPayments = pendingResponse.data.data || [];
                this.paidPayments = paidResponse.data.data || [];
                return {
                    pending: this.pendingPayments,
                    paid: this.paidPayments
                };
            } catch (error) {
                console.error('Error fetching payments:', error);
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // ประวัติเฉพาะคน
        async fetchPaymentHistoryByParticipant(participationId) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/participant/${participationId}/history`,
                    { headers: this.getAuthHeaders() }
                );
                return { history: response.data.data || [] };
            } catch (error) {
                console.error('Error fetching payment history by participant:', error);
                this.error = error.response?.data?.message || 'Error fetching payment history';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },


        async fetchJobPaymentSummary(jobId) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/jobs/${jobId}/payment-summary`,
                    {
                        headers: this.getAuthHeaders()
                    }
                );
                this.paymentSummary = response.data;
                return response.data;

            } catch (error) {
                console.error('Error fetching payment summary:', error);
                this.error = error.response?.data?.message || 'Error fetching payment summary';
                throw error;
            } finally {
                this.isLoading = false;
            }

        },

        // อัพเดทสถานะการจ่ายเงิน
        async updatePaymentStatus(id, paymentData) {
            this.isLoading = true;
            this.error = null;
            try {

                const response = await axios.patch(
                    `${this.baseURL}/api/payments/${id}/status`,
                    paymentData,
                    { headers: this.getAuthHeaders(true) }
                );
                return {
                    success: true,
                    data: response.data.data,
                    message: 'อัพเดทสถานะการจ่ายเงินสำเร็จ',
                };
            } catch (error) {
                console.error('Error updating payment status:', error);
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะ';
                return {
                    success: false,
                    message: this.error,
                };
            } finally {
                this.isLoading = false;
            }
        },



        // ดึงรายการจ่ายเงินของ user
        async fetchUserPayments() {
            try {
                this.isLoading = true;
                const response = await axios.get(`${this.baseURL}/api/payments/user/payments`);
                this.payments = response.data.data || [];
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // ดึงรายละเอียดการจ่ายเงิน
        async fetchPaymentDetail(paymentId) {
            try {
                this.isLoading = true;
                const response = await axios.get(`${this.baseURL}/api/payments/user/payments/${paymentId}`);
                this.currentPayment = response.data.data || null;
                return response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                throw error;
            } finally {
                this.isLoading = false;
            }
        }
    },




});
