<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" @close="closeModal" class="relative z-50">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
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
            <HeadlessDialogPanel class="w-[80%] max-w-md h-full bg-white shadow-xl relative">
              <!-- Header -->
              <div
                class="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] border-b"
              >
                <HeadlessDialogTitle class="text-base font-medium text-[#EA6B6B]">
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
                  <button @click="closeModal" class="text-[#3A3A49] hover:text-[#2b2b4d]">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div class="sticky top-[65px] z-10 p-4 border-b bg-gray-50 overflow-x-auto">
                <div class="flex gap-2">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                    :class="
                      currentFilter === filter.value
                        ? 'bg-[#babbec] text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
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
                  class="p-8 text-center text-[#3A3A49] flex flex-col items-center gap-3"
                >
                  <i class="fas fa-bell-slash text-3xl text-[#EABF71]"></i>
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>

                <div
                  v-else
                  v-for="notification in filteredNotifications"
                  :key="notification.id"
                  class="p-4 hover:bg-[#5D5FEF]/5 border-b last:border-b-0 transition-colors duration-200"
                  :class="!notification.read ? 'bg-[#5D5FEF]/10' : ''"
                  @click="handleNotificationClick(notification)"
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
      if (this.currentFilter === 'all') return this.notifications
      if (this.currentFilter === 'unread') return this.notifications.filter((n) => !n.read)
      return this.notifications.filter((n) => n.type === this.currentFilter)
    }
  },

  methods: {
    closeModal() {
      this.$emit('close')
    },

    async handleNotificationClick(notification) {
      try {
        await this.notificationStore.markAsRead(notification.id)
      } catch (error) {
        console.error('Error marking notification as read:', error)
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
        // user: 'text-[#CDE45F]',
        // skill: 'bg-green-100 text-green-600',
        job: 'bg-purple-100 text-purple-600',
        default: 'bg-gray-100 text-gray-600'
      }
      return classes[type] || classes.default
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
</style>
