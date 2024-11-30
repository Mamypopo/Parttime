<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div
      class="flex justify-between items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg shadow-md"
    >
      <h2 class="text-xl font-semibold">งานของฉัน</h2>
      <select
        v-model="selectedStatus"
        class="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm focus:ring focus:ring-indigo-200"
        @change="filterJobs"
      >
        <option value="all">ทั้งหมด</option>
        <option value="pending">รอการอนุมัติ</option>
        <option value="approved">ได้รับอนุมัติ</option>
        <option value="rejected">ไม่ผ่านการอนุมัติ</option>
        <option value="completed">เสร็จสิ้น</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
    </div>

    <!-- ไม่มีงาน -->
    <div
      v-else-if="!filteredJobs.length"
      class="flex flex-col items-center justify-center py-12 text-gray-500"
    >
      <i class="fas fa-folder-open text-6xl mb-4 text-gray-300"></i>
      <p class="text-lg">ยังไม่มีงานที่สมัคร</p>
    </div>

    <!-- รายการงาน -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <div
        v-for="job in filteredJobs"
        :key="job.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all p-4"
      >
        <div class="space-y-2">
          <!-- ชื่อและรายละเอียดงาน -->
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ job.title }}
            </h3>
            <button
              class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
              @click="showAdminContact(job.creator)"
            >
              <i class="fas fa-headset mr-1"></i>
              ติดต่อ
            </button>
          </div>
          <p class="text-gray-500 dark:text-gray-400">
            <i class="fas fa-map-marker-alt text-indigo-500 mr-2"></i>
            {{ job.location }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <i class="fas fa-calendar-alt text-indigo-500 mr-2"></i>
            {{ jobStore.formatDate(job.work_date) }}
            <span class="mx-2">•</span>
            <i class="fa-solid fa-circle-info text-indigo-500 mr-2"></i>
            {{ job.job_details }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <i class="fas fa-user-tie text-indigo-500 mr-2"></i>
            ตำแหน่ง: {{ job.position }}
            <span class="mx-2">•</span>
            <i class="fas fa-coins text-indigo-500 mr-2"></i>
            ค่าจ้าง: {{ jobStore.formatNumber(job.wage) }} บาท
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <i class="fa-solid fa-circle-info text-indigo-500 mr-2"></i>
            {{ job.position_details }}
          </p>

          <!-- สถานะ -->
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-300">สถานะ</span>
              <span :class="getStatusTextColor(job.status)">{{ getStatusText(job.status) }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :class="getProgressBarClass(job.status)"
                :style="{ width: getProgressWidth(job.status) }"
                class="h-full transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <!-- ปุ่มดูคะแนน -->
        <div v-if="job.status === 'completed' && job.evaluation" class="mt-4">
          <button
            @click="showEvaluation(job)"
            class="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
          >
            <i class="fas fa-star mr-2"></i>
            ดูผลการประเมิน
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- เพิ่ม Modal สำหรับแสดงข้อมูลติดต่อ -->
  <div
    v-if="showContactModal"
    class="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center modal backdrop-blur-sm"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        ข้อมูลติดต่อผู้ประสานงาน
      </h3>
      <div class="space-y-3">
        <p class="text-gray-600 dark:text-gray-400">
          <i class="fas fa-user text-indigo-500 mr-2"></i>
          {{ selectedAdmin?.first_name }} {{ selectedAdmin?.last_name }}
        </p>
        <p class="text-gray-600 dark:text-gray-400">
          <i class="fas fa-phone-alt text-indigo-500 mr-2"></i>
          {{ selectedAdmin?.phone }}
        </p>
      </div>
      <button
        @click="closeAdminContact"
        class="mt-6 w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
      >
        ปิด
      </button>
    </div>
  </div>
  <JobEvaluationModal
    :show="showEvaluationModal"
    :job="selectedJob"
    :evaluation="selectedJob?.evaluation"
    @close="closeEvaluation"
  />
</template>

<script>
import { useJobStore } from '@/stores/jobStore'
import JobEvaluationModal from '@/components/Users/JobEvaluationModal.vue'

export default {
  name: 'MyJobs',
  components: {
    JobEvaluationModal
  },
  data() {
    return {
      selectedStatus: 'all',
      jobStore: useJobStore(),
      showEvaluationModal: false,
      selectedJob: null,
      showContactModal: false,
      selectedAdmin: null
    }
  },

  computed: {
    loading() {
      return this.jobStore.loading
    },

    myJobs() {
      return this.jobStore.myJobs
    },
    filteredJobs() {
      if (this.selectedStatus === 'all') return this.myJobs
      return this.myJobs.filter((job) => job.status === this.selectedStatus)
    }
  },

  methods: {
    async fetchMyJobs() {
      try {
        await this.jobStore.fetchMyJobs()
      } catch (error) {
        console.error('Error fetching my jobs:', error)
      }
    },

    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
        case 'approved':
          return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
        case 'rejected':
          return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
        case 'completed':
          return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    },

    getStatusText(status) {
      const texts = {
        pending: 'รอการอนุมัติ',
        approved: 'ได้รับอนุมัติ',
        rejected: 'ไม่ผ่านการอนุมัติ',
        completed: 'เสร็จสิ้น'
      }
      return texts[status] || status
    },
    getProgressBarClass(status) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-500'
        case 'approved':
          return 'bg-blue-500'
        case 'rejected':
          return 'bg-red-500'
        case 'completed':
          return 'bg-green-500'
        default:
          return 'bg-gray-500'
      }
    },

    getProgressWidth(status) {
      return (
        {
          pending: '25%',
          approved: '50%',
          rejected: '100%',
          completed: '100%'
        }[status] || '0%'
      )
    },

    getStatusTextColor(status) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'text-yellow-500'
        case 'approved':
          return 'text-blue-500'
        case 'rejected':
          return 'text-red-500'
        case 'completed':
          return 'text-green-500'
        default:
          return 'text-gray-500'
      }
    },

    showEvaluation(job) {
      this.selectedJob = job
      this.showEvaluationModal = true
    },

    closeEvaluation() {
      this.showEvaluationModal = false
      this.selectedJob = null
    },
    showAdminContact(admin) {
      this.selectedAdmin = admin
      this.showContactModal = true
    },

    closeAdminContact() {
      this.showContactModal = false
      this.selectedAdmin = null
    },
    getScoreLabel(type) {
      return (
        {
          appearance_score: 'การแต่งกาย',
          quality_score: 'คุณภาพงาน',
          quantity_score: 'ปริมาณงาน',
          manner_score: 'มารยาท',
          punctuality_score: 'การตรงต่อเวลา'
        }[type] || type
      )
    },

    getTotalScoreClass(score) {
      if (score >= 4) return 'text-green-500 font-semibold'
      if (score >= 3) return 'text-blue-500 font-semibold'
      if (score >= 2) return 'text-yellow-500 font-semibold'
      return 'text-red-500 font-semibold'
    }
  },

  created() {
    this.fetchMyJobs()
  }
}
</script>
