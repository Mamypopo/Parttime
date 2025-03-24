import api from './axios.js'

const adminService = {
    // ดึงรายการผู้ใช้ทั้งหมด
    async getUsers(params) {
        const response = await api.get('/api/admin/users', { params })
        return response.data
    },

    // สร้างผู้ใช้ใหม่
    async createUser(formData) {
        try {
            const response = await api.post('/api/admin/create-users', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        } catch (error) {
            console.error('Create User Error:', error)
            throw error
        }
    },

    // อัพเดทข้อมูลผู้ใช้
    async updateUser(userId, userData) {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        const response = await api.put(`/api/admin/users/${userId}`, userData, config)
        return response.data
    },

    // ดึงข้อมูลผู้ใช้รายบุคคล
    async getUserById(userId) {
        const response = await api.get(`/api/admin/users/${userId}`)
        return response.data
    }
}

export default adminService