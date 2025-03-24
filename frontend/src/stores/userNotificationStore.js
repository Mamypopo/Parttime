import { defineStore } from 'pinia'
import api from '@/services/axios'
import { useUserStore } from './userStore'

export const useUserNotificationStore = defineStore('userNotification', {
    state: () => ({
        notifications: [],
        loading: false,
        error: null,
        NOTIFICATION_TYPES: {
            JOB_APPLICATION_STATUS: 'job_status',    // แจ้งเตือนสถานะการสมัครงาน
            WORK_EVALUATION: 'evaluation',           // แจ้งเตือนผลการประเมิน
            WORK_EVALUATION_REJECTED: 'rejected',    // แจ้งเตือนไม่ผ่านการประเมิน
            SYSTEM: 'system',                        // แจ้งเตือนจากระบบ
            GENERAL: 'general',                       // แจ้งเตือนทั่วไป
            JOB_APPLICATION_CANCELLED: 'job_application_cancelled',
            PAYMENT_COMPLETED: 'payment_completed',
        }

    }),

    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.read).length,
        hasUnread: (state) => state.notifications.some(n => !n.read),
        sortedNotifications: (state) => [...state.notifications].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ),
        getNotificationsByType: (state) => (type) => {
            return state.notifications.filter(n => n.type === type)
        }
    },

    actions: {
        async fetchNotifications() {
            this.loading = true
            this.error = null
            const userStore = useUserStore()
            if (!userStore.token) return
            try {
                const response = await api.get('/api/users/notifications', {
                    headers: {
                        'Authorization': `Bearer ${userStore.token}`
                    }
                })

                if (response.data?.notifications) {
                    this.notifications = response.data.notifications.map(n => ({
                        id: n.id,
                        message: n.message,
                        created_at: n.createdAt,
                        read: n.read || false,
                        jobId: n.jobId,
                        type: n.type || 'default'
                    }))
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
            const userStore = useUserStore()
            if (!userStore.token || !notificationId) return

            try {
                const response = await api.patch(
                    `/api/users/notifications/${notificationId}/read`,
                    {},
                    { headers: { 'Authorization': `Bearer ${userStore.token}` } }
                )


                // ตรวจสอบการตอบกลับจาก API
                if (response.status === 200) {
                    // อัพเดทสถานะในแอพทันที
                    const notification = this.notifications.find(n => n.id === notificationId)
                    if (notification) {
                        notification.read = true
                        // การอัพเดท state เพื่อให้ Vue รับรู้การเปลี่ยนแปลง
                        this.notifications = [...this.notifications]
                    }

                }
            } catch (error) {
                console.error('Error marking notification as read:', error)
            }
        },

        async markAllAsRead() {
            const userStore = useUserStore()
            if (!userStore.token) return

            try {
                await api.patch('/api/users/notifications/mark-all-read',
                    {},
                    { headers: { 'Authorization': `Bearer ${userStore.token}` } }
                )

                // อัพเดทสถานะทั้งหมดในแอพทันที
                this.notifications.forEach(n => n.read = true)

            } catch (error) {
                console.error('Error marking all notifications as read:', error)
            }
        },
        startChecking() {
            // เช็คทุก 30 วินาที
            this.checkInterval = setInterval(() => {
                this.fetchNotifications()
            }, 30000)
        },

        // เพิ่ม action สำหรับหยุดการตรวจสอบ
        stopChecking() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval)
            }
        },
        setModalOpen(value) {
            this.isModalOpen = value
        },
        resetStore() {
            this.notifications = []
            this.loading = false
            this.error = null
        }
    }
})