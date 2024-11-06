import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/userStore'
import { useAdminStore } from '../stores/adminStore'
import { checkTokenExpiration } from '@/utils/auth'

import AdminSidebar from '@/components/admin/AdminSidebar.vue'

import HomeView from '../views/HomeView.vue'
import SignInView from '@/views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'


import SignUpAdminView from '@/views/admin/SignUpAdminView.vue'
import SignInAdminView from '@/views/admin/SignInAdminView.vue'
import AdminRejectedUsers from '@/views/admin/AdminRejectedUsers.vue'
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
      name: 'signinuser',
      component: SignInView
    },
    {
      path: '/signup-admin',
      name: 'signupadmin',
      component: SignUpAdminView
    },
    {
      path: '/signin-admin',
      name: 'signInadmin',
      component: SignInAdminView
    },
    // Admin Routes
    {
      path: '/admin',
      component: AdminSidebar,
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'pending-users',
          name: 'AdminPendingUsers',
          component: () => import('@/views/admin/AdminPendingUsers.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'reject-user',
          name: 'AdminRejectedUsers',
          component: () => import('@/views/admin/AdminRejectedUsers.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'alluser',
          name: 'AdminAllUsers',
          component: () => import('@/views/admin/AdminUsers.vue'),
          meta: { requiresAdmin: true }
        },

        /// Jobs 
        {
          path: 'create-job',
          name: 'CreateJob',
          component: () => import('@/views/admin/Jobs/CreateJob.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'job-List',
          name: 'JobList',
          component: () => import('@/views/admin/Jobs/JobList.vue'),
          meta: { requiresAdmin: true }
        },
      ]
    },



    // {
    //   path: '/admin/skills-pending',
    //   name: 'AdminSkillsPending',
    //   component: AdminSkillsPending,
    //   meta: { requiresAdmin: true }
    // },
    // {
    //   path: '/admin/work-history',
    //   name: 'AdminWorkHistory',
    //   component: AdminWorkHistory,
    //   meta: { requiresAdmin: true }
    // },
    // {
    //   path: '/admin/jobs',
    //   name: 'AdminJobs',
    //   component: AdminJobs,
    //   meta: { requiresAdmin: true }
    // },
    // {
    //   path: '/admin/my-jobs',
    //   name: 'AdminMyJobs',
    //   component: AdminMyJobs,
    //   meta: { requiresAdmin: true }
    // },
    // {
    //   path: '/admin/create-job',
    //   name: 'AdminCreateJob',
    //   component: AdminCreateJob,
    //   meta: { requiresAdmin: true }
    // },
  ]
})


router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const adminStore = useAdminStore()


  try {

    // ถ้าพยายามเข้าหน้า signin-admin ทั้งที่มี token อยู่แล้ว ให้ redirect ไปหน้า dashboard
    if (to.name === 'signInadmin' && adminStore.token) {
      return next({ name: 'AdminDashboard' })
    }
    if (to.name === 'signinuser' && userStore.token) {
      return next({ name: 'home' })
    }

    // จัดการเส้นทางสำหรับ Admin
    if (to.meta.requiresAdmin) {
      const adminToken = localStorage.getItem('admin_token')

      // ตรวจสอบการหมดอายุของ token
      if (adminToken) {
        const isTokenValid = checkTokenExpiration(adminToken)
        // console.log('Admin token validation:', isTokenValid)
        // ถ้า token ไม่ valid (หมดอายุ) ถึงจะ logout
        if (isTokenValid === false) {  // หรือใช้ !isTokenValid
          adminStore.logout()
          await Swal.fire({
            icon: 'error',
            title: 'Admin Session หมดอายุ',
            text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
          })
          return next('/signin-admin')
        }

      }


      // ตั้งค่า token ใน axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`        // ดึงข้อมูล profile admin
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`)
        adminStore.setAdmin(response.data)
        adminStore.setToken(adminToken)
      } catch (error) {
        console.error('Error fetching admin profile:', error)
      }


      // ตรวจสอบสิทธิ์การเข้าถึง
      if (to.meta.requiresAdmin && !adminToken) {
        return next('/signin-admin')
      } else if (to.meta.requiresGuest && adminToken) {
        return next('/admin/dashboard')
      } else {
        return next()
      }
    }

    // จัดการเส้นทางสำหรับ User
    const token = localStorage.getItem('token')

    // ตรวจสอบการหมดอายุของ token
    if (token && !checkTokenExpiration(token)) {
      userStore.logout()
      await Swal.fire({
        icon: 'error',
        title: 'Session หมดอายุ',
        text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
      })
      return next('/signin-user')
    }

    if (token) {
      // ตั้งค่า token ใน axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // ดึงข้อมูล profile user
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`)
      // เก็บข้อมูล user และ token ใน store
      userStore.setUser(response.data)
      userStore.setToken(token)
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (to.meta.requiresAuth && !token) {
      next('/signin-user')
    } else if (to.meta.requiresGuest && token) {
      next('/')
    } else {
      next()
    }

  } catch (error) {
    // จัดการกรณี error
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message === 'token expired') {
        // แยกการจัดการระหว่าง admin และ user
        if (to.meta.requiresAdmin) {
          adminStore.logout()
          if (!to.path.includes('signin-admin')) {
            await Swal.fire({
              icon: 'error',
              title: 'Admin Session หมดอายุ',
              text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
            })
          }
          next('/signin-admin')
        } else {
          userStore.logout()
          if (!to.path.includes('signin-user')) {
            await Swal.fire({
              icon: 'error',
              title: 'Session หมดอายุ',
              text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
            })
          }
          next('/signin-user')
        }
      }
    }
  }
})

export default router
