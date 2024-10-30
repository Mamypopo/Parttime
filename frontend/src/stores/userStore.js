import { defineStore } from 'pinia'
import axios from 'axios'
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
            phone_number: null,
            line_id: null,
            profile_image: null,
            skills: [],
            email_verified: false,
            approved: false
        },
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token')
    }),

    actions: {
        setToken(token) {
            this.token = token
            localStorage.setItem('token', token)
            this.isAuthenticated = true
            // เพิ่ม token เข้าไปใน axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        },

        async logout() {
            this.user = null
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
            // ลบ token ออกจาก axios headers
            delete axios.defaults.headers.common['Authorization']
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
                phone_number: userData.phone_number,
                line_id: userData.line_id,
                profile_image: userData.profile_image,
                skills: userData.skills || [],
                email_verified: userData.email_verified,
                approved: userData.approved
            };
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
                phone_number: this.user.phone_number,
                line_id: this.user.line_id,
                profile_image: this.user.profile_image ?
                    `${import.meta.env.VITE_API_URL}/uploads/profiles/${this.user.profile_image}` :
                    'https://example.com/default-avatar.png',
                skills: this.user.skills || [],
                email_verified: this.user.email_verified,
                approved: this.user.approved,
                // เพิ่ม computed values
                fullName: this.user.first_name && this.user.last_name ?
                    `${this.user.prefix} ${this.user.first_name} ${this.user.last_name}` : ''
            }
        }
    }
})