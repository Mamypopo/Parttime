<template>
  <nav v-if="!shouldHideNavbar" class="absolute w-full z-[999] py-4">
    <div class="container mx-auto px-4 sm:px-6">
      <!-- Desktop & Mobile Navbar -->
      <div
        class="max-w-6xl mx-auto flex items-center justify-between rounded-lg px-4 sm:px-8 py-3 bg-white bg-opacity-100 shadow-lg"
      >
        <!-- Logo -->
        <div class="flex items-center">
          <img src="@/assets/logo.svg" alt="Logo" class="h-6 w-6 sm:h-8 sm:w-8" />
          <span class="ml-2 font-medium text-gray-800 text-sm sm:text-base">
            Parttime by semad
          </span>
        </div>

        <!-- Desktop Auth Buttons -->
        <div class="hidden lg:flex items-center space-x-3">
          <router-link
            to="/signin-user"
            class="px-4 py-1.5 bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] text-[#3A3A49] rounded-full hover:bg-opacity-90 text-sm shadow-sm"
          >
            <i class="fa-solid fa-key"></i>
            SIGN IN
          </router-link>

          <router-link
            to="/signup-user"
            class="px-4 py-1.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-[#3A3A49] rounded-full hover:bg-opacity-90 text-sm shadow-sm"
          >
            <i class="fa-solid fa-circle-user"></i>
            SIGN UP
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="lg:hidden text-gray-600 focus:outline-none"
        >
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isMenuOpen"
          class="lg:hidden mt-4 max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-4"
        >
          <!-- Mobile Auth Buttons -->
          <div class="space-y-2">
            <router-link
              to="/signin-user"
              class="block w-full px-4 py-2 text-center bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] text-[#3A3A49] rounded-full hover:bg-gray-50 text-sm shadow-sm"
            >
              <i class="fa-solid fa-key"></i>
              SIGN IN
            </router-link>

            <router-link
              to="/signup-user"
              class="block w-full px-4 py-2 text-center bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-[#3A3A49] rounded-full hover:bg-gray-50 text-sm shadow-sm"
            >
              <i class="fa-solid fa-circle-user"></i>
              SIGN UP
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
