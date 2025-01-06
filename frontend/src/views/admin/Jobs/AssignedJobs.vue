<template>
  <div class="p-6 space-y-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2
        class="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
      >
        งานที่ได้รับมอบหมาย
      </h2>
    </div>

    <!-- Filters -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div class="flex flex-wrap items-center gap-4">
        <!-- Label -->
        <label
          class="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0"
        >
          สถานะงาน:
        </label>

        <!-- Select -->
        <select
          v-model="statusFilter"
          class="form-select w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
        >
          <option value="">ทั้งหมด</option>
          <option value="published">ประกาศรับสมัคร</option>
          <option value="in_progress">กำลังดำเนินการ</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
      </div>
    </div>

    <!-- Job List -->
    <div v-if="!jobStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in filteredJobs"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <!-- Header -->
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">
            {{ item?.job?.title }}
          </h3>
        </div>

        <!-- ข้อมูลผู้สร้างงาน -->
        <div class="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <i class="fas fa-user-edit text-xs text-gray-400"></i>
            <span>ผู้สร้างงาน:</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="font-medium text-gray-700 dark:text-gray-300">
              {{ item?.job.creator?.first_name }} {{ item?.job.creator?.last_name }}
            </span>
            <a
              :href="`tel:${item?.job.creator?.phone}`"
              class="flex items-center gap-1 ml-3 text-gray-400 hover:text-[#6ED7D1] transition-colors"
            >
              <i class="fas fa-phone-alt text-xs"></i>
              <span class="text-xs">{{ item?.job.creator?.phone }}</span>
            </a>
          </div>
        </div>

        <!-- Job Info -->
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p class="flex items-center gap-2">
            <i class="fas fa-calendar-alt w-4 text-gray-400"></i>
            <span>{{ jobStore.formatDate(item?.job?.work_date) }}</span>
          </p>
          <p class="flex items-center gap-2">
            <i class="fas fa-clock w-4 text-gray-400"></i>
            <span>
              {{ jobStore.formatTime(item?.job?.start_time) }} -
              {{ jobStore.formatTime(item?.job?.end_time) }}
            </span>
          </p>
          <p class="flex items-center gap-2">
            <i class="fas fa-map-marker-alt w-4 text-gray-400"></i>
            <span>{{ item?.job?.location }}</span>
          </p>
        </div>

        <!-- Progress Bar -->
        <div class="mb-5">
          <div class="flex justify-between text-xs mb-1.5">
            <span class="text-gray-500 dark:text-gray-400">ความคืบหน้า</span>
            <span
              :class="getStatusClass(item?.job?.status)"
              class="text-xs px-2.5 py-1 rounded-full font-medium"
            >
              {{ getStatusText(item?.job?.status) }}
            </span>
          </div>
          <div class="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              :class="getProgressBarClass(item?.job?.status)"
              class="h-full rounded-full transition-all duration-300"
              :style="{ width: getProgressWidth(item?.job?.status) }"
            ></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 text-xs">
          <!-- View Job Details -->
          <button
            @click="viewJobDetails(item)"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 rounded-lg shadow-sm transition-all"
          >
            <i class="fas fa-eye text-sm"></i>
            <span>ดูรายละเอียด</span>
          </button>

          <!-- Open Evaluation -->
          <button
            @click="openEvaluation(item)"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300 rounded-lg shadow-sm transition-all"
          >
            <i class="fas fa-star text-sm"></i>
            <span>ประเมินผล</span>
          </button>

          <!-- Manage Participants -->
          <div class="relative ml-auto">
            <button
              @click="openParticipantsModal(item)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 rounded-lg shadow-sm transition-all"
            >
              <i class="fas fa-users text-sm"></i>
              <span>จัดการผู้สมัคร</span>
            </button>

            <!-- Notification Badge -->
            <span
              v-if="jobStore.getPendingCount(item?.job) > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white animate-pulse text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1"
            >
              {{ jobStore.getPendingCount(item?.job) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="jobStore.loading" class="text-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
    </div>

    <!-- Empty State -->
    <div
      v-if="!jobStore.loading && filteredJobs.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <i class="fas fa-inbox text-4xl mb-2"></i>
      <p>ไม่พบงานที่ได้รับมอบหมาย</p>
    </div>

    <!-- Modals -->
    <JobDetailsModal :is-open="showDetailsModal" :job="selectedJob" @close="closeDetailsModal" />

    <UpdateWorkStatusModal
      v-if="showEvaluationModal && selectedJob"
      :show="showEvaluationModal"
      :job="selectedJob"
      @close="closeEvaluationModal"
    />

    <!-- Modal อนุมัติผู้สมัคร -->
    <ParticipantsModal
      v-if="showParticipantsModal"
      :show="showParticipantsModal"
      :job="selectedJob"
      @close="closeParticipantsModal"
      @approve="handleApprove"
      @reject="handleReject"
      @update:job="updateJob"
    />
  </div>
</template>

<script>
import { useJobStore } from '@/stores/jobStore'
import JobDetailsModal from '@/components/admin/Jobs/JobDetailModal.vue'
import UpdateWorkStatusModal from '@/components/admin/Jobs/UpdateWorkStatusModal.vue'
import ParticipantsModal from '@/components/admin/Jobs/ParticipantsModal.vue'

export default {
  name: 'AssignedJobs',

  components: {
    JobDetailsModal,
    UpdateWorkStatusModal,
    ParticipantsModal
  },

  data() {
    return {
      jobs: [],
      statusFilter: '',
      showDetailsModal: false,
      showEvaluationModal: false,
      showParticipantsModal: false,
      selectedJob: null
    }
  },

  computed: {
    filteredJobs() {
      let jobs = this.jobs
      if (this.statusFilter) {
        jobs = jobs.filter((item) => item.job.status === this.statusFilter)
      }

      return jobs
    },

    jobStore() {
      return useJobStore()
    }
  },
  async created() {
    await this.fetchJobs()
    await this.jobStore.fetchJobsAndParticipants()
  },
  methods: {
    async fetchJobs() {
      try {
        const filters = {
          status: this.statusFilter
        }
        const response = await this.jobStore.fetchAssignedJobs(filters)
        this.jobs = response?.data?.data || []
      } catch (error) {
        console.error('Error fetching assigned jobs:', error)
        this.jobs = []
      }
    },

    openParticipantsModal(item) {
      this.selectedJob = item.job
      this.showParticipantsModal = true
    },

    closeParticipantsModal() {
      this.showParticipantsModal = false
      this.selectedJob = null
    },

    async handleApprove(participationId, resolve) {
      try {
        const response = await this.jobStore.approveOrRejectParticipation(
          participationId,
          'approved'
        )
        resolve({
          success: true,
          message: 'อนุมัติการสมัครสำเร็จ'
        })
        if (response) {
          await this.jobStore.fetchAssignedJobsAndParticipants()
        }
      } catch (error) {
        resolve({
          success: false,
          message: error.message || 'ไม่สามารถอนุมัติการสมัครได้'
        })
      }
    },

    async handleReject(participationId, resolve) {
      try {
        const response = await this.jobStore.approveOrRejectParticipation(
          participationId,
          'rejected'
        )
        resolve({
          success: true,
          message: 'ปฏิเสธการสมัครสำเร็จ'
        })
        if (response) {
          await this.jobStore.fetchAssignedJobsAndParticipants()
        }
      } catch (error) {
        resolve({
          success: false,
          message: error.message || 'ไม่สามารถปฏิเสธการสมัครได้'
        })
      }
    },

    updateJob(updatedJob) {
      this.selectedJob = updatedJob
    },
    async viewJobDetails(job) {
      await this.jobStore.fetchAssignedJobsAndParticipants()
      const foundJob = this.jobStore.jobs.find((j) => j.id === job.job_id)
      if (foundJob) {
        this.selectedJob = foundJob
        this.showDetailsModal = true
      }
    },

    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedJob = null
    },

    async openEvaluation(job) {
      await this.jobStore.fetchAssignedJobsAndParticipants()
      const foundJob = this.jobStore.jobs.find((j) => j.id === job.job_id)
      if (foundJob) {
        this.selectedJob = foundJob
        this.showEvaluationModal = true
      }
    },

    closeEvaluationModal() {
      this.showEvaluationModal = false
      this.selectedJob = null
    },
    formatDate(date) {
      return this.jobStore.formatDate(date)
    },
    formatTime(time) {
      return this.jobStore.formatTime(time)
    },

    getProgressBarClass(status) {
      const classes = {
        published:
          'bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-600 dark:to-blue-800',
        in_progress:
          'bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800',
        completed:
          'bg-gradient-to-br from-green-200 to-green-400 dark:from-green-600 dark:to-green-800'
      }
      return (
        classes[status] ||
        'bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800'
      )
    },

    getProgressWidth(status) {
      const widths = {
        published: '33%',
        in_progress: '66%',
        completed: '100%'
      }
      return widths[status] || '0%'
    },
    getStatusClass(status) {
      const classes = {
        published: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
        in_progress: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
        completed: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      }
      return `px-2 py-1 rounded-full text-xs ${classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-400'}`
    },

    getStatusText(status) {
      const texts = {
        published: 'ประกาศรับสมัคร',
        in_progress: 'กำลังดำเนินงาน',
        completed: 'เสร็จสิ้น'
      }
      return texts[status?.toLowerCase()] || 'สถานะไม่ระบุ'
    }
  },

  watch: {
    statusFilter() {
      this.fetchJobs()
    }
  },

  mounted() {
    this.fetchJobs()
  }
}
</script>
