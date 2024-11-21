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
            v-if="user.avatar"
            :src="user.avatar"
            :alt="`${user.name}'s avatar`"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <i class="fas fa-user text-gray-400"></i>
          </div>
          <div>
            <div class="font-medium">{{ user.name }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</div>
            <div class="text-xs text-gray-500">
              ลงทะเบียนเมื่อ: {{ formatDate(user.registeredAt) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!users.length" class="text-center text-gray-500 py-4">ไม่มีผู้ใช้ที่รออนุมัติ</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PendingUsersList',

  props: {
    users: {
      type: Array,
      default: () => [],
      required: true
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH')
    }
  }
}
</script>
