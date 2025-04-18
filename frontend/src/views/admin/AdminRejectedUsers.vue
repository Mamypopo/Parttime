<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
          >
            รายการผู้ใช้ที่ไม่ผ่านการอนุมัติ
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            จัดการและดูข้อมูลผู้ใช้ที่ไม่ผ่านการอนุมัติในระบบ
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div
            class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">ไม่ผ่านการอนุมัติทั้งหมด</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ totalRejected }}
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
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
        <div class="relative group">
          <button
            @click="refreshData"
            class="p-3 rounded-xl bg-white dark:bg-gray-800/80 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <i class="fas fa-sync-alt"></i>
          </button>

          <!-- Tooltip -->
          <div
            class="absolute -bottom-8 left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap"
          >
            รีเฟรชข้อมูล
          </div>
        </div>
      </div>
    </div>

    <transition name="fade" mode="out-in">
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
          class="w-24 h-24 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center mb-4"
        >
          <i class="fas fa-users text-3xl text-[#EABF71] dark:text-[#F0C788]"></i>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          ไม่พบข้อมูลผู้ใช้ที่ไม่ผ่านการอนุมัติ
        </p>
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
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left w-[200px]"
                >
                  ผู้ใช้งาน
                </th>
                <th
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left w-[200px]"
                >
                  อีเมล
                </th>
                <th
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left w-[300px]"
                >
                  ตำแหน่ง
                </th>
                <th
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left w-[150px]"
                >
                  วันที่ไม่อนุมัติ
                </th>
                <th
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left w-[300px]"
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
                <!-- User Profile -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3 max-w-[250px]">
                    <div
                      class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg"
                    >
                      <img
                        v-if="user.profileImage"
                        :src="adminUserStore.getProfileImage(user.profileImage)"
                        :alt="user.fullName"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-white">
                        {{ user.fullName?.split(' ')[1]?.charAt(0) || '?' }}
                      </span>
                    </div>
                    <div class="min-w-0">
                      <div class="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {{ user.fullName }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>

                <!-- อีเมล -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                    {{ user.email }}
                  </div>
                </td>

                <!-- ทักษะ -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="skill in user.skills"
                      :key="skill"
                      class="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 whitespace-nowrap"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </td>

                <!-- วันที่ไม่อนุมัติ -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {{ user.rejectedDate }}
                  </div>
                </td>

                <!-- การจัดการ -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <!-- ปุ่มรายละเอียด -->
                    <button
                      @click="showUserDetails(user)"
                      class="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-[#C5B4E3] to-[#9899EE] dark:from-purple-600 dark:to-blue-600 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 flex items-center"
                    >
                      <i class="fas fa-info-circle text-xs mr-1.5"></i>
                      <span>รายละเอียด</span>
                    </button>

                    <!-- ปุ่มประวัติการทำงาน -->
                    <button
                      @click="handleViewHistory(user)"
                      class="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 dark:from-orange-600 dark:to-red-500 dark:text-white flex items-center"
                    >
                      <i class="fas fa-history text-xs mr-1.5"></i>
                      <span>ประวัติ</span>
                    </button>

                    <!-- ปุ่มอนุมัติ -->
                    <button
                      @click="handleApprove(user.id)"
                      class="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 flex items-center"
                    >
                      <i class="fas fa-check-circle text-xs mr-1.5"></i>
                      <span>อนุมัติ</span>
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
              <div
                class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg"
              >
                <img
                  v-if="user.profileImage"
                  :src="adminUserStore.getProfileImage(user.profileImage)"
                  :alt="user.fullName"
                  class="w-full h-full object-cover"
                />
                <span v-else>
                  {{ user.fullName?.split(' ')[1]?.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">
                  {{ user.fullName }}
                </div>
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

            <!-- Date -->
            <div class="flex justify-between text-sm mb-4">
              <span class="text-gray-500 dark:text-gray-400">วันที่ไม่อนุมัติ:</span>
              <span class="text-gray-900 dark:text-gray-100">{{ user.rejectedDate }}</span>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-2 gap-2">
              <!-- Row 1: รายละเอียด + อนุมัติ -->
              <button
                @click="showUserDetails(user)"
                class="group px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#C5B4E3] to-[#9899EE] dark:from-purple-600 dark:to-blue-600 text-white text-sm hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
              >
                <i
                  class="fas fa-info-circle text-xs mr-1.5 group-hover:scale-110 transition-transform"
                ></i>
                <span>รายละเอียด</span>
              </button>

              <button
                @click="handleApprove(user.id)"
                class="group px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white text-sm hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
              >
                <i
                  class="fas fa-check-circle text-xs mr-1.5 group-hover:scale-110 transition-transform"
                ></i>
                <span>อนุมัติ</span>
              </button>

              <!-- Row 2: ประวัติ (ถ้ามี) -->
              <button
                @click="handleViewHistory(user)"
                class="col-span-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 dark:from-orange-600 dark:to-red-500 dark:text-white flex items-center justify-center"
              >
                <i
                  class="fas fa-history text-xs mr-1.5 group-hover:scale-110 transition-transform"
                ></i>
                <span>ประวัติ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Pagination -->
    <div
      v-if="!loading && formattedUsers.length > 0"
      class="mt-6 flex justify-center items-center space-x-2 pb-3"
    >
      <!-- ปุ่มไปหน้าแรก -->
      <button
        @click="goToFirstPage"
        :disabled="currentPage <= 1"
        class="px-3 py-2 rounded-lg transition-all duration-300 flex items-center"
        :class="[
          currentPage <= 1
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/10 dark:to-blue-400/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 dark:hover:from-purple-400/20 dark:hover:to-blue-400/20 hover:shadow-md'
        ]"
        title="หน้าแรก"
      >
        <i class="fas fa-angle-double-left text-sm"></i>
      </button>

      <!-- ปุ่มย้อนกลับ -->
      <button
        @click="handlePrevPage"
        :disabled="currentPage <= 1"
        class="px-3 py-2 rounded-lg transition-all duration-300 flex items-center"
        :class="[
          currentPage <= 1
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/10 dark:to-blue-400/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 dark:hover:from-purple-400/20 dark:hover:to-blue-400/20 hover:shadow-md'
        ]"
        title="หน้าก่อนหน้า"
      >
        <i class="fas fa-chevron-left text-sm"></i>
      </button>

      <!-- ตัวเลขหน้า -->
      <div class="flex items-center space-x-1">
        <!-- แสดงหน้าแรกเสมอถ้าไม่ได้อยู่ที่หน้าแรก และมีหน้ามากกว่า 5 หน้า -->
        <button
          v-if="currentPage > 3 && totalPages > 5"
          @click="goToPage(1)"
          class="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-gray-600 dark:text-gray-300 font-medium min-w-[36px] text-center hover:shadow-sm"
        >
          1
        </button>

        <!-- แสดงจุดไข่ปลาถ้าหน้าปัจจุบันห่างจากหน้าแรกมากกว่า 3 หน้า -->
        <span
          v-if="currentPage > 4 && totalPages > 6"
          class="px-2 text-gray-500 dark:text-gray-400"
        >
          ...
        </span>

        <!-- แสดงหน้าก่อนหน้าปัจจุบัน 1 หน้า (ถ้ามี) -->
        <button
          v-if="currentPage > 1"
          @click="goToPage(currentPage - 1)"
          class="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-gray-600 dark:text-gray-300 font-medium min-w-[36px] text-center hover:shadow-sm"
        >
          {{ currentPage - 1 }}
        </button>

        <!-- หน้าปัจจุบัน -->
        <button
          class="px-3 py-1 rounded-lg bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4a9490] dark:to-[#6667aa] text-white font-medium min-w-[36px] text-center"
        >
          {{ currentPage }}
        </button>

        <!-- แสดงหน้าถัดจากปัจจุบัน 1 หน้า (ถ้ามี) -->
        <button
          v-if="currentPage < totalPages"
          @click="goToPage(currentPage + 1)"
          class="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-gray-600 dark:text-gray-300 font-medium min-w-[36px] text-center hover:shadow-sm"
        >
          {{ currentPage + 1 }}
        </button>

        <!-- แสดงจุดไข่ปลาถ้าหน้าปัจจุบันห่างจากหน้าสุดท้ายมากกว่า 3 หน้า -->
        <span
          v-if="currentPage < totalPages - 3 && totalPages > 6"
          class="px-2 text-gray-500 dark:text-gray-400"
        >
          ...
        </span>

        <!-- แสดงหน้าสุดท้ายเสมอถ้าไม่ได้อยู่ที่หน้าสุดท้าย และมีหน้ามากกว่า 5 หน้า -->
        <button
          v-if="currentPage < totalPages - 2 && totalPages > 5"
          @click="goToPage(totalPages)"
          class="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-gray-600 dark:text-gray-300 font-medium min-w-[36px] text-center hover:shadow-sm"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- ปุ่มถัดไป -->
      <button
        @click="handleNextPage"
        :disabled="currentPage >= totalPages"
        class="px-3 py-2 rounded-lg transition-all duration-300 flex items-center"
        :class="[
          currentPage >= totalPages
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/10 dark:to-blue-400/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 dark:hover:from-purple-400/20 dark:hover:to-blue-400/20 hover:shadow-md'
        ]"
        title="หน้าถัดไป"
      >
        <i class="fas fa-chevron-right text-sm"></i>
      </button>

      <!-- ปุ่มไปหน้าสุดท้าย -->
      <button
        @click="goToLastPage"
        :disabled="currentPage >= totalPages"
        class="px-3 py-2 rounded-lg transition-all duration-300 flex items-center"
        :class="[
          currentPage >= totalPages
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/10 dark:to-blue-400/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-blue-500/20 dark:hover:from-purple-400/20 dark:hover:to-blue-400/20 hover:shadow-md'
        ]"
        title="หน้าสุดท้าย"
      >
        <i class="fas fa-angle-double-right text-sm"></i>
      </button>
    </div>

    <!-- User Details Modal -->
    <UserDetailsModal
      v-if="showModal"
      :is-open="showModal"
      :user="selectedUser"
      @close="closeModal"
    />
    <JobHistoryModal :show="showHistoryModal" :user="selectedUser" @close="closeHistoryModal" />
  </div>
