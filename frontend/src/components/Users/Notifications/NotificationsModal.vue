<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" class="relative modal" @close="closeModal">
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
              class="w-full max-w-4xl rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-800"
            >
              <!-- Header -->
              <div
                class="flex justify-between items-center p-6 bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] dark:from-[#4a9490] dark:to-[#6ED7D1] border-b"
              >
                <HeadlessDialogTitle class="text-lg font-semibold text-[#3A3A49] dark:text-white">
                  การแจ้งเตือนทั้งหมด
                </HeadlessDialogTitle>
                <div class="flex items-center gap-4">
                  <button
                    v-if="hasUnread"
                    @click="markAllAsRead"
                    class="text-sm text-[#6ED7D1] hover:text-[#4bb3af] dark:text-[#A8E6E2] dark:hover:text-[#6ED7D1] transition-colors duration-200"
                  >
                    <span class="flex items-center gap-2">
                      <i class="fas fa-check-double"></i>
                      อ่านทั้งหมด
                    </span>
                  </button>
                  <button
                    @click="closeModal"
                    class="text-[#3A3A49]/70 hover:text-[#3A3A49] dark:text-white/70 dark:hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div class="p-6 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div class="flex gap-3">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center gap-2"
                    :class="[
                      currentFilter === filter.value
                        ? 'bg-[#6ED7D1] text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    ]"
                  >
                    <i :class="getFilterIcon(filter.value)"></i>
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="max-h-[70vh] overflow-y-auto dark:bg-gray-800">
                <!-- Empty State -->
                <div
                  v-if="filteredNotifications.length === 0"
                  class="p-12 text-center text-[#3A3A49] dark:text-gray-400 flex flex-col items-center gap-4"
                >
                  <i class="fas fa-bell-slash text-4xl text-[#A8E6E2] dark:text-[#6ED7D1]"></i>
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>

                <!-- Notification Items -->
                <div
                  v-else
                  v-for="notification in filteredNotifications"
                  :key="notification.id"
                  class="p-6 border-b last:border-b-0 transition-colors duration-200 cursor-pointer dark:border-gray-700"
                  :class="[
                    !notification.read
                      ? 'bg-[#A8E6E2]/10 dark:bg-[#6ED7D1]/20'
                      : 'hover:bg-[#A8E6E2]/5 dark:hover:bg-[#6ED7D1]/10'
                  ]"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="flex-1 flex gap-3 min-h-[80px]">
                    <!-- Icon -->
                    <div class="mt-1">
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
                        :class="getIconClass(notification.type)"
                      >
                        <i :class="getIcon(notification.type)"></i>
                      </span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1">
                      <p
                        class="font-medium text-lg mb-1"
                        :class="!notification.read ? 'text-[#3A3A49]' : 'text-gray-600'"
                      >
                        {{ notification.message }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatTime(notification.created_at) }}
                      </p>
                    </div>

                    <!-- Unread Indicator -->
                    <div v-if="!notification.read" class="flex-shrink-0">
                      <div class="h-3 w-3 rounded-full bg-[#f76363] animate-ping"></div>
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
import { useUserNotificationStore } from '@/stores/userNotificationStore'
import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  DialogTitle as HeadlessDialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'

export default {
  name: 'NotificationsModal',

  components: {
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild
  },

  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },

  emits: ['close'],

  data() {
    return {
      currentFilter: 'all',
      notificationStore: useUserNotificationStore(),
      filters: [
        { label: 'ทั้งหมด', value: 'all' },
        { label: 'ยังไม่ได้อ่าน', value: 'unread' },
        { label: 'งาน', value: 'job' }
      ]
    }
  },

  computed: {
    filteredNotifications() {
      const notifications = this.notificationStore.notifications
      if (this.currentFilter === 'all') return notifications
      if (this.currentFilter === 'unread') return notifications.filter((n) => !n.read)
      return notifications.filter((n) => n.type === this.currentFilter)
    },

    hasUnread() {
      return this.notificationStore.hasUnread
    }
  },

  methods: {
    closeModal() {
      this.$emit('close')
    },

    markAllAsRead() {
      this.notificationStore.markAllAsRead()
    },

    handleNotificationClick(notification) {
      this.notificationStore.markAsRead(notification.id)
    },

    getIconClass(type) {
      const classes = {
        job: 'bg-purple-100 text-purple-600',
        default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      }
      return classes[type] || classes.default
    },

    getFilterIcon(value) {
      const icons = {
        all: 'fas fa-th-list text-[#EABF71]',
        unread: 'fas fa-envelope text-[#EABF71]',
        job: 'fas fa-briefcase text-[#EABF71]'
      }
      return icons[value]
    },

    getIcon(type) {
      const icons = {
        job: 'fas fa-briefcase',
        default: 'fas fa-bell text-[#EABF71]'
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
  }
}
</script>

<style scoped>
.max-h-\[70vh\] {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 #f3f4f6;
}

.max-h-\[70vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[70vh\]::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.dark .max-h-\[70vh\]::-webkit-scrollbar-track {
  background: #1f2937;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 20px;
}

.dark .max-h-\[70vh\]::-webkit-scrollbar-thumb {
  background-color: #9899ee;
}
</style>
