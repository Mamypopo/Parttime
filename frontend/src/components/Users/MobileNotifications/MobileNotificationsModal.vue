<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-[950]">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" @click="handleClose" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 modal">
        <div class="flex min-h-full">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-full"
            enter-to="opacity-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 translate-y-full"
          >
            <DialogPanel
              class="w-[300px] max-w-md h-screen bg-white dark:bg-gray-800 shadow-xl relative"
              tabindex="0"
            >
              <!-- Header -->
              <div
                class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4B9592] dark:to-[#6667AA]"
              >
                <DialogTitle class="text-base font-medium text-[#EA6B6B] dark:text-[#FF8F8F]">
                  การแจ้งเตือนทั้งหมด
                </DialogTitle>
                <div class="flex items-center gap-4">
                  <button
                    v-if="hasUnread"
                    @click="markAllAsRead"
                    class="text-sm text-[#6ED7D1] dark:text-[#4B9592] hover:text-[#4bb3af] dark:hover:text-[#3D7A78] transition-colors duration-200"
                  >
                    <span class="flex items-center gap-2">
                      <i class="fas fa-check-double"></i>
                      อ่านทั้งหมด
                    </span>
                  </button>
                  <button
                    @click="handleClose"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div
                class="sticky top-[65px] z-10 px-3 py-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div class="flex gap-2">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-4 py-1.5 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-1.5"
                    :class="
                      currentFilter === filter.value
                        ? 'bg-[#babbec] dark:bg-[#6667AA] text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    "
                  >
                    <i :class="getFilterIcon(filter.value)"></i>
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="overflow-y-auto" style="height: calc(100vh - 130px)">
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
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useUserNotificationStore } from '@/stores/userNotificationStore'
import { FocusTrap } from '@headlessui/vue'
export default {
  name: 'MobileNotificationsModal',

  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild,
    FocusTrap
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close'],

  data() {
    return {
      notificationStore: useUserNotificationStore(),
      currentFilter: 'all',
      filters: [
        { label: 'ทั้งหมด', value: 'all' },
        { label: 'ยังไม่ได้อ่าน', value: 'unread' }
      ]
    }
  },

  computed: {
    filteredNotifications() {
      if (this.currentFilter === 'all') return this.notificationStore.notifications
      if (this.currentFilter === 'unread') {
        return this.notificationStore.notifications.filter((n) => !n.read)
      }
      return this.notificationStore.notifications
    },

    hasUnread() {
      return this.notificationStore.hasUnread
    }
  },

  methods: {
    getIconClass(type) {
      const classes = {
        job: 'bg-purple-100 text-purple-600',
        default: 'bg-gray-100 text-gray-600'
      }
      return classes[type] || classes.default
    },

    getIcon(type) {
      const icons = {
        job: 'fas fa-briefcase',
        default: 'fas fa-bell text-[#EABF71]'
      }
      return icons[type] || icons.default
    },

    getFilterIcon(value) {
      const icons = {
        all: 'fas fa-th-list text-[#81E2C4]',
        unread: 'fas fa-envelope text-[#81E2C4]'
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
    handleClose() {
      this.$emit('close')
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
</style>
