<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-1 py-1 z-40"
  >
    <div class="flex justify-around items-center h-16">
      <!-- เมนูปกติ -->
      <router-link
        v-for="item in pathMenuItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center w-full h-full"
        :class="[$route.path === item.path ? activeClass : inactiveClass]"
      >
        <i :class="[item.icon, 'text-xl mb-1']"></i>
        <span class="text-xs">{{ item.name }}</span>
      </router-link>

      <!-- ปุ่มงานของฉัน -->
      <button
        ref="myJobsButton"
        @click="handleMyJobsClick"
        class="flex flex-col items-center justify-center w-full h-full my-jobs-button"
        :class="[sidebarStore.showMyJobsSubmenu ? activeClass : inactiveClass]"
      >
        <i class="fas fa-tasks text-xl mb-1"></i>
        <span class="text-xs">งานของฉัน</span>
      </button>

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

  <!-- Overlay -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="sidebarStore.showMyJobsSubmenu"
      class="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
      @click="closeMyJobsSubmenu"
    ></div>
  </Transition>

  <!-- Submenu งานของฉัน -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="sidebarStore.showMyJobsSubmenu"
      class="fixed bottom-16 left-0 right-0 bg-white/95 dark:bg-gray-800/95 border-t dark:border-gray-700 shadow-lg z-50 submenu"
    >
      <div class="p-2 space-y-1">
        <router-link
          v-for="subItem in myJobsSubmenuItems"
          :key="subItem.path"
          :to="subItem.path"
          class="flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group"
          :class="[
            $route.path === subItem.path
              ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          ]"
          @click="closeMyJobsSubmenu"
        >
          <div class="flex items-center flex-1 relative z-10">
            <i
              :class="[
                subItem.icon,
                'text-lg mr-3 transition-transform duration-200 group-hover:scale-110',
                $route.path === subItem.path ? 'text-cyan-500' : 'text-gray-400'
              ]"
            ></i>
            <span class="font-medium">{{ subItem.name }}</span>
          </div>

          <div v-if="subItem.badge && subItem.badgeCount > 0" class="flex items-center gap-2">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            >
              {{ subItem.badgeCount }}
            </span>
          </div>

          <i
            class="fas fa-chevron-right text-xs text-gray-400 group-hover:translate-x-1 transition-transform duration-200"
          ></i>
        </router-link>
      </div>
    </div>
  </Transition>

  <!-- การแจ้งเตือน -->
  <MobileNotifications v-model="showNotifications" @close="handleCloseNotifications" />

  <!-- User Submenu -->
  <UserSubmenu v-if="sidebarStore.showUserSubmenu" @close="sidebarStore.closeAllSubmenus" />
</template>

<script>
import { useSidebarStore } from '@/stores/sidebarStore'
import UserSubmenu from './UserSubmenu.vue'
import MobileNotifications from '@/components/Users/MobileNotifications/MobileNotifications.vue'
import { useUserNotificationStore } from '@/stores/userNotificationStore'

export default {
  name: 'MobileNavigation',

  components: {
    UserSubmenu,
    MobileNotifications
  },

  data() {
    return {
      sidebarStore: useSidebarStore(),
      notificationStore: useUserNotificationStore(),
      activeClass: 'text-cyan-600 dark:text-cyan-400',
      inactiveClass: 'text-gray-500 dark:text-gray-400',
      showNotifications: false,
      myJobsSubmenuItems: [
        {
          path: '/user/my-jobs',
          name: 'งานที่รับ',
          icon: 'fas fa-list-check',
          badge: true,
          badgeCount: 0
        },
        {
          path: '/user/payment-view',
          name: 'การเงิน',
          icon: 'fas fa-money-bill-wave'
        }
      ]
    }
  },

  computed: {
    pathMenuItems() {
      return this.sidebarStore.userMobileItems.filter(
        (item) =>
          item.path &&
          !item.isComponent &&
          item.path !== '/user/my-jobs' &&
          item.path !== '/user/payment-view'
      )
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

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    handleProfileClick() {
      this.sidebarStore.toggleUserSubmenu()
    },

    handleMyJobsClick(event) {
      event.stopPropagation()
      this.sidebarStore.closeAllSubmenus()
      this.sidebarStore.showMyJobsSubmenu = !this.sidebarStore.showMyJobsSubmenu
    },

    closeMyJobsSubmenu() {
      this.sidebarStore.showMyJobsSubmenu = false
    },

    handleClickOutside(event) {
      if (!this.sidebarStore.showMyJobsSubmenu) return

      const submenuEl = this.$refs.myJobsSubmenu
      const buttonEl = this.$refs.myJobsButton

      if (
        submenuEl &&
        !submenuEl.contains(event.target) &&
        buttonEl &&
        !buttonEl.contains(event.target)
      ) {
        this.closeMyJobsSubmenu()
      }
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
