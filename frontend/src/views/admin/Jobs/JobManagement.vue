<template>
  <div class="p-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h3 class="text-gray-500 text-sm">งานทั้งหมด</h3>
        <p class="text-2xl font-semibold mt-2">{{ totalJobs }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h3 class="text-gray-500 text-sm">ประกาศรับสมัคร</h3>
        <p class="text-2xl font-semibold text-[#7BC4C4] mt-2">{{ pendingJobs }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h3 class="text-gray-500 text-sm">กำลังดำเนินการ</h3>
        <p class="text-2xl font-semibold text-[#F0B429] mt-2">{{ inProgressJobs }}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h3 class="text-gray-500 text-sm">เสร็จสิ้น</h3>
        <p class="text-2xl font-semibold text-[#81E2C4] mt-2">{{ completedJobs }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-sm">
      <!-- Header -->
      <div class="p-5 border-b">
        <div class="flex justify-between items-center overflow-hidden">
          <h2 class="text-xl font-semibold text-gray-800">จัดการงาน</h2>
        </div>
        <JobSearch @search="handleSearch" @clear="handleClear" />
      </div>

      <!-- Job Cards Grid -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Loading State -->
          <div v-if="loading" class="col-span-full flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!jobs.length" class="col-span-full text-center py-12">
            <i class="fas fa-clipboard-list text-4xl mb-4 text-[#EABF71]"></i>
            <p class="text-gray-500">ไม่พบข้อมูลงาน</p>
          </div>

          <!-- Job Cards -->
          <div
            v-else
            v-for="job in jobs"
            :key="job.id"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border overflow-hidden"
          >
            <!-- Card Header -->
            <div class="p-4 border-b">
              <div class="flex justify-between items-start flex-wrap sm:flex-nowrap">
                <div>
                  <h3 class="font-medium text-gray-900">{{ job.title }}</h3>
                  <p class="text-sm text-gray-500 mt-1">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    {{ job.location }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="viewJobDetails(job)"
                    class="p-2 text-[#7BC4C4] hover:text-[#5DA3A3] rounded-full hover:bg-gray-50"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="handleOpenEditModal(job)"
                    class="p-2 text-[#81E2C4] hover:text-[#5DC4A7] rounded-full hover:bg-gray-50"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmDelete(job)"
                    class="p-2 text-[#E98585] hover:text-[#da7171] rounded-full hover:bg-gray-50"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="px-4 py-3">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-gray-600">สถานะงาน</span>
                <span :class="getStatusClass(getJobStatus(job))">
                  {{ getStatusText(getJobStatus(job)) }}
                </span>
              </div>
              <div class="relative pt-1">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="h-2.5 rounded-full transition-all duration-500"
                    :class="getProgressBarClass(job)"
                    :style="{ width: getProgressWidth(job) }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-4 space-y-3">
              <div class="flex items-center text-sm text-gray-600">
                <i class="far fa-calendar-alt w-5"></i>
                <span>{{ formatDate(job.work_date) }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="far fa-clock w-5"></i>
                <span>{{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}</span>
              </div>

              <!-- เปิด modal อัพเดทสถานะ -->
              <div v-if="getJobStatus(job) === 'completed'" class="mt-4">
                <button
                  @click="openWorkStatusModal(job)"
                  class="w-full px-4 py-2 text-sm bg-[#81E2C4] text-white rounded-lg hover:bg-opacity-80"
                >
                  <i class="fas fa-clipboard-check mr-2"></i>
                  อัพเดทสถานะการทำงาน
                  <span v-if="getCompletedWorkCount(job) > 0" class="ml-1">
                    (ประเมินแล้ว {{ getCompletedWorkCount(job) }})
                  </span>
                </button>
              </div>

              <!-- Positions -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="position in job.JobPositions"
                  :key="position.id"
                  class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600"
                >
                  {{ position.position_name }}
                </span>
              </div>

              <!--  แสดงจำนวนผู้สมัคร -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- แสดงจำนวนรอดำเนินการ -->
                  <span class="text-sm text-gray-600">
                    <i class="fas fa-user-clock text-yellow-500"></i>
                    รอดำเนินการ: {{ getPendingCount(job) }}
                    <span
                      v-if="hasNewParticipants(job) > 0"
                      class="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse"
                    >
                      ใหม่
                    </span>
                  </span>
                  <!-- แสดงจำนวนอนุมัติแล้ว -->
                  <span class="text-sm text-gray-600">
                    <i class="fas fa-user-check text-green-500"></i>
                    อนุมัติแล้ว: {{ getApprovedCount(job) }}
                  </span>
                </div>
              </div>

              <!-- Participants -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex -space-x-2 overflow-hidden" v-if="job.JobParticipation?.length">
                    <img
                      v-for="participant in job.JobParticipation.slice(0, 3)"
                      :key="participant.user.id"
                      :src="getProfileImage(participant.user.profile_image)"
                      :alt="participant.user.first_name"
                      class="w-8 h-8 rounded-full border-2 border-white"
                    />
                    <span
                      v-if="job.JobParticipation.length > 3"
                      class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                    >
                      <span class="text-xs text-gray-600"
                        >+{{ job.JobParticipation.length - 3 }}</span
                      >
                    </span>
                  </div>
                  <button
                    @click="openParticipantsModal(job)"
                    class="ml-3 text-sm"
                    :class="[
                      getPendingCount(job) > 0
                        ? 'bg-[#7BC4C4] text-white px-3 py-1 rounded-lg hover:bg-[#5DA3A3]'
                        : 'text-[#7BC4C4] hover:text-[#5DA3A3]'
                    ]"
                  >
                    <template v-if="getPendingCount(job) > 0">
                      จัดการผู้สมัคร ({{ getPendingCount(job) }})
                    </template>
                    <template v-else-if="job.JobParticipation?.length">
                      ดูผู้สมัครทั้งหมด ({{ job.JobParticipation.length }})
                    </template>
                    <template v-else>
                      <i class="fas fa-user-plus mr-2"></i>
                      ยังไม่มีผู้สมัคร
                    </template>
                  </button>
                </div>
                <div class="text-right">
                  <p class="text-[#6ED7D1] font-medium">
                    {{ calculateTotalWage(job) }}
                    <span class="text-[#969696]">บาท</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Participants Modal -->
    <ParticipantsModal
      v-if="showParticipantsModal && selectedJob"
      :show="showParticipantsModal"
      :job="selectedJob"
      @close="closeParticipantsModal"
      @approve="handleApprove"
      @reject="handleReject"
    />
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

    <UpdateWorkStatusModal
      v-if="showWorkStatusModal"
      :show="showWorkStatusModal"
      :job="selectedJob"
      @close="closeWorkStatusModal"
      @update="handleUpdateWorkStatus"
    />
  </div>
</template>
<script>
import { useJobStore } from '@/stores/jobStore'
import ParticipantsModal from '@/components/admin/Jobs/ParticipantsModal.vue'
import JobDetailsModal from '@/components/admin/Jobs/JobDetailModal.vue'
import EditJobModal from '@/components/admin/Jobs/EditJobModal.vue'
import UpdateWorkStatusModal from '@/components/admin/Jobs/UpdateWorkStatusModal.vue'
import JobSearch from '@/components/Search/JobSearch.vue'

import Swal from 'sweetalert2'

export default {
  name: 'JobManagement',
  components: {
    ParticipantsModal,
    EditJobModal,
    JobDetailsModal,
    JobSearch,
    UpdateWorkStatusModal
  },

  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      jobToDelete: null,
      selectedJob: null,
      showDetailsModal: false,
      showParticipantsModal: false,
      showWorkStatusModal: false,
      showEditModal: false,
      searchFilters: {
        search: '',
        status: '',
        date: null
      },
      jobParticipants: []
    }
  },
  watch: {
    // เมื่อมีการเปลี่ยนแปลงใน jobs หรือ participants
    async '$store.state.job.jobs'() {
      await this.jobStore.fetchJobsAndParticipants()
    }
  },
  computed: {
    jobStore() {
      return useJobStore()
    },
    jobs() {
      return this.jobStore.jobs || []
    },
    loading() {
      return this.jobStore.loading
    },
    currentPage() {
      return this.jobStore.pagination.currentPage
    },
    totalPages() {
      return this.jobStore.pagination.totalPages
    },
    participants() {
      return this.jobStore.jobsWithParticipants || []
    },
    totalJobs() {
      return this.jobs.length
    },
    pendingJobs() {
      return this.jobs.filter((job) => this.getJobStatus(job) === 'published').length
    },

    inProgressJobs() {
      return this.jobs.filter((job) => this.getJobStatus(job) === 'in_progress').length
    },

    completedJobs() {
      return this.jobs.filter((job) => this.getJobStatus(job) === 'completed').length
    }
  },
  // เรียกใช้ loadInitialData เพื่อโหลดข้อมูลเมื่อคอมโพเนนต์ถูกสร้างขึ้น
  created() {
    this.loadInitialData()
  },

  beforeUnmount() {
    // เคลียร์ข้อมูลใน store เมื่อคอมโพเนนต์กำลังจะถูกทำลาย
    this.jobStore.resetStore()
  },
  async mounted() {
    try {
      await this.jobStore.fetchJobsAndParticipants()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถโหลดข้อมูลได้',
        confirmButtonText: 'ตกลง'
      })
    }
  },

  methods: {
    // ดึงข้อมูลงานและผู้สมัครจาก store
    async fetchJobsAndParticipants() {
      try {
        await this.jobStore.fetchJobsAndParticipants() // จัดการ loading state ใน store
      } catch (error) {
        this.showError('ไม่สามารถโหลดข้อมูลงานได้')
      }
    },
    //คืนค่าสถานะของงานตามวันเวลาปัจจุบันและวันที่ทำงานของงาน
    getJobStatus(job) {
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
    },

    getStatusClass(status) {
      const classes = {
        published: 'text-blue-600 bg-blue-100',
        in_progress: 'text-yellow-600 bg-yellow-100',
        completed: 'text-green-600 bg-green-100'
      }
      return `px-2 py-1 rounded-full text-xs ${classes[status]}`
    },

    getStatusText(status) {
      const texts = {
        published: 'ประกาศรับสมัคร',
        in_progress: 'กำลังดำเนินงาน',
        completed: 'เสร็จสิ้น'
      }
      return texts[status]
    },

    getProgressBarClass(job) {
      const status = this.getJobStatus(job)
      const classes = {
        published: 'bg-blue-500',
        in_progress: 'bg-yellow-500',
        completed: 'bg-green-500'
      }
      return classes[status]
    },

    getProgressWidth(job) {
      const status = this.getJobStatus(job)
      const widths = {
        published: '33%',
        in_progress: '66%',
        completed: '100%'
      }
      return widths[status]
    },
    // อนุมัติผู้สมัครและเรียก loadJobs
    async handleApprove(participationId) {
      try {
        await this.jobStore.approveOrRejectParticipation(participationId, 'approved')
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'อนุมัติผู้สมัครสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        })
        await this.loadJobs()
        this.closeParticipantsModal()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถอนุมัติผู้สมัครได้'
        })
      }
    },

    async handleReject(participationId) {
      try {
        await this.jobStore.approveOrRejectParticipation(participationId, 'rejected')
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'ปฏิเสธผู้สมัครสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        })
        await this.loadJobs()
        this.closeParticipantsModal()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถปฏิเสธผู้สมัครได้'
        })
      }
    },
    async loadJobs() {
      try {
        await this.jobStore.fetchJobsAndParticipants()

        // อัพเดท selectedJob ถ้ามีการเลือกอยู่
        if (this.selectedJob) {
          this.selectedJob = this.jobStore.jobs.find((job) => job.id === this.selectedJob.id)
        }
      } catch (error) {
        console.error('Failed to load jobs:', error)
      }
    },

    async handleEditJob(jobData) {
      try {
        await this.jobStore.editJob(jobData.id, jobData)

        Swal.fire({
          icon: 'success',
          title: 'แก้ไขงานสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })

        // รีโหลดข้อมูลงานใหม่
        await this.jobStore.fetchJobsAndParticipants()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถแก้ไขงานได้',
          confirmButtonText: 'ตกลง'
        })
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
            await this.jobStore.deleteJob(job.id)

            Swal.fire({
              title: 'ลบงานสำเร็จ',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            })

            // รีโหลดข้อมูลงานใหม่
            await this.jobStore.fetchJobsAndParticipants()
          } catch (error) {
            Swal.fire({
              title: 'เกิดข้อผิดพลาด',
              text: error.response?.data?.message || 'ไม่สามารถลบงานได้',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            })
          }
        }
      })
    },

    async handleSearch(filters) {
      try {
        // อัพเดท filters ใน store
        await this.jobStore.updateSearchFilters(filters)

        // เรียกข้อมูลใหม่
        await this.jobStore.fetchJobsAndParticipants()
      } catch (error) {
        console.error('Error searching jobs:', error)
        // แสดง error message
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถค้นหาข้อมูลได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    async handleClear() {
      try {
        // เคลียร์ filters ใน store
        this.jobStore.clearSearchFilters()

        // เรียกข้อมูลใหม่
        await this.jobStore.fetchJobsAndParticipants()
      } catch (error) {
        console.error('Error clearing search:', error)
        // แสดง error message
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถรีเซ็ตการค้นหาได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    // สำหรับโหลดข้อมูลครั้งแรก
    async loadInitialData() {
      try {
        await this.jobStore.fetchJobsAndParticipants(this.searchFilters)
      } catch (error) {
        this.showError(error.message || 'ไม่สามารถโหลดข้อมูลงานได้')
      }
    },
    changePage(page) {
      this.jobStore.changePage(page)
    },

    // การนับต่าง ๆ
    hasNewParticipants(job) {
      return job.JobPositions?.some((position) =>
        position.JobParticipation?.some((p) => this.jobStore.newParticipations.has(p.id))
      )
    },

    getPendingCount(job) {
      return (
        job.JobPositions?.reduce((count, position) => {
          return (
            count + (position.JobParticipation?.filter((p) => p.status === 'pending').length || 0)
          )
        }, 0) || 0
      )
    },

    // นับจำนวนผู้สมัครที่อนุมัติแล้ว
    getApprovedCount(job) {
      return (
        job.JobPositions?.reduce((count, position) => {
          return (
            count + (position.JobParticipation?.filter((p) => p.status === 'approved').length || 0)
          )
        }, 0) || 0
      )
    },

    // นับจำนวนผู้สมัครทั้งหมด
    getTotalApplicants(job) {
      return (
        job.JobPositions?.reduce((count, position) => {
          return count + (position.JobParticipation?.length || 0)
        }, 0) || 0
      )
    },
    // เพิ่มเมธอดสำหรับนับจำนวนคนที่ได้รับการประเมินแล้ว
    getCompletedWorkCount(job) {
      return (
        job.JobPositions?.reduce((count, position) => {
          return (
            count +
            (position.JobParticipation?.filter((p) => p.status === 'approved' && p.work_status)
              .length || 0)
          )
        }, 0) || 0
      )
    },

    openWorkStatusModal(job) {
      this.selectedJob = job
      this.showWorkStatusModal = true
    },

    closeWorkStatusModal() {
      this.showWorkStatusModal = false
      this.selectedJob = null
    },

    async handleUpdateWorkStatus(data) {
      try {
        await this.jobStore.updateWorkStatus(data.participationId, {
          rating: data.rating,
          comment: data.comment
        })

        this.closeWorkStatusModal()
        Swal.fire({
          icon: 'success',
          title: 'บันทึกการประเมินสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกการประเมินได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    openParticipantsModal(job) {
      // เมื่อเปิดดูรายชื่อ ให้ mark ทุกคนในงานนี้เป็น viewed
      job.JobPositions?.forEach((position) => {
        position.JobParticipation?.forEach((p) => {
          this.jobStore.markAsViewed(p.id)
        })
      })

      this.selectedJob = job
      this.showParticipantsModal = true
    },
    closeParticipantsModal() {
      this.showParticipantsModal = false
      this.selectedJob = null
    },

    viewJobDetails(job) {
      this.selectedJob = job
      this.showDetailsModal = true
    },

    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedJob = null
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
      return this.jobStore.formatDate(date)
    },

    formatTime(time) {
      return this.jobStore.formatTime(time)
    },

    getProfileImage(image) {
      return this.jobStore.getProfileImage(image)
    },

    calculateTotalWage(job) {
      return this.jobStore.calculateTotalWage(job)
    }
  }
}
</script>
