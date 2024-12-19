import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notificationStore';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        payments: [],
        currentPayment: null,
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        isLoading: false,
        error: null,
        filters: {
            status: '',
            method: '',
            dateFrom: '',
            dateTo: ''
        }
    }),

    actions: {
        // ดึงรายการจ่ายเงินทั้งหมด
        async fetchPayments() {
            try {
                this.isLoading = true;
                const params = {
                    page: this.currentPage,
                    limit: this.pageSize,
                    ...this.filters
                };

                const response = await axios.get('/api/payments', {
                    params,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })


                this.payments = response.data.payments;
                this.totalItems = response.data.total;
                this.totalPages = response.data.totalPages;
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                const notificationStore = useNotificationStore();
                notificationStore.showError(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        // ดึงข้อมูลการจ่ายเงินตาม ID
        async fetchPaymentById(id) {
            try {
                this.isLoading = true;
                const response = await axios.get(`${this.baseURL}/api/payments/${id}`);
                this.currentPayment = response.data;
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
                const notificationStore = useNotificationStore();
                notificationStore.showError(this.error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // สร้างรายการจ่ายเงินใหม่
        async createPayment(paymentData) {
            try {
                this.isLoading = true;
                const formData = new FormData();

                // เพิ่มข้อมูลเข้า FormData
                Object.keys(paymentData).forEach(key => {
                    if (key === 'slip' && paymentData[key]) {
                        formData.append('payment_slip', paymentData[key]);
                    } else {
                        formData.append(key, paymentData[key]);
                    }
                });

                const response = await axios.post('/api/payments', formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })

                const notificationStore = useNotificationStore();
                notificationStore.showSuccess('สร้างรายการจ่ายเงินสำเร็จ');

                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างรายการ';
                const notificationStore = useNotificationStore();
                notificationStore.showError(this.error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // อัพเดทรายการจ่ายเงิน
        async updatePayment(id, paymentData) {
            try {
                this.isLoading = true;
                const formData = new FormData();

                // เพิ่มข้อมูลเข้า FormData
                Object.keys(paymentData).forEach(key => {
                    if (key === 'slip' && paymentData[key]) {
                        formData.append('payment_slip', paymentData[key]);
                    } else {
                        formData.append(key, paymentData[key]);
                    }
                });

                const response = await axios.put(`${this.baseURL}/api/payments/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                const notificationStore = useNotificationStore();
                notificationStore.showSuccess('อัพเดทรายการจ่ายเงินสำเร็จ');

                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทรายการ';
                const notificationStore = useNotificationStore();
                notificationStore.showError(this.error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // ตั้งค่าฟิลเตอร์
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.currentPage = 1; // รีเซ็ตหน้าเมื่อมีการเปลี่ยนฟิลเตอร์
            this.fetchPayments();
        },

        // เปลี่ยนหน้า
        setPage(page) {
            this.currentPage = page;
            this.fetchPayments();
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
            this.fetchPayments();
        }
    }
}); 