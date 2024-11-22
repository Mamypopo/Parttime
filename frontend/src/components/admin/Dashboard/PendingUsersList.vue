<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">ผู้ใช้ที่รออนุมัติล่าสุด</h3>
      <router-link
        to="/admin/pending-users"
        class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
      >
        ดูทั้งหมด <i class="fas fa-arrow-right ml-1"></i>
      </router-link>
    </div>

    <div class="space-y-3">
      <div
        v-for="user in users"
        :key="user.id"
        class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="user.profileImage"
            :src="getProfileImage(user.profileImage)"
            :alt="`${user.name}'s avatar`"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <i class="fas fa-user text-gray-400"></i>
          </div>
          <div>
            <div class="font-medium">{{ user.fullName }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</div>
            <div class="text-xs text-gray-500">ลงทะเบียนเมื่อ: {{ user.registeredDate }}</div>
          </div>
        </div>
      </div>

      <div v-if="!users.length" class="text-center text-gray-500 py-4">ไม่มีผู้ใช้ที่รออนุมัติ</div>
    </div>
  </div>
</template>

<script>
import { useAdminUserStore } from '@/stores/adminUserStore'

export default {
  name: 'PendingUsersList',
  data() {
    return {
      adminUserStore: useAdminUserStore()
    }
  },

  computed: {
    users() {
      return this.adminUserStore.pendingUsers.slice(0, 5) // แสดงแค่ 5 คนล่าสุด
    }
  },

  async created() {
    try {
      await this.adminUserStore.fetchPendingUsers()
    } catch (error) {
      console.error('Error loading pending users:', error)
    }
  },

  methods: {
    formatDate(date) {
      return this.adminUserStore.formatDate(date)
    },
    getProfileImage(image) {
      return this.adminUserStore.getProfileImage(image)
    }
  }
}
</script>
