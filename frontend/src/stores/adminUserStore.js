import { defineStore } from 'pinia'
import api from '@/services/axios'
import Swal from 'sweetalert2'

export const useAdminUserStore = defineStore('adminUser', {
    state: () => ({
        users: [], // approved users
        pendingUsers: [], // pending users
        rejectedUsers: [], // rejected users
        approvedUsers: [],
        totalVerifiedUsers: 0,
        totalNotVerifiedUsers: 0,
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
            name: '',
            skills: []
        },
        rejectedStats: {
            total: 0,
        },
        pendingPagination: {
            currentPage: 1,
            perPage: 10,
            totalItems: 0
        },
        rejectedPagination: {
            currentPage: 1,
            perPage: 10,
            totalItems: 0
        },
        approvedPagination: {
            currentPage: 1,
            perPage: 10,
            totalItems: 0
        },
    }),

    getters: {
        baseApiUrl: () => import.meta.env.VITE_API_URL,

        totalPages: (state) => {
            if (!state.pagination.totalItems || isNaN(state.pagination.totalItems)) {
                return 1
            }
            return Math.max(1, Math.ceil(state.pagination.totalItems / state.pagination.perPage))
        },
        pendingTotalPages() {
            return Math.ceil(this.pendingPagination.totalItems / this.pendingPagination.perPage)
        },
        rejectedTotalPages() {
            return Math.ceil(this.rejectedPagination.totalItems / this.rejectedPagination.perPage)
        },
        approvedTotalPages() {
            return Math.ceil(this.approvedPagination.totalItems / this.approvedPagination.perPage)
        },
        hasMorePages: (state) => state.pagination.currentPage < state.totalPages
    },

    actions: {
        formatUserData(user) {
            if (!user) return null

            let skills = [];
            if (user.skills) {
                if (typeof user.skills === 'string') {
                    try {
                        skills = JSON.parse(user.skills);
                    } catch (e) {
                        console.error('Error parsing skills:', e);
                        skills = [];
                    }
                } else if (Array.isArray(user.skills)) {
                    skills = user.skills;
                }
            }

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
                skills: skills,
                gender: user.gender || '-',
                birthDate: user.birth_date ? this.formatDate(user.birth_date) : '-',
                age: user.age || '0',
                profileImage: user.profile_image,
                educationCertificate: user.education_certificate,
                documents: user.user_documents || '-',
                totalJobs: user.total_jobs || 0,
                averageRating: parseFloat(user.average_rating || 0),
                totalReviews: user.total_reviews || 0
            }
        },

        async fetchUsers() {
            try {
                this.loading = true

                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.perPage,
                    search: this.searchFilters.name || this.searchFilters.userId || this.searchFilters.idCard || '',
                    skill: this.searchFilters.skills || []
                }

                Object.keys(params).forEach(key => {
                    if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
                        delete params[key]
                    }
                })

                const response = await api.get('/api/admin/users', { params })
                if (response.data) {
                    this.users = response.data.users.map(this.formatUserData)
                    if (response.data.pagination) {
                        this.pagination.totalItems = parseInt(response.data.pagination.total)
                    }
                }
            } catch (error) {
                console.error('Error fetching users:', error)
                this.users = []
                this.pagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        async fetchPendingUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.pendingPagination.currentPage,
                    limit: this.pendingPagination.perPage,
                    userId: this.searchFilters.userId,
                    name: this.searchFilters.name,
                    idCard: this.searchFilters.idCard
                }

                if (this.searchFilters.skills && this.searchFilters.skills.length > 0) {
                    const skillsArray = Array.from(this.searchFilters.skills);
                    params.skill = skillsArray.join(',');
                }

                Object.keys(params).forEach(key => {
                    if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
                        delete params[key]
                    }
                })

                const response = await api.get('/api/admin/pending', { params })

                if (response.data) {
                    this.pendingUsers = response.data.users.map(this.formatUserData)
                    if (response.data.pagination) {
                        this.pendingPagination.totalItems = parseInt(response.data.pagination.total)
                    }
                    if (response.data.stats) {
                        this.rejectedStats = {
                            total: response.data.stats.total,
                            verified: response.data.stats.totalVerified,
                            notVerified: response.data.stats.totalNotVerified
                        }
                    }
                }

            } catch (error) {
                console.error('Error fetching pending users:', error)
                this.pendingUsers = []
                this.pendingPagination.totalItems = 0
                this.totalVerifiedUsers = 0
                this.totalNotVerifiedUsers = 0
            } finally {
                this.loading = false
            }
        },

        async approveUser(userId) {
            try {
                await api.post(`/api/admin/approve-reject-user/${userId}`, {
                    status: 'approved'
                })
            } catch (error) {
                console.error('Error approving user:', error)
                throw error
            }
        },

        async rejectUser(userId) {
            try {
                await api.post(`/api/admin/approve-reject-user/${userId}`, {
                    status: 'rejected'
                })
            } catch (error) {
                console.error('Error rejecting user:', error)
                throw error
            }
        },

        async fetchRejectedUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.rejectedPagination.currentPage,
                    limit: this.rejectedPagination.perPage,
                    userId: this.searchFilters.userId,
                    name: this.searchFilters.name,
                    idCard: this.searchFilters.idCard
                }

                if (this.searchFilters.skills && this.searchFilters.skills.length > 0) {
                    const skillsArray = Array.from(this.searchFilters.skills);
                    params.skill = skillsArray.join(',');
                }

                Object.keys(params).forEach(key => {
                    if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
                        delete params[key]
                    }
                })

                const response = await api.get('/api/admin/rejected', { params })

                if (response.data) {
                    this.rejectedUsers = response.data.users.map(this.formatUserData)
                    if (response.data.pagination) {
                        this.rejectedPagination.totalItems = parseInt(response.data.pagination.total)
                    }

                }

            } catch (error) {
                console.error('Error fetching rejected users:', error)
                this.rejectedUsers = []
                this.rejectedPagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        async fetchApprovedUsers() {
            this.loading = true
            try {
                const params = {
                    page: this.approvedPagination.currentPage,
                    limit: this.approvedPagination.perPage,
                    userId: this.searchFilters.userId,
                    name: this.searchFilters.name,
                    idCard: this.searchFilters.idCard
                }

                if (this.searchFilters.skills && this.searchFilters.skills.length > 0) {
                    const skillsArray = Array.from(this.searchFilters.skills);
                    params.skill = skillsArray.join(',');
                }

                Object.keys(params).forEach(key => {
                    if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
                        delete params[key]
                    }
                })

                const response = await api.get('/api/admin/approved', { params })

                if (response.data) {
                    this.approvedUsers = response.data.users.map(this.formatUserData)
                    if (response.data.pagination) {
                        this.approvedPagination.totalItems = parseInt(response.data.pagination.total)
                    }
                }

            } catch (error) {
                console.error('Error fetching approved users:', error)
                this.approvedUsers = []
                this.approvedPagination.totalItems = 0
            } finally {
                this.loading = false
            }
        },

        getProfileImage(image) {
            if (!image) return '/default-avatar.png'
            return `${this.baseApiUrl}/uploads/profiles/${image}`
        },

        setSearchFilters(filters) {
            this.searchFilters = {
                ...this.searchFilters,
                ...filters,
                skills: filters.skills || this.searchFilters.skills
            }
            this.pagination.currentPage = 1
        },

        clearSearchFilters() {
            this.searchFilters = {
                userId: '',
                name: '',
                idCard: '',
                skills: []
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

        setPendingPage(page) {
            this.pendingPagination.currentPage = page
        },

        setRejectedPage(page) {
            this.rejectedPagination.currentPage = page
        },

        setApprovedPage(page) {
            this.approvedPagination.currentPage = page
        },
    }
})