<template>
  <div class="w-full relative">
    <HeadlessMenu v-if="!isMobile" as="div" class="w-full">
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
          class="fixed ml-3 w-80 bg-white rounded-xl shadow-xl border overflow-visible dark:bg-gray-800 dark:border-gray-700"
          :class="{
            'left-20 bottom-16': isCollapsed, // sidebar หด
            'left-72 bottom-16': !isCollapsed // sidebar ขยาย
          }"
          style="width: 320px; max-height: 480px; overflow-y: auto"
        >
          <div
            class="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600"
          >
            <h3 class="font-medium text-white">การแจ้งเตือน</h3>
            <button
              v-if="notifications.length > 0"
              @click="markAllAsRead"
              class="text-sm text-white/80 hover:text-white transition-colors duration-200"
            >
              <span class="flex items-center gap-2">
                <i class="fas fa-check-double"></i>
                อ่านทั้งหมด
              </span>
            </button>
          </div>

          <!-- Notifications List -->
          <div class="max-h-[320px] overflow-y-auto">
            <HeadlessMenuItem
              v-for="notification in notifications"
              :key="notification.id"
              v-slot="{ active }"
            >
              <div
                class="px-4 py-3 cursor-pointer transition-colors duration-200 border-b last:border-b-0 dark:bg-gray-800 dark:border-gray-700"
                :class="[
                  active ? 'bg-[#5D5FEF]/5' : '',
                  !notification.read ? 'bg-[#5D5FEF]/10' : ''
                ]"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full"
                    :class="getIconClass(notification.type)"
                  >
                    <i :class="getIcon(notification.type)"></i>
                  </span>
                  <div class="flex-1">
                    <p
                      class="text-sm font-medium"
                      :class="!notification.read ? 'text-[#CDE45F]' : 'text-[#888888]'"
                    >
                      {{ notification.message }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <i class="far fa-clock"></i>
                      {{ formatTime(notification.created_at) }}
                    </p>
                  </div>
                  <div v-if="!notification.read" class="flex-shrink-0">
                    <div class="h-3 w-3 rounded-full bg-[#EA6B6B] animate-ping"></div>
                  </div>
                </div>
              </div>
            </HeadlessMenuItem>

            <!-- Empty State -->
            <div
              v-if="notifications.length === 0"
              class="p-8 text-center text-[#3A3A49] flex flex-col items-center gap-3"
            >
              <i class="fas fa-bell-slash text-3xl text-[#EABF71]"></i>
              <p>ไม่มีการแจ้งเตือน</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <button
              class="w-full text-center text-sm text-[#3A3A49] hover:text-[#5D5FEF] transition-colors duration-200"
              @click="openModal"
            >
              <p class="text-[#EA6B6B]">ดูการแจ้งเตือนทั้งหมด</p>
            </button>
          </div>
        </HeadlessMenuItems>
      </transition>

      <!-- Mobile Version -->
      <div v-if="isMobile" class="flex flex-col items-center p-2 relative">
        <button class="flex flex-col items-center relative" @click="openModal">
          <i class="fas fa-bell text-xl text-gray-400"></i>
          <span
            v-if="notificationCount"
            class="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ notificationCount }}
          </span>
          <span class="text-xs mt-1">Alerts</span>
        </button>
      </div>

      <!-- Add Modal -->
      <NotificationsModal
        :is-open="isModalOpen"
        @close="isModalOpen = false"
        :notifications="notifications"
        @notification-read="handleNotificationRead"
        @mark-all-read="markAllAsRead"
      />
    </HeadlessMenu>
  </div>
</template>

<script>
import {
  Menu as HeadlessMenu,
  MenuButton as HeadlessMenuButton,
  MenuItems as HeadlessMenuItems,
  MenuItem as HeadlessMenuItem
} from '@headlessui/vue'
import NotificationsModal from './NotificationsModal.vue'
import { useNotificationStore } from '@/stores/notificationStore'

export default {
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

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },
  data() {
    return {
      isModalOpen: false,
      isMenuOpen: false,
      currentFilter: 'all'
    }
  },
  computed: {
    notifications() {
      return this.notificationStore.sortedNotifications
    },

    notificationCount() {
      return this.notificationStore.unreadCount
    },

    hasUnread() {
      return this.notificationStore.hasUnread
    }
  },

  async created() {
    await this.notificationStore.fetchNotifications()
  },

  methods: {
    openModal() {
      ;(this.isModalOpen = true), (this.isMenuOpen = false)
    },

    closeModal() {
      this.isModalOpen = false
    },

    handleNotificationClick(notification) {
      this.notificationStore.markAsRead(notification.id)
    },

    handleNotificationRead(notificationId) {
      this.notificationStore.markAsRead(notificationId)
    },

    markAllAsRead() {
      this.notificationStore.markAllAsRead()
    },

    getIconClass(type) {
      const classes = {
        job_application: 'bg-gradient-to-br from-[#89CFF0] to-[#4682B4]',
        job_status_update: 'bg-gradient-to-br from-[#6FCF97] to-[#27AE60]',
        user_verification: 'bg-gradient-to-br from-[#F2C94C] to-[#F2994A]',
        evaluation: 'bg-gradient-to-br from-[#A29BFE] to-[#6C5CE7]',
        system: 'bg-gradient-to-br from-[#BDC3C7] to-[#95A5A6]',
        job_application_cancelled_admin: 'bg-gradient-to-br from-[#EB5757] to-[#C0392B]',
        payment_pending: 'bg-gradient-to-br from-[#AFF1DA] to-[#11A89D]',
        default: 'bg-gradient-to-br from-[#89CFF0] to-[#4682B4]'
      }
      return classes[type] || classes.default
    },

    getIcon(type) {
      const icons = {
        job_application: 'fas fa-briefcase text-white',
        job_status_update: 'fas fa-clock text-white',
        user_verification: 'fas fa-user-check text-white',
        evaluation: 'fas fa-star text-white',
        system: 'fas fa-bell text-white',
        job_application_cancelled_admin: 'fas fa-ban text-white',
        payment_pending: 'fas fa-money-bill-wave text-white',
        default: 'fas fa-bell text-white'
      }
      return icons[type] || icons.default
    },

    formatTime(date) {
      if (!date) return 'ไม่ระบุเวลา'

      try {
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) {
          return 'ไม่ระบุเวลา'
        }

        return new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(dateObj)
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'ไม่ระบุเวลา'
      }
    },

    closeMenu() {
      this.isMenuOpen = false
    }
  },
  watch: {
    isModalOpen(newValue) {
      if (newValue) {
        this.closeMenu()
      }
    }
  }
}
</script>

<style scoped>
.max-h-\[320px\] {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 #f3f4f6;
}

.max-h-\[320px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[320px\]::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.max-h-\[320px\]::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 20px;
  border: 2px solid #f3f4f6;
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
