import { defineStore } from 'pinia';
import axios from 'axios';
import { useAdminStore } from './adminStore';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        pendingPayments: [],
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
                console.log(response)
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

        // ดึงรายการที่รอจ่ายเงินตามงาน
        async fetchPendingPayments(jobId, page = 1, limit = 10) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/job/${jobId}/payments`,
                    {
                        headers: this.getAuthHeaders(),
                        params: { status: 'pending', page, limit }, // ส่งข้อมูล Pagination
                    }
                );
                console.log(response)
                this.pendingPayments = response.data.data || [];
                this.totalPages = response.data.totalPages || 1; // เก็บจำนวนหน้าทั้งหมด
                this.currentPage = response.data.currentPage || 1; // เก็บหน้าปัจจุบัน
                return {
                    pendingPayments: this.pendingPayments,
                    totalPages: this.totalPages,
                    currentPage: this.currentPage,
                };
            } catch (error) {
                console.error('Error fetching pending payments:', error);
                this.error =
                    error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // ดึงรายการที่จ่ายเงินแล้วตามงาน
        async fetchPaidPayments(jobId, page = 1, limit = 10) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.get(
                    `${this.baseURL}/api/payments/job/${jobId}/paid`, // เปลี่ยน endpoint
                    {
                        headers: this.getAuthHeaders(),
                        params: { status: 'paid', page, limit }, // ส่งข้อมูล Pagination
                    }
                );

                this.paidPayments = response.data.data || []; // เก็บรายการที่จ่ายแล้วใน state
                this.totalPaidPages = response.data.totalPages || 1; // จำนวนหน้าทั้งหมดสำหรับผู้จ่ายแล้ว
                this.currentPaidPage = response.data.currentPage || 1; // หน้าปัจจุบันสำหรับผู้จ่ายแล้ว
                return {
                    paidPayments: this.paidPayments,
                    totalPaidPages: this.totalPaidPages,
                    currentPaidPage: this.currentPaidPage,
                };
            } catch (error) {
                console.error('Error fetching paid payments:', error);
                this.error =
                    error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
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
                    `${this.baseURL}/api/payments/${jobId}/history`, // ตรวจสอบว่า Endpoint ตรงกับที่ Server รองรับ
                    {
                        headers: this.getAuthHeaders(),
                        params: { page, limit }, // ตรวจสอบพารามิเตอร์ที่ส่งไป
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
                const formData = new FormData();

                // Append fields to FormData
                if (paymentData.payment_slip) {
                    formData.append('payment_slip', paymentData.payment_slip);
                }
                formData.append('payment_method', paymentData.payment_method);
                formData.append('payment_note', paymentData.payment_note || '');
                if (paymentData.checklist_items) {
                    formData.append(
                        'checklist_items',
                        JSON.stringify(paymentData.checklist_items)
                    );
                }

                const response = await axios.patch(
                    `${this.baseURL}/api/payments/${id}/status`,
                    formData,
                    { headers: this.getAuthHeaders(true) }
                );

                return {
                    success: true,
                    data: response.data.data,
                    message: 'อัพเดทสถานะการจ่ายเงินสำเร็จ',
                };
            } catch (error) {
                console.error('Error updating payment status:', error);
                this.error =
                    error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะ';
                return {
                    success: false,
                    message: this.error,
                };
            } finally {
                this.isLoading = false;
            }
        },
    },
});
