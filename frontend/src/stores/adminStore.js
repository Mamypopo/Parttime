import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        admin: {
            id: null,
            username: null,
            email: null,
            role: null,
            first_name: null,
            last_name: null
        },
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
            this.admin = {
                id: null,
                username: null,
                email: null,
                role: null,
                first_name: null,
                last_name: null
            }
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('admin_token')

            delete axios.defaults.headers.common['Authorization']
        },

        setAdmin(adminData) {
            this.admin = {
                id: adminData.id,
                username: adminData.username,
                email: adminData.email,
                role: adminData.role,
                first_name: adminData.first_name,
                last_name: adminData.last_name
            }
        }
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
                    `${this.admin.first_name} ${this.admin.last_name}` : ''
            }
        }
    }
})