<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100">
        งานทั้งหมด
      </h1>
      <p class="mt-2 text-gray-500 dark:text-gray-400">งานที่ทักษะตรงกับคุณจะสามารถสมัครได้</p>
    </div>

    <!-- Search Component -->
    <JobSearch @search="handleSearch" @clear="fetchJobs" />

    <!-- Jobs Grid -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="job in jobs"
        :key="job.id"
        class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        <!-- Job Header -->
        <div class="p-5 border-b dark:border-gray-700">
          <div class="flex justify-between items-start gap-4 mb-3">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
              {{ job.title }}
            </h3>
            <span
              class="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full"
              :class="getJobStatusClass(getJobStatus(job))"
            >
              {{ getJobStatusText(getJobStatus(job)) }}
            </span>
          </div>

          <!-- Creator Info -->
          <div class="flex items-center gap-3 mb-3">
            <!-- รูปโปรไฟล์ -->
            <div class="w-8 h-8 rounded-full overflow-hidden">
              <img
                v-if="job.creator?.profile_pic"
                :src="`${jobStore.baseURL}/uploads/admin-profiles/${job.creator.profile_pic}`"
                :alt="`${job.creator.first_name}'s profile`"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white"
              >
                {{ job.creator?.first_name?.[0] || 'U' }}
              </div>
            </div>

            <!-- ข้อมูลผู้สร้างงาน -->
            <div class="flex flex-col">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ job.creator?.first_name }} {{ job.creator?.last_name }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-500">
                <i class="fas fa-phone-alt mr-1 text-cyan-500/70"></i>
                {{ job.creator?.phone || 'ไม่ระบุเบอร์โทร' }}
              </span>
            </div>
          </div>

          <!-- Location -->
          <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <i class="fas fa-map-marker-alt mr-2 text-cyan-500 dark:text-cyan-400"></i>
            {{ job.location }}
          </p>
        </div>

        <!-- Job Details -->
        <div class="p-5 space-y-4">
          <!-- Date and Time -->
          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span class="flex items-center">
              <i class="fas fa-calendar mr-2 text-cyan-500 dark:text-cyan-400"></i>
              {{ formatDate(job.work_date) }}
            </span>
            <span class="flex items-center">
              <i class="fas fa-clock mr-2 text-cyan-500 dark:text-cyan-400"></i>
              {{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}
            </span>
          </div>

          <!-- Positions -->
          <div class="space-y-3" v-if="job?.JobPositions?.length">
            <!-- แสดงสรุปตำแหน่ง -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="position in job.JobPositions"
                :key="position.id"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-50 dark:bg-gray-700/50"
              >
                <span class="font-medium text-gray-700 dark:text-gray-300">
                  {{ position.position_name }}
                </span>
                <span class="text-cyan-600 dark:text-cyan-400">
                  {{ position.required_people }} คน
                </span>
                <span class="text-gray-500 dark:text-gray-400">
                  {{ formatCurrency(position.wage) }}
                </span>
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 pt-2">
            <button
              @click="openJobDetail(job)"
              class="flex-1 py-2 px-4 rounded-lg font-medium bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-500 dark:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <i class="fas fa-info-circle mr-2"></i>
              รายละเอียด
            </button>
            <!-- ถ้างานเสร็จสิ้นแล้ว แสดงปุ่มดูคะแนนประเมิน -->
            <button
              v-if="job.status === 'completed'"
              @click="viewEvaluation(job)"
              class="flex-1 py-2 px-4 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white transition-all duration-200"
              :disabled="!hasEvaluation(job)"
            >
              <i class="fas fa-star mr-2"></i>
              ดูผลประเมิน
            </button>

            <!-- ถ้างานยังไม่เสร็จสิ้น แสดงปุ่มสมัครงาน -->
            <button
              v-else
              @click="openApplyModal(job)"
              class="flex-1 py-2 px-4 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
              :disabled="!canApply(job)"
            >
              <i class="fas fa-paper-plane mr-2"></i>
              สมัครงาน
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="jobStore.loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!jobStore.loading && jobs.length === 0"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <i class="fas fa-search text-5xl text-gray-400 dark:text-gray-600 mb-4"></i>
      <p class="text-gray-500 dark:text-gray-400">ไม่พบงานที่คุณค้นหา</p>
    </div>

    <!-- Job Detail Modal -->
    <JobDetailModal :is-open="isModalOpen" :job="selectedJob" @close="closeModal" />

    <JobApplyModal
      :is-open="showApplyModal"
      v-if="showApplyModal"
      :job="selectedJob"
      @close="closeApplyModal"
    />

    <JobHistoryModal
      :show="showHistoryModal"
      :user="selectedUser"
      @close="showHistoryModal = false"
    />
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useJobStore } from '@/stores/jobStore'
import { useUserHistoryStore } from '@/stores/userHistoryStore'

import JobDetailModal from '@/components/admin/Jobs/JobDetailModal.vue'
import JobApplyModal from '@/components/Users/JobApplyModal.vue'
import JobHistoryModal from '@/components/Users/JobHistoryModal.vue'

import JobSearch from '@/components/Search/JobSearch.vue'
import Swal from 'sweetalert2'

export default {
  name: 'JobsView',

  components: {
    JobSearch,
    JobDetailModal,
    JobApplyModal,
    JobHistoryModal
  },

  data() {
    return {
      jobStore: useJobStore(),
      userStore: useUserStore(),
      searchQuery: '',
      isModalOpen: false,
      selectedJob: null,
      selectedUser: null,
      showAllPositions: false,
      showHistoryModal: false,
      showApplyModal: false,
      positionsPerPage: 5,
      expandedJobs: new Set()
    }
  },

  computed: {
    jobs() {
      return this.jobStore.jobs
    },

    isLoading() {
      return this.jobStore.loading
    }
  },

  methods: {
    async fetchJobs() {
      try {
        await this.jobStore.fetchJobs()
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    },

    // hasMatchingSkills(job) {
    //   // ให้ผ่านไปก่อน เพราะมีการเช็คที่ backend อยู่แล้ว
    //   return true
    // },

    handleJobApplied() {
      // Handle successful application
      this.closeApplyModal()
      // Maybe show success message
    },
    async handleSearch(query) {
      this.jobStore.searchFilters = { title: query }
      await this.fetchJobs()
    },
    openJobDetail(job) {
      this.selectedJob = job
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
      this.selectedJob = null
    },
    openApplyModal(job) {
      this.selectedJob = job
      this.showApplyModal = true
    },

    closeApplyModal() {
      this.showApplyModal = false
      this.selectedJob = null
    },
    canApply(job) {
      // เช็คว่าสามารถสมัครงานได้หรือไม่
      if (job.status === 'completed') return false

      const now = new Date()
      const workDate = new Date(job.work_date)

      // ถ้าวันทำงานผ่านไปแล้ว ไม่สามารถสมัครได้
      if (workDate < now) return false

      // เช็คเงื่อนไขอื่นๆ เช่น จำนวนที่รับสมัครเต็มหรือยัง
      return true
    },

    hasEvaluation(job) {
      const userStore = useUserStore()
      // เช็คว่าผู้ใช้มีการประเมินในงานนี้หรือไม่
      return job.JobPositions?.some((position) =>
        position.JobParticipation?.some(
          (p) => p.user_id === userStore.user?.id && p.evaluation !== null
        )
      )
    },

    async viewEvaluation(job) {
      const userHistoryStore = useUserHistoryStore()

      try {
        // โหลดประวัติการทำงานของ user สำหรับงานนี้
        await userHistoryStore.fetchUserHistory(job.creator.id)

        // เปิด modal
        this.showHistoryModal = true
        this.selectedUser = job.creator
      } catch (error) {
        console.error('Error loading user history:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดประวัติการทำงานได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0
      }).format(amount)
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // สถานะงานหลัก
    getJobStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'published': // เปิดรับสมัคร
          return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
        case 'in_progress': // กำลังดำเนินการ
          return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
        case 'completed': // เสร็จสิ้น
          return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    },

    getJobStatusText(status) {
      switch (status?.toLowerCase()) {
        case 'published':
          return 'ประกาศรับสมัคร'
        case 'in_progress':
          return 'กำลังดำเนินงาน'
        case 'completed':
          return 'เสร็จสิ้น'
        default:
          return 'ไม่ระบุสถานะ'
      }
    },

    // สถานะตำแหน่งงาน
    getPositionStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'open':
          return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        case 'closed':
          return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
        case 'full':
          return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
        case 'pending':
          return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    },

    getPositionStatusText(status) {
      switch (status?.toUpperCase()) {
        case 'OPEN':
          return 'เปิดรับสมัคร'
        case 'CLOSED':
          return 'ปิดรับสมัคร'
        case 'FULL':
          return 'เต็มแล้ว'
        case 'PENDING':
          return 'รอดำเนินการ'
        default:
          return status || 'ไม่ระบุสถานะ'
      }
    },
    getJobStatus(job) {
      // ถ้ามีผู้สมัครที่ completed แล้ว ให้ถือว่างานเสร็จสิ้น
      const hasCompletedParticipants = job.JobPositions?.some((position) =>
        position.JobParticipation?.some((p) => p.status === 'completed')
      )

      if (hasCompletedParticipants) {
        return 'completed'
      }

      // ดูสถานะจริงของงานก่อน
      if (job.status === 'completed') {
        return 'completed'
      }

      const now = new Date()
      const workDate = new Date(job.work_date)

      // ถ้ายังไม่ถึงวันทำงาน = ประกาศรับสมัคร
      if (workDate > now) {
        return 'published'
      }
      // ถ้าเป็นวันเดียวกัน = กำลังดำเนินงาน
      else if (workDate.toDateString() === now.toDateString()) {
        return 'in_progress'
      }
      // ถ้าผ่านวันทำงานมาแล้ว = เสร็จสิ้น
      else {
        return 'completed'
      }
    }
  },

  mounted() {
    this.fetchJobs()
  }
}
</script>
<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
