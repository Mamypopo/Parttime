<template>
  <div class="p-6">
    <!-- Main Card -->
    <div
      class="bg-white p-4 md:p-8 min-h-screen rounded-lg transition-all duration-500 ease-in-out shadow-sm overflow-hidden"
    >
      <!-- Header -->
      <div class="p-6 border-b">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">งานที่ฉันสร้าง</h2>
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
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ชื่องาน</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">สถานที่</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">วันที่ทำงาน</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">เวลา</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ตำแหน่ง</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">ค่าจ้างรวม</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">สถานะ</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-gray-900">{{ job.id }}</td>
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
              <td class="px-6 py-4">
                <div class="flex justify-center space-x-2 gap-3">
                  <button @click="viewJobDetails(job)" class="text-[#7BC4C4] hover:text-[#5DA3A3]">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="handleOpenEditModal(job)"
                    class="text-[#81E2C4] hover:text-[#5DC4A7]"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmDelete(job)"
                    class="text-[#E98585] hover:text-[#da7171] transition-colors"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && jobs.length > 0"
        class="flex justify-center items-center mt-6 space-x-2 pb-4"
      >
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          :class="[
            currentPage <= 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-[#C5B4E3] hover:bg-purple-50 border border-purple-200'
          ]"
        >
          <i class="fas fa-chevron-left text-sm"></i>
        </button>

        <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C5B4E3] text-white">
          {{ currentPage }}
        </button>

        <span class="text-gray-600"> of {{ totalPages }} </span>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          :class="[
            currentPage >= totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-[#C5B4E3] hover:bg-purple-50 border border-purple-200'
          ]"
        >
          <i class="fas fa-chevron-right text-sm"></i>
        </button>
      </div>

      <!-- Modals รายละเอียด -->
      <JobDetailsModal :is-open="showDetailsModal" :job="selectedJob" @close="closeDetailsModal" />

      <!-- Modal แก้ไขงาน -->
      <EditJobModal
        v-if="showEditModal"
        :show="showEditModal"
        :job="selectedJob"
        @close="handleCloseModal"
        @submit="handleEditJob"
      />
    </div>
  </div>
</template>

<script>
import JobSearch from '@/components/Search/JobSearch.vue'
import JobDetailsModal from '@/components/admin/Jobs/JobDetailModal.vue'
import EditJobModal from '@/components/admin/Jobs/EditJobModal.vue'
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'MyCreatedJobs',

  components: {
    JobSearch,
    JobDetailsModal,
    EditJobModal
  },

  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      jobs: [],
      currentPage: 1,
      totalPages: 1,
      filters: {},
      loading: false,
      selectedJob: null,
      showDetailsModal: false,
      showEditModal: false,
      jobToDelete: null
    }
  },

  mounted() {
    this.fetchJobs()
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
        const response = await axios.get(`${this.baseURL}/api/jobs/my-created-jobs`, {
          params
        })
        this.jobs = response.data.jobs
        this.totalPages = response.data.totalPages
      } catch (error) {
        this.$toast.error('ไม่สามารถดึงข้อมูลงานได้')
        console.error('Error fetching jobs:', error)
      } finally {
        this.loading = false
      }
    },

    confirmDelete(job) {
      Swal.fire({
        title: 'ยืนยันการลบงาน',
        text: `คุณต้องการลบงาน "${job.title}" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EA6B6B',
        cancelButtonColor: '#B5B5C3',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${this.baseURL}/api/jobs/delete-job/${job.id}`)
            Swal.fire({
              title: 'ลบงานสำเร็จ',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            })
            this.fetchJobs()
          } catch (error) {
            console.error('Error deleting job:', error)
            Swal.fire({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถลบงานได้',
              icon: 'error'
            })
          }
        }
      })
    },

    async handleEditJob(jobData) {
      try {
        const response = await axios.put(`${this.baseURL}/api/jobs/editJob/${jobData.id}`, jobData)

        const index = this.jobs.findIndex((job) => job.id === jobData.id)
        if (index !== -1) {
          this.jobs[index] = response.data.job
        }

        this.handleCloseModal()
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขงานสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการแก้ไขงาน:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถแก้ไขงานได้',
          confirmButtonText: 'ตกลง'
        })
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

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.fetchJobs()
      }
    },

    viewJobDetails(job) {
      this.selectedJob = job
      this.showDetailsModal = true
    },

    closeDetailsModal() {
      this.selectedJob = null
      this.showDetailsModal = false
    },

    closeDeleteModal() {
      this.jobToDelete = null
      this.showDeleteModal = false
    },
    handleOpenEditModal(job) {
      this.selectedJob = { ...job }
      this.showEditModal = true
    },

    handleCloseModal() {
      this.showEditModal = false
      this.selectedJob = null
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatTime(time) {
      return new Date(time).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    },

    calculateTotalWage(job) {
      if (!job.JobPositions || job.JobPositions.length === 0) return 0

      const total = job.JobPositions.reduce((sum, position) => {
        const wagePerPerson = Number(position.wage) || 0
        const requiredPeople = Number(position.required_people) || 0
        const totalWageForPosition = wagePerPerson * requiredPeople
        return sum + totalWageForPosition
      }, 0)

      return total.toLocaleString('th-TH')
    }
  }
}
</script>

<style scoped>
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
