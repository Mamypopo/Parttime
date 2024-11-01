<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
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
            <DialogPanel class="w-full max-w-2xl bg-white rounded-xl shadow-xl">
              <!-- Header -->
              <div class="flex justify-between items-center p-4 border-b">
                <DialogTitle class="text-lg font-semibold">
                  All Notifications
                </DialogTitle>
                <div class="flex items-center gap-4">
                  <button 
                    v-if="hasUnread"
                    @click="markAllAsRead" 
                    class="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Mark all as read
                  </button>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Filters -->
              <div class="p-4 border-b">
                <div class="flex gap-2">
                  <button 
                    v-for="filter in filters" 
                    :key="filter.value"
                    @click="currentFilter = filter.value"
                    class="px-3 py-1.5 text-sm rounded-lg"
                    :class="currentFilter === filter.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="max-h-[60vh] overflow-y-auto">
                <div v-if="filteredNotifications.length === 0" class="p-8 text-center text-gray-500">
                  No notifications found
                </div>
                
                <div v-else v-for="notification in filteredNotifications" 
                  :key="notification.id"
                  class="p-4 hover:bg-gray-50 border-b last:border-b-0"
                  :class="!notification.read ? 'bg-blue-50' : ''"
                >
                  <div class="flex gap-4">
                    <div class="mt-1">
                      <span class="flex h-8 w-8 items-center justify-center rounded-full" 
                        :class="getIconClass(notification.type)"
                      >
                        <i :class="getIcon(notification.type)"></i>
                      </span>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium" :class="!notification.read ? 'text-blue-600' : ''">
                        {{ notification.title }}
                      </p>
                      <p class="text-sm text-gray-600">{{ notification.message }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                    </div>
                    <div v-if="!notification.read" class="flex-shrink-0">
                      <div class="h-2 w-2 rounded-full bg-blue-600"></div>
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
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import NotificationsModal from './NotificationsModal.vue'
export default {
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild,
    
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
        { label: 'All', value: 'all' },
        { label: 'Unread', value: 'unread' },
        { label: 'Users', value: 'user' },
        { label: 'Skills', value: 'skill' },
        { label: 'Jobs', value: 'job' }
      ],
      notifications: [
        {
          id: 1,
          type: 'user',
          title: 'New User Registration',
          message: 'John Doe has requested approval',
          time: '5 minutes ago',
          read: false
        }
        // ... เพิ่ม notifications อื่นๆ
      ]
    }
  },

  computed: {
    hasUnread() {
      return this.notifications.some(n => !n.read)
    },

    filteredNotifications() {
      if (this.currentFilter === 'all') return this.notifications
      if (this.currentFilter === 'unread') return this.notifications.filter(n => !n.read)
      return this.notifications.filter(n => n.type === this.currentFilter)
    }
  },

  methods: {
    getIconClass(type) {
      const classes = {
        user: 'bg-blue-100 text-blue-600',
        skill: 'bg-green-100 text-green-600',
        job: 'bg-purple-100 text-purple-600',
        default: 'bg-gray-100 text-gray-600'
      }
      return classes[type] || classes.default
    },

    getIcon(type) {
      const icons = {
        user: 'fas fa-user-clock',
        skill: 'fas fa-tasks',
        job: 'fas fa-briefcase',
        default: 'fas fa-bell'
      }
      return icons[type] || icons.default
    },

    closeModal() {
      this.$emit('close')
    },

    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
    }
  }
}
</script>