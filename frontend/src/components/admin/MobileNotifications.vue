<!-- src/components/admin/notifications/MobileNotifications.vue -->
<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-y-full"
    enter-to-class="transform translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-y-0"
    leave-to-class="transform translate-y-full"
  >
    <div 
      v-show="modelValue" 
      class="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-sm font-semibold text-[#EA6B6B]">การแจ้งเตือน</h3>
        <div class="flex items-center gap-3">
          <button 
            class="text-sm text-[#6ED7D1] hover:text-[#4bb3af]"
            @click="markAllAsRead"
          >
            อ่านทั้งหมด
          </button>
          <button @click="$emit('update:modelValue', false)" class="text-[#3A3A49] hover:text-[#2b2b4d]">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-[60vh] overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-[#3A3A49]">
          ไม่มีการแจ้งเตือนใหม่
        </div>
        
        <template v-else>
      <div
        v-for="notification in notifications"
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
            <p class="text-sm font-medium text-gray-900 mb-0.5">
              {{ notification.title }}
            </p>
            <p class="text-sm text-gray-600 line-clamp-2">
              {{ notification.message }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatTime(notification.created_at) }}
            </p>
          </div>

          <!-- Unread Indicator -->
          <div v-if="!notification.read" 
               class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0">
          </div>
        </div>
      </div>
    </template>
      </div>

      <!-- Footer -->
      <div class="p-3 border-t bg-gray-50">
        <button 
          to="/admin/notifications"
          class="block text-center text-sm text-gray-500 hover:text-gray-600"
          @click="openAllNotifications"
        >
          ดูการแจ้งเตือนทั้งหมด
        </button>

    <MobileNotificationsModal
    :is-open="showAllNotifications"
    :notifications="notifications"
    @close="showAllNotifications = false"
  />
      </div>
    </div>
  </Transition>
</template>


<script>
import { useAdminStore } from '@/stores/adminStore';
import MobileNotificationsModal from '@/components/admin/MobileNotificationsModal.vue'

export default {
  name: 'MobileNotifications',
  components: {
    MobileNotificationsModal
  },
  
props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],

  data() {
    return {
      adminStore: useAdminStore(),
        showAllNotifications: false,
        notifications: [  // จัดการข้อมูลเองในนี้
        {
          id: 1,
          type: 'user',
          title: 'มีผู้ใช้งานลงทะเบียนใหม่',
          message: 'คุณ John Doe ขอการอนุมัติ',
          created_at: new Date(),
          read: false,
         
        },
        {
          id: 2,
          type: 'skill',
          title: 'ต้องการการตรวจสอบทักษะ',
          message: 'คุณ Jane Smith เพิ่มทักษะใหม่เพื่อรอการตรวจสอบ',
          created_at: new Date(Date.now() - 10 * 60000),
          read: false,
        
        },
        {
          id: 3,
          type: 'job',
          title: 'มีการสมัครงานใหม่',
          message: 'มีผู้สมัครตำแหน่ง Frontend Developer',
          created_at: new Date(Date.now() - 60 * 60000),
          read: false,
        
        }
      ]
    }
  },

  methods: {
    getTypeClass(type) {
      const classes = {
        success: 'bg-green-100 text-green-600',
        warning: 'bg-yellow-100 text-yellow-600',
        error: 'bg-red-100 text-red-600',
        info: 'bg-blue-100 text-blue-600',
      }
      return classes[type] || classes.info
    },

    getTypeIcon(type) {
      const icons = {
        success: 'fas fa-check',
        warning: 'fas fa-exclamation',
        error: 'fas fa-times',
        info: 'fas fa-info',
      }
      return icons[type] || icons.info
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
handleNotificationClick(notification) {
      notification.read = true
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
    },

 handleSelect(notification) {
      this.handleNotificationClick(notification)
      // this.$emit('update:modelValue', false) // ปิด dropdown เมื่อคลิก
    },
   openAllNotifications() {
      this.showAllNotifications = true
      this.$emit('update:modelValue', false)
    }
  }
}
</script>