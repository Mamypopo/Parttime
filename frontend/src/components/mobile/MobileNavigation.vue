<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg px-4 py-2 z-50"
  >
    <div class="flex justify-around items-center">
      <button
        v-for="item in sidebarStore.mobileMainItems"
        :key="item.name"
        @click="handleClick(item)"
        class="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <i :class="[item.icon, 'text-xl']"></i>
        <span class="text-xs mt-1">{{ item.name }}</span>
      </button>

      <!-- การแจ้งเตือน -->
      <MobileNotifications
        v-model="sidebarStore.showNotifications"
        @update:modelValue="handleNotificationClick"
      />
    </div>
  </nav>
</template>
<script>
import { useSidebarStore } from '@/stores/sidebarStore'
import MobileNotifications from '@/components/admin/MobileNotifications/MobileNotifications.vue'

export default {
  name: 'MobileNavigation',
  components: {
    MobileNotifications
  },
  data() {
    return {
      sidebarStore: useSidebarStore()
    }
  },

  methods: {
    handleClick(item) {
      if (item.hasSubmenu) {
        this.sidebarStore.handleMobileMenuClick(item)
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
