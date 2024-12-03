<template>
  <div
    class="flex flex-col min-h-screen bg-gradient-to-br from-[#ece9e6] to-[##ffffff] dark:from-gray-900 dark:to-gray-800 relative transition-colors duration-300 ease-in-out"
  >
    <!-- Desktop/Tablet Sidebar -->
    <TransitionRoot
      :show="!sidebarStore.isMobile"
      as="template"
      enter="transition-all duration-300 ease-in-out"
      enter-from="opacity-0 -translate-x-full"
      enter-to="opacity-100 translate-x-0"
      leave="transition-all duration-300 ease-in-out"
      leave-from="opacity-100 translate-x-0"
      leave-to="opacity-0 -translate-x-full"
    >
      <nav
        class="sidebar h-screen fixed bg-white border-r shadow-lg transition-all duration-500 ease-in-out"
        :class="[
          sidebarStore.isCollapsed ? 'w-20' : 'w-72',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        ]"
      >
        <!-- Header -->
        <div
          class="relative h-16 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80"
        >
          <div class="absolute inset-0 flex items-center justify-between px-4">
            <!-- Logo & Text -->
            <Transition
              enter-active-class="transition-all duration-300 ease-in-out"
              enter-from-class="opacity-0 -translate-x-4"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition-all duration-300 ease-in-out"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-4"
            >
              <div v-if="!sidebarStore.isCollapsed" class="flex items-center gap-3">
                <img src="@/assets/logo.svg" alt="Logo" class="w-8 h-8 rounded-lg" />
                <h1 class="text-lg font-bold text-white">My Workspace</h1>
              </div>
            </Transition>

            <!-- Hamburger Button -->
            <button
              @click="sidebarStore.toggleSidebar"
              class="relative group p-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div class="relative flex overflow-hidden items-center justify-center w-6 h-6">
                <div
                  class="flex flex-col justify-between w-[20px] h-[20px] transform transition-all duration-300 origin-center overflow-hidden"
                >
                  <div
                    class="hamburger-line"
                    :class="{ 'rotate-[42deg] translate-x-px': !sidebarStore.isCollapsed }"
                  ></div>
                  <div
                    class="hamburger-line"
                    :class="{ 'opacity-0': !sidebarStore.isCollapsed }"
                  ></div>
                  <div
                    class="hamburger-line"
                    :class="{ '-rotate-[42deg] translate-x-px': !sidebarStore.isCollapsed }"
                  ></div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="py-4 flex flex-col h-[calc(100vh-4rem)]">
          <!-- Main Menu -->
          <nav class="space-y-1 px-3">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-200"
              :class="[
                $route.path.includes(item.path)
                  ? 'bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 text-[#4bc0c8] dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20 dark:text-[#4bc0c8]'
                  : 'text-gray-600 hover:bg-gray-50/50 dark:text-gray-300 dark:hover:bg-gray-700/50',
                sidebarStore.isCollapsed ? 'justify-center' : 'gap-3'
              ]"
            >
              <i :class="[item.icon, 'text-xl text-[#c779d0] dark:text-[#c779d0]/70']"></i>
              <span v-if="!sidebarStore.isCollapsed" class="font-medium">{{ item.name }}</span>
              <!-- Badge -->
              <div
                v-if="item.badge && item.badgeCount > 0"
                class="ml-auto flex items-center"
                :class="{ 'absolute -top-1 -right-1': sidebarStore.isCollapsed }"
              >
                <span
                  class="bg-gradient-to-r from-[#feac5e] to-[#c779d0] text-white text-xs font-medium px-2 py-0.5 rounded-full"
                >
                  {{ item.badgeCount }}
                </span>
              </div>
            </router-link>

            <div class="mt-4">
              <h2
                v-if="!sidebarStore.isCollapsed"
                class="text-xs font-semibold text-gray-400 mt-6 mb-4 px-4"
              >
                การแจ้งเตือน
              </h2>
              <NotificationsPanel
                :is-collapsed="sidebarStore.isCollapsed"
                :is-mobile="sidebarStore.isMobile"
              />
            </div>
          </nav>

          <!-- Dark Mode Toggle -->
          <div class="mt-auto px-3">
            <div
              class="flex items-center px-4 py-3 rounded-xl transition-all duration-300"
              :class="[sidebarStore.isCollapsed ? 'justify-center' : 'gap-3']"
            >
              <button
                @click="toggleDarkMode"
                class="relative inline-flex items-center cursor-pointer"
              >
                <div
                  class="w-12 h-7 rounded-full transition-colors duration-300 ease-in-out overflow-hidden"
                  :class="[
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8]'
                      : 'bg-gradient-to-r from-[#feac5e]/30 via-[#c779d0]/30 to-[#4bc0c8]/30'
                  ]"
                >
                  <div
                    class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center"
                    :class="{ 'translate-x-5': isDarkMode }"
                  >
                    <i
                      class="text-xs"
                      :class="[
                        isDarkMode ? 'fas fa-moon text-cyan-600' : 'fas fa-sun text-amber-500'
                      ]"
                    ></i>
                  </div>
                </div>
              </button>
              <span
                v-if="!sidebarStore.isCollapsed"
                class="text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {{ isDarkMode ? 'โหมดมืด' : 'โหมดสว่าง' }}
              </span>
            </div>
          </div>

          <!-- User Profile Section -->
          <div class="border-t pt-4 px-3">
            <router-link
              to="/user/profile-view"
              class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#feac5e]/10 hover:via-[#c779d0]/10 hover:to-[#4bc0c8]/10 dark:hover:from-[#feac5e]/20 dark:hover:via-[#c779d0]/20 dark:hover:to-[#4bc0c8]/20 transition-colors group"
            >
              <img
                :src="userStore.getUser.profile_image"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#4bc0c8] dark:group-hover:ring-[#4bc0c8]/70 transition-all"
                alt="Profile"
              />
              <div v-if="!sidebarStore.isCollapsed">
                <h3
                  class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
                >
                  {{ userStore.getUser.first_name }}
                  <!-- ใช้ getter แทน -->
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ userStore.getUser.email }}
                  <!-- ใช้ getter แทน -->
                </p>
              </div>
            </router-link>

            <!-- Logout Button -->
            <button
              v-if="!sidebarStore.isCollapsed"
              @click="handleLogout"
              class="w-full mt-2 px-4 py-2 text-[#c779d0] dark:text-[#c779d0]/70 hover:bg-gradient-to-r hover:from-[#feac5e]/10 hover:via-[#c779d0]/10 hover:to-[#4bc0c8]/10 dark:hover:from-[#feac5e]/20 dark:hover:via-[#c779d0]/20 dark:hover:to-[#4bc0c8]/20 rounded-xl transition-colors duration-200 flex items-center gap-2"
            >
              <i class="fas fa-sign-out-alt"></i>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </nav>
    </TransitionRoot>

    <!-- Content Area -->
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="{
        'mb-16': sidebarStore.isMobile,
        'ml-20': !sidebarStore.isMobile && sidebarStore.isCollapsed,
        'ml-72': !sidebarStore.isMobile && !sidebarStore.isCollapsed
      }"
    >
      <router-view> </router-view>
    </div>

    <!-- Mobile Navigation -->
    <MobileNavigation v-if="sidebarStore.isMobile" />
  </div>
