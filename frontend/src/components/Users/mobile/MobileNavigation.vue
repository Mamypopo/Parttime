<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-50"
  >
    <div class="flex justify-around items-center h-16">
      <router-link
        v-for="item in pathMenuItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[$route.path === item.path ? activeClass : inactiveClass]"
      >
        <i :class="[item.icon, 'text-xl mb-1']"></i>
        <span class="text-xs">{{ item.name }}</span>
        <span
          v-if="item.badge && item.badgeCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
        >
          {{ item.badgeCount }}
        </span>
      </router-link>
      <!-- ปุ่มแจ้งเตือน -->
      <button
        @click="handleNotificationClick"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[showNotifications ? activeClass : inactiveClass]"
      >
        <div class="relative">
          <i :class="[notificationItem.icon, 'text-xl mb-1']"></i>
          <span
            v-if="notificationCount > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ notificationCount }}
          </span>
        </div>
        <span class="text-xs">{{ notificationItem.name }}</span>
      </button>

      <!-- ปุ่มโปรไฟล์ -->
      <button
        @click="handleProfileClick"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[sidebarStore.showUserSubmenu ? activeClass : inactiveClass]"
      >
        <i :class="[profileItem.icon, 'text-xl mb-1']"></i>
        <span class="text-xs">{{ profileItem.name }}</span>
      </button>
    </div>
  </nav>

  <!-- การแจ้งเตือน -->
  <MobileNotifications v-model="showNotifications" @close="handleCloseNotifications" />

  <!-- User Submenu -->
  <UserSubmenu v-if="sidebarStore.showUserSubmenu" @close="sidebarStore.closeAllSubmenus" />
</template>

<script>
import { useSidebarStore } from '@/stores/sidebarStore'
import UserSubmenu from './UserSubmenu.vue'
import MobileNotifications from '@/components/Users/MobileNotifications/MobileNotifications.vue'
import { useUserNotificationStore } from '@/stores/userNotificationStore' // เพิ่ม import

export default {
  name: 'MobileNavigation',

  components: {
    UserSubmenu,
    MobileNotifications
  },
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      sidebarStore: useSidebarStore(),
      notificationStore: useUserNotificationStore(),
      activeClass: 'text-cyan-600 dark:text-cyan-400',
      inactiveClass: 'text-gray-500 dark:text-gray-400',
      showNotifications: false
    }
  },
  mounted() {
    this.notificationStore.fetchNotifications()
  },
  computed: {
    pathMenuItems() {
      return this.sidebarStore.userMobileItems.filter((item) => !item.isComponent)
    },
    notificationItem() {
      return this.sidebarStore.userMobileItems.find((item) => item.hasNotification)
    },
    notificationCount() {
      return this.notificationStore.unreadCount
    },
    profileItem() {
      return this.sidebarStore.userMobileItems.find(
        (item) => item.isComponent && !item.hasNotification
      )
    }
  },

  methods: {
    handleProfileClick() {
      this.sidebarStore.toggleUserSubmenu()
    },

    handleCloseNotifications() {
      this.showNotifications = false
      this.showAllNotifications = false
    },
    handleNotificationClick() {
      this.showNotifications = !this.showNotifications
      if (!this.showNotifications) {
        this.sidebarStore.closeAllSubmenus()
      }
    }
  }
}
</script>
