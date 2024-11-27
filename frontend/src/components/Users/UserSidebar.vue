<template>
  <div
    class="flex flex-col min-h-screen bg-gradient-to-br from-[#ece9e6] to-[##ffffff] dark:from-gray-900 dark:to-gray-800 relative transition-colors duration-300 ease-in-out"
  >
    <!-- Desktop/Tablet Sidebar -->
    <TransitionRoot :show="!sidebarStore.isMobile" as="template">
      <nav
        class="sidebar h-screen fixed bg-white border-r shadow-lg transition-all duration-500 ease-in-out"
        :class="[
          sidebarStore.isCollapsed ? 'w-20' : 'w-72',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        ]"
      >
        <!-- Header -->
        <div
          class="relative h-16 bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] dark:from-blue-600 dark:to-cyan-600"
        >
          <div class="absolute inset-0 flex items-center justify-between px-4">
            <!-- Logo & Text -->
            <Transition>
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
                  ? 'bg-gradient-to-r from-cyan-50 to-green-50 text-cyan-600 dark:from-cyan-900/30 dark:to-green-900/30'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                sidebarStore.isCollapsed ? 'justify-center' : 'gap-3'
              ]"
            >
              <i :class="[item.icon, 'text-xl']"></i>
              <span v-if="!sidebarStore.isCollapsed" class="font-medium">{{ item.name }}</span>
              <span
                v-if="!sidebarStore.isCollapsed && item.badge"
                class="ml-auto bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-full text-xs"
              >
                {{ item.badgeCount }}
              </span>
            </router-link>
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
                  :class="[isDarkMode ? 'bg-cyan-600' : 'bg-gray-200']"
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
            <div class="flex items-center gap-3 px-4 py-2">
              <img
                :src="userStore.user?.profile_image || defaultAvatar"
                class="w-10 h-10 rounded-full object-cover"
                alt="Profile"
              />
              <div v-if="!sidebarStore.isCollapsed">
                <h3 class="font-medium text-gray-700 dark:text-gray-300">
                  {{ userStore.user?.first_name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ userStore.user?.email }}</p>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              v-if="!sidebarStore.isCollapsed"
              @click="handleLogout"
              class="w-full mt-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200 flex items-center gap-2"
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
import { useUserStore } from '@/stores/userStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { TransitionRoot } from '@headlessui/vue'
import MobileNavigation from '@/components/Users/mobile/MobileNavigation.vue'
import Swal from 'sweetalert2'

export default {
  name: 'UserSidebar',

  components: {
    TransitionRoot,
    MobileNavigation
  },

  data() {
    return {
      userStore: useUserStore(),
      sidebarStore: useSidebarStore(),
      defaultAvatar: '/path/to/default-avatar.png'
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
    // ใช้ toggleDarkMode จาก sidebarStore โดยตรง
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

  mounted() {
    this.sidebarStore.initializeResponsive()
    // ไม่ต้อง initialize dark mode ที่นี่แล้ว เพราะทำที่ App.vue แล้ว
  },

  beforeUnmount() {
    this.sidebarStore.cleanup()
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
</style>
