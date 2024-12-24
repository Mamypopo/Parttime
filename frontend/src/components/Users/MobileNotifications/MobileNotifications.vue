<template>
  <div class="relative">
    <TransitionRoot appear :show="modelValue" as="template">
      <Dialog as="div" class="relative z-[900]" @close="$emit('update:modelValue', false)">
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
            <DialogPanel
              class="bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg"
              @click.stop
            >
              <!-- Header -->
              <div
                class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80"
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
                    @click="$emit('update:modelValue', false)"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="overflow-y-auto" style="max-height: calc(80vh - 130px)">
                <div v-if="notifications.length === 0" class="p-8 text-center">
                  <div
                    class="bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20 rounded-full p-6 mb-4 inline-block"
                  >
                    <i class="fas fa-bell-slash text-3xl text-[#c779d0] dark:text-[#c779d0]/70"></i>
                  </div>
                  <p class="text-gray-600 dark:text-gray-300">ไม่มีการแจ้งเตือน</p>
                </div>

                <!-- Notification Items -->
                <div
                  v-else
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="p-4 border-b dark:border-gray-700 last:border-b-0 transition-colors duration-200"
                  :class="[
                    !notification.read
                      ? 'bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20'
                      : 'hover:bg-gradient-to-r hover:from-[#feac5e]/5 hover:via-[#c779d0]/5 hover:to-[#4bc0c8]/5 dark:hover:from-[#feac5e]/10 dark:hover:via-[#c779d0]/10 dark:hover:to-[#4bc0c8]/10'
                  ]"
                  @click="handleSelect(notification)"
                >
                  <!-- เนื้อหาการแจ้งเตือน -->
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
                            ? 'text-[#CDE45F] dark:text-[#A4B83C]/90'
                            : 'text-gray-600 dark:text-gray-400'
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
                        class="h-3 w-3 rounded-full bg-gradient-to-r from-[#feac5e] to-[#c779d0] animate-pulse"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                  class="w-full text-center text-sm text-[#c779d0] hover:text-[#4bc0c8] dark:text-[#c779d0]/70 dark:hover:text-[#4bc0c8]/70 transition-colors duration-200"
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
      @close="handleCloseAllNotifications"
    />
  </div>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useUserNotificationStore } from '@/stores/userNotificationStore'
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
      notificationStore: useUserNotificationStore(),
      showAllNotifications: false
    }
  },

  computed: {
    notifications() {
      return this.notificationStore.notifications.slice(0, 5) // แสดงแค่ 5 รายการแรก
    },
    hasUnread() {
      return this.notificationStore.hasUnread
    }
  },

  mounted() {
    this.notificationStore.fetchNotifications()
  },

  methods: {
    getIconClass(type) {
      const classes = {
        job_status: 'bg-gradient-to-br from-[#6FCF97] to-[#27AE60]',
        evaluation: 'bg-gradient-to-br from-[#A29BFE] to-[#6C5CE7]',
        rejected: 'bg-gradient-to-br from-[#FF6F61] to-[#D7263D]',
        system: 'bg-gradient-to-br from-[#95A5A6] to-[#7F8C8D]',
        general: 'bg-gradient-to-br from-[#F5D547] to-[#E5A623]',
        job_application_cancelled: 'bg-gradient-to-br from-[#EB5757] to-[#C0392B]',
        payment_completed: 'bg-gradient-to-br from-[#AFF1DA] to-[#11A89D]'
      }
      return classes[type] || classes.general
    },

    getIcon(type) {
      const icons = {
        job_status: 'fas fa-briefcase text-white',
        evaluation: 'fas fa-star text-white',
        rejected: 'fas fa-times-circle text-white',
        system: 'fas fa-cog text-white',
        general: 'fas fa-bell text-white',
        job_application_cancelled: 'fas fa-ban text-white',
        payment_completed: 'fas fa-money-bill-wave text-white'
      }
      return icons[type] || icons.general
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

    closeModal() {
      this.$emit('update:modelValue', false)
    },
    openAllNotifications() {
      this.showAllNotifications = true
      this.$emit('update:modelValue', false)
    },
    handleCloseAllNotifications() {
      this.showAllNotifications = false
    }
  }
}
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c779d0 #f3f4f6;
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

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-y-auto {
    scrollbar-color: #c779d0 #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-image: linear-gradient(to bottom, #feac5e80, #c779d080, #4bc0c880);
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
