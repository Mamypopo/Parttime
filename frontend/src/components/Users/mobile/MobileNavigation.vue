<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg mobile-nav transition-transform duration-300 ease-in-out z-50"
    :class="{ 'translate-y-full': isHidden }"
  >
    <div class="max-w-screen-xl mx-auto px-4">
      <div class="flex justify-around items-center h-16">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center w-16 h-16 transition-all duration-200"
          :class="[
            $route.path.includes(item.path)
              ? 'text-cyan-600 dark:text-cyan-400'
              : 'text-gray-500 dark:text-gray-400'
          ]"
          @click="handleClick(item)"
        >
          <div
            class="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
            :class="[
              $route.path.includes(item.path)
                ? 'bg-gradient-to-r from-cyan-50 to-green-50 dark:from-cyan-900/30 dark:to-green-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <i :class="[item.icon, 'text-xl']"></i>
            <span
              v-if="item.badge"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
            >
              {{ item.badgeCount }}
            </span>
          </div>
          <span class="text-xs mt-1">{{ item.name }}</span>
        </router-link>
      </div>
    </div>

    <!-- Profile Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showProfileMenu"
        class="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg rounded-t-2xl p-4"
      >
        <div class="flex items-center gap-4 mb-4 p-2">
          <img
            :src="userStore.user?.profile_image || defaultAvatar"
            class="w-12 h-12 rounded-full object-cover"
            alt="Profile"
          />
          <div>
            <h3 class="font-medium text-gray-800 dark:text-gray-200">
              {{ userStore.user?.first_name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ userStore.user?.email }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <button
            @click="toggleDarkMode"
            class="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <i :class="[isDarkMode ? 'fas fa-moon' : 'fas fa-sun', 'text-xl']"></i>
            <span>{{ isDarkMode ? 'โหมดมืด' : 'โหมดสว่าง' }}</span>
          </button>

          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200"
          >
            <i class="fas fa-sign-out-alt text-xl"></i>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useSidebarStore } from '@/stores/sidebarStore'

import Swal from 'sweetalert2'

export default {
  name: 'MobileNavigation',

  data() {
    return {
      userStore: useUserStore(),
      sidebarStore: useSidebarStore(),
      showProfileMenu: false,
      lastScrollY: 0,
      isHidden: false,
      defaultAvatar: '/path/to/default-avatar.png'
    }
  },
  computed: {
    navigationItems() {
      return this.sidebarStore.userMobileItems
    },

    isDarkMode: {
      get() {
        return this.sidebarStore.isDarkMode
      },
      set(value) {
        this.sidebarStore.isDarkMode = value
      }
    }
  },

  methods: {
    handleScroll() {
      const currentScrollY = window.scrollY
      this.isHidden = currentScrollY > this.lastScrollY && currentScrollY > 100
      this.lastScrollY = currentScrollY
    },

    handleClick(item) {
      if (item.isProfile) {
        this.showProfileMenu = !this.showProfileMenu
      } else {
        this.showProfileMenu = false
      }
    },

    toggleDarkMode() {
      this.sidebarStore.toggleDarkMode()
    },

    async handleLogout() {
      try {
        const result = await Swal.fire({
          title: 'ต้องการออกจากระบบ?',
          text: 'คุณแน่ใจหรือไม่ที่จะออกจากระบบ',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ออกจากระบบ',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#EF4444'
        })

        if (result.isConfirmed) {
          await this.userStore.logout()
          this.$router.push('/signin-user')
          this.showProfileMenu = false
        }
      } catch (error) {
        console.error('Logout error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถออกจากระบบได้'
        })
      }
    }
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style scoped>
.mobile-nav {
  transform: translateY(0);
  backface-visibility: hidden;
  will-change: transform;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.mobile-nav {
  animation: slideUp 0.3s ease-out;
}
</style>
