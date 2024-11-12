<template>
  <div class="p-6 ml-6">
    <!-- Main Card -->
    <div
      class="bg-white p-4 md:p-8 min-h-screen rounded-lg transition-all duration-500 ease-in-out shadow-sm overflow-hidden"
    >
      <!-- Header -->
      <div class="p-6 border-b">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">งานทั้งหมดในระบบ</h2>
        </div>
      </div>

      <!-- Search Component -->
      <JobSearch @search="handleSearch" @clear="handleClear" />

      <!-- Table Section -->
      <div class="overflow-x-auto">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!jobs.length" class="text-center py-12 text-gray-500">
          <i class="fas fa-clipboard-list text-4xl mb-4 text-[#EABF71]"></i>
          <p>ไม่พบข้อมูลงาน</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Job ID</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ADMIN</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ชื่องาน</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">สถานที่</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">วันที่ทำงาน</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">เวลา</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ตำแหน่ง</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ค่าจ้างรวม</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">สถานะ</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">รายละเอียด</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-gray-900">{{ job.id }}</td>
              <td class="px-6 py-4 text-gray-600">
                {{ job.creator?.first_name || `Admin ${job.created_by}` }}
              </td>
              <td class="px-6 py-4 text-gray-900">{{ job.title }}</td>
              <td class="px-6 py-4 text-gray-600">{{ job.location }}</td>
              <td class="px-6 py-4 text-gray-600">{{ formatDate(job.work_date) }}</td>
              <td class="px-6 py-4 text-gray-600">
                {{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}
              </td>

              <!-- Positions -->
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="position in job.JobPositions"
                    :key="position.id"
                    class="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-600"
                  >
                    {{ position.position_name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-2">
                <span class="text-[#6ED7D1] font-medium">
                  {{ calculateTotalWage(job) }}
                  <span class="text-[#969696]">บาท</span>
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex px-3 py-1 rounded-full text-xs whitespace-nowrap"
                  :class="
                    job.completed ? 'bg-[#B8E994] text-[#2E7D32]' : 'bg-[#FDD1C1] text-[#3A506B]'
                  "
                >
                  {{ job.completed ? 'เสร็จสิ้น' : 'กำลังดำเนินการ' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center space-x-2">
                  <button @click="openModal(job)" class="text-[#7BC4C4] hover:text-[#5DA3A3]">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- เพิ่ม Modal Component -->
      <JobDetailModal :is-open="isModalOpen" :job="selectedJob || {}" @close="closeModal" />

      <!-- Pagination controls -->
      <div
        v-if="!loading && jobs.length > 0"
        class="flex justify-center items-center mt-6 space-x-2 pb-4"
      >
        <!-- ปุ่มย้อนกลับ -->
        <button
          @click="handlePrevPage"
          :disabled="currentPage <= 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          :class="[
            currentPage <= 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'
          ]"
        >
          <i class="fas fa-chevron-left text-sm"></i>
        </button>

        <!-- หน้าปัจจุบัน -->
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-400 text-white"
        >
          {{ currentPage }}
        </button>

        <!-- จำนวนหน้าทั้งหมด -->
        <span class="text-gray-600"> of {{ totalPages }} </span>

        <!-- ปุ่มถัดไป -->
        <button
          @click="handleNextPage"
          :disabled="currentPage >= totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          :class="[
            currentPage >= totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'
          ]"
        >
          <i class="fas fa-chevron-right text-sm"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import JobSearch from '@/components/Search/JobSearch.vue'
import JobDetailModal from '@/components/admin/jobs/JobDetailModal.vue'

import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'JobList',
  components: {
    JobSearch,
    JobDetailModal
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    job: {
      type: Object,
      default: () => ({
        title: '',
        location: '',
        work_date: null,
        start_time: null,
        end_time: null,
        details: '',
        completed: false,
        JobPositions: []
      })
    }
  },
  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      jobs: [],
      loading: false,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      filters: {},
      isModalOpen: false,
      selectedJob: null
    }
  },
  methods: {
    async fetchJobs() {
      try {
        this.loading = true
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          ...this.filters
        }
        const response = await axios.get(`${this.baseURL}/api/jobs`, {
          params
        })
        if (response?.data) {
          this.jobs = response.data.jobs
          this.totalPages = response.data.totalPages
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลงานได้'
        })
      } finally {
        this.loading = false
      }
    },

    handleSearch(searchFilters) {
      this.filters = searchFilters
      this.currentPage = 1
      this.fetchJobs()
    },

    handleClear() {
      this.filters = {}
      this.currentPage = 1
      this.fetchJobs()
    },

    handlePrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.fetchJobs()
      }
    },
    handleNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.fetchJobs()
      }
    },

    // สำหรับวันที่
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    // สำหรับเวลา
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // ใช้ระบบ 24 ชั่วโมง
      })
    },
    // คำนวณรายจ่ายต่องานทั้งหมด total
    calculateTotalWage(job) {
      if (!job.JobPositions || job.JobPositions.length === 0) return 0

      const total = job.JobPositions.reduce((sum, position) => {
        const wagePerPerson = Number(position.wage) || 0
        const requiredPeople = Number(position.required_people) || 0
        const totalWageForPosition = wagePerPerson * requiredPeople
        return sum + totalWageForPosition
      }, 0)

      return total.toLocaleString('th-TH')
    },
    openModal(job) {
      this.selectedJob = job
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
      this.selectedJob = null
    }
  },
  created() {
    this.fetchJobs()
  },
  watch: {
    // ดักการเปลี่ยนแปลงของ filters หรือ search params อื่นๆ
    '$route.query': {
      handler() {
        this.currentPage = 1 // reset page
        this.fetchJobs()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
/* Optional: Add custom scrollbar styling */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
