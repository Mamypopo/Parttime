<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" class="relative modal">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <HeadlessDialogPanel
              class="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden"
              @click.stop
            >
              <!-- Header -->
              <div
                class="flex justify-between items-center p-6 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] border-b"
              >
                <HeadlessDialogTitle class="text-lg font-semibold text-[#EA6B6B]">
                  การแจ้งเตือนทั้งหมด
                </HeadlessDialogTitle>
                <div class="flex items-center gap-4">
                  <button
                    v-if="hasUnread"
                    @click="markAllAsRead"
                    class="text-sm text-[#6ED7D1] hover:text-[#4bb3af] transition-colors duration-200"
                  >
                    <span class="flex items-center gap-2">
                      <i class="fas fa-check-double"></i>
                      อ่านทั้งหมด
                    </span>
                  </button>
                  <button
                    @click="closeModal"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div class="p-6 border-b bg-gray-50">
                <div class="flex gap-3">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center gap-2"
                    :class="
                      currentFilter === filter.value
                        ? 'bg-[#babbec] text-white  shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
                    "
                  >
                    <i :class="getFilterIcon(filter.value)"></i>
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="max-h-[70vh] overflow-y-auto">
                <div
                  v-if="filteredNotifications.length === 0"
                  class="p-12 text-center text-[#3A3A49] flex flex-col items-center gap-4"
                >
                  <i class="fas fa-bell-slash text-4xl text-[#EABF71]"></i>
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>

                <div
                  v-else
                  v-for="notification in filteredNotifications"
                  :key="notification.id"
                  class="p-6 hover:bg-[#5D5FEF]/5 border-b last:border-b-0 transition-colors duration-200 cursor-pointer"
                  :class="!notification.read ? 'bg-[#5D5FEF]/10' : ''"
                  @click="handleNotificationClick(notification)"
                >
                  <!-- ไอคอนและข้อความ -->
                  <div class="flex-1 flex gap-3 min-h-[80px]">
                    <div class="mt-1">
                      <span
                        class="flex-shrink-0 h-10 w-10 items-center justify-center rounded-full shadow-sm"
                        :class="getIconClass(notification.type)"
                      >
                        <i :class="getIcon(notification.type)"></i>
                      </span>
                    </div>
                    <div class="flex-1">
                      <p
                        class="font-medium text-lg mb-1"
                        :class="!notification.read ? 'text-[#CDE45F]' : 'text-[#888888]'"
                      >
                        {{ notification.message }}
                      </p>

                      <p class="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <i class="far fa-clock"></i>
                        {{ formatTime(notification.created_at) }}
                      </p>
                    </div>

                    <div class="w-3 h-3 mt-2 ml-2">
                      <div
                        class="h-3 w-3 rounded-full transition-opacity duration-200"
                        :class="
                          !notification.read ? 'bg-[#EA6B6B] animate-ping opacity-100' : 'opacity-0'
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </HeadlessDialogPanel>
          </TransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>

<script>
import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  DialogTitle as HeadlessDialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'

import NotificationsModal from './NotificationsModal.vue'
import { useNotificationStore } from '@/stores/notificationStore'

export default {
  components: {
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild
  },

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentFilter: 'all',
      filters: [
        { label: 'ทั้งหมด', value: 'all' },
        { label: 'ยังไม่ได้อ่าน', value: 'unread' },
        // { label: 'ผู้ใช้งาน', value: 'user' },
        // { label: 'ทักษะ', value: 'skill' },
        { label: 'งาน', value: 'job' }
      ]
    }
  },

  computed: {
    notifications() {
      return this.notificationStore.sortedNotifications
    },

    hasUnread() {
      return this.notificationStore.hasUnread
    },

    filteredNotifications() {
      const notifications = this.notifications
      if (this.currentFilter === 'all') return notifications
      if (this.currentFilter === 'unread') return notifications.filter((n) => !n.read)
      return notifications.filter((n) => n.type === this.currentFilter)
    }
  },

  methods: {
    getIconClass(type) {
      const classes = {
        user: ' text-[#CDE45F]',
        // skill: 'bg-green-100 text-green-600',
        job: 'bg-purple-100 text-purple-600',
        default: 'bg-gray-100 text-gray-600'
      }
      return classes[type] || classes.default
    },
    getFilterIcon(value) {
      const icons = {
        all: 'fas fa-th-list  text-[#81E2C4]',
        unread: 'fas fa-envelope text-[#81E2C4]',
        // user: 'fas fa-users',
        // skill: 'fas fa-tools',
        job: 'fas fa-briefcase'
      }
      return icons[value]
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
          console.error('Invalid date:', date)
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
        console.error('Error formatting date:', error, date)
        return 'ไม่ระบุเวลา'
      }
    },
    closeModal() {
      this.isModalOpen = false
      this.$emit('close')
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    markAllAsRead() {
      this.notificationStore.markAllAsRead()
    },
    handleNotificationRead(notificationId) {
      this.notificationStore.markAsRead(notificationId)
    },
    handleNotificationClick(notification) {
      this.notificationStore.markAsRead(notification.id)
    }
  }
}
</script>

<style scoped>
.max-h-\[320px\] {
  scrollbar-width: thin;
  scrollbar-color: #5d5fef #f3f4f6;
}

.max-h-\[320px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[320px\]::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.max-h-\[320px\]::-webkit-scrollbar-thumb {
  background-color: #5d5fef;
  border-radius: 20px;
  border: 2px solid #f3f4f6;
}
</style>