</template>
<script>
import { useAdminUserStore } from '@/stores/adminUserStore'
import { useUserHistoryStore } from '@/stores/userHistoryStore'

import SearchUsersBar from '@/components/Search/SearchUsersBar.vue'
import UserDetailsModal from '@/components/Users/UserDetailsModal.vue'
import JobHistoryModal from '@/components/Users/JobHistoryModal.vue'

import Swal from 'sweetalert2'

export default {
  name: 'AdminRejectedUsers',

  components: {
    SearchUsersBar,
    UserDetailsModal,
    JobHistoryModal
  },

  data() {
    return {
      adminUserStore: useAdminUserStore(),
      userHistoryStore: useUserHistoryStore(),
      showModal: false,
      selectedUser: null,
      showHistoryModal: false
    }
  },

  computed: {
    // Store Data
    loading() {
      return this.adminUserStore.loading
    },
    searchFilters() {
      return this.adminUserStore.searchFilters
    },
    formattedUsers() {
      return this.adminUserStore.rejectedUsers
    },

    // User Stats
    totalRejected() {
      return this.adminUserStore.rejectedPagination.totalItems || 0
    },

    // Pagination
    currentPage: {
      get() {
        return this.adminUserStore.rejectedPagination.currentPage
      },
      set(value) {
        this.adminUserStore.rejectedPagination.currentPage = value
      }
    },
    totalPages() {
      return this.adminUserStore.rejectedTotalPages
    }
  },
  created() {
    this.initializeData()
  },

  methods: {
    async initializeData() {
      try {
        await this.adminUserStore.fetchRejectedUsers({
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
    async handleApprove(userId) {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการอนุมัติใหม่',
          text: 'คุณต้องการอนุมัติผู้ใช้นี้ใหม่ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#10B981'
        })
        if (result.isConfirmed) {
          await this.adminUserStore.approveUser(userId)
          await this.refreshData()
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'อนุมัติผู้ใช้เรียบร้อยแล้ว',
            showConfirmButton: false,
            timer: 1500
          })
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'ไม่สามารถดำเนินการได้'
        Swal.fire({
          icon: 'warning',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonText: 'ตกลง'
        })
      }
    },

    // Search & Filter
    handleSearch(filters) {
      this.adminUserStore.setSearchFilters(filters)
      this.adminUserStore.fetchRejectedUsers()
    },

    handleClear() {
      this.adminUserStore.clearSearchFilters()
      this.adminUserStore.fetchRejectedUsers()
    },

    handlePrevPage() {
      if (this.currentPage > 1) {
        this.adminUserStore.setRejectedPage(this.currentPage - 1)
        this.adminUserStore.fetchRejectedUsers()
      }
    },

    handleNextPage() {
      if (this.currentPage < this.totalPages) {
        this.adminUserStore.setRejectedPage(this.currentPage + 1)
        this.adminUserStore.fetchRejectedUsers()
      }
    },

    // Modal Management
    showUserDetails(user) {
      this.selectedUser = JSON.parse(JSON.stringify(user))
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedUser = null
    },

    async handleViewHistory(user) {
      try {
        this.selectedUser = user
        await this.userHistoryStore.fetchUserHistory(user.id)

        if (!this.userHistoryStore.history?.length) {
          await Swal.fire({
            icon: 'info',
            title: 'ไม่พบประวัติการทำงาน',
            text: `${user?.first_name || ''} ${user?.last_name || ''} ยังไม่มีประวัติการทำงานในระบบ`,
            showConfirmButton: true,
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#6ED7D1',
            background: document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF',
            customClass: {
              title: 'text-xl font-medium text-gray-800 dark:text-gray-100',
              htmlContainer: 'text-base text-gray-600 dark:text-gray-300',
              popup: 'dark:bg-gray-800 dark:text-gray-100 rounded-xl',
              confirmButton: 'rounded-lg text-sm font-medium px-5 py-2.5'
            }
          })
          return
        }

        this.showHistoryModal = true
      } catch (error) {
        console.error('Error fetching history:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลประวัติการทำงานได้ กรุณาลองใหม่อีกครั้ง',
          showConfirmButton: true,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#EF4444',
          background: document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF',
          customClass: {
            title: 'text-xl font-medium text-gray-800 dark:text-gray-100',
            htmlContainer: 'text-base text-gray-600 dark:text-gray-300',
            popup: 'dark:bg-gray-800 dark:text-gray-100 rounded-xl',
            confirmButton: 'rounded-lg text-sm font-medium px-5 py-2.5'
          }
        })
      }
    },
    closeHistoryModal() {
      this.showHistoryModal = false
      this.selectedUser = null
      this.userHistoryStore.clearHistory()
    },

    // Data Management
    formatDate(dateString) {
      return this.adminUserStore.formatDate(dateString)
    },
    async refreshData() {
      try {
        this.handleClear()
        await this.adminUserStore.fetchRejectedUsers()
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
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.adminUserStore.setRejectedPage(page)
        this.adminUserStore.fetchRejectedUsers()
      }
    },

    goToFirstPage() {
      if (this.currentPage > 1) {
        this.currentPage = 1
        this.adminUserStore.fetchRejectedUsers()
      }
    },

    goToLastPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage = this.totalPages
        this.adminUserStore.fetchRejectedUsers()
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
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ถ้าต้องการให้แสดง tooltip เมื่อ hover ข้อความที่ถูกตัด */
[class*='truncate']:hover {
  overflow: visible;
  white-space: normal;
  word-break: break-word;
  position: relative;
  z-index: 1;
}

.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
