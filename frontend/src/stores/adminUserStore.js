import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useAdminUserStore = defineStore('adminUser', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        users: [],
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            perPage: 10,
            totalItems: 0
        },
        searchFilters: {
            userId: '',
            idCard: '',
            name: ''
        }
    }),

    getters: {
        totalPages: (state) => Math.max(1, Math.ceil(state.pagination.totalItems / state.pagination.perPage)),
        hasMorePages: (state) => state.pagination.currentPage < state.totalPages
    },

    actions: {
        formatUserData(user) {
            if (!user) return null

            return {
                id: user.id,
                fullName: `${user.prefix || ''} ${user.first_name} ${user.last_name}`.trim(),
                email: user.email,
                phoneNumber: user.phone_number || '-',
                idCardNumber: user.national_id || '-',
                lineId: user.line_id || '-',
                isVerified: user.email_verified,
                registeredDate: new Date(user.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                skills: user.skills ? user.skills.split(',') : [],
                gender: user.gender || '-',
                birthDate: user.birth_date ? new Date(user.birth_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : '-',
                age: user.age || '0',
                profileImage: user.profile_image,
                educationCertificate: user.education_certificate,
                documents: user.user_documents || '-'
            }
        },

        async fetchUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.perPage,
                    offset: (this.pagination.currentPage - 1) * this.pagination.perPage,
                    ...this.searchFilters
                }

                // ลบ key ที่มีค่าว่างออก
                Object.keys(params).forEach(key => {
                    if (params[key] === '') delete params[key]
                })

                const response = await axios.get(`${this.baseURL}/api/admin/approved`, { params })

                if (response.data) {
                    this.users = response.data.users
                        .map(this.formatUserData)
                        .filter(user => user !== null)
                    this.pagination.totalItems = parseInt(response.data.pagination.total)
                }
            } catch (error) {
                console.error('Error fetching users:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้'
                })
                this.users = []
                this.pagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        setSearchFilters(filters) {
            this.searchFilters = { ...filters }
            this.pagination.currentPage = 1
            this.fetchUsers()
        },

        clearSearchFilters() {
            this.searchFilters = {
                userId: '',
                name: '',
                idCard: ''
            }
            this.pagination.currentPage = 1
            this.fetchUsers()
        },

        setPage(page) {
            this.pagination.currentPage = page
            this.fetchUsers()
            window.scrollTo(0, 0)
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
    }
})