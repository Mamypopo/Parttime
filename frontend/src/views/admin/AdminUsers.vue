<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
          >
            รายการผู้ใช้ที่ผ่านการอนุมัติ
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">จัดการและดูข้อมูลผู้ใช้ทั้งหมดในระบบ</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้ทั้งหมด</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ totalUsers }}
            </div>
          </div>
          <div
            class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">ยืนยันอีเมลแล้ว</div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ verifiedUsers }}
            </div>
          </div>
          <div
            class="hidden md:block bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">ออนไลน์</div>
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ onlineUsers }}
            </div>
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
            class="bg-white dark:bg-gray-800/80 rounded-2xl shadow-lg dark:shadow-gray-950/20 hover:shadow-xl dark:hover:shadow-gray-950/30 transition-shadow duration-300"
          />
        </div>

        <!-- ปุ่ม Refresh -->
        <button
          @click="refreshData"
          class="p-3 rounded-xl bg-white dark:bg-gray-800/80 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          title="รีเฟรชข้อมูล"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid gap-4">
      <div v-for="n in 5" :key="n" class="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div class="flex space-x-2">
            <div class="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div class="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="formattedUsers.length === 0"
      class="flex flex-col items-center justify-center py-12"
    >
      <div
        class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
      >
        <i class="fas fa-users text-3xl text-[#EABF71] dark:text-[#d4a75f]"></i>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-lg">ไม่พบข้อมูลผู้ใช้</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">ลองปรับเงื่อนไขการค้นหาใหม่</p>
    </div>

    <!-- Users Table/Grid -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
    >
      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr
              class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30"
            >
              <th
                class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left"
              >
                ผู้ใช้งาน
              </th>
              <th
                class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left"
              >
                อีเมล
              </th>
              <th
                class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left"
              >
                ตำแหน่ง
              </th>
              <th
                class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left"
              >
                สถานะยืนยันอีเมล
              </th>
              <th
                class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left"
              >
                วันที่อนุมัติ
              </th>
              <th
                class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left"
              >
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in formattedUsers"
              :key="user.id"
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <!-- User Avatar -->
                  <div class="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      v-if="user.profileImage"
                      :src="adminUserStore.getProfileImage(user.profileImage)"
                      :alt="user.fullName"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center text-white font-medium"
                    >
                      {{ user.fullName.charAt(0) }}
                    </div>
                  </div>
                  <!-- User Info -->
                  <div>
                    <div class="font-medium text-gray-900 dark:text-gray-100">
                      {{ user.fullName }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-gray-100">{{ user.email }}</div>
              </td>

              <!-- Skills -->
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="skill in user.skills"
                    :key="skill"
                    class="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  >
                    {{ skill }}
                  </span>
                </div>
              </td>

              <!-- Verification Status -->
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="
                    user.isVerified
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                  "
                >
                  {{ user.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}
                </span>
              </td>

              <!-- Approval Date -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-gray-100">{{ user.approvedDate }}</div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button
                    @click="showUserDetails(user)"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white text-sm hover:opacity-90 transition-opacity"
                  >
                    <i class="fas fa-info-circle text-xs mr-1"></i>
                    <span>รายละเอียด</span>
                  </button>

                  <button
                    @click="handleViewHistory(user.id)"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white text-sm hover:opacity-90 transition-opacity"
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
      <div class="md:hidden space-y-4 p-4">
        <div
          v-for="user in formattedUsers"
          :key="user.id"
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <!-- User Info -->
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
                class="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center text-white font-medium"
              >
                {{ user.fullName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">{{ user.fullName }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                ID: {{ user.id }} : {{ user.email }}
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="space-y-2 mb-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">ทักษะ:</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="skill in user.skills"
                :key="skill"
                class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Status -->
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-500 dark:text-gray-400">สถานะยืนยันอีเมล:</span>
            <span
              class="px-2 py-1 rounded-full text-xs"
              :class="
                user.isVerified
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
              "
            >
              {{ user.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน' }}
            </span>
          </div>

          <!-- Date -->
          <div class="flex justify-between text-sm mb-4">
            <span class="text-gray-500 dark:text-gray-400">วันที่อนุมัติ:</span>
            <span class="text-gray-900 dark:text-gray-100">{{ user.approvedDate }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="showUserDetails(user)"
              class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white text-sm hover:opacity-90 transition-opacity"
            >
              <i class="fas fa-info-circle text-xs mr-1"></i>
              รายละเอียด
            </button>

            <button
              @click="handleViewHistory(user.id)"
              class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white text-sm hover:opacity-90 transition-opacity"
            >
              <i class="fas fa-history text-xs mr-1"></i>
              ประวัติ
            </button>
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
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/10 dark:to-blue-400/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 dark:hover:from-purple-400/20 dark:hover:to-blue-400/20 hover:shadow-md'
        ]"
      >
        <i class="fas fa-chevron-left text-sm"></i>
      </button>

      <div class="flex items-center space-x-2">
        <button
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4a9490] dark:to-[#6667aa] text-white font-medium min-w-[40px]"
        >
          {{ currentPage }}
        </button>

        <span class="text-gray-500 dark:text-gray-400 font-medium">จาก</span>

        <span
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-gray-600 dark:text-gray-300 font-medium min-w-[40px] text-center"
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
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/10 dark:to-blue-400/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 dark:hover:from-purple-400/20 dark:hover:to-blue-400/20 hover:shadow-md'
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
    try {
      this.adminUserStore.fetchOnlineUsers()

      this.adminUserStore.startOnlineTracking()
    } catch (error) {
      console.error('Error initializing online tracking:', error)
    }
  },

  onBeforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    if (this.adminUserStore?.stopOnlineTracking) {
      this.adminUserStore.stopOnlineTracking()
    }
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
      return this.adminUserStore.onlineUsersCount
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

<style scoped>

/* Firefox */
.max-h-\[70vh\] {
  scrollbar-width: thin;
  scrollbar-color: #5d5fef #f3f4f6;
}

.dark .max-h-\[70vh\] {
  scrollbar-color: #6667aa #1f2937;
}

/* Chrome, Edge, Safari */
.max-h-\[70vh\]::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.max-h-\[70vh\]::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
  border-radius: 3px;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb {
  @apply bg-[#5d5fef] dark:bg-[#6667aa];
  border-radius: 3px;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb:hover {
  @apply bg-[#9899ee] dark:bg-[#9899ee];
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
