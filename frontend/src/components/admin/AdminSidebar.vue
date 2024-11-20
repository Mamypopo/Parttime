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
      <div
        class="sidebar h-screen fixed bg-white border-r shadow-lg transition-all duration-500 ease-in-out"
        :class="[
          sidebarStore.isCollapsed ? 'w-20' : 'w-72',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        ]"
      >
        <!-- Header with Gradient -->
        <div
          class="relative h-16 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-700 dark:to-blue-600"
        >
          <div
            class="absolute inset-0 flex items-center justify-between px-4"
            :class="[sidebarStore.isCollapsed ? 'justify-center' : '']"
          >
            <div class="flex items-center gap-3">
              <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-8 h-8 rounded-lg" />
              <h1 v-if="!sidebarStore.isCollapsed" class="text-lg font-bold text-white">
                Admin Panel
              </h1>
            </div>
            <button
              v-if="!sidebarStore.isCollapsed"
              @click="sidebarStore.toggleSidebar"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <i class="fas fa-chevron-left text-white"></i>
            </button>
          </div>
        </div>
        <!-- Toggle Dark Mode -->
        <div class="mt-auto">
          <div
            class="flex items-center px-4 py-3 rounded-xl transition-all duration-200"
            :class="[sidebarStore.isCollapsed ? 'justify-center' : 'gap-3']"
          >
            <!-- Toggle Switch -->
            <button
              @click="toggleDarkMode"
              class="relative inline-flex items-center cursor-pointer"
            >
              <div
                class="w-11 h-6 rounded-full transition-colors duration-200 ease-in-out"
                :class="[
                  isDarkMode ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                ]"
              >
                <div
                  class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out"
                  :class="{ 'translate-x-full': isDarkMode }"
                ></div>
                <!-- Icons -->
                <span
                  class="absolute left-[4px] top-[4px] text-[10px] transition-opacity duration-200"
                  :class="{ 'opacity-0': isDarkMode }"
                >
                  🌞
                </span>
                <span
                  class="absolute right-[4px] top-[4px] text-[10px] transition-opacity duration-200"
                  :class="{ 'opacity-0': !isDarkMode }"
                >
                  🌙
                </span>
              </div>
            </button>

            <!-- Label -->
            <span
              v-if="!sidebarStore.isCollapsed"
              class="text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              {{ isDarkMode ? 'โหมดมืด' : 'โหมดสว่าง' }}
            </span>
          </div>
        </div>
        <!-- Navigation Menu -->
        <div class="p-4 space-y-8">
          <!-- Main Menu -->
          <div>
            <h2
              v-if="!sidebarStore.isCollapsed"
              class="text-xs font-semibold text-gray-400 mb-4 px-4 dark:text-gray-500"
            >
              เมนูหลัก
            </h2>
            <nav class="space-y-1">
              <router-link
                v-for="item in sidebarStore.mainMenuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-3 rounded-xl transition-all duration-200"
                :class="[
                  $route.path === item.path
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600  dark:from-purple-800/30 dark:to-blue-800/30 dark:text-purple-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                  sidebarStore.isCollapsed ? 'justify-center' : 'gap-3'
                ]"
              >
                <i
                  :class="[
                    item.icon,
                    'text-xl',
                    $route.path === item.path
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-400 dark:text-gray-500'
                  ]"
                ></i>
                <span v-if="!sidebarStore.isCollapsed" class="font-medium">{{ item.name }}</span>
              </router-link>
            </nav>
          </div>

          <!-- Jobs Section -->
          <div>
            <h2
              v-if="!sidebarStore.isCollapsed"
              class="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 px-4"
            >
              งาน
            </h2>
            <nav class="space-y-1">
              <router-link
                v-for="item in sidebarStore.jobMenuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-3 rounded-xl transition-all duration-200"
                :class="[
                  $route.path === item.path
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 dark:from-purple-900/50 dark:to-blue-900/50 dark:text-purple-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                  sidebarStore.isCollapsed ? 'justify-center' : 'gap-3'
                ]"
              >
                <i
                  :class="[
                    item.icon,
                    'text-xl',
                    $route.path === item.path ? 'text-purple-600' : 'text-gray-400'
                  ]"
                ></i>
                <span v-if="!sidebarStore.isCollapsed" class="font-medium">{{ item.name }}</span>
                <span
                  v-if="item.badge && jobStore.pendingApplicationsCount > 0"
                  class="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse"
                >
                  {{ jobStore.pendingApplicationsCount }}
                </span>
              </router-link>
            </nav>
          </div>
          <div>
            <h2
              v-if="!sidebarStore.isCollapsed"
              class="text-xs font-semibold text-gray-400 mb-4 px-4"
            >
              การแจ้งเตือน
            </h2>
            <NotificationsPanel
              v-model="sidebarStore.showNotifications"
              :is-collapsed="sidebarStore.isCollapsed"
              @show-all="sidebarStore.showAllNotifications = true"
            />
          </div>
        </div>

        <!-- Profile Section -->
        <div
          class="absolute bottom-0 left-0 right-0 p-4"
          :class="[sidebarStore.isCollapsed ? 'py-4' : 'py-6']"
        >
          <div
            class="rounded-2xl bg-white/10 dark:bg-gray-700/50 transition-all duration-200 p-4"
            :class="[sidebarStore.isCollapsed ? 'px-2' : 'px-4']"
          >
            <div
              class="flex items-center"
              :class="[sidebarStore.isCollapsed ? 'justify-center' : 'gap-3']"
            >
              <img
                src="@/assets/images/logosemed.svg"
                alt="Profile"
                class="w-10 h-10 rounded-xl shadow-md"
              />
              <div v-if="!sidebarStore.isCollapsed" class="flex-1">
                <h3 class="font-semibold text-gray-700 dark:text-gray-300">Admin User</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">admin@example.com</p>
              </div>
            </div>
            <div v-if="!sidebarStore.isCollapsed" class="mt-4">
              <button
                @click="handleLogout"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-700 dark:to-blue-600 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
              >
                <i class="fas fa-sign-out-alt"></i>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>
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
    <!-- Expand Button -->
    <TransitionRoot
      :show="sidebarStore.isCollapsed && !sidebarStore.isTablet && !sidebarStore.isMobile"
      as="template"
      enter="transition-all duration-300"
      enter-from="opacity-0 translate-x-4"
      enter-to="opacity-100 translate-x-0"
      leave="transition-all duration-300"
      leave-from="opacity-100 translate-x-0"
      leave-to="opacity-0 translate-x-4"
    >
      <button
        @click="sidebarStore.toggleSidebar"
        class="fixed top-4 left-[4.5rem] p-2 ml-4 bg-white/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group z-50 dark:bg-gray-800/50"
      >
        <i
          class="fas fa-chevron-right text-gray-400 group-hover:text-purple-600 transition-colors dark:text-gray-300"
        ></i>
      </button>
    </TransitionRoot>

    <!-- Mobile Navigation -->
    <MobileNavigation v-if="sidebarStore.isMobile" />

    <!-- Mobile Dialogs -->
    <MobileUserSubmenu v-if="sidebarStore.showUserSubmenu" @close="sidebarStore.closeAllSubmenus" />
    <MobileJobSubmenu v-if="sidebarStore.showJobSubmenu" @close="sidebarStore.closeAllSubmenus" />
    <MobileNotifications
      v-if="sidebarStore.showNotifications"
      @close="sidebarStore.closeAllSubmenus"
    />
    <MobileMoreSubmenu v-if="sidebarStore.showMoreSubmenu" @close="sidebarStore.closeAllSubmenus" />
  </div>
