<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="mb-8 mt-3">
      <div class="flex justify-between items-center mb-6">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
          >
            จัดการผู้ใช้งาน
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">จัดการข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <i class="fas fa-user-plus"></i>
          เพิ่มผู้ใช้งาน
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">ค้นหา</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ชื่อ, อีเมล, เลขบัตรประชาชน"
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            @input="handleSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">สถานะ</label>
          <select
            v-model="filterStatus"
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            @change="handleSearch"
          >
            <option value="">ทั้งหมด</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="pending">รออนุมัติ</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left">ชื่อ-นามสกุล</th>
              <th class="px-4 py-3 text-left">อีเมล</th>
              <th class="px-4 py-3 text-left">เบอร์โทร</th>
              <th class="px-4 py-3 text-left">สถานะ</th>
              <th class="px-4 py-3 text-left">วันที่สร้าง</th>
              <th class="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <!-- Avatar -->
                  <div
                    class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center mr-3 text-white font-semibold text-base"
                  >
                    <img
                      v-if="user.profile_image && user.profile_image.trim() !== ''"
                      :src="`${baseURL}/uploads/profiles/${user.profile_image}`"
                      :alt="user.first_name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>
                      {{ user.first_name?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>

                  <!-- Name Info -->
                  <div>
                    <div class="text-gray-900 dark:text-white font-medium">
                      {{ user.prefix }} {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.national_id }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3">{{ user.email }}</td>
              <td class="px-4 py-3">{{ user.phone_number }}</td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'px-2 py-1 rounded-full text-xs': true,
                    'bg-green-100 text-green-800': user.approved === 'approved',
                    'bg-yellow-100 text-yellow-800': user.approved === 'pending',
                    'bg-red-100 text-red-800': user.approved === 'rejected'
                  }"
                >
                  {{ getStatusText(user.approved) }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatDate(user.created_at) }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="editUser(user)"
                  class="text-yellow-600 hover:text-yellow-800 mx-1"
                  title="แก้ไข"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 flex items-center justify-between border-t">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="prevPage" :disabled="currentPage === 1" class="btn-pagination mobile">
            ก่อนหน้า
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="btn-pagination mobile"
          >
            ถัดไป
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              แสดง
              <span class="font-medium">{{ startItem }}</span>
              ถึง
              <span class="font-medium">{{ endItem }}</span>
              จากทั้งหมด
              <span class="font-medium">{{ totalItems }}</span>
              รายการ
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="prevPage" :disabled="currentPage === 1" class="btn-pagination">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'btn-pagination',
                  currentPage === page ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="btn-pagination"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management Modal -->
    <UserManagementModal
      :isOpen="showModal"
      :isEditing="isEditing"
      :userData="selectedUser"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { debounce } from 'lodash'
import UserManagementModal from '@/components/Users/UserManagementModal.vue'
import adminService from '@/services/adminService'
import Swal from 'sweetalert2'

export default {
  name: 'UserManagement',

  components: {
    UserManagementModal
  },

  data() {
    return {
      users: [],
      currentPage: 1,
      totalItems: 0,
      itemsPerPage: 10,
      searchQuery: '',
      filterStatus: '',
      showModal: false,
      isEditing: false,
      selectedUser: null,
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage)
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
    },
    displayedPages() {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= this.totalPages; i++) {
        if (
          i === 1 ||
          i === this.totalPages ||
          (i >= this.currentPage - delta && i <= this.currentPage + delta)
        ) {
          range.push(i)
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    }
  },

  methods: {
    async fetchUsers() {
      try {
        const response = await adminService.getUsers({
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.searchQuery,
          status: this.filterStatus
        })
        this.users = response.users
        this.totalItems = response.pagination.total
      } catch (error) {
        console.error('Error fetching users:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้'
        })
      }
    },

    handleSearch: debounce(function () {
      this.currentPage = 1
      this.fetchUsers()
    }, 300),

    async handleSubmit(formData) {
      try {
        if (this.isEditing) {
          await adminService.updateUser(this.selectedUser.id, formData)
        } else {
          await adminService.createUser(formData)
        }

        await Swal.fire({
          icon: 'success',
          title: this.isEditing ? 'แก้ไขข้อมูลสำเร็จ' : 'สร้างผู้ใช้งานสำเร็จ',
          text: this.isEditing
            ? 'ข้อมูลผู้ใช้ถูกอัพเดทเรียบร้อยแล้ว'
            : 'สร้างผู้ใช้งานใหม่เรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          position: 'top-end',
          toast: true
        })

        this.closeModal()
        await this.fetchUsers()
      } catch (error) {
        console.error('Error:', error)
        let errorMessage = 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }

        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonColor: '#C5B4E3'
        })
      }
    },

    openCreateModal() {
      this.isEditing = false
      this.selectedUser = null
      this.showModal = true
    },

    editUser(user) {
      this.isEditing = true
      this.selectedUser = { ...user }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedUser = null
    },

    getStatusText(status) {
      const statusMap = {
        approved: 'อนุมัติแล้ว',
        pending: 'รออนุมัติ',
        rejected: 'ปฏิเสธ'
      }
      return statusMap[status] || status
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.fetchUsers()
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.fetchUsers()
      }
    },

    goToPage(page) {
      if (typeof page === 'number' && page !== this.currentPage) {
        this.currentPage = page
        this.fetchUsers()
      }
    }
  },

  mounted() {
    this.fetchUsers()
  }
}
</script>

<style scoped>
.btn-pagination {
  @apply relative inline-flex items-center px-4 py-2 border text-sm font-medium;
}

.btn-pagination.mobile {
  @apply relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50;
}

.btn-pagination:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
