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
    <JobSearchFilters @search="handleSearch" @clear="fetchJobs" />

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
        <!-- Job Details -->
        <div class="p-5 flex flex-col flex-1">
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
          <div class="space-y-3 mt-4" v-if="job?.JobPositions?.length">
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
          <div class="flex gap-2 mt-auto pt-4">
            <!-- ปุ่มดูรายละเอียด -->
            <button
              @click="openJobDetail(job)"
              class="flex-1 py-2 px-4 rounded-lg font-medium bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-500 dark:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <i class="fas fa-info-circle mr-2"></i>
              รายละเอียด
            </button>

            <!-- ปุ่มสมัครงาน -->
            <button
              @click="openApplyModal(job)"
              class="flex-1 py-2 px-4 rounded-lg font-medium"
              :class="
                hasApplied(job) || !canApply(job)
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
              "
              :disabled="hasApplied(job) || !canApply(job)"
            >
              <i class="fas fa-paper-plane mr-2"></i>
              <span v-if="hasApplied(job)">สมัครแล้ว</span>
              <span v-else-if="getJobStatus(job) === 'in_progress'">กำลังดำเนินงาน</span>
              <span v-else-if="getJobStatus(job) === 'completed'">งานเสร็จสิ้น</span>
              <span v-else>สมัครงาน</span>
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

    <JobEvaluationModal
      :show="showEvaluationModal"
      :job="selectedJob"
      :evaluation="evaluation"
      @close="showEvaluationModal = false"
    />
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useJobStore } from '@/stores/jobStore'
import { useUserHistoryStore } from '@/stores/userHistoryStore'

import JobDetailModal from '@/components/admin/Jobs/JobDetailModal.vue'
import JobApplyModal from '@/components/Users/JobApplyModal.vue'
import JobEvaluationModal from '@/components/Users/JobEvaluationModal.vue'
import JobSearchFilters from '@/components/Search/JobSearchFilters.vue'
import Swal from 'sweetalert2'

export default {
  name: 'JobsView',

  components: {
    JobSearchFilters,
    JobDetailModal,
    JobApplyModal,
    JobEvaluationModal
  },

  data() {
    return {
      jobStore: useJobStore(),
      userStore: useUserStore(),
      userHistoryStore: useUserHistoryStore(),
      searchQuery: '',
      isModalOpen: false,
      selectedJob: null,
      selectedUser: null,
      showAllPositions: false,
      showHistoryModal: false,
      showEvaluationModal: false,
      evaluation: null,
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

    hasApplied(job) {
      if (!this.userStore.user?.id) return false
      if (!job.JobPositions) return false

      const isApplied = job.JobPositions.some((position) =>
        position.JobParticipation?.some((p) => p.user_id === this.userStore.user.id)
      )

      return isApplied
    },
    canApply(job) {
      // แปลง string เป็น Date object ให้ถูกต้อง
      const now = new Date()
      const workDate = new Date(job.work_date.split('T')[0])

      // เช็คว่ามีตำแหน่งว่างไหม
      const hasAvailablePosition = job.JobPositions?.some((position) => {
        const participantsCount = position.JobParticipation?.length || 0
        const hasSpace = participantsCount < position.required_people

        return hasSpace
      })

      const canApply = workDate > now && hasAvailablePosition

      return canApply
    },
    getApplyButtonTooltip(job) {
      if (this.getJobStatus(job) === 'in_progress') {
        return 'งานกำลังดำเนินการอยู่ ไม่สามารถสมัครได้'
      }
      if (!this.canApply(job)) {
        return 'ตำแหน่งงานเต็มแล้ว หรือปิดรับสมัคร'
      }
      return ''
    },
    handleJobApplied() {
      this.closeApplyModal()
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
      const now = new Date()
      const workDate = new Date(job.work_date)

      // ฝั่ง user ดูแค่:
      // 1. ถ้ายังไม่ถึงวันงาน = published
      // 2. ถ้าถึงวันงาน = in_progress
      // 3. ถ้าผ่านวันงาน = completed

      if (workDate > now) {
        return 'published' // ยังไม่ถึงวันงาน
      } else if (workDate.toDateString() === now.toDateString()) {
        return 'in_progress' // วันนี้
      } else {
        return 'completed' // ผ่านไปแล้ว
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
