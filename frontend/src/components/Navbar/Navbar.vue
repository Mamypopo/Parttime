<template>
  <nav v-if="!shouldHideNavbar" class="fixed w-full z-[999] py-4">
    <div class="container mx-auto px-4 sm:px-6">
      <!-- Desktop & Mobile Navbar -->
      <div
        class="max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-4 sm:px-8 py-3 bg-white/90 border border-gray-100 shadow-lg dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        <!-- Logo -->
        <div class="flex items-center group">
          <router-link to="/" class="flex items-center group">
            <div class="relative">
              <img
                src="@/assets/logo.svg"
                alt="Logo"
                class="h-8 w-8 sm:h-9 sm:w-9 transition-transform duration-300 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-[#6B7F5E]/20 to-[#9FE7DD]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
            </div>
            <span
              class="ml-3 font-semibold bg-gradient-to-r from-[#6B7F5E] to-[#9FE7DD] bg-clip-text text-transparent text-sm sm:text-lg"
            >
              Parttime by semad
            </span>
          </router-link>
        </div>

        <!-- Desktop Auth Buttons -->
        <div class="hidden lg:flex items-center gap-4">
          <router-link
            to="/contact"
            class="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors duration-300 flex items-center gap-2 text-sm font-medium"
          >
            <i class="fas fa-phone-alt"></i>
            <span>ติดต่อเรา</span>
          </router-link>
          <router-link
            to="/signin-user"
            class="px-6 py-2 bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] text-gray-700 rounded-xl hover:shadow-lg hover:shadow-[#C3E8D5]/20 transition-all duration-300 flex items-center gap-2 text-sm font-medium transform hover:-translate-y-0.5"
          >
            <i class="fa-solid fa-key"></i>
            <span>เข้าสู่ระบบ</span>
          </router-link>

          <router-link
            to="/signup-user"
            class="px-6 py-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-gray-700 rounded-xl hover:shadow-lg hover:shadow-[#EAC6FC]/20 transition-all duration-300 flex items-center gap-2 text-sm font-medium transform hover:-translate-y-0.5"
          >
            <i class="fa-solid fa-circle-user"></i>
            <span>สมัครสมาชิก</span>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none dark:hover:bg-gray-700"
        >
          <i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div
          v-if="isMenuOpen"
          class="lg:hidden mt-2 max-w-6xl mx-auto bg-white/95 rounded-xl shadow-lg p-4 border border-gray-100 dark:bg-gray-800/95 dark:border-gray-700/50"
        >
          <!-- Mobile Auth Buttons -->
          <div class="space-y-3">
            <router-link
              to="/contact"
              class="w-full px-4 py-2.5 text-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              @click="isMenuOpen = false"
            >
              <i class="fas fa-phone-alt"></i>
              <span>ติดต่อเรา</span>
            </router-link>

            <router-link
              to="/signin-user"
              class="w-full px-4 py-2.5 text-center bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] text-gray-700 rounded-xl hover:shadow-lg hover:shadow-[#C3E8D5]/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              @click="isMenuOpen = false"
            >
              <i class="fa-solid fa-key"></i>
              <span>เข้าสู่ระบบ</span>
            </router-link>

            <router-link
              to="/signup-user"
              class="w-full px-4 py-2.5 text-center bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-gray-700 rounded-xl hover:shadow-lg hover:shadow-[#EAC6FC]/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              @click="isMenuOpen = false"
            >
              <i class="fa-solid fa-circle-user"></i>
              <span>สมัครสมาชิก</span>
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'NavBar',

  data() {
    return {
      isMenuOpen: false,
      userStore: useUserStore()
    }
  },

  computed: {
    shouldHideNavbar() {
      return (
        this.$route.path.includes('/admin') ||
        this.$route.path.includes('/user') ||
        this.$route.meta.requiresAuth
      )
    }
  }
}
</script>
