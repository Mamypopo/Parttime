<template>
     <div class="w-full relative">
  <HeadlessMenu  v-if="!isMobile" as="div" class="w-full">
     <HeadlessMenuButton 
        class="w-full flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg"
        :class="[isCollapsed ? 'justify-center' : 'gap-3']"
      >
        <div class="w-6 text-center">
          <i class="fas fa-bell text-gray-400"></i>
        </div>
        <span v-if="!isCollapsed">Notifications</span>
        <span 
          v-if="notificationCount" 
          class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full"
          :class="[isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto']"
        >
          {{ notificationCount }}
        </span>
      </HeadlessMenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <HeadlessMenuItems class="absolute left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border z-50 origin-top-left">
        <div class="flex justify-between items-center px-4 py-2 border-b">
          <h3 class="font-medium">Notifications</h3>
          <button 
            v-if="notifications.length > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-500 hover:text-blue-600"
          >
            Mark all as read
          </button>
        </div>

        <div class="max-h-[320px] overflow-y-auto">
          <HeadlessMenuItem v-for="notification in notifications" 
            :key="notification.id" 
            v-slot="{ active }"
          >
            <div
              :class="[
                'px-4 py-3 cursor-pointer',
                active ? 'bg-gray-50' : '',
                !notification.read ? 'bg-blue-50' : ''
              ]"
              @click="handleNotificationClick(notification)"
            >
              <p class="text-sm font-medium" :class="!notification.read ? 'text-blue-600' : 'text-gray-900'">
                {{ notification.title }}
              </p>
              <p class="text-sm text-gray-500">{{ notification.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
              <!-- Unread Indicator -->
              <div v-if="!notification.read" class="absolute right-4">
                <div class="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </HeadlessMenuItem>
        </div>

        <div class="px-4 py-2 border-t">
          <button 
            class="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            @click="openModal"
          >
            View all notifications
          </button>
        </div>
      </HeadlessMenuItems>    
    </transition>
    <!-- Mobile Version -->
    <div v-if="isMobile" class="flex flex-col items-center p-2 relative">
      <button 
        class="flex flex-col items-center relative"
        @click="openModal"
      >
        <i class="fas fa-bell text-xl text-gray-400"></i>
        <span 
          v-if="notificationCount" 
          class="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
        >
          {{ notificationCount }}
        </span>
        <span class="text-xs mt-1">Alerts</span>
      </button>
    </div>

     <!-- Add Modal -->
      <NotificationsModal 
      :is-open="isModalOpen"
      @close="closeModal"
      :notifications="notifications"
      @mark-all-read="markAllAsRead"
    />
  </HeadlessMenu>
</div>
</template>

<script>
import { Menu as HeadlessMenu, MenuButton as HeadlessMenuButton, MenuItems as HeadlessMenuItems, MenuItem as HeadlessMenuItem } from '@headlessui/vue'
import NotificationsModal from './NotificationsModal.vue'

export default {
  components: {
  HeadlessMenu,
    HeadlessMenuButton,
    HeadlessMenuItems,
    HeadlessMenuItem,
    NotificationsModal
  },
props: {
    isCollapsed: {
      type: Boolean,
      default: false
    },
     isMobile: {  // เพิ่ม prop isMobile
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isModalOpen: false,
      notificationCount: 3,
      notifications: [
        {
          id: 1,
          type: 'user',
          title: 'New User Registration',
          message: 'John Doe has requested approval',
          time: '5 minutes ago',
          read: false
        },
        {
          id: 2,
          type: 'skill',
          title: 'Skill Verification Required',
          message: 'Jane Smith added new skills for review',
          time: '10 minutes ago',
          read: false
        },
        {
          id: 3,
          type: 'job',
          title: 'New Job Application',
          message: 'You have a new applicant for Frontend Developer position',
          time: '1 hour ago',
          read: false
        }
      ]
    }
  },

  methods: {
    openModal() {
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
    },

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

    handleNotificationClick(notification) {
      notification.read = true
      this.notificationCount = this.notifications.filter(n => !n.read).length
      // เพิ่มโค้ดจัดการเมื่อคลิกที่การแจ้งเตือน เช่น นำทางไปหน้าที่เกี่ยวข้อง
    },

    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this.notificationCount = 0
    },

    viewAllNotifications() {
      // นำทางไปหน้าแสดงการแจ้งเตือนทั้งหมด
      console.log('View all notifications')
      this.openModal()
    }
  }
}
</script>