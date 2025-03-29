import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: apiUrl,
    timeout: 300000,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
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


api.interceptors.request.use(
    (config) => {
        const isAdminRoute = config.url.includes('/api/admin')
        const token = isAdminRoute
            ? localStorage.getItem('admin_token')
            : localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        if (config.url.includes('/login')) {
            config.headers['Content-Type'] = 'application/json'
        } else if (
            config.url.includes('/register-admin') ||
            config.url.includes('/api/users/register')
        ) {
            delete config.headers['Content-Type']
        }

        return config
    },
    (error) => Promise.reject(error)
)
export default api