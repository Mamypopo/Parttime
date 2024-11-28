<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mobile-bottom-nav z-50"
  >
    <div class="flex justify-around items-center h-16">
      <!-- หน้าแรก -->
      <router-link
        to="/user/jobs"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[$route.path === '/user/jobs' ? activeClass : inactiveClass]"
      >
        <i class="fas fa-home text-xl mb-1"></i>
        <span class="text-xs">หน้าแรก</span>
      </router-link>

      <!-- งานของฉัน -->
      <router-link
        to="/user/my-jobs"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[$route.path === '/user/my-jobs' ? activeClass : inactiveClass]"
      >
        <i class="fas fa-briefcase text-xl mb-1"></i>
        <span class="text-xs">งานของฉัน</span>
      </router-link>

      <!-- การแจ้งเตือน -->
      <button
        @click="sidebarStore.toggleNotifications"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[sidebarStore.showNotifications ? activeClass : inactiveClass]"
      >
        <div class="relative">
          <i class="fas fa-bell text-xl mb-1"></i>
          <span
            v-if="notificationStore.unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ notificationStore.unreadCount }}
          </span>
        </div>
        <span class="text-xs">แจ้งเตือน</span>
      </button>

      <!-- โปรไฟล์ -->
      <button
        @click="sidebarStore.toggleUserSubmenu"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[sidebarStore.showUserSubmenu ? activeClass : inactiveClass]"
      >
        <i class="fas fa-user text-xl mb-1"></i>
        <span class="text-xs">โปรไฟล์</span>
      </button>
    </div>
  </nav>
</template>

<script>
import { useSidebarStore } from '@/stores/sidebarStore'
import { useNotificationStore } from '@/stores/notificationStore'

export default {
  name: 'MobileNavigation',
  data() {
    return {
      sidebarStore: useSidebarStore(),
      notificationStore: useNotificationStore(),
      activeClass: 'text-purple-600 dark:text-purple-400',
      inactiveClass: 'text-gray-500 dark:text-gray-400'
    }
  }
}
</script>

<style scoped>
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