</template>
<script>
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import NotificationsPanel from '@/components/admin/Notifications/NotificationsPanel.vue'
import MobileNotifications from '@/components/admin/MobileNotifications/MobileNotifications.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAdminStore } from '@/stores/adminStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useJobStore } from '@/stores/jobStore'
import MobileNavigation from '@/components/mobile/MobileNavigation.vue'
import MobileUserSubmenu from '@/components/mobile/MobileUserSubmenu.vue'
import MobileJobSubmenu from '@/components/mobile/MobileJobSubmenu.vue'
import MobileMoreSubmenu from '@/components/mobile/MobileMoreSubmenu.vue'

export default {
  name: 'AdminSidebar',
  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    NotificationsPanel,
    MobileNavigation,
    MobileUserSubmenu,
    MobileJobSubmenu,
    MobileNotifications,
    MobileMoreSubmenu
  },
  data() {
    return {
      sidebarStore: useSidebarStore(),
      jobStore: useJobStore(),
      notificationStore: useNotificationStore(),
      isDarkMode: localStorage.getItem('darkMode') === 'true' || false
    }
  },

  methods: {
    async handleLogout() {
      const success = await this.sidebarStore.handleLogout()
      if (success) {
        this.$router.push('/signin-admin')
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode

      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      localStorage.setItem('darkMode', this.isDarkMode)
    }
  },

  mounted() {
    this.sidebarStore.initializeResponsive()
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark')
      this.isDarkMode = true
    }
  },

  beforeUnmount() {
    this.sidebarStore.cleanup()
  }
}
</script>

<style scoped>
.sidebar {
  @apply backdrop-blur-lg bg-white/80 dark:bg-gray-800/95;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.router-link-active {
  @apply bg-purple-100/10 dark:bg-purple-900/20;
}

.router-link-active i {
  @apply text-purple-600 dark:text-purple-400;
}

.router-link-active:hover {
  @apply bg-purple-100 dark:bg-purple-900/30;
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
@keyframes bell-shake {
  0% {
    transform: rotate(0);
  }
  15% {
    transform: rotate(5deg);
  }
  30% {
    transform: rotate(-5deg);
  }
  45% {
    transform: rotate(4deg);
  }
  60% {
    transform: rotate(-4deg);
  }
  75% {
    transform: rotate(2deg);
  }
  85% {
    transform: rotate(-2deg);
  }
  92% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(0);
  }
}

.fa-bell:hover {
  animation: bell-shake 0.5s ease;
}
</style>
