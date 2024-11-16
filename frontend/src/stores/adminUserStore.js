import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useAdminUserStore = defineStore('adminUser', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        users: [], // approved users
        pendingUsers: [], // pending users
        rejectedUsers: [], // rejected users
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
                registeredDate: this.formatDate(user.created_at),
                approvedDate: this.formatDate(user.updated_at),
                rejectedDate: this.formatDate(user.updated_at),
                skills: user.skills ? JSON.parse(user.skills) : [],
                gender: user.gender || '-',
                birthDate: user.birth_date ? this.formatDate(user.birth_date) : '-',
                age: user.age || '0',
                profileImage: user.profile_image,
                educationCertificate: user.education_certificate,
                documents: user.user_documents || '-'
            }
        },

        // ดึงคนที่มีสถานะ approved = ผู้ใช้ในระบบ
        async fetchUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.perPage,
                    offset: (this.pagination.currentPage - 1) * this.pagination.perPage,
                    ...this.searchFilters
                }

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

        // ดึงข้อมูล pending users
        async fetchPendingUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.perPage,
                    offset: (this.pagination.currentPage - 1) * this.pagination.perPage,
                    ...this.searchFilters
                }

                Object.keys(params).forEach(key => {
                    if (params[key] === '') delete params[key]
                })

                const response = await axios.get(`${this.baseURL}/api/admin/pending`, { params })

                if (response.data) {
                    this.pendingUsers = response.data.users.map(this.formatUserData)
                    if (response.data.pagination) {
                        this.pagination.totalItems = parseInt(response.data.pagination.total)
                    }
                }
            } catch (error) {
                console.error('Error fetching pending users:', error)
                this.pendingUsers = []
                this.pagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        // อนุมัติ user
        async approveUser(userId) {
            try {
                await axios.post(`${this.baseURL}/api/admin/approve-reject-user/${userId}`, {
                    status: 'approved'
                })
            } catch (error) {
                console.error('Error approving user:', error)
                throw error
            }
        },

        // ปฏิเสธ user
        async rejectUser(userId) {
            try {
                await axios.post(`${this.baseURL}/api/admin/approve-reject-user/${userId}`, {
                    status: 'rejected'
                })
            } catch (error) {
                console.error('Error rejecting user:', error)
                throw error
            }
        },

        async fetchRejectedUsers() {  // ปรับให้ไม่รับ parameters
            this.loading = true
            try {
                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.perPage,
                    offset: (this.pagination.currentPage - 1) * this.pagination.perPage,
                    ...this.searchFilters
                }

                // ลบ params ที่เป็นค่าว่าง
                Object.keys(params).forEach(key => {
                    if (params[key] === '') delete params[key]
                })

                const response = await axios.get(`${this.baseURL}/api/admin/rejected`, { params })

                if (response.data) {
                    this.rejectedUsers = response.data.users.map(this.formatUserData)
                    if (response.data.pagination) {
                        this.pagination.totalItems = parseInt(response.data.pagination.total)
                    }
                }
            } catch (error) {
                console.error('Error fetching rejected users:', error)
                this.rejectedUsers = []
                this.pagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        getProfileImage(image) {
            if (image) {
                return `${this.baseURL}/uploads/profiles/${image}`
            }
            return null
        },

        // ฟังก์ชันสำหรับดึงตัวอักษรแรกของชื่อ
        getInitials(fullName) {
            return fullName ? fullName.trim().charAt(0).toUpperCase() : ''
        },
        setSearchFilters(filters) {
            this.searchFilters = { ...filters }
            this.pagination.currentPage = 1

        },

        clearSearchFilters() {
            this.searchFilters = {
                userId: '',
                name: '',
                idCard: ''
            }
            this.pagination.currentPage = 1

        },

        setPage(page) {
            this.pagination.currentPage = page

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