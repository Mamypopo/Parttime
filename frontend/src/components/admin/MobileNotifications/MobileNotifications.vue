<template>
  <div class="relative">
    <TransitionRoot appear :show="modelValue" as="template">
      <Dialog
        as="div"
        class="relative z-50"
        @close="$emit('update:modelValue', false)"
        :initial-focus="$refs.closeButton"
      >
        <TransitionChild
          as="template"
          enter="transition-opacity duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-x-0 bottom-[80px] overflow-y-auto">
          <TransitionChild
            as="template"
            enter="transition-all duration-300 ease-out"
            enter-from="transform translate-y-full opacity-0"
            enter-to="transform translate-y-0 opacity-100"
            leave="transition-all duration-300 ease-in"
            leave-from="transform translate-y-0 opacity-100"
            leave-to="transform translate-y-full opacity-0"
          >
            <DialogPanel class="bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
              <!-- Header -->
              <div
                class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 border-b dark:border-gray-700"
              >
                <DialogTitle class="text-base font-medium text-white"> การแจ้งเตือน </DialogTitle>
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
                    tabindex="0"
                    @click="$emit('update:modelValue', false)"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="overflow-y-auto" style="max-height: calc(80vh - 130px)">
                <div
                  v-if="notifications.length === 0"
                  class="p-8 text-center text-[#3A3A49] dark:text-gray-300 flex flex-col items-center gap-3"
                >
                  <i class="fas fa-bell-slash text-3xl text-[#EABF71] dark:text-[#B38B4A]"></i>
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>

                <div
                  v-else
                  v-for="notification in notifications"
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

              <!-- Footer -->
              <div class="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                  class="w-full text-center text-sm text-[#EA6B6B] dark:text-[#FF8F8F] hover:text-[#d95151] dark:hover:text-[#ff7070] transition-colors duration-200"
                  @click="openAllNotifications"
                >
                  ดูการแจ้งเตือนทั้งหมด
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Full Screen Modal -->
    <MobileNotificationsModal
      :is-open="showAllNotifications"
      @close="showAllNotifications = false"
    />
  </div>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useNotificationStore } from '@/stores/notificationStore'
import MobileNotificationsModal from './MobileNotificationsModal.vue'

export default {
  name: 'MobileNotifications',

  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild,
    MobileNotificationsModal
  },

  props: {
    modelValue: Boolean
  },

  emits: ['update:modelValue'],

  data() {
    return {
      showAllNotifications: false
    }
  },

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },

  computed: {
    notifications() {
      return this.notificationStore.notifications.slice(0, 5)
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
        payment_pending: 'fas fa-money-bill-wave text-white',
        default: 'fas fa-bell text-white',
        job_assigned: 'fas fa-clipboard-list text-white'
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
