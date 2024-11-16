<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
          >
            รายการผู้ใช้ที่ผ่านการอนุมัติ
          </h2>
          <p class="text-gray-500 mt-1">จัดการและดูข้อมูลผู้ใช้ทั้งหมดในระบบ</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl shadow-sm">
            <div class="text-sm text-gray-500">ผู้ใช้ทั้งหมด</div>
            <div class="text-2xl font-bold text-purple-600">{{ totalUsers }}</div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl shadow-sm">
            <div class="text-sm text-gray-500">ยืนยันอีเมลแล้ว</div>
            <div class="text-2xl font-bold text-green-600">{{ verifiedUsers }}</div>
          </div>
          <div
            class="hidden md:block bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl shadow-sm"
          >
            <div class="text-sm text-gray-500">ออนไลน์</div>
            <div class="text-2xl font-bold text-yellow-600">{{ onlineUsers }}</div>
          </div>
        </div>
      </div>

      <!-- Search Bar with Animation -->
      <div class="mt-6 flex items-center gap-2">
        <div class="flex-1 transform transition-all duration-300 hover:scale-[1.01]">
          <SearchUsersBar
            :filters="searchFilters"
            @search="handleSearch"
            @clear="handleClear"
            class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        </div>

        <!-- ปุ่ม Refresh -->
        <button
          @click="refreshData"
          class="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-purple-600"
          title="รีเฟรชข้อมูล"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid gap-4">
      <div v-for="n in 5" :key="n" class="animate-pulse bg-white p-4 rounded-lg">
        <div class="flex items-center space-x-3">
          <!-- Avatar skeleton -->
          <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          <!-- Text skeleton -->
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <!-- Button skeleton -->
          <div class="flex space-x-2">
            <div class="w-20 h-8 bg-gray-200 rounded-lg"></div>
            <div class="w-20 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="formattedUsers.length === 0"
      class="flex flex-col items-center justify-center py-12"
    >
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fas fa-users text-3xl text-[#EABF71]"></i>
      </div>
      <p class="text-gray-500 text-lg">ไม่พบข้อมูลผู้ใช้</p>
      <p class="text-gray-400 text-sm mt-2">ลองปรับเงื่อนไขการค้นหาใหม่</p>
    </div>

    <!-- Users Table/Grid -->
    <div v-else class="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gradient-to-r from-purple-50 to-blue-50">
              <th class="px-6 py-4 text-sm font-semibold text-gray-600 text-left">ผู้ใช้งาน</th>
              <th class="px-6 py-4 text-sm font-semibold text-gray-600 text-left">อีเมล</th>
              <th class="px-6 py-4 text-sm font-semibold text-gray-600 text-left">ตำแหน่ง</th>
              <th class="px-6 py-4 text-sm font-semibold text-gray-600 text-left">
                สถานะยืนยันอีเมล
              </th>
              <th class="px-6 py-4 text-sm font-semibold text-gray-600 text-left">วันที่อนุมัติ</th>
              <th class="px-6 py-4 text-sm font-semibold text-gray-600 text-left">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in formattedUsers"
              :key="user.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
            >
              <!-- User cells with hover effects -->
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      v-if="user.profileImage"
                      :src="adminUserStore.getProfileImage(user.profileImage)"
                      :alt="user.fullName"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-medium"
                    >
                      {{ user.fullName.charAt(0) }}
                    </div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ user.fullName }}</div>
                    <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>

              <!-- อีเมล -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <!-- ทักษะ -->

              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="skill in user.skills"
                    :key="skill"
                    class="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600"
                  >
                    {{ skill }}
                  </span>
                </div>
              </td>

              <!-- สถานะยืนยันอีเมล -->
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="
                    user.isVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  "
                >
                  {{ user.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}
                </span>
              </td>

              <!-- วันที่สมัคร -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ user.approvedDate }}</div>
              </td>

              <!--  action -->
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button
                    @click="showUserDetails(user)"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm hover:opacity-90 transition-opacity"
                  >
                    <i class="fas fa-info-circle text-xs mr-1"></i>
                    <span>รายละเอียด</span>
                  </button>

                  <!-- ปุ่มประวัติ -->
                  <button
                    @click="handleViewHistory(user.id)"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm hover:opacity-90 transition-opacity"
                  >
                    <i class="fas fa-history text-xs mr-1"></i>
                    <span>ประวัติ</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Grid View -->
      <div class="md:hidden">
        <div v-if="loading" class="flex justify-center py-4">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="formattedUsers.length === 0" class="text-center py-4">
          <p class="text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="user in formattedUsers"
            :key="user.id"
            class="bg-white p-4 rounded-lg shadow-sm"
          >
            <!-- User Info -->
            <div class="md:hidden">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    v-if="user.profileImage"
                    :src="adminUserStore.getProfileImage(user.profileImage)"
                    :alt="user.fullName"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-medium"
                  >
                    {{ user.fullName.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ user.fullName }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </div>

            <!-- Mobile View User Details -->
            <div class="space-y-2 mb-3">
              <!-- ข้อมูลพื้นฐาน -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">อีเมล:</span>
                <span class="font-medium">{{ user.email }}</span>
              </div>

              <!-- ทักษะ -->
              <div class="space-y-2">
                <p class="text-sm text-gray-500">ทักษะ:</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="skill in user.skills"
                    :key="skill"
                    class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>

              <!-- สถานะยืนยันอีเมล -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">สถานะยืนยันอีเมล:</span>
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="
                    user.isVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  "
                >
                  {{ user.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}
                </span>
              </div>

              <!-- วันที่สมัคร -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">วันที่สมัคร:</span>
                <span>{{ formatDate(user.approvedDate) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                @click="showUserDetails(user)"
                class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm hover:opacity-90 transition-opacity"
              >
                <i class="fas fa-info-circle text-xs mr-1"></i>
                รายละเอียด
              </button>

              <button
                @click="handleViewHistory(user.id)"
                class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm hover:opacity-90 transition-opacity"
              >
                <i class="fas fa-history text-xs mr-1"></i>
                ประวัติ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && formattedUsers.length > 0"
      class="mt-6 flex justify-center items-center space-x-3 pb-3"
    >
      <button
        @click="handlePrevPage"
        :disabled="currentPage <= 1"
        class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
        :class="[
          currentPage <= 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 hover:from-purple-500/20 hover:to-blue-500/20 hover:shadow-md'
        ]"
      >
        <i class="fas fa-chevron-left text-sm"></i>
      </button>

      <div class="flex items-center space-x-2">
        <button
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] text-white font-medium min-w-[40px]"
        >
          {{ currentPage }}
        </button>

        <span class="text-gray-500 font-medium">จาก</span>

        <span
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 text-gray-600 font-medium min-w-[40px] text-center"
        >
          {{ totalPages }}
        </span>
      </div>

      <button
        @click="handleNextPage"
        :disabled="currentPage >= totalPages"
        class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
        :class="[
          currentPage >= totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 hover:from-purple-500/20 hover:to-blue-500/20 hover:shadow-md'
        ]"
      >
        <i class="fas fa-chevron-right text-sm"></i>
      </button>
    </div>

    <!-- Modals -->
    <TransitionRoot appear :show="showModal" as="template">
      <UserDetailsModal :is-open="showModal" :user="selectedUser" @close="closeModal" />
    </TransitionRoot>

    <TransitionRoot appear :show="showHistoryModal" as="template">
      <JobHistoryModal
        :show="showHistoryModal"
        :user="selectedUser"
        @close="closeHistoryModal"
        :jobs="userHistoryStore.jobHistory.data"
        :total-jobs="userHistoryStore.jobHistory.totalJobs"
      />
    </TransitionRoot>
  </div>
</template>
<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import SearchUsersBar from '@/components/Search/SearchUsersBar.vue'
import UserDetailsModal from '@/components/Users/UserDetailsModal.vue'
import JobHistoryModal from '@/components/Users/JobHistoryModal.vue'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useUserHistoryStore } from '@/stores/userHistoryStore'
import { useAdminUserStore } from '@/stores/adminUserStore'
import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  DialogTitle as HeadlessDialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'AdminAllUsers',
  components: {
    SearchUsersBar,
    UserDetailsModal,
    JobHistoryModal,
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild,
    LoadingSpinner
  },
  data() {
    const adminUserStore = useAdminUserStore()
    const userHistoryStore = useUserHistoryStore()
    const sidebarStore = useSidebarStore()

    return {
      baseURL: import.meta.env.VITE_API_URL,
      showHistoryModal: false,
      showModal: false,
      selectedUser: null,
      adminUserStore,
      userHistoryStore,
      sidebarStore
    }
  },

  created() {
    this.initializeData()
  },

  mounted() {
    if (window.innerWidth < 768) {
      window.addEventListener('scroll', this.handleScroll)
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },

  computed: {
    // Pagination
    currentPage: {
      get() {
        return this.adminUserStore.pagination.currentPage
      },
      set(value) {
        this.adminUserStore.pagination.currentPage = value
      }
    },
    totalPages() {
      return this.adminUserStore.totalPages
    },

    // Store Data
    loading() {
      return this.adminUserStore.loading
    },

    searchFilters() {
      return this.adminUserStore.searchFilters
    },
    formattedUsers() {
      return this.adminUserStore.users
    },
    totalUsers() {
      return this.adminUserStore.pagination.totalItems
    },

    // User Stats
    verifiedUsers() {
      return this.formattedUsers.filter((user) => user.isVerified).length
    },
    onlineUsers() {
      return Math.floor(this.totalUsers * 0.3)
    },
    isSidebarCollapsed() {
      return this.sidebarStore.isCollapsed
    }
  },
  methods: {
    async initializeData() {
      try {
        await this.adminUserStore.fetchUsers({
          page: this.currentPage,
          limit: this.perPage
        })
      } catch (error) {
        console.error('Error fetching rejected users:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },
    // User Actions
    async handleViewHistory(userId) {
      try {
        this.selectedUser = this.formattedUsers.find((u) => u.id === userId)
        await this.userHistoryStore.fetchUserHistory(userId)
        this.showHistoryModal = true
      } catch (error) {
        Swal.fire({
          title: 'ไม่พบประวัติการทำงาน',
          text: 'ผู้ใช้งานนี้ยังไม่มีประวัติการทำงาน',
          icon: 'info',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6366f1'
        })
      }
    },
    // Modal Management
    closeHistoryModal() {
      this.showHistoryModal = false
      this.selectedUser = null
      this.userHistoryStore.clearHistory()
    },
    async showUserDetails(user) {
      this.selectedUser = { ...user }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },
    // Search & Filter
    handleSearch(filters) {
      this.adminUserStore.setSearchFilters(filters)
      this.adminUserStore.fetchUsers()
    },

    handleClear() {
      this.adminUserStore.clearSearchFilters()
      this.adminUserStore.fetchUsers()
    },
    // Pagination
    handlePrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.adminUserStore.fetchUsers()
        window.scrollTo(0, 0)
      }
    },

    handleNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.adminUserStore.fetchUsers()
        window.scrollTo(0, 0)
      }
    },
    // Data Management
    formatDate(dateString) {
      return this.adminUserStore.formatDate(dateString)
    },

    async refreshData() {
      try {
        this.handleClear()
        await this.adminUserStore.fetchUsers()
        Swal.fire({
          icon: 'success',
          title: 'รีเฟรชข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถรีเฟรชข้อมูลได้',
          confirmButtonText: 'ตกลง'
        })
      }
    }
  }
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c5b4e3;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9899ee;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
