<template>
  <div class="relative">
    <TransitionRoot appear :show="modelValue" as="template">
      <Dialog as="div" class="relative z-50" @close="$emit('update:modelValue', false)">
        <TransitionChild
          as="template"
          enter="transition-opacity duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
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
            <DialogPanel class="bg-white border-t shadow-lg">
              <!-- Header -->
              <div
                class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] border-b"
              >
                <DialogTitle class="text-base font-medium text-[#EA6B6B]">
                  การแจ้งเตือน
                </DialogTitle>
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
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center ml-2"
                  >
                    <i class="fas fa-times text-xl"></i>
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
        user: 'text-[#CDE45F]',
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
