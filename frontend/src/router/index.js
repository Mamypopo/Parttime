import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/userStore'
import HomeView from '../views/HomeView.vue'
import SignInView from '@/views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/signup-user',
      name: 'signUp',
      component: SignUpView
    },

    {
      path: '/signin-user',
      name: 'signin',
      component: SignInView
    },

  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  try {
    const token = localStorage.getItem('token')

    if (token) {
      // ตั้งค่า token และดึงข้อมูล profile
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`)
      userStore.setUser(response.data)
      userStore.setToken(token)  // เซ็ต token และ isAuthenticated
    }

    // เช็คเงื่อนไขการเข้าถึงหน้า
    if (to.meta.requiresAuth && !token) {
      // หน้าที่ต้องล็อกอิน แต่ไม่มี token
      next('/signin-user')
    } else if (to.meta.requiresGuest && token) {
      // หน้าสำหรับ guest แต่มี token
      next('/')
    } else {
      next()
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message === 'token expired') {
        // token หมดอายุ
        userStore.logout()  // ใช้ logout แทน resetUser
        await Swal.fire({
          icon: 'error',
          title: 'Session หมดอายุ',
          text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
        })
      }
    }
    next('/signin-user')
  }
})
export default router
