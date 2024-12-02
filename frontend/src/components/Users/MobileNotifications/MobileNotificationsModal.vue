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
                class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80"
              >
                <DialogTitle class="text-base font-medium text-white">
                  การแจ้งเตือนทั้งหมด
                </DialogTitle>
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
                    @click="handleClose"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div
                class="sticky top-[65px] z-10 px-3 py-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-4 py-3 text-xs whitespace-nowrap rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 flex-shrink-0"
                    :class="[
                      currentFilter === filter.value
                        ? 'bg-[#babbec] dark:bg-[#6667AA] text-white shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    ]"
                  >
                    <i :class="getFilterIcon(filter.value)" class="text-xs"></i>
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="overflow-y-auto flex-1" style="height: calc(100vh - 130px)">
                <div
                  v-if="filteredNotifications.length === 0"
                  class="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <div
                    class="bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20 rounded-full p-6 mb-4"
                  >
                    <i class="fas fa-bell-slash text-4xl text-[#c779d0] dark:text-[#c779d0]/70"></i>
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
                  :class="[
                    !notification.read
                      ? 'bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20'
                      : 'hover:bg-gradient-to-r hover:from-[#feac5e]/5 hover:via-[#c779d0]/5 hover:to-[#4bc0c8]/5 dark:hover:from-[#feac5e]/10 dark:hover:via-[#c779d0]/10 dark:hover:to-[#4bc0c8]/10'
                  ]"
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
        { label: 'ยังไม่ได้อ่าน', value: 'unread' },
        { label: 'งาน', value: 'job_status' }, // เพิ่มตัวกรองงาน
        { label: 'การประเมิน', value: 'evaluation' }, // เพิ่มตัวกรองการประเมิน
        { label: 'ระบบ', value: 'system' } // เพิ่มตัวกรองระบบ
      ]
    }
  },

  computed: {
    filteredNotifications() {
      if (this.currentFilter === 'all') return this.notificationStore.notifications
      if (this.currentFilter === 'unread') {
        return this.notificationStore.notifications.filter((n) => !n.read)
      }
      // กรองตาม type
      return this.notificationStore.notifications.filter((n) => n.type === this.currentFilter)
    },

    hasUnread() {
      return this.notificationStore.hasUnread
    }
  },

  methods: {
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
    getIcon(type) {
      const icons = {
        job_status: 'fas fa-briefcase text-white',
        evaluation: 'fas fa-star text-white',
        rejected: 'fas fa-times-circle text-white',
        system: 'fas fa-cog text-white',
        general: 'fas fa-bell text-white'
      }
      return icons[type] || icons.general
    },

    getFilterIcon(value) {
      const icons = {
        all: 'fas fa-th-list text-[#c779d0]',
        unread: 'fas fa-envelope text-[#feac5e]',
        job_status: 'fas fa-briefcase text-[#4bc0c8]',
        evaluation: 'fas fa-star text-[#c779d0]',
        system: 'fas fa-cog text-[#feac5e]'
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
  scrollbar-color: #c779d0 #f3f4f6;
  -webkit-overflow-scrolling: touch; /* สำหรับ iOS */
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c779d0;
  background-image: linear-gradient(to bottom, #feac5e, #c779d0, #4bc0c8);
  border-radius: 4px;
}

.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-y-auto {
    scrollbar-color: #c779d0 #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-image: linear-gradient(to bottom, #feac5e80, #c779d080, #4bc0c880);
  }
}

/* ซ่อน scrollbar บน mobile */
@media (max-width: 640px) {
  .overflow-y-auto {
    scrollbar-width: none;
  }

  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
}
</style>
