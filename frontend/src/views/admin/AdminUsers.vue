<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6">Users Management</h1>
    
    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- User Row -->
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img 
                    class="h-10 w-10 rounded-full" 
                    :src="user.avatar || 'default-avatar.png'" 
                    alt=""
                  >
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.name }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': user.status === 'active',
                  'bg-red-100 text-red-800': user.status === 'inactive'
                }"
              >
                {{ user.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="editUser(user)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Edit
              </button>
              <button 
                @click="deleteUser(user.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

export default {
  name: 'UsersView',

  setup() {
    const users = ref([])
    const adminStore = useAdminStore()

    onMounted(async () => {
      // โหลดข้อมูล users จาก store หรือ API
      try {
        users.value = await adminStore.getUsers()
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    })

    const editUser = (user) => {
      // จัดการแก้ไขข้อมูล user
      console.log('Edit user:', user)
    }

    const deleteUser = async (userId) => {
      // จัดการลบ user
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await adminStore.deleteUser(userId)
          users.value = users.value.filter(user => user.id !== userId)
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      }
    }

    return {
      users,
      editUser,
      deleteUser
    }
  }
}
</script>