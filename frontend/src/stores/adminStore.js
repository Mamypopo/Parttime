import { defineStore } from 'pinia'
import { useNotificationStore } from '@/stores/notificationStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import axios from 'axios'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        admin: {
            id: null,
            username: null,
            email: null,
            role: null,
            first_name: null,
            last_name: null,
            profile_pic: null,
            phone: null
        },
        profileImageUrl: null,
        token: localStorage.getItem('admin_token') || null,
        isAuthenticated: !!localStorage.getItem('admin_token')
    }),

    actions: {
        setToken(token) {
            this.token = token
            localStorage.setItem('admin_token', token)
            this.isAuthenticated = true
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        },

        logout() {
            // Clear store data
            this.admin = {
                id: null,
                username: null,
                email: null,
                role: null,
                first_name: null,
                last_name: null,
                profile_pic: null,
                phone: null
            }
            this.profileImageUrl = null
            this.token = null
            this.isAuthenticated = false

            // Clear localStorage
            localStorage.removeItem('darkmode')
            localStorage.removeItem('admin_token')


            // Clear axios header
            delete axios.defaults.headers.common['Authorization']
            // Reset sidebar store (darkmode)
            const sidebarStore = useSidebarStore()
            if (sidebarStore?.resetDarkMode) {
                sidebarStore.resetDarkMode()
            }
            // Reset other stores 
            const notificationStore = useNotificationStore()
            if (notificationStore?.resetStore) {
                notificationStore.resetStore()
            }
        },

        setAdmin(adminData) {
            this.admin = {
                id: adminData.id,
                username: adminData.username,
                email: adminData.email,
                role: adminData.role,
                first_name: adminData.first_name,
                last_name: adminData.last_name,
                profile_pic: adminData.profile_pic,
                phone: adminData.phone
            }
            this.updateProfileImageUrl()

        },
        updateProfileImageUrl() {
            if (this.admin.profile_pic) {
                this.profileImageUrl = `${import.meta.env.VITE_API_URL}/uploads/admin-profiles/${this.admin.profile_pic}`
            } else {

                this.profileImageUrl = new URL('@/assets/images/logosemed.svg', import.meta.url).href
            }
        },

    },

    getters: {
        getAdmin() {
            return {
                id: this.admin.id,
                username: this.admin.username,
                email: this.admin.email,
                role: this.admin.role,
                first_name: this.admin.first_name,
                last_name: this.admin.last_name,
                fullName: this.admin.first_name && this.admin.last_name ?
                    `${this.admin.first_name} ${this.admin.last_name}` : '',
                profile_pic: this.profileImageUrl,
                phone: this.admin.phone
            }
        }
    }
})