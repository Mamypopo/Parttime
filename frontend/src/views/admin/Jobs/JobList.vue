<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
          >
            งานทั้งหมดในระบบ
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">จัดการและดูรายละเอียดงานทั้งหมด</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">งานทั้งหมด</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ jobs.length }}
            </div>
          </div>
          <div
            class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">งานที่เสร็จสิ้น</div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ jobs.filter((job) => job.status === 'completed').length }}
            </div>
          </div>
          <div
            class="hidden md:block bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 p-4 rounded-xl shadow-sm dark:shadow-gray-900/10"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400">งานที่กำลังดำเนินการ</div>
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ jobs.filter((job) => job.status === 'in_progress').length }}
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar with Animation -->
      <div class="mt-6 flex items-center gap-2">
        <div class="flex-1 transform transition-all duration-300 hover:scale-[1.01]">
          <JobSearch
            @search="handleSearch"
            @clear="handleClear"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
    >
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
        v-else-if="jobs.length === 0"
        class="flex flex-col items-center justify-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl dark:border dark:border-gray-700"
      >
        <i class="fas fa-clipboard-list text-4xl mb-4 text-[#EABF71] dark:text-[#D4A85C]"></i>
        <p class="text-gray-500 dark:text-gray-400 text-lg">ไม่พบข้อมูลงาน</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">ลองปรับเงื่อนไขการค้นหาใหม่</p>
      </div>

      <!-- Table -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr
              class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30"
            >
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Job ID
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                ADMIN
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                ชื่องาน
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                สถานที่
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                วันที่ทำงาน
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                เวลา
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                ตำแหน่ง
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                ค่าจ้างรวม
              </th>
              <th
                class="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                สถานะ
              </th>
              <th
                class="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                รายละเอียด
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="job in jobs"
              :key="job.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td class="px-6 py-4 text-gray-900 dark:text-gray-100">{{ job.id }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-100">
                {{ job.creator?.first_name || `Admin ${job.created_by}` }}
              </td>
              <td class="px-6 py-4 text-gray-900 dark:text-gray-100">{{ job.title }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-100">{{ job.location }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-100">
                {{ formatDate(job.work_date) }}
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-100">
                {{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="position in job.JobPositions"
                    :key="position.id"
                    class="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  >
                    {{ position.position_name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <!-- ประมาณการค่าใช้จ่าย -->
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    ประมาณการ:
                    <span class="font-medium text-gray-600 dark:text-gray-300">
                      {{ calculateEstimatedCost(job).toLocaleString() }} บาท
                    </span>
                  </div>
                  <!-- ค่าจ้างจริง -->
                  <div class="text-sm">
                    จ่ายจริง:
                    <span class="font-medium text-purple-600 dark:text-purple-400">
                      {{ calculateActualCost(job).toLocaleString() }} บาท
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex px-3 py-1 rounded-full text-xs whitespace-nowrap"
                  :class="getJobStatus(job).class"
                >
                  {{ getJobStatus(job).text }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  @click="openModal(job)"
                  class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm hover:opacity-90 transition-opacity"
                >
                  <i class="fas fa-eye mr-1"></i>
                  รายละเอียด
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="px-4 py-3 flex items-center justify-between border-t">
        <div class="flex-1 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              แสดง
              <span class="font-medium">{{ startItem }}</span>
              ถึง
              <span class="font-medium">{{ endItem }}</span>
              จากทั้งหมด
              <span class="font-medium">{{ pagination.totalItems }}</span>
              รายการ
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="handlePrevPage" :disabled="currentPage === 1" class="btn-pagination">
                <i class="fas fa-chevron-left"></i>
              </button>

              <button
                v-for="page in displayedPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'btn-pagination',
                  currentPage === page
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="handleNextPage"
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

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4">
      <div
        v-for="job in jobs"
        :key="job.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-3"
      >
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">งาน : {{ job.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ job.id }}</p>
          </div>
          <span
            class="inline-flex px-3 py-1 rounded-full text-xs whitespace-nowrap"
            :class="getJobStatus(job).class"
          >
            {{ getJobStatus(job).text }}
          </span>
        </div>

        <!-- Content -->
        <div class="space-y-2 text-sm">
          <div class="flex items-start gap-2">
            <i class="fas fa-user-tie w-5 text-blue-500 dark:text-blue-400"></i>
            <span class="text-gray-600 dark:text-gray-300">
              {{ job.creator?.first_name || `Admin ${job.created_by}` }}
            </span>
          </div>

          <div class="flex items-start gap-2">
            <i class="fas fa-map-marker-alt w-5 text-red-500 dark:text-red-400"></i>
            <span class="text-gray-600 dark:text-gray-300">{{ job.location }}</span>
          </div>

          <div class="flex items-start gap-2">
            <i class="fas fa-calendar w-5 text-green-500 dark:text-green-400"></i>
            <span class="text-gray-600 dark:text-gray-300">{{ formatDate(job.work_date) }}</span>
          </div>

          <div class="flex items-start gap-2">
            <i class="fas fa-clock w-5 text-yellow-500 dark:text-yellow-400"></i>
            <span class="text-gray-600 dark:text-gray-300">
              {{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}
            </span>
          </div>

          <div class="flex items-start gap-2">
            <i class="fas fa-briefcase w-5 text-purple-500 dark:text-purple-400"></i>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="position in job.JobPositions"
                :key="position.id"
                class="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
              >
                {{ position.position_name }}
              </span>
            </div>
          </div>

          <div class="flex items-start gap-2">
            <i class="fas fa-money-bill w-5 text-emerald-500 dark:text-emerald-400"></i>
            <div class="space-y-1">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                ประมาณการ:
                <span class="font-medium text-gray-600 dark:text-gray-300">
                  {{ calculateEstimatedCost(job).toLocaleString() }} บาท
                </span>
              </div>
              <div class="text-sm">
                จ่ายจริง:
                <span class="font-medium text-purple-600 dark:text-purple-400">
                  {{ calculateActualCost(job).toLocaleString() }} บาท
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button
          @click="openModal(job)"
          class="w-full mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm hover:opacity-90 transition-opacity"
        >
          <i class="fas fa-eye mr-1"></i>
          รายละเอียด
        </button>
      </div>
    </div>

    <!-- Job Detail Modal -->
    <JobDetailModal :is-open="isModalOpen" :job="selectedJob || {}" @close="closeModal" />
  </div>
</template>

<script>
import JobSearch from '@/components/Search/JobSearch.vue'
import JobDetailModal from '@/components/admin/Jobs/JobDetailModal.vue'
import { useJobStore } from '@/stores/jobStore'

export default {
  name: 'JobList',
  components: {
    JobSearch,
    JobDetailModal
  },

  setup() {
    const jobStore = useJobStore()
    return { jobStore }
  },
  watch: {
    $route(to, from) {
      if (to.name === 'JobList' && from.name !== 'JobList') {
        this.jobStore.resetPagination()
        this.jobStore.fetchJobsAndParticipants()
      }
    }
  },
  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      pageSize: 10,
      isModalOpen: false,
      selectedJob: null
    }
  },
  computed: {
    jobs() {
      return this.jobStore.jobs || []
    },
    loading() {
      return this.jobStore.loading
    },
    pagination() {
      return this.jobStore.pagination
    },
    currentPage: {
      get() {
        return this.jobStore.pagination.currentPage
      },
      set(value) {
        this.jobStore.updatePagination(value)
      }
    },
    totalPages() {
      return this.pagination.totalPages
    },
    startItem() {
      return (this.currentPage - 1) * this.pageSize + 1
    },
    endItem() {
      return Math.min(this.currentPage * this.pageSize, this.pagination.totalItems)
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

  async created() {
    try {
      this.jobStore.resetPagination()
      // await this.jobStore.fetchJobsAndParticipants()
      await this.jobStore.fetchJobs()
    } catch (error) {
      console.error('Error in created hook:', error)
    }
  },

  methods: {
    async fetchJobs() {
      try {
        await this.jobStore.fetchJobs({
          page: this.currentPage,
          pageSize: this.pageSize // เปลี่ยนจาก limit เป็น pageSize ตาม API
        })
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    },
    handleSearch(searchFilters) {
      this.jobStore.updateSearchFilters(searchFilters)
      this.currentPage = 1 // รีเซ็ตกลับหน้าแรกเมื่อค้นหา
      this.fetchJobs()
    },
    handleClear() {
      this.jobStore.clearSearchFilters()
      this.currentPage = 1 // รีเซ็ตกลับหน้าแรก
      this.fetchJobs()
    },
    async handlePrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        await this.fetchJobs()
      }
    },
    async handleNextPage() {
      if (this.currentPage < this.pagination.totalPages) {
        this.currentPage++
        await this.fetchJobs()
      }
    },
    formatDate(date) {
      return this.jobStore.formatDate(date)
    },
    formatTime(time) {
      return this.jobStore.formatTime(time)
    },
    calculateEstimatedCost(job) {
      return this.jobStore.calculateEstimatedCost(job)
    },
    calculateActualCost(job) {
      return this.jobStore.calculateActualCost(job)
    },
    openModal(job) {
      this.selectedJob = job
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
      this.selectedJob = null
    },
    getJobStatus(job) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const workDate = new Date(job.work_date)
      workDate.setHours(0, 0, 0, 0)

      if (job.status === 'completed') {
        return { text: 'เสร็จสิ้น', class: 'text-green-600 bg-green-100' }
      }
      if (job.status === 'cancelled') {
        return { text: 'ยกเลิก', class: 'text-red-600 bg-red-100' }
      }

      if (workDate > today) {
        return { text: 'ประกาศรับสมัคร', class: 'text-blue-600 bg-blue-100' }
      }
      if (workDate.getTime() === today.getTime()) {
        return { text: 'กำลังดำเนินงาน', class: 'text-yellow-600 bg-yellow-100' }
      }

      return { text: 'เสร็จสิ้น', class: 'text-green-600 bg-green-100' }
    },
    goToPage(page) {
      if (typeof page === 'number' && page !== this.currentPage) {
        this.currentPage = page
        this.fetchJobs()
      }
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

/* Custom scrollbar for dark mode */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

.btn-pagination {
  @apply relative inline-flex items-center px-4 py-2 border text-sm font-medium;
}

.btn-pagination:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
