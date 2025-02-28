import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
        const isAdminRoute = config.url.includes('/api/admin')
        const token = isAdminRoute
            ? localStorage.getItem('admin_token')
            : localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default api