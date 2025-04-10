import { createRouter, createWebHistory } from 'vue-router'
import api from '@/services/axios'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/userStore'
import { useAdminStore } from '../stores/adminStore'
import { checkTokenExpiration } from '@/services/auth'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/signup-user',
      name: 'signUp',
      component: () => import('@/views/user/SignUpView.vue')
    },

    {
      path: '/signin-user',
      name: 'signinuser',
      component: () => import('@/views/user/SignInView.vue')
    },
    {
      path: '/signup-admin',
      name: 'signupadmin',
      component: () => import('@/views/admin/SignUpAdminView.vue')
    },
    {
      path: '/signin-admin',
      name: 'signInadmin',
      component: () => import('@/views/admin/SignInAdminView.vue')
    },

    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/auth/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password/:token?',
      name: 'ResetPassword',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue')
    },



    // Admin Routes
    {
      path: '/admin',
      component: () => import('@/components/admin/AdminSidebar.vue'),
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
        {
          path: 'job-Management',
          name: 'JobManagement',
          component: () => import('@/views/admin/Jobs/JobManagement.vue'),
          meta: { requiresAdmin: true }
        },

        {
          path: 'assigned-jobs',
          name: 'assigned-jobs',
          component: () => import('@/views/admin/Jobs/AssignedJobs.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'PaymentManagement-view',
          name: 'PaymentManagement',
          component: () => import('@/views/Payment/PaymentManagement.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: '/admin/user-management',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: {
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: '/admin/user/:userId/evaluation',
          name: 'UserEvaluation',
          component: () => import('@/views/admin/EditEvaluation.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: '/admin/evaluation/:id',
          name: 'EditEvaluation',
          component: () => import('@/views/admin/EditEvaluation.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
      ]
    },

    {
      path: '/user',
      component: () => import('@/components/Users/UserSidebar.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'UserDashboard',
          component: () => import('@/views/user/DashboardView.vue')
        },
        {
          path: 'jobs-view',
          name: 'JobsView',
          component: () => import('@/views/user/JobsView.vue')
        },
        {
          path: 'my-jobs',
          name: 'MyJobs',
          component: () => import('@/views/user/MyJobs.vue')
        },
        {
          path: 'payment-View',
          name: 'PaymentStatus',
          component: () => import('@/views/user/PaymentStatus.vue')
        },
        {
          path: 'profile-View',
          name: 'Profile',
          component: () => import('@/views/user/ProfileView.vue')
        },

      ]
    },
    {
      path: '/verify-email',
      name: 'VerifyEmail',
      component: () => import('@/views/VerifyEmail.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    },

  ]
})


router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const adminStore = useAdminStore()


  try {
    const userToken = localStorage.getItem('token')
    const adminToken = localStorage.getItem('admin_token')
    // ถ้ามี token และพยายามเข้าหน้าแรก (/) ให้ redirect ไปหน้าที่เหมาะสม
    if (to.path === '/') {
      if (adminToken) {
        // ตรวจสอบการหมดอายุของ admin token
        if (checkTokenExpiration(adminToken)) {
          return next('/admin/dashboard')
        }
      } else if (userToken) {
        // ตรวจสอบการหมดอายุของ user token
        if (checkTokenExpiration(userToken)) {
          return next('/user/dashboard')
        }
      }
    }
    // ถ้าพยายามเข้าหน้า signin ทั้งที่มี token อยู่แล้ว ให้ redirect ไปหน้า dashboard
    if (to.name === 'signInadmin' && adminStore.token) {
      return next({ name: 'AdminDashboard' })
    }
    if (to.name === 'signinuser' && userStore.token) {
      return next({ name: 'UserDashboard' })
    }

    // จัดการเส้นทางสำหรับ Admin
    if (to.meta.requiresAdmin) {
      const adminToken = localStorage.getItem('admin_token')

      // ตรวจสอบการหมดอายุของ token
      if (adminToken) {
        const isTokenValid = checkTokenExpiration(adminToken)

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


      // // ตั้งค่า token ใน axios header
      // axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`        // ดึงข้อมูล profile admin
      try {
        const response = await api.get('/api/admin/profile')
        adminStore.setAdmin(response.data)
        adminStore.setToken(adminToken)
      } catch (error) {
        console.error('Error fetching admin profile:', error)
        // ถ้าไม่สามารถดึงข้อมูล profile ได้ ให้ redirect ไปหน้า 404
        return next({ name: 'NotFound' })
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
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        const response = await api.get('/api/users/profile')
        userStore.setUser(response.data)
        userStore.setToken(token)
      } catch (error) {
        // ถ้าไม่สามารถดึงข้อมูล profile ได้ ให้ redirect ไปหน้า 404
        return next({ name: 'NotFound' })
      }
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
    if (api.isAxiosError(error)) {
      if (error.response?.data?.message === 'token expired') {
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
      } else if (error.response?.status === 404) {
        // เคลียร์ข้อมูลทั้งหมด
        localStorage.clear()
        userStore.logout()
        adminStore.logout()
        delete api.defaults.headers.common['Authorization']
        next({ name: 'NotFound' })
        return
      }
    }
    localStorage.clear()
    userStore.logout()
    adminStore.logout()
    delete api.defaults.headers.common['Authorization']
    next({ name: 'NotFound' })

  }
})

export default router
