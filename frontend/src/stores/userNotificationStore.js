import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from './userStore'

export const useUserNotificationStore = defineStore('userNotification', {
    state: () => ({
        notifications: [],
        loading: false,
        error: null,
        baseURL: import.meta.env.VITE_API_URL,
        userStore: useUserStore(),
        isModalOpen: false
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

            if (!this.userStore.token) {
                console.warn('No token available. Skipping fetchNotifications.')
                return
            }

            try {
                const response = await axios.get(`${this.baseURL}/api/users/notifications`, {
                    headers: {
                        'Authorization': `Bearer ${this.userStore.token}`
                    }
                })

                if (response.data?.notifications) {
                    this.notifications = response.data.notifications.map(n => ({
                        id: n.id,
                        message: n.message,
                        created_at: n.createdAt,
                        read: n.read || false,
                        jobId: n.jobId,
                        type: n.type || 'notification'
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
            if (!this.userStore.token) {
                console.warn('No token available. Cannot mark notification as read.')
                return
            }

            try {
                const response = await axios({
                    method: 'PATCH',
                    url: `${this.baseURL}/api/users/notifications/${notificationId}/read`,
                    headers: {
                        'Authorization': `Bearer ${this.userStore.token}`
                    }
                })

                if (response.status === 200) {
                    const notification = this.notifications.find(n => n.id === notificationId)
                    if (notification) {
                        notification.read = true
                    }
                }
            } catch (error) {
                console.error('Error details:', {
                    notificationId,
                    baseURL: this.baseURL,
                    fullURL: `${this.baseURL}/api/users/notifications/${notificationId}/read`,
                    token: this.userStore.token ? 'exists' : 'missing',
                    error: error.response?.data || error.message,
                    status: error.response?.status
                })
                throw error
            }
        },

        async markAllAsRead() {
            if (!this.userStore.token) {
                console.warn('No token available. Skipping markAllAsRead.')
                return
            }

            try {
                // แก้ไข URL path ให้ถูกต้อง
                const response = await axios.patch(
                    `/api/users/notifications/mark-all-read`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${this.userStore.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )

                if (response.status === 200) {
                    this.notifications.forEach(notification => {
                        notification.read = true
                    })
                }
            } catch (error) {
                console.error('Error marking all notifications as read:', error)
                throw error
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