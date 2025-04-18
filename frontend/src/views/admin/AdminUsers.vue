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
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div
            class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้ทั้งหมด</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ totalUsers }}
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar with Animation -->
      <div class="mt-6 flex items-center gap-2">
        <div class="flex-1 transform transition-all duration-300 hover:scale-[1.01]">
          <SearchAdminUsersBar
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
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left whitespace-nowrap"
                >
                  จำนวนงาน
                </th>
                <th
                  class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-left whitespace-nowrap"
                >
                  คะแนนเฉลี่ย
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

                    <!-- User Info -->
                    <div>
                      <div class="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
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
                  <div class="space-y-2 mb-3">
                    <div class="flex flex-wrap gap-1.5">
                      <!-- แสดงเพียง 5 ตำแหน่งแรก -->
                      <span
                        v-for="(skill, index) in user.skills?.slice(0, 5) || []"
                        :key="skill + index"
                        class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                      >
                        {{ skill }}
                      </span>

                      <!-- ถ้ามีมากกว่า 5 ตำแหน่ง แสดงจำนวนที่เหลือ -->
                      <span
                        v-if="(user.skills?.length || 0) > 5"
                        class="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-pointer"
                        @click="showAllSkills(user)"
                      >
                        +{{ (user.skills?.length || 0) - 5 }} เพิ่มเติม
                      </span>
                    </div>
                  </div>
                </td>

                <!-- จำนวนงาน -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="font-medium">{{ user.totalJobs || 0 }}</span>
                      <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">งาน</span>
                    </div>
                  </div>
                </td>

                <!-- คะแนนเฉลี่ย -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <span
                      class="text-sm font-medium"
                      :class="getOverallScoreClass(user.averageRating)"
                    >
                      {{ user.averageRating.toFixed(1) }}
                    </span>
                    <div class="flex text-yellow-400 ml-1.5">
                      <i class="fas fa-star text-xs"></i>
                    </div>
                  </div>
                </td>

                <!-- Approval Date -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {{ user.approvedDate }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <!-- ปุ่มรายละเอียด -->
                    <button
                      @click="showUserDetails(user)"
                      class="group px-4 py-2 rounded-lg bg-gradient-to-r from-[#C5B4E3] to-[#9899EE] dark:from-purple-600 dark:to-blue-600 text-white text-sm hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 items-center whitespace-nowrap"
                    >
                      <i
                        class="fas fa-info-circle text-xs mr-1.5 group-hover:scale-110 transition-transform"
                      ></i>
                      <span>รายละเอียด</span>
                    </button>

                    <!-- ปุ่มประวัติ -->
                    <button
                      @click="handleViewHistory(user)"
                      class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 dark:from-orange-600 dark:to-red-500 dark:text-white items-center whitespace-nowrap"
                    >
                      <i class="fas fa-history text-xs mr-1.5"></i>
                      <span>ประวัติ</span>
                    </button>
                    <button
                      @click="goToEditEvaluation(user)"
                      class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-400 to-green-400 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 dark:from-blue-600 dark:to-green-500 dark:text-white items-center whitespace-nowrap"
                    >
                      <i class="fas fa-edit text-xs mr-1.5"></i>
                      <span>แก้ไขการประเมิน</span>
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
                <!-- แสดงเพียง 5 ตำแหน่งแรก -->
                <span
                  v-for="(skill, index) in user.skills?.slice(0, 5) || []"
                  :key="skill + index"
                  class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                >
                  {{ skill }}
                </span>

                <!-- ถ้ามีมากกว่า 5 ตำแหน่ง แสดงจำนวนที่เหลือ -->
                <span
                  v-if="(user.skills?.length || 0) > 5"
                  class="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-pointer"
                  @click="showAllSkills(user)"
                >
                  +{{ (user.skills?.length || 0) - 5 }} เพิ่มเติม
                </span>
              </div>
            </div>

            <!-- Date -->
            <div class="flex justify-between text-sm mb-4">
              <span class="text-gray-500 dark:text-gray-400">วันที่อนุมัติ:</span>
              <span class="text-gray-900 dark:text-gray-100">{{ user.approvedDate }}</span>
            </div>

            <!-- จำนวนงานและคะแนนเฉลี่ย -->
            <div class="flex justify-between text-sm mb-4">
              <div class="flex items-center">
                <span class="text-gray-500 dark:text-gray-400">จำนวนงาน:</span>
                <span class="text-gray-900 dark:text-gray-100 ml-2 font-medium"
                  >{{ user.totalJobs }} งาน</span
                >
              </div>

              <div class="flex items-center">
                <span class="text-gray-500 dark:text-gray-400">คะแนนเฉลี่ย:</span>
                <span class="ml-2 font-medium" :class="getOverallScoreClass(user.averageRating)">
                  {{ user.averageRating.toFixed(1) }}
                  <i class="fas fa-star text-yellow-400 text-xs ml-1"></i>
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-1 gap-2">
              <!-- ปุ่มรายละเอียด -->
              <button
                @click="showUserDetails(user)"
                class="group w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#C5B4E3] to-[#9899EE] dark:from-purple-600 dark:to-blue-600 text-white text-sm hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
              >
                <i
                  class="fas fa-info-circle text-xs mr-1.5 group-hover:scale-110 transition-transform"
                ></i>
                <span>รายละเอียด</span>
              </button>

              <!-- ปุ่มประวัติ -->
              <button
                @click="handleViewHistory(user)"
                class="group w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 dark:from-orange-600 dark:to-red-500 dark:text-white flex items-center justify-center"
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

    <!-- Modals -->
    <TransitionRoot appear :show="showModal" as="template">
      <UserDetailsModal :is-open="showModal" :user="selectedUser" @close="closeModal" />
    </TransitionRoot>

    <TransitionRoot appear :show="showHistoryModal" as="template">
      <JobHistoryModal :show="showHistoryModal" :user="selectedUser" @close="closeHistoryModal" />
    </TransitionRoot>
  </div>
</template>
<script>
import Swal from 'sweetalert2'
import SearchAdminUsersBar from '@/components/Search/SearchAdminUsersBar.vue'
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
    SearchAdminUsersBar,
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
    return {
      adminUserStore: useAdminUserStore(),
      userHistoryStore: useUserHistoryStore(),
      sidebarStore: useSidebarStore(),
      baseURL: import.meta.env.VITE_API_URL,
      showHistoryModal: false,
      showModal: false,
      selectedUser: null
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
    },

    async goToEditEvaluation(user) {
      if (user && user.id) {
        // ส่งต่อไปยังหน้าแก้ไขการประเมินโดยใช้ userId
        this.$router.push(`/admin/user/${user.id}/evaluation`)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'ไม่พบข้อมูลผู้ใช้',
          text: 'ไม่สามารถเข้าถึงข้อมูลการประเมินได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page
        this.adminUserStore.fetchUsers()
      }
    },

    goToFirstPage() {
      if (this.currentPage > 1) {
        this.currentPage = 1
        this.adminUserStore.fetchUsers()
      }
    },

    goToLastPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage = this.totalPages
        this.adminUserStore.fetchUsers()
      }
    },

    showAllSkills(user) {
      const skillsList =
        user.skills
          ?.map(
            (skill) =>
              `<span class="inline-block px-2 py-1 m-1 text-sm rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">${skill}</span>`
          )
          .join('') || 'ไม่มีตำแหน่ง'

      const isDarkMode = document.documentElement.classList.contains('dark')

      Swal.fire({
        title: 'ตำแหน่งทั้งหมดของ ' + user.fullName,
        html: `<div class="flex flex-wrap justify-center my-3">${skillsList}</div>`,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#C5B4E3',
        background: isDarkMode ? '#1F2937' : '#FFFFFF',
        color: isDarkMode ? '#F3F4F6' : '#111827',
        customClass: {
          popup: isDarkMode ? 'swal2-dark' : '',
          title: isDarkMode ? 'text-gray-100' : 'text-gray-800',
          content: isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }
      })
    },

    getOverallScoreClass(score) {
      if (score >= 8) return 'text-green-600 dark:text-green-400'
      if (score >= 6) return 'text-yellow-600 dark:text-yellow-400'
      if (score >= 4) return 'text-orange-600 dark:text-orange-400'
      return 'text-red-600 dark:text-red-400'
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
