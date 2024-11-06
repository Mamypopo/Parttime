<template>
  <div class="relative">
    <!-- ปุ่มการแจ้งเตือน -->
    <button
      class="flex flex-col items-center p-2 text-[#3A3A49]"
      @click="$emit('update:modelValue', true)"
    >
      <div class="relative">
        <i class="fas fa-bell text-xl"></i>
        <span
          v-if="notificationStore.unreadCount > 0"
          class="absolute -top-2 -right-2 bg-[#EA6B6B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
        >
          {{ notificationStore.unreadCount }}
        </span>
      </div>
      <span class="text-xs mt-1">การแจ้งเตือน</span>
    </button>
    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-full opacity-0"
    >
      <!-- Panel หลัก -->
      <div
        v-show="modelValue"
        class="fixed inset-x-0 bottom-[80px] bg-white border-t shadow-lg z-40"
      >
        <!-- Header -->
        <div
          class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] border-b"
        >
          <div class="flex-1">
            <h3 class="text-base font-medium text-[#EA6B6B]">การแจ้งเตือน</h3>
          </div>
          <div class="flex items-center gap-4">
            <button
              v-if="hasUnread"
              @click="markAllAsRead"
              class="text-sm text-[#6ED7D1] hover:text-[#4bb3af] transition-colors duration-200 whitespace-nowrap"
            >
              <span class="flex items-center gap-2">
                <i class="fas fa-check-double"></i>
                อ่านทั้งหมด
              </span>
            </button>
            <button
              @click="$emit('update:modelValue', false)"
              class="text-[#3A3A49] hover:text-[#2b2b4d] ml-2"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto" style="max-height: calc(80vh - 130px)">
          <div
            v-if="notifications.length === 0"
            class="p-8 text-center text-[#3A3A49] flex flex-col items-center gap-3"
          >
            <i class="fas fa-bell-slash text-3xl text-[#EABF71]"></i>
            <p>ไม่มีการแจ้งเตือน</p>
          </div>

          <div
            v-else
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 hover:bg-[#5D5FEF]/5 border-b last:border-b-0 transition-colors duration-200"
            :class="!notification.read ? 'bg-[#5D5FEF]/10' : ''"
            @click="handleSelect(notification)"
          >
            <div class="flex items-start gap-3">
              <span
                class="flex h-10 w-10 items-center justify-center rounded-full"
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
        </div>

        <!-- Footer -->
        <div class="p-3 border-t bg-gray-50">
          <button
            class="w-full text-center text-sm text-[#EA6B6B] hover:text-[#d95151] transition-colors duration-200"
            @click="openAllNotifications"
          >
            ดูการแจ้งเตือนทั้งหมด
          </button>
        </div>
      </div>
    </Transition>

    <!-- Full Screen Modal -->
    <MobileNotificationsModal
      :is-open="showAllNotifications"
      @close="showAllNotifications = false"
    />
  </div>
</template>

<script>
import { useNotificationStore } from '@/stores/notificationStore'
import MobileNotificationsModal from './MobileNotificationsModal.vue'

export default {
  name: 'MobileNotifications',

  components: {
    MobileNotificationsModal
  },

  props: {
    modelValue: Boolean
  },

  emits: ['update:modelValue'],

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },

  data() {
    return {
      showAllNotifications: false
    }
  },

  computed: {
    notifications() {
      return this.notificationStore.sortedNotifications
    },

    hasUnread() {
      return this.notificationStore.hasUnread
    },

    unreadCount() {
      return this.notifications.filter((n) => !n.read).length
    }
  },

  methods: {
    getIconClass(type) {
      const classes = {
        user: 'text-[#CDE45F]',
        // skill: 'bg-green-100 text-green-600',
        job: 'bg-purple-100 text-purple-600',
        default: 'bg-gray-100 text-gray-600'
      }

      return classes[type] || classes.default
    },

    getIcon(type) {
      const icons = {
        // user: 'fas fa-user-clock',
        // skill: 'fas fa-tasks',
        job: 'fas fa-briefcase ',
        default: 'fas fa-bell text-[#EABF71]'
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

    async handleSelect(notification) {
      try {
        await this.notificationStore.markAsRead(notification.id)
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    },

    async markAllAsRead() {
      try {
        await this.notificationStore.markAllAsRead()
      } catch (error) {
        console.error('Error marking all as read:', error)
      }
    },

    openAllNotifications() {
      this.showAllNotifications = true
      this.$emit('update:modelValue', false)
    }
  }
}
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 #f3f4f6;
  max-height: calc(100vh - 180px);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
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
