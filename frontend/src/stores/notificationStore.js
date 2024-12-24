import { defineStore } from 'pinia'
import axios from 'axios'
import { useAdminStore } from './adminStore'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        loading: false,
        error: null,
        baseURL: import.meta.env.VITE_API_URL,
        adminStore: useAdminStore(),
        checkInterval: null,
        NOTIFICATION_TYPES: {
            JOB_APPLICATION: 'job_application',      // มีคนสมัครงานใหม่
            JOB_STATUS_UPDATE: 'job_status_update',  // สถานะงานเปลี่ยน
            USER_VERIFICATION: 'user_verification',   // มีการยืนยันตัวตนใหม่
            EVALUATION: 'evaluation',                // มีการประเมินงาน
            SYSTEM: 'system',                      // แจ้งเตือนจากระบบ
            JOB_APPLICATION_CANCELLED: 'job_application_cancelled_admin',// แจ้งเตือนการยกเลิกสมัครงาน
            PAYMENT_PENDING: 'payment_pending' // แจ้งเตือนเมื่อมีการประเมินเสร็จ รอจ่ายเงิน
        }
    }),
    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.read).length,
        hasUnread: (state) => state.notifications.some(n => !n.read),
        sortedNotifications: (state) => [...state.notifications].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
    },
    actions: {
        async fetchNotifications() {
            this.loading = true
            this.error = null
            // ตรวจสอบ token ก่อนเรียก API
            if (!this.adminStore.token) {
                console.warn('No token available. Skipping fetchNotifications.')
                return
            }

            try {
                const response = await axios.get(`${this.baseURL}/api/admin/notifications`, {
                    headers: {
                        'Authorization': `Bearer ${this.adminStore.token}`
                    }
                })

                if (response.data?.notifications && Array.isArray(response.data.notifications)) {
                    this.notifications = response.data.notifications.map(n => ({
                        id: n.id,
                        message: n.message,
                        created_at: n.createdAt,
                        read: n.read || false,
                        jobId: n.jobId,
                        userId: n.userId,
                        adminId: n.adminId,
                        type: n.type || 'notification'
                    }))
                } else if (Array.isArray(response.data)) {
                    this.notifications = response.data.map(n => ({
                        id: n.id,
                        message: n.message,
                        created_at: n.createdAt,
                        read: n.read || false,
                        jobId: n.jobId,
                        userId: n.userId,
                        adminId: n.adminId
                    }))
                } else {
                    console.warn('Unexpected API response format:', response.data)
                    this.notifications = []
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน'
                console.error('Error fetching notifications:', error)
                this.notifications = []
            } finally {
                this.loading = false
            }
        },

        async markAsRead(notificationId) {
            const adminStore = useAdminStore()

            if (!adminStore.token) {
                console.warn('No token available. Cannot mark notification as read.')
                return
            }

            try {
                await axios.patch(`${this.baseURL}/api/admin/notifications/${notificationId}/read`, {}, {
                    headers: {
                        'Authorization': `Bearer ${adminStore.token}`
                    }
                })

                const notification = this.notifications.find(n => n.id === notificationId)
                if (notification) {
                    notification.read = true
                }
            } catch (error) {
                console.error('Error marking notification as read:', error)
                throw error
            }
        },

        async markAllAsRead() {
            const adminStore = useAdminStore()

            if (!adminStore.token) {
                console.warn('No token available. Cannot mark all notifications as read.')
                return
            }

            try {

                await axios.patch(`${this.baseURL}/api/admin/notifications/mark-all-read`, {}, {
                    headers: {
                        'Authorization': `Bearer ${adminStore.token}`
                    }
                })

                this.notifications.forEach(notification => {
                    notification.read = true
                })

            } catch (error) {
                console.error('Error marking all notifications as read:', error)
                throw error
            }
        },
        startChecking() {
            // เช็คทุก 30 วินาที
            this.checkInterval = setInterval(() => {
                if (this.adminStore.isLoggedIn) {
                    this.fetchNotifications()
                }
            }, 30000)
        },

        //  action สำหรับหยุดการตรวจสอบ
        stopChecking() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval)
                this.checkInterval = null
            }
        },
        resetStore() {
            this.notifications = []
            this.loading = false
            this.error = null
        }
    }
})
