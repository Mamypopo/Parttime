<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">
        <span
          class="bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-transparent bg-clip-text"
        >
          งานทั้งหมด
        </span>
      </h1>
      <p class="mt-2 text-gray-500 dark:text-gray-400">งานที่ทักษะตรงกับคุณจะสามารถสมัครได้</p>
    </div>

    <!-- Search Component -->
    <div class="mt-6 flex items-center gap-2">
      <div class="flex-1 transform transition-all duration-300 hover:scale-[1.01]">
        <JobSearchFilters
          @search="handleSearch"
          @clear="fetchJobs"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
      </div>
    </div>

    <!-- Jobs Grid -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="job in jobs"
        :key="job.id"
        class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#c779d0]/50 dark:hover:border-[#4bc0c8]/50 hover:shadow-lg hover:shadow-[#c779d0]/10 dark:hover:shadow-[#4bc0c8]/10"
      >
        <!-- Job Header -->
        <div
          class="p-5 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-[#feac5e]/5 via-[#c779d0]/5 to-[#4bc0c8]/5 dark:from-[#feac5e]/10 dark:via-[#c779d0]/10 dark:to-[#4bc0c8]/10"
        >
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
                <i class="fas fa-phone-alt mr-1 text-[#4bc0c8] dark:text-[#4bc0c8]/70"></i>
                {{ job.creator?.phone || 'ไม่ระบุเบอร์โทร' }}
              </span>
            </div>
          </div>

          <!-- Location -->
          <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <i class="fas fa-map-marker-alt mr-2 text-[#c779d0] dark:text-[#c779d0]/70"></i>
            {{ job.location }}
          </p>
        </div>

        <!-- Job Details -->
        <div class="p-5 flex flex-col flex-1">
          <!-- Date and Time -->
          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span class="flex items-center">
              <i class="fa-solid fa-calendar-days mr-2 text-[#feac5e] dark:text-[#feac5e]/70"></i>
              {{ formatDate(job.work_date) }}
            </span>
            <span class="flex items-center">
              <i class="fas fa-clock mr-2 text-[#4bc0c8] dark:text-[#4bc0c8]/70"></i>
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
              class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 relative overflow-hidden group border-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#4bc0c8]/10"
              :class="[
                'border-[#4bc0c8]/30 dark:border-[#4bc0c8]/30',
                'bg-white dark:bg-gray-800/80',
                'text-[#4bc0c8] dark:text-[#4bc0c8]'
              ]"
            >
              <!-- Effect กระพริบ -->
              <span
                class="absolute inset-0 bg-gradient-to-r from-[#4bc0c8]/0 via-[#4bc0c8]/10 to-[#c779d0]/0 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
              ></span>

              <!-- Effect gradient พื้นหลัง -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-[#4bc0c8]/5 via-[#c779d0]/5 to-[#4bc0c8]/5 dark:from-[#4bc0c8]/10 dark:via-[#c779d0]/10 dark:to-[#4bc0c8]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>

              <!-- เนื้อหาปุ่ม -->
              <span class="relative flex items-center justify-center">
                <i
                  class="fas fa-info-circle mr-2 text-[#c779d0] dark:text-[#c779d0]/70 group-hover:rotate-12 transition-transform duration-300"
                ></i>
                <span class="group-hover:tracking-wide transition-all duration-300"
                  >รายละเอียด</span
                >
              </span>
            </button>

            <!-- ปุ่มสมัครงาน -->
            <button
              v-if="!hasAppliedForJob(job)"
              @click="openApplyModal(job)"
              class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
              :class="[
                getJobStatus(job) === 'completed'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : getJobStatus(job) === 'in_progress'
                    ? 'bg-amber-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] hover:shadow-lg hover:shadow-[#c779d0]/20'
              ]"
              :disabled="getJobStatus(job) !== 'published'"
            >
              <!-- เพิ่ม Effect ไฟกระพริบ -->
              <span
                class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
              ></span>

              <span class="relative flex items-center justify-center text-white">
                <i class="fas fa-paper-plane mr-2 group-hover:animate-bounce"></i>
                <span class="group-hover:tracking-wider transition-all duration-300">สมัครงาน</span>
              </span>
            </button>

            <!-- สถานะการสมัคร -->
            <div
              v-else
              class="flex-1 py-2.5 px-4 rounded-lg font-medium relative overflow-hidden group transition-all duration-300"
              :class="[
                getApplicationStatusClass(getApplicationStatus(job)),
                'hover:shadow-lg border-2 border-opacity-50'
              ]"
            >
              <div
                class="absolute inset-0 bg-gradient-to-r opacity-20"
                :class="getStatusGradient(getApplicationStatus(job))"
              ></div>

              <span class="relative flex items-center justify-center">
                <i
                  :class="[
                    getApplicationStatusIcon(getApplicationStatus(job)),
                    'mr-2 group-hover:rotate-12 transition-transform duration-300'
                  ]"
                ></i>
                <span class="group-hover:tracking-wide transition-all duration-300">
                  {{ getApplicationStatusText(getApplicationStatus(job)) }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="jobStore.loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-[#4bc0c8] dark:border-[#4bc0c8]/70 border-t-transparent dark:border-t-transparent border-b-[#c779d0] dark:border-b-[#c779d0]/70"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!jobStore.loading && jobs.length === 0"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <i
        class="fas fa-search text-5xl bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-transparent bg-clip-text mb-4 mt-1"
      ></i>
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
    // เช็คว่าผู้ใช้สมัครงานนี้แล้วหรือยัง
    hasAppliedForJob(job) {
      const userId = this.userStore.user?.id
      return job.JobPositions?.some((position) =>
        position.JobParticipation?.some((p) => p.user_id === userId)
      )
    },

    // ดึงสถานะการสมัครงาน
    getApplicationStatus(job) {
      const userId = this.userStore.user?.id
      for (const position of job.JobPositions || []) {
        const participation = position.JobParticipation?.find((p) => p.user_id === userId)
        if (participation) {
          return participation.status
        }
      }
      return null
    },

    // สีและสไตล์ตามสถานะการสมัคร
    getApplicationStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'text-yellow-600 dark:text-yellow-400 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
        case 'approved':
          return 'text-emerald-600 dark:text-emerald-400 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
        case 'rejected':
          return 'text-rose-600 dark:text-rose-400 border-rose-400 bg-rose-50 dark:bg-rose-900/20'
        case 'completed':
          return 'text-blue-600 dark:text-blue-400 border-blue-400 bg-blue-50 dark:bg-blue-900/20' // โทนน้ำเงิน
        default:
          return 'text-gray-600 dark:text-gray-400 border-gray-400 bg-gray-50 dark:bg-gray-900/20'
      }
    },

    // ไอคอนตามสถานะ
    getApplicationStatusIcon(status) {
      switch (status) {
        case 'pending':
          return 'fas fa-clock'
        case 'approved':
          return 'fas fa-check-circle'
        case 'rejected':
          return 'fas fa-times-circle'
        case 'completed':
          return 'fa-regular fa-circle-check'
        default:
          return 'fas fa-info-circle'
      }
    },

    // ข้อความแสดงสถานะ
    getApplicationStatusText(status) {
      switch (status) {
        case 'pending':
          return 'รอการอนุมัติ'
        case 'approved':
          return 'ได้รับอนุมัติ'
        case 'rejected':
          return 'ไม่ผ่านการอนุมัติ'
        case 'completed':
          return 'ได้รับการประเมินแล้ว'
        default:
          return 'ไม่ทราบสถานะ'
      }
    },

    getStatusGradient(status) {
      switch (status) {
        case 'pending':
          return 'from-yellow-400 via-amber-300 to-yellow-400'
        case 'approved':
          return 'from-emerald-400 via-green-300 to-emerald-400'
        case 'rejected':
          return 'from-rose-400 via-red-300 to-rose-400'
        case 'completed':
          return 'from-blue-400 via-sky-300 to-blue-400'
        default:
          return 'from-gray-400 via-gray-300 to-gray-400'
      }
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
.group {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ปรับ Disabled State */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}
</style>
