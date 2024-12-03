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
                class="flex justify-between items-center p-6 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80"
              >
                <HeadlessDialogTitle class="text-lg font-semibold text-[#3A3A49] dark:text-white">
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
                    :class="[
                      currentFilter === filter.value
                        ? 'bg-[#babbec] dark:bg-[#6667AA] text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#5D5FEF]/5 dark:hover:bg-[#5D5FEF]/20'
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
                      ? 'bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20'
                      : 'hover:bg-gradient-to-r hover:from-[#feac5e]/5 hover:via-[#c779d0]/5 hover:to-[#4bc0c8]/5'
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
                            ? 'text-[#CDE45F] dark:text-[#A4B83C]'
                            : 'text-[#94A3B8] dark:text-[#64748B]'
                        "
                      >
                        {{ notification.message }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatTime(notification.created_at) }}
                      </p>
                    </div>

                    <!-- Unread Indicator -->
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
        { label: 'งาน', value: 'job_status' },
        { label: 'การประเมิน', value: 'evaluation' },
        { label: 'ระบบ', value: 'system' }
      ]
    }
  },

  computed: {
    filteredNotifications() {
      if (this.currentFilter === 'all') return this.notificationStore.notifications
      if (this.currentFilter === 'unread') {
        return this.notificationStore.notifications.filter((n) => !n.read)
      }
      return this.notificationStore.getNotificationsByType(this.currentFilter)
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
        job_status: 'bg-gradient-to-br from-[#6ED7D1] to-[#9899ee]', // สถานะงาน
        evaluation: 'bg-gradient-to-br from-[#CDE45F] to-[#A4B83C]', // ผลการประเมิน
        rejected: 'bg-gradient-to-br from-[#EA6B6B] to-[#FF8F8F]', // ไม่ผ่านการประเมิน
        system: 'bg-gradient-to-br from-[#9899ee] to-[#6667AA]', // ระบบ
        general: 'bg-[#EABF71] dark:bg-[#C69B4F]' // ทั่วไป
      }
      return classes[type] || classes.general
    },

    getFilterIcon(value) {
      const icons = {
        all: 'fas fa-th-list text-[#c779d0]',
        unread: 'fas fa-envelope text-[#feac5e]',
        job_status: 'fas fa-briefcase text-[#4bc0c8]',
        evaluation: 'fas fa-star text-[#c779d0]',
        system: 'fas fa-cog text-[#feac5e]'
      }
      return icons[value] || icons.all
    },

    getIcon(type) {
      const icons = {
        job_status: 'fas fa-briefcase',
        evaluation: 'fas fa-star',
        rejected: 'fas fa-times-circle',
        system: 'fas fa-cog',
        general: 'fas fa-bell'
      }
      return `${icons[type] || icons.general} text-white`
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
