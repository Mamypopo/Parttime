
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAdminStore } from './adminStore'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        loading: false,
        error: null,
        baseURL: import.meta.env.VITE_API_URL,
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
            const adminStore = useAdminStore()

            try {
                const response = await axios.get(`${this.baseURL}/api/admin/notifications`, {

                    headers: {
                        'Authorization': `Bearer ${adminStore.token}`
                    }
                })


                //  check และ map data
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
                    // กรณีที่ response.data เป็น array โดยตรง
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
        }
    }
})