import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterUserView from '@/views/RegisterUserView.vue'
import SignInView from '@/views/SignInView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/register-user',
      name: 'register',
      component: RegisterUserView
    },

    {
      path: '/signin-user',
      name: 'signin',
      component: SignInView
    },

  ]
})

export default router
