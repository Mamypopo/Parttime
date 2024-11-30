<template>
  <div class="w-full relative">
    <HeadlessMenu v-if="!isMobile" as="div" class="w-full" v-model="isMenuOpen">
      <!-- ปุ่มแจ้งเตือน -->
      <HeadlessMenuButton
        class="w-full flex items-center px-4 py-2 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-gray-600 transition-colors duration-200"
        :class="[
          isCollapsed ? 'justify-center' : 'gap-3',
          'hover:bg-[#5D5FEF] hover:bg-opacity-5 dark:hover:bg-opacity-10 text-gray-600 dark:text-gray-300'
        ]"
      >
        <div class="w-4 text-center">
          <i class="fas fa-bell text-xl text-[#A8E6E2] dark:text-[#6ED7D1]"></i>
        </div>
        <span v-if="!isCollapsed" class="font-semibold ml-1 text-gray-600 dark:text-gray-300"
          >การแจ้งเตือน</span
        >
        <span
          v-if="notificationCount"
          class="text-xs bg-[#f76363] dark:bg-[#ff4444] text-white px-2 py-0.5 rounded-full animate-pulse"
          :class="[isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto']"
        >
          {{ notificationCount }}
        </span>
      </HeadlessMenuButton>

      <!-- รายการแจ้งเตือน -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <HeadlessMenuItems
          v-if="!isModalOpen"
          class="fixed ml-3 w-80 bg-white rounded-xl shadow-xl border overflow-visible dark:bg-gray-800 dark:border-gray-700 transition-all duration-200"
          :class="{
            'left-20 bottom-16': isCollapsed,
            'left-72 bottom-16': !isCollapsed
          }"
          style="width: 320px; max-height: 480px; overflow-y: auto"
        >
          <!-- หัวข้อ -->
          <div
            class="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] dark:from-[#4a9490] dark:to-[#6ED7D1] border-b"
          >
            <h3 class="font-medium text-[#3A3A49] dark:text-white">การแจ้งเตือน</h3>
            <button
              v-if="notifications.length > 0"
              @click="markAllAsRead"
              class="text-sm text-[#3A3A49] hover:text-[#6ED7D1] dark:text-white dark:hover:text-[#A8E6E2] transition-colors duration-200"
            >
              <span class="flex items-center gap-2">
                <i class="fas fa-check-double"></i>
                อ่านทั้งหมด
              </span>
            </button>
          </div>

          <!-- รายการแจ้งเตือน -->
          <div class="max-h-[320px] overflow-y-auto">
            <HeadlessMenuItem
              v-for="notification in notifications"
              :key="notification.id"
              v-slot="{ active }"
            >
              <div
                class="px-4 py-3 cursor-pointer transition-all duration-200 border-b last:border-b-0 dark:border-gray-700"
                :class="[
                  active ? 'bg-[#D9F9F4] dark:bg-[#3D756E]' : '',
                  !notification.read
                    ? 'bg-[#E3FCEC] dark:bg-[#2F4F4D]'
                    : 'bg-white dark:bg-gray-800'
                ]"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start gap-3">
                  <!-- Icon -->
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full shadow-md"
                    :class="getIconClass(notification.type)"
                  >
                    <i :class="getIcon(notification.type)"></i>
                  </span>
                  <!-- Message -->
                  <div class="flex-1">
                    <p
                      class="text-sm font-medium"
                      :class="
                        !notification.read
                          ? 'text-[#256D85] dark:text-[#A3E0DF]'
                          : 'text-[#94A3B8] dark:text-[#64748B]'
                      "
                    >
                      {{ notification.message }}
                    </p>
                    <p
                      class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"
                    >
                      <i class="far fa-clock"></i>
                      {{ formatTime(notification.created_at) }}
                    </p>
                  </div>
                  <!-- Unread Indicator -->
                  <div v-if="!notification.read" class="flex-shrink-0">
                    <div class="h-3 w-3 rounded-full bg-[#F87171] animate-ping"></div>
                  </div>
                </div>
              </div>
            </HeadlessMenuItem>

            <!-- สถานะว่าง -->
            <div
              v-if="notifications.length === 0"
              class="p-8 text-center flex flex-col items-center gap-3"
            >
              <i
                class="fas fa-bell-slash text-3xl text-[#6ED7D1] dark:text-[#A8E6E2] opacity-50"
              ></i>
              <p class="text-gray-500 dark:text-gray-400">ไม่มีการแจ้งเตือน</p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-4 py-3 border-t bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 dark:border-gray-700"
          >
            <button
              class="w-full text-center text-sm transition-all duration-200"
              @click="openModal"
            >
              <p
                class="text-[#6ED7D1] hover:text-[#4bb3af] dark:text-[#A8E6E2] dark:hover:text-[#6ED7D1] font-medium"
              >
                ดูการแจ้งเตือนทั้งหมด
              </p>
            </button>
          </div>
        </HeadlessMenuItems>
      </transition>

      <!-- Modal แสดงการแจ้งเตือนทั้งหมด -->
      <NotificationsModal
        :is-open="isModalOpen"
        @close="closeModal"
        :notifications="notifications"
        @notification-read="handleNotificationRead"
        @mark-all-read="markAllAsRead"
      />
    </HeadlessMenu>
  </div>
</template>

<script>
import { useUserNotificationStore } from '@/stores/userNotificationStore'
import NotificationsModal from './NotificationsModal.vue'
import {
  Menu as HeadlessMenu,
  MenuButton as HeadlessMenuButton,
  MenuItems as HeadlessMenuItems,
  MenuItem as HeadlessMenuItem
} from '@headlessui/vue'

export default {
  name: 'NotificationsPanel',

  components: {
    HeadlessMenu,
    HeadlessMenuButton,
    HeadlessMenuItems,
    HeadlessMenuItem,
    NotificationsModal
  },

  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isModalOpen: false,
      notificationStore: useUserNotificationStore(),
      isMenuOpen: false
    }
  },

  computed: {
    notifications() {
      return this.notificationStore.notifications
    },
    notificationCount() {
      return this.notificationStore.unreadCount
    }
  },

  methods: {
    openModal() {
      this.isModalOpen = true
      this.isMenuOpen = false
    },

    closeModal() {
      this.isModalOpen = false
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    handleNotificationClick(notification) {
      if (notification?.id) {
        this.notificationStore.markAsRead(notification.id)
      } else {
        console.error('Invalid notification ID')
      }
    },
    handleNotificationRead(notificationId) {
      this.notificationStore.markAsRead(notificationId)
    },
    markAllAsRead() {
      this.notificationStore.markAllAsRead()
    },

    getIconClass(type) {
      const classes = {
        job: 'bg-gradient-to-br from-[#6ED7D1] to-[#9899ee] text-white',
        default:
          'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300'
      }
      return classes[type] || classes.default
    },

    getIcon(type) {
      const icons = {
        job: 'fas fa-briefcase',
        default: 'fas fa-bell'
      }
      return icons[type] || icons.default
    },

    formatTime(date) {
      if (!date) return 'ไม่ระบุเวลา'
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date(date))
    }
  },
  watch: {
    isModalOpen(newValue) {
      if (newValue) {
        this.closeMenu()
      }
    }
  },
  mounted() {
    this.notificationStore.fetchNotifications()
  }
}
</script>

<style scoped>
/* เพิ่ม animation กระดิ่ง */
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
