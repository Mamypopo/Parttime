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
            <HeadlessDialogPanel class="w-full h-full bg-white">
              <!-- Header -->
              <div class="sticky top-0 z-10 flex justify-between items-center p-4 border-b bg-white">
                <HeadlessDialogTitle class="text-base font-semibold">
                  การแจ้งเตือนทั้งหมด
                </HeadlessDialogTitle>
                <div class="flex items-center gap-4">
                  <button 
                    v-if="hasUnread"
                    @click="markAllAsRead" 
                    class="text-sm text-blue-500 hover:text-blue-600"
                  >
                    อ่านทั้งหมด
                  </button>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div class="sticky top-[65px] z-10 p-3 border-b bg-white overflow-x-auto">
                <div class="flex gap-2">
                  <button 
                    v-for="filter in filters" 
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-3 py-1.5 text-sm rounded-lg whitespace-nowrap"
                    :class="currentFilter === filter.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
            <div class="overflow-y-auto" style="height: calc(100vh - 120px)">
    <div
      v-for="notification in filteredNotifications"
      :key="notification.id"
      class="block border-b last:border-b-0"
      @click="handleSelect(notification)"
    >
      <div class="flex items-start gap-3 p-4 hover:bg-gray-50" 
           :class="{ 'bg-blue-50': !notification.read }">
        <!-- Icon -->
        <div :class="[
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          getTypeClass(notification.type)
        ]">
          <i :class="getTypeIcon(notification.type)"></i>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" 
            :class="notification.read ? 'text-[#3A3A49]' : 'text-[#EABF71]'">
            {{ notification.title }}
          </p>
          <p class="text-sm" 
            :class="notification.read ? 'text-gray-500' : 'text-gray-700'">
            {{ notification.message }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatTime(notification.created_at) }}
          </p>
        </div>

        <!-- Unread Indicator -->
        <div v-if="!notification.read" 
             class="w-2 h-2 rounded-full bg-[#CDE45F]">
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
  TransitionChild,
} from '@headlessui/vue'
import { useAdminStore } from '@/stores/adminStore'

export default {
  components: {
   HeadlessDialog,
    HeadlessDialogPanel, 
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
     notifications: { // รับ notifications จาก props แทน
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      currentFilter: 'all',
      filters: [
        { label: 'ทั้งหมด', value: 'all' },
        { label: 'ยังไม่อ่าน', value: 'unread' },
        { label: 'ผู้ใช้', value: 'user' },
        { label: 'ทักษะ', value: 'skill' },
        { label: 'งาน', value: 'job' }
      ],
    }
  },

  computed: {
    hasUnread() {
      return this.notifications?.some(n => !n.read) || false
    },

    filteredNotifications() {
      if (!this.notifications) return []
      if (this.currentFilter === 'all') return this.notifications
      if (this.currentFilter === 'unread') return this.notifications.filter(n => !n.read)
      return this.notifications.filter(n => n.type === this.currentFilter)
    }
  },

  methods: {
    getTypeClass(type) {
      const classes = {
        user: 'bg-blue-100 text-blue-600',
        skill: 'bg-green-100 text-green-600',
        job: 'bg-purple-100 text-purple-600'
      }
      return classes[type] || 'bg-gray-100 text-gray-600'
    },

    getTypeIcon(type) {
      const icons = {
        user: 'fas fa-user-clock',
        skill: 'fas fa-tasks',
        job: 'fas fa-briefcase'
      }
      return icons[type] || 'fas fa-bell'
    },

    formatTime(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    closeModal() {
      this.$emit('close')
    },
   handleSelect(notification) {
      this.handleNotificationClick(notification)
    },

   handleNotificationClick(notification) {
      notification.read = true
    },
    
    async markAllAsRead() {
      try {
        await this.adminStore.markAllNotificationsAsRead()
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    }
  }
}
</script>