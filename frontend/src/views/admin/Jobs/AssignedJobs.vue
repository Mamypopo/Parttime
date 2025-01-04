<template>
  <div class="p-4 space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">งานที่ได้รับมอบหมาย</h2>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="block text-sm font-medium mb-1">ค้นหา</label>
          <input
            type="text"
            v-model="searchTerm"
            placeholder="ค้นหาตามชื่องาน..."
            class="form-input w-full"
          />
        </div>
        <div class="form-group">
          <label class="block text-sm font-medium mb-1">สถานะ</label>
          <select v-model="selectedStatus" class="form-select w-full">
            <option value="">ทั้งหมด</option>
            <option value="published">รอดำเนินการ</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="completed">เสร็จสิ้น</option>
          </select>
        </div>
        <div class="form-group">
          <label class="block text-sm font-medium mb-1">บทบาท</label>
          <select v-model="selectedRole" class="form-select w-full">
            <option value="">ทั้งหมด</option>
            <option value="manager">ผู้จัดการ</option>
            <option value="evaluator">ผู้ประเมิน</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Job List -->
    <div v-if="!jobStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in filteredJobs"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
      >
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-semibold">{{ item?.job?.title }}</h3>
          <span :class="getStatusClass(item?.job?.status)" class="text-xs px-2 py-1 rounded-full">
            {{ getStatusText(item?.job?.status) }}
          </span>
        </div>

        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p class="flex items-center">
            <i class="fas fa-calendar-alt w-5"></i>
            {{ jobStore.formatDate(item?.job?.work_date) }}
          </p>
          <p class="flex items-center">
            <i class="fas fa-clock w-5"></i>
            {{ jobStore.formatTime(item?.job?.start_time) }} -
            {{ jobStore.formatTime(item?.job?.end_time) }}
          </p>
          <p class="flex items-center">
            <i class="fas fa-map-marker-alt w-5"></i>
            {{ item?.job?.location }}
          </p>
          <p class="flex items-center">
            <i class="fas fa-user-tag w-5"></i>
            {{ item?.role === 'manager' ? 'ผู้จัดการ' : 'ผู้ประเมิน' }}
          </p>
          <div class="flex space-x-2 mt-4">
            <button
              @click="viewJobDetails(item)"
              class="p-2 text-[#A7F3D0] hover:text-[#6EE7B7] dark:text-[#81E6A9] dark:hover:text-[#4ADE80] rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
              title="ดูรายละเอียดงาน"
            >
              <i class="fas fa-eye"></i>
            </button>

            <button
              @click="openEvaluation(item)"
              class="p-2 text-[#93C5FD] hover:text-[#60A5FA] dark:text-[#7DAEF8] dark:hover:text-[#3B82F6] rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
              title="ประเมินคะแนน"
            >
              <i class="fas fa-star"></i>
            </button>
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
  </div>
</template>

<script>
import { useJobStore } from '@/stores/jobStore'
import JobDetailsModal from '@/components/admin/Jobs/JobDetailModal.vue'
import UpdateWorkStatusModal from '@/components/admin/Jobs/UpdateWorkStatusModal.vue'

export default {
  name: 'AssignedJobs',

  components: {
    JobDetailsModal,
    UpdateWorkStatusModal
  },

  data() {
    return {
      jobs: [],
      searchTerm: '',
      selectedStatus: '',
      selectedRole: '',
      showDetailsModal: false,
      showEvaluationModal: false,
      selectedJob: null
    }
  },

  computed: {
    filteredJobs() {
      return this.jobs
    },

    jobStore() {
      return useJobStore()
    }
  },
  async created() {
    // โหลดข้อมูลงานเมื่อ component ถูกสร้าง
    await this.jobStore.fetchJobsAndParticipants()
  },
  methods: {
    async fetchJobs() {
      try {
        const filters = {
          search: this.searchTerm,
          status: this.selectedStatus,
          role: this.selectedRole
        }
        const response = await this.jobStore.fetchAssignedJobs(filters)
        this.jobs = response?.data?.data || []
      } catch (error) {
        console.error('Error fetching assigned jobs:', error)
        this.jobs = [] // กำหนดเป็น array ว่างเมื่อเกิด error
      }
    },

    getStatusClass(status) {
      const classes = {
        published: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800'
      }
      return classes[status] || ''
    },

    getStatusText(status) {
      const texts = {
        published: 'รอดำเนินการ',
        in_progress: 'กำลังดำเนินการ',
        completed: 'เสร็จสิ้น'
      }
      return texts[status] || status
    },
    async viewJobDetails(job) {
      // รีโหลดข้อมูลงานก่อนแสดง modal
      await this.jobStore.fetchJobsAndParticipants()
      this.selectedJob = this.jobStore.jobs.find((j) => j.id === job.id)
      this.showDetailsModal = true
    },

    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedJob = null
    },

    async openEvaluation(job) {
      console.log('Opening evaluation for job:', job)
      // เปลี่ยนมาใช้ job_id แทน job.job.id
      await this.jobStore.fetchAssignedJobsAndParticipants()
      const foundJob = this.jobStore.jobs.find((j) => j.id === job.job_id)

      console.log('Found job:', foundJob)
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
    }
  },

  watch: {
    searchTerm() {
      this.fetchJobs()
    },
    selectedStatus() {
      this.fetchJobs()
    },
    selectedRole() {
      this.fetchJobs()
    }
  },

  mounted() {
    this.fetchJobs()
  }
}
</script>
