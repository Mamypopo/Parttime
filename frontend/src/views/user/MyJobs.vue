<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div
      class="flex justify-between items-center bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white py-4 px-6 rounded-lg shadow-md"
    >
      <h1 class="text-2xl sm:text-3xl font-semibold">งานของฉัน</h1>

      <select
        v-model="selectedStatus"
        class="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
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
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
        style="border-color: #4bc0c8 transparent #c779d0 transparent"
      ></div>
    </div>

    <!-- ไม่มีงาน -->
    <div v-else-if="!filteredJobs.length" class="flex flex-col items-center justify-center py-12">
      <i
        class="fas fa-folder-open text-6xl mb-4 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-transparent bg-clip-text"
      ></i>
      <p class="text-lg text-gray-500 dark:text-gray-400">ยังไม่มีงานที่สมัคร</p>
    </div>

    <!-- รายการงาน -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <div
        v-for="job in filteredJobs"
        :key="job.id"
        class="p-4 group bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#c779d0]/50 dark:hover:border-[#4bc0c8]/50 hover:shadow-lg hover:shadow-[#c779d0]/10 dark:hover:shadow-[#4bc0c8]/10"
      >
        <div class="space-y-2">
          <!-- ชื่อและรายละเอียดงาน -->
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ job.title }}
            </h3>
            <button
              class="text-sm flex items-center text-[#4bc0c8] hover:text-[#c779d0] dark:text-[#4bc0c8]/70 dark:hover:text-[#c779d0]/70 transition-colors"
              @click="showAdminContact(job.creator)"
            >
              <i class="fas fa-headset mr-1"></i>
              ติดต่อ
            </button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <i class="fas fa-map-marker-alt mr-2 text-[#c779d0] dark:text-[#c779d0]/70"></i>
            {{ job.location }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <i class="fas fa-calendar-alt mr-2 text-[#feac5e] dark:text-[#feac5e]/70"></i>
            {{ jobStore.formatDate(job.work_date) }}
            <span class="mx-2">•</span>
            <i class="fa-solid fa-clock mr-2 text-[#feac5e] dark:text-[#feac5e]/70"></i>
            {{ jobStore.formatTimeRange(job.start_time, job.end_time) }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <i class="fas fa-user-tie mr-2 text-[#c779d0] dark:text-[#c779d0]/70"></i>
            ตำแหน่ง: {{ job.position }}
            <span class="mx-2">•</span>
            <i class="fa-solid fa-circle-info mr-2 text-[#4bc0c8] dark:text-[#4bc0c8]/70"></i>
            {{ job.job_details }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <i class="fa-solid fa-circle-info mr-2 text-[#4bc0c8] dark:text-[#4bc0c8]/70"></i>
            {{ job.position_details }}
            <span class="mx-2">•</span>
            <i class="fas fa-coins mr-2 text-[#feac5e] dark:text-[#feac5e]/70"></i>
            ค่าจ้าง: {{ jobStore.formatNumber(job.wage) }} บาท
          </p>

          <!-- สถานะ -->
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-300">สถานะ</span>
              <span :class="getStatusTextColor(job.status)">{{ getStatusText(job.status) }}</span>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
            class="w-full py-2 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-lg shadow-md hover:opacity-90 transition-all duration-200"
          >
            <i class="fas fa-star mr-2 text-white"></i>
            ดูผลการประเมิน
          </button>
        </div>
        <!-- ปุ่มยกเลิก -->
        <div v-if="job.status === 'pending'" class="mt-4">
          <button
            @click="cancelApplication(job.id, job.job_position_id)"
            class="w-full py-2 bg-red-500 text-white rounded-lg shadow-md hover:opacity-90 transition-all duration-200 dark:bg-red-600 dark:text-white"
          >
            <i class="fas fa-times-circle mr-2"></i>
            ยกเลิกคำขอ
          </button>
        </div>
      </div>
    </div>
  </div>

  <!--  Modal สำหรับแสดงข้อมูลติดต่อ -->
  <div
    v-if="showContactModal"
    class="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center modal"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700 shadow-lg shadow-[#c779d0]/10 dark:shadow-[#4bc0c8]/10"
    >
      <h3 class="text-lg font-semibold mb-4">
        <span
          class="bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-transparent bg-clip-text"
        >
          ข้อมูลติดต่อผู้ประสานงาน
        </span>
      </h3>
      <div class="space-y-3">
        <p class="text-gray-600 dark:text-gray-400">
          <i class="fas fa-user mr-2 text-[#c779d0] dark:text-[#c779d0]/70"></i>
          {{ selectedAdmin?.first_name }} {{ selectedAdmin?.last_name }}
        </p>
        <p class="text-gray-600 dark:text-gray-400">
          <i class="fas fa-phone-alt mr-2 text-[#4bc0c8] dark:text-[#4bc0c8]/70"></i>
          {{ selectedAdmin?.phone }}
        </p>
      </div>
      <button
        @click="closeAdminContact"
        class="mt-6 w-full py-2 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-lg hover:opacity-90 transition-all duration-200"
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
import Swal from 'sweetalert2'
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
      let jobs =
        this.selectedStatus === 'all'
          ? this.myJobs
          : this.myJobs.filter((job) => job.status === this.selectedStatus)

      // เรียงลำดับตามวันที่งาน จากวันที่ใกล้ที่สุดไปไกลที่สุด
      return jobs.sort((a, b) => new Date(a.work_date) - new Date(b.work_date))
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

    // ฟังชั่นยกเลิกสมัครงาน
    async cancelApplication(jobId, jobPositionId) {
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'กรุณาพิมพ์ "ยืนยัน" เพื่อยืนยันการยกเลิกคำขอ',
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'พิมพ์ "ยืนยัน"',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ยกเลิกเลย!',
        cancelButtonText: 'ยกเลิก',
        preConfirm: (inputValue) => {
          if (inputValue !== 'ยืนยัน') {
            Swal.showValidationMessage('กรุณาพิมพ์ "ยืนยัน" ให้ถูกต้อง')
          }
        }
      })

      if (result.isConfirmed) {
        try {
          await this.jobStore.cancelJobApplication(jobId, jobPositionId)
          Swal.fire('ยกเลิกแล้ว!', 'คำขอของคุณถูกยกเลิกเรียบร้อย.', 'success')
          this.fetchMyJobs()
        } catch (error) {
          console.error('Error cancelling application:', error)
          Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถยกเลิกคำขอได้.', 'error')
        }
      }
    },

    getStatusText(status) {
      const texts = {
        pending: 'รอการอนุมัติ',
        approved: 'ได้รับอนุมัติ',
        rejected: 'ไม่ผ่านการอนุมัติ',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก'
      }
      return texts[status] || status
    },
    getProgressBarClass(status) {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-500 shadow-md shadow-yellow-300 border border-yellow-400'
        case 'approved':
          return 'bg-blue-500 shadow-md shadow-blue-300 border border-blue-400'
        case 'rejected':
          return 'bg-red-500 shadow-md shadow-red-300 border border-red-400'
        case 'completed':
          return 'bg-green-500 shadow-md shadow-green-300 border border-green-400'
        case 'cancelled':
          return 'bg-gradient-to-br from-[#EB5757] to-[#C0392B] shadow-lg shadow-red-400/70 border border-red-600'
        default:
          return 'bg-gray-500 shadow-md shadow-gray-300 border border-gray-400'
      }
    },

    getProgressWidth(status) {
      return (
        {
          pending: '25%',
          approved: '50%',
          rejected: '100%',
          completed: '100%',
          cancelled: '100%'
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
        case 'cancelled':
          return 'text-[#EB5757]'
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
