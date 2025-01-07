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
            <!-- Modal Container -->
            <HeadlessDialogPanel
              class="w-full max-w-7xl rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-800"
              @click.stop
            >
              <!-- Header -->
              <div
                class="flex justify-between items-center p-6 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 border-b dark:border-gray-700"
              >
                <HeadlessDialogTitle class="text-lg font-semibold text-white">
                  การแจ้งเตือนทั้งหมด
                </HeadlessDialogTitle>
                <div class="flex items-center gap-4">
                  <button
                    v-if="hasUnread"
                    @click="markAllAsRead"
                    class="text-sm text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <span class="flex items-center gap-2">
                      <i class="fas fa-check-double"></i>
                      อ่านทั้งหมด
                    </span>
                  </button>
                  <button
                    @click="closeModal"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
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
                    :class="
                      currentFilter === filter.value
                        ? 'bg-[#babbec] dark:bg-[#6667aa] text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#5D5FEF]/5 dark:hover:bg-[#5D5FEF]/20 border dark:border-gray-600'
                    "
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
                  <i class="fas fa-bell-slash text-4xl text-[#EABF71] dark:text-[#d4a75f]"></i>
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
                      ? 'bg-[#5D5FEF]/10 dark:bg-purple-900/20'
                      : 'hover:bg-[#5D5FEF]/5 dark:hover:bg-gray-700/50'
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
                        :class="
                          !notification.read
                            ? 'text-[#CDE45F] dark:text-[#d4e474]'
                            : 'text-[#888888] dark:text-gray-400'
                        "
                      >
                        {{ notification.message }}
                      </p>
                      <p
                        class="text-sm text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-2"
                      >
                        <i class="far fa-clock"></i>
                        {{ formatTime(notification.created_at) }}
                      </p>
                    </div>

                    <!-- Unread Indicator -->
                    <div class="w-3 h-3 mt-2 ml-2">
                      <div
                        class="h-3 w-3 rounded-full transition-opacity duration-200"
                        :class="
                          !notification.read
                            ? 'bg-[#EA6B6B] dark:bg-[#ff4444] animate-ping opacity-100'
                            : 'opacity-0'
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
        { label: 'สมัครงาน', value: 'job_application' },
        { label: 'สถานะงาน', value: 'job_status_update' },
        { label: 'ยืนยันตัวตน', value: 'user_verification' },
        { label: 'ประเมินผล', value: 'evaluation' },
        { label: 'การเงิน', value: 'payment_pending' },
        { label: 'งานที่ได้รับ', value: 'job_assigned' },
        { label: 'ยกเลิก', value: 'job_application_cancelled_admin' },
        { label: 'ระบบ', value: 'system' }
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
        job_application: 'bg-gradient-to-br from-[#89CFF0] to-[#4682B4]',
        job_status_update: 'bg-gradient-to-br from-[#6FCF97] to-[#27AE60]',
        user_verification: 'bg-gradient-to-br from-[#F2C94C] to-[#F2994A]',
        evaluation: 'bg-gradient-to-br from-[#A29BFE] to-[#6C5CE7]',
        system: 'bg-gradient-to-br from-[#BDC3C7] to-[#95A5A6]',
        job_application_cancelled_admin: 'bg-gradient-to-br from-[#EB5757] to-[#C0392B]',
        payment_pending: 'bg-gradient-to-br from-[#AFF1DA] to-[#11A89D]',
        default: 'bg-gradient-to-br from-[#89CFF0] to-[#4682B4]',
        job_assigned: 'bg-gradient-to-br from-[#B794F4] to-[#553C9A]'
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
        default: 'fas fa-bell text-white',
        job_assigned: 'fas fa-clipboard-list text-white'
      }
      return icons[type] || icons.default
    },

    getFilterIcon(value) {
      const icons = {
        all: 'fas fa-th-list text-[#c779d0]',
        unread: 'fas fa-envelope text-[#feac5e]',
        job_application: 'fas fa-briefcase text-[#4bc0c8] ',
        job_status_update: 'fas fa-clock text-[#F5D547] ',
        user_verification: 'fas fa-user-check text-[#81E2C4]',
        evaluation: 'fas fa-star text-[#6FCF97] ',
        system: 'fas fa-cog text-[#95A5A6] ',
        job_application_cancelled_admin: 'fas fa-ban text-[#FF6F61] ',
        payment_pending: 'fas fa-money-bill-wave text-[#AFF1DA]',
        job_assigned: 'fas fa-clipboard-list text-[#B794F4]'
      }
      return icons[value]
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

.max-h-\[70vh\] {
  scrollbar-width: thin;
  scrollbar-color: #5d5fef #f3f4f6;
}

.dark .max-h-\[70vh\] {
  scrollbar-color: #6667aa #1f2937;
}

/* Chrome, Edge, Safari */
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
  background-color: #5d5fef;
  border-radius: 20px;
}

.dark .max-h-\[70vh\]::-webkit-scrollbar-thumb {
  background-color: #6667aa;
}
</style>
