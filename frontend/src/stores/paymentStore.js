import { defineStore } from 'pinia';
import axios from 'axios';
import { useAdminStore } from './adminStore';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        pendingPayments: [],
        paidPayments: [],
        jobs: [],
        isLoading: false,
        error: null,
        totalPages: 1, // จำนวนหน้าทั้งหมด
        currentPage: 1, // หน้าปัจจุบัน
    }),

    actions: {
        // Helper method to create authentication headers
        getAuthHeaders(isFormData = false) {
            const adminStore = useAdminStore();
            if (!adminStore.token) {
                throw new Error('กรุณาเข้าสู่ระบบใหม่');
            }

            return {
                Authorization: `Bearer ${adminStore.token}`,
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
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
                console.log(paidResponse)
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
        // ดึงรายการที่รอจ่ายเงินตามงาน
        // async fetchPendingPayments(jobId, page = 1, limit = 10) {
        //     this.isLoading = true;
        //     this.error = null;

        //     try {
        //         const response = await axios.get(
        //             `${this.baseURL}/api/payments/job/${jobId}/payments`,
        //             {
        //                 headers: this.getAuthHeaders(),
        //                 params: { status: 'pending', page, limit }, // ส่งข้อมูล Pagination
        //             }
        //         );
        //         console.log(response)
        //         this.pendingPayments = response.data.data || [];
        //         this.totalPages = response.data.totalPages || 1; // เก็บจำนวนหน้าทั้งหมด
        //         this.currentPage = response.data.currentPage || 1; // เก็บหน้าปัจจุบัน
        //         return {
        //             pendingPayments: this.pendingPayments,
        //             totalPages: this.totalPages,
        //             currentPage: this.currentPage,
        //         };
        //     } catch (error) {
        //         console.error('Error fetching pending payments:', error);
        //         this.error =
        //             error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
        //         throw error;
        //     } finally {
        //         this.isLoading = false;
        //     }
        // },

        // // ดึงรายการที่จ่ายเงินแล้วตามงาน
        // async fetchPaidPayments(jobId, page = 1, limit = 10) {
        //     this.isLoading = true;
        //     this.error = null;

        //     try {
        //         const response = await axios.get(
        //             `${this.baseURL}/api/payments/job/${jobId}/paid`, // เปลี่ยน endpoint
        //             {
        //                 headers: this.getAuthHeaders(),
        //                 params: { status: 'paid', page, limit }, // ส่งข้อมูล Pagination
        //             }
        //         );

        //         this.paidPayments = response.data.data || []; // เก็บรายการที่จ่ายแล้วใน state
        //         this.totalPaidPages = response.data.totalPages || 1; // จำนวนหน้าทั้งหมดสำหรับผู้จ่ายแล้ว
        //         this.currentPaidPage = response.data.currentPage || 1; // หน้าปัจจุบันสำหรับผู้จ่ายแล้ว
        //         return {
        //             paidPayments: this.paidPayments,
        //             totalPaidPages: this.totalPaidPages,
        //             currentPaidPage: this.currentPaidPage,
        //         };
        //     } catch (error) {
        //         console.error('Error fetching paid payments:', error);
        //         this.error =
        //             error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
        //         throw error;
        //     } finally {
        //         this.isLoading = false;
        //     }
        // },

        // ประวัติเฉพาะคน
        async fetchPaymentHistoryByParticipant(participationId) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/participant/${participationId}/history`,
                    { headers: this.getAuthHeaders() }
                );

                console.log(response)
                return { history: response.data.data || [] };
            } catch (error) {
                console.error('Error fetching payment history by participant:', error);
                this.error = error.response?.data?.message || 'Error fetching payment history';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // ประวัติทั้งหมดของงาน
        async fetchPaymentHistory(jobId, page = 1, limit = 10) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/${jobId}/history`,
                    {
                        headers: this.getAuthHeaders(),
                        params: { page, limit },
                    }
                );

                console.log(response);
                this.paidPayments = response.data.data || [];
                this.totalPaidPages = response.data.totalPages || 1;
                this.currentPaidPage = response.data.currentPage || 1;

                return {
                    history: this.paidPayments,
                    totalPaidPages: this.totalPaidPages,
                    currentPaidPage: this.currentPaidPage,
                };
            } catch (error) {
                console.error('Error fetching payment history:', error);
                this.error = error.response?.data?.message || 'Error fetching payment history';
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
                // ส่ง paymentData (FormData) ไปเลย ไม่ต้องสร้างใหม่
                const response = await axios.patch(
                    `${this.baseURL}/api/payments/${id}/status`,
                    paymentData,  // ใช้ FormData ที่ส่งมาจากหน้าบ้านโดยตรง
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
        }
    },
});
