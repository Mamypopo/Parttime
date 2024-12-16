<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" @close="closeModal" class="relative modal">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" @click="closeModal" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0">
        <div class="flex min-h-full">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-full"
            enter-to="opacity-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 translate-y-full"
          >
            <HeadlessDialogPanel
              class="w-[400px] max-w-md h-full bg-white dark:bg-gray-800 shadow-xl relative"
            >
              <!-- Header -->
              <div
                class="sticky top-0 modal flex justify-between items-center p-4 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 border-b dark:border-gray-700"
              >
                <HeadlessDialogTitle class="text-base font-medium text-white">
                  การแจ้งเตือนทั้งหมด
                </HeadlessDialogTitle>
                <div class="flex items-center gap-4">
                  <button
                    v-if="hasUnread"
                    @click="markAllAsRead"
                    class="text-sm text-white/80 hover:text-white transition-colors duration-200 focus:outline-none"
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
              <div class="sticky px-3 py-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="flex-shrink-0 px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                    :class="[
                      currentFilter === filter.value
                        ? 'bg-[#babbec] dark:bg-[#6667aa] text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#5D5FEF]/5 dark:hover:bg-[#5D5FEF]/20 '
                    ]"
                  >
                    <i :class="getFilterIcon(filter.value)"></i>
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="overflow-y-auto flex-1" style="height: calc(100vh - 130px)">
                <div
                  v-if="filteredNotifications.length === 0"
                  class="flex flex-col items-center justify-center h-[50vh] p-8 text-center"
                >
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-full p-6 mb-4">
                    <i class="fas fa-bell-slash text-4xl text-[#EABF71] dark:text-[#B38B4A]"></i>
                  </div>
                  <h3 class="text-lg font-medium text-[#3A3A49] dark:text-gray-200 mb-2">
                    ไม่มีการแจ้งเตือน
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    ยังไม่มีการแจ้งเตือนใหม่ในขณะนี้
                  </p>
                </div>
                <div
                  v-else
                  v-for="notification in filteredNotifications"
                  :key="notification.id"
                  class="p-4 hover:bg-[#5D5FEF]/5 dark:hover:bg-[#5D5FEF]/20 border-b dark:border-gray-700 last:border-b-0 transition-colors duration-200"
                  :class="!notification.read ? 'bg-[#5D5FEF]/10 dark:bg-[#5D5FEF]/20' : ''"
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
                        :class="
                          !notification.read
                            ? 'text-[#CDE45F] dark:text-[#A4B83C]'
                            : 'text-[#888888] dark:text-gray-400'
                        "
                      >
                        {{ notification.message }}
                      </p>
                      <p
                        class="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1"
                      >
                        <i class="far fa-clock"></i>
                        {{ formatTime(notification.created_at) }}
                      </p>
                    </div>
                    <div v-if="!notification.read" class="flex-shrink-0">
                      <div
                        class="h-3 w-3 rounded-full bg-[#EA6B6B] dark:bg-[#FF8F8F] animate-ping"
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
import { useNotificationStore } from '@/stores/notificationStore'

export default {
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
      default: false
    }
  },

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
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
      if (this.currentFilter === 'all') return this.notifications
      if (this.currentFilter === 'unread') return this.notifications.filter((n) => !n.read)
      return this.notifications.filter((n) => n.type === this.currentFilter)
    }
  },

  methods: {
    closeModal() {
      this.$emit('close')
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
    getIconClass(type) {
      const classes = {
        job_application: 'bg-gradient-to-br from-[#89CFF0] to-[#4682B4]',
        job_status_update: 'bg-gradient-to-br from-[#6FCF97] to-[#27AE60]',
        user_verification: 'bg-gradient-to-br from-[#F2C94C] to-[#F2994A]',
        evaluation: 'bg-gradient-to-br from-[#A29BFE] to-[#6C5CE7]',
        system: 'bg-gradient-to-br from-[#BDC3C7] to-[#95A5A6]',
        job_application_cancelled_admin: 'bg-gradient-to-br from-[#EB5757] to-[#C0392B]',
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
        default: 'fas fa-bell text-whitetext-white ',
        job_application_cancelled_admin: 'fas fa-ban text-white'
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
        job_application_cancelled_admin: 'fas fa-ban text-[#FF6F61] '
      }
      return icons[value]
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
    }
  }
}
</script>

<style scoped>
/* Light mode scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 #f3f4f6;
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

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-y-auto {
    scrollbar-color: #4b9592 #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #4b9592;
    border: 2px solid #1f2937;
  }
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
