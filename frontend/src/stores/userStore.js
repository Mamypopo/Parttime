import { defineStore } from 'pinia'
import { useSidebarStore } from './sidebarStore'
import api from '@/services/axios'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {
            id: null,
            email: null,
            prefix: null,
            first_name: null,
            last_name: null,
            gender: null,
            birth_date: null,
            age: null,
            education_certificate: null,
            documents: null,
            phone_number: null,
            line_id: null,
            profile_image: null,
            skills: [],
            email_verified: false,
            approved: false,

        },
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token')
    }),

    actions: {
        setToken(token) {
            this.token = token
            localStorage.setItem('token', token)
            this.isAuthenticated = true
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        },

        logout() {
            // รีเซ็ตเป็น object ว่างแทนที่จะเป็น null
            this.user = {
                id: null,
                email: null,
                prefix: null,
                first_name: null,
                last_name: null,
                gender: null,
                birth_date: null,
                age: null,
                education_certificate: null,
                phone_number: null,
                line_id: null,
                profile_image: null,
                skills: [],
                email_verified: false,
                approved: false,
            }
            this.token = null
            this.isAuthenticated = false


            this.token = null
            this.isAuthenticated = false

            // Clear localStorage
            localStorage.removeItem('darkmode')
            localStorage.removeItem('token')
            // Reset sidebar store (darkmode)
            const sidebarStore = useSidebarStore()
            if (sidebarStore?.resetDarkMode) {
                sidebarStore.resetDarkMode()
            }
            delete api.defaults.headers.common['Authorization']


        },
        setUser(userData) {
            this.user = {
                id: userData.id,
                email: userData.email,
                prefix: userData.prefix,
                first_name: userData.first_name,
                last_name: userData.last_name,
                gender: userData.gender,
                birth_date: userData.birth_date,
                age: userData.age,
                education_certificate: userData.education_certificate,
                documents: userData.user_documents,
                phone_number: userData.phone_number,
                line_id: userData.line_id,
                profile_image: userData.profile_image,
                skills: userData.skills || [],
                email_verified: userData.email_verified,
                approved: userData.approved
            }

        },

        async fetchUser() {
            try {
                const response = await api.get('/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                })

                if (response.data) {
                    this.setUser(response.data)
                    return response.data
                }
            } catch (error) {
                console.error('Error fetching user:', error)
                if (error.response?.status === 401) {
                    this.logout()
                }
                throw error
            }
        },
    },

    getters: {
        getUser() {
            return {
                id: this.user.id,
                email: this.user.email,
                prefix: this.user.prefix,
                first_name: this.user.first_name,
                last_name: this.user.last_name,
                gender: this.user.gender,
                birth_date: this.user.birth_date,
                age: this.user.age,
                education_certificate: this.user.education_certificate,
                documents: this.user.documents,
                phone_number: this.user.phone_number,
                line_id: this.user.line_id,
                profile_image: this.user.profile_image ?
                    `${import.meta.env.VITE_API_URL}/uploads/profiles/${this.user.profile_image}` :
                    'https://example.com/default-avatar.png',
                skills: this.user.skills || [],
                email_verified: this.user.email_verified,
                approved: this.user.approved,
                fullName: this.user.first_name && this.user.last_name ?
                    `${this.user.prefix} ${this.user.first_name} ${this.user.last_name}` : ''
            }
        }
    }
})