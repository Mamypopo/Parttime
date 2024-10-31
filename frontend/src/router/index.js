import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/userStore'
import { useAdminStore } from '../stores/adminStore'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

import HomeView from '../views/HomeView.vue'
import SignInView from '@/views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'
import SignUpAdminView from '@/views/admin/SignUpAdminView.vue'
import SignInAdminView from '@/views/admin/SignInAdminView.vue'
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
      children: [
        {
          path: 'dashboard',  // /admin
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue')
        }
        // เพิ่ม routes อื่นๆ ตามเมนู
      ]
    },

    // {
    //   path: '/admin/users',
    //   name: 'AdminUsers',
    //   component: AdminUsers,
    //   meta: { requiresAdmin: true }
    // },
    // {
    //   path: '/admin/pending-users',
    //   name: 'AdminPendingUsers',
    //   component: AdminPendingUsers,
    //   meta: { requiresAdmin: true }
    // },
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
    if (to.name === 'signin-admin' && adminStore.token) {
      // เปลี่ยนเส้นทางไปยังหน้าแดชบอร์ด
      return next({ name: 'AdminDashboard' });
    }
    // ตรวจสอบ admin routes
    if (to.meta.requiresAdmin) {
      const adminToken = localStorage.getItem('admin_token')

      if (adminToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`)
        adminStore.setAdmin(response.data)
        adminStore.setToken(adminToken)
      }

      if (to.meta.requiresAdmin && !adminToken) {
        return next('/signin-admin')
      } else if (to.meta.requiresGuest && adminToken) {
        return next('/admin/dashboard')
      } else {
        return next()
      }
    }

    // ตรวจสอบ user routes
    const token = localStorage.getItem('token')

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`)
      userStore.setUser(response.data)
      userStore.setToken(token)
    }

    if (to.meta.requiresAuth && !token) {
      next('/signin-user')
    } else if (to.meta.requiresGuest && token) {
      next('/')
    } else {
      next()
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message === 'token expired') {
        // ตรวจสอบว่าเป็น route ของ admin หรือ user
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
// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore()
//   const adminStore = useAdminStore()

//   try {

//     // ตรวจสอบ admin routes
//     if (to.meta.requiresAdmin) {
//       const adminToken = localStorage.getItem('admin_token')

//       if (!adminToken) {
//         return next('/signin-admin')
//       }

//       try {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
//         const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`)
//         adminStore.setUser(response.data)
//         adminStore.setToken(adminToken)
//         return next()
//       } catch (error) {
//         adminStore.logout()
//         if (!to.path.includes('signin-admin')) {
//           await Swal.fire({
//             icon: 'error',
//             title: 'Session หมดอายุ',
//             text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
//           })
//         }
//         return next('/signin-admin')
//       }
//     }

//     // ตรวจสอบ user routes (โค้ดเดิม)
//     const token = localStorage.getItem('token')

//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`)
//       userStore.setUser(response.data)
//       userStore.setToken(token)
//     }

//     if (to.meta.requiresAuth && !token) {
//       next('/signin-user')
//     } else if (to.meta.requiresGuest && token) {
//       next('/')
//     } else {
//       next()
//     }

//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (error.response?.data?.message === 'token expired') {
//         userStore.logout()
//         await Swal.fire({
//           icon: 'error',
//           title: 'Session หมดอายุ',
//           text: 'กรุณาเข้าสู่ระบบอีกครั้ง'
//         })
//       }
//     }
//     next('/signin-user')
//   }
// })
export default router
