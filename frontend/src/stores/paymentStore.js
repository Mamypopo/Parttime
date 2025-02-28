import { defineStore } from 'pinia';
import api from '@/service/axios'

export const usePaymentStore = defineStore('payment', {
    state: () => ({
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

    getters: {
        baseApiUrl: () => import.meta.env.VITE_API_URL,
    },

    actions: {

        // ดึงรายการงานที่เสร็จและมีการประเมิน
        async fetchJobs() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.get(
                    '/api/payments/jobs'
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
                    api.get('/api/payments/job/${jobId}/payments', {
                        params: { status: 'pending' }
                    }),
                    api.get(`/api/payments/job/${jobId}/payments`, {
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
                const response = await api.get(
                    `/api/payments/participant/${participationId}/history`,
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
                const response = await api.get(
                    `/api/payments/jobs/${jobId}/payment-summary`,

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

                const response = await api.patch(
                    `/api/payments/${id}/status`,
                    paymentData,
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
                const response = await api.get('/api/payments/user/payments');
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
                const response = await api.get(`/api/payments/user/payments/${paymentId}`);
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
