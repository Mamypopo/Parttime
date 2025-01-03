<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg px-1 py-1 z-50"
  >
    <div class="grid grid-cols-5 gap-1">
      <button
        v-for="item in sidebarStore.mobileMainItems"
        :key="item.name"
        @click="handleClick(item)"
        class="flex flex-col items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <div class="relative">
          <i :class="[item.icon, 'text-xl']"></i>
          <!--  Badge "การแจ้งเตือน" -->
          <span
            v-if="item.name === MENU_TYPE.NOTIFICATION && notificationStore.unreadCount > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ notificationStore.unreadCount }}
          </span>
        </div>
        <span class="text-xs mt-1 truncate w-full text-center">{{ item.name }}</span>
      </button>

      <MobileNotifications
        v-model="sidebarStore.showNotifications"
        @update:modelValue="handleNotificationClick"
      />
    </div>
  </nav>
</template>

<script>
import { useSidebarStore } from '@/stores/sidebarStore'
import { useNotificationStore } from '@/stores/notificationStore'
import MobileNotifications from '@/components/admin/MobileNotifications/MobileNotifications.vue'

const MENU_TYPE = {
  NOTIFICATION: 'การแจ้งเตือน'
}

export default {
  name: 'MobileNavigation',
  components: {
    MobileNotifications
  },
  data() {
    return {
      MENU_TYPE,
      sidebarStore: useSidebarStore(),
      notificationStore: useNotificationStore()
    }
  },

  mounted() {
    this.notificationStore.fetchNotifications()
  },

  methods: {
    handleClick(item) {
      if (item.hasSubmenu) {
        if (item.name === MENU_TYPE.NOTIFICATION) {
          this.sidebarStore.showNotifications = !this.sidebarStore.showNotifications
        } else {
          this.sidebarStore.handleMobileMenuClick(item)
        }
      } else {
        this.$router.push(item.path)
      }
    },

    handleNotificationClick(value) {
      this.sidebarStore.showNotifications = value
    }
  }
}
</script>