</template>

<script>
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'

import { useNotificationStore } from '@/stores/notificationStore'
import { useUserStore } from '@/stores/userStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useJobStore } from '@/stores/jobStore'
import { useUserNotificationStore } from '@/stores/userNotificationStore'

import MobileNavigation from '@/components/Users/mobile/MobileNavigation.vue'
import NotificationsPanel from '@/components/Users/Notifications/NotificationsPanel.vue'

import Swal from 'sweetalert2'

export default {
  name: 'UserSidebar',

  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    MobileNavigation,
    NotificationsPanel
  },

  data() {
    return {
      sidebarStore: useSidebarStore(),
      jobStore: useJobStore(),
      userStore: useUserStore(),
      notificationStore: useNotificationStore(),
      defaultAvatar: `${import.meta.env.VITE_API_URL}/images/default-avatar.png`
    }
  },

  computed: {
    // ใช้ menuItems จาก sidebarStore
    menuItems() {
      return this.sidebarStore.userMenuItems
    },

    // ใช้ isDarkMode จาก sidebarStore
    isDarkMode() {
      return this.sidebarStore.isDarkMode
    }
  },

  methods: {
    // ใช้ toggleDarkMode จาก sidebarStore
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
          // หยุดเช็คการแจ้งเตือนเมื่อ logout
          this.notificationStore.stopChecking()
          await this.userStore.logout()

          // เคลียร์ค่าใน sidebarStore
          if (this.sidebarStore.$reset) {
            this.sidebarStore.$reset()
          } else {
            this.sidebarStore.$patch({ isCollapsed: false, isMobile: false })
          }

          this.$router.push('/signin-user')
          await Swal.fire({
            icon: 'success',
            title: 'ออกจากระบบสำเร็จ',
            showConfirmButton: false,
            timer: 1500
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง'
        })
      }
    }
  },

  async mounted() {
    this.sidebarStore.initializeResponsive()
    this.sidebarStore.initializeTheme()

    // เริ่มเช็คการแจ้งเตือนเมื่อ login แล้ว
    if (this.userStore.isLoggedIn) {
      await this.notificationStore.fetchNotifications() // เช็คครั้งแรก
      this.notificationStore.startChecking() // เริ่มการเช็คอัตโนมัติ
    }
  },
  beforeUnmount() {
    this.sidebarStore.cleanup()
    // หยุดเช็คการแจ้งเตือนเมื่อออกจาก layout
    this.notificationStore.stopChecking()
  }
}
</script>

<style scoped>
.hamburger-line {
  @apply bg-white h-[2px] w-7 transform transition-all duration-300 origin-left;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
}

button:hover .hamburger-line {
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}

.sidebar {
  @apply backdrop-blur-lg bg-white/80 dark:bg-gray-800/95;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.sidebar {
  @apply backdrop-blur-lg bg-white/80 dark:bg-gray-800/95;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Optional: Add hover animation for the button */
@keyframes subtle-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.group:hover {
  animation: subtle-pulse 2s infinite;
}

/* Mobile Navigation Animation */
.mobile-bottom-nav {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
