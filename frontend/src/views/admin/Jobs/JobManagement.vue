<template>
  <div class="mb-4 p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
          >
            จัดการงาน
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">จัดการและดูรายละเอียดงานทั้งหมด</p>
        </div>
        <div class="flex gap-2">
          <!-- เพิ่ม div ครอบปุ่ม -->
          <!-- ปุ่มรีเฟรช -->
          <button
            @click="refreshJobs"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <i class="fas fa-sync-alt mr-2"></i>รีเฟรช
          </button>

          <!-- ปุ่มสร้างงานใหม่ -->
          <router-link
            to="/admin/create-job"
            class="px-4 py-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <i class="fas fa-plus mr-2"></i>สร้างงานใหม่
          </router-link>
        </div>
      </div>
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">งานทั้งหมด</div>
          <div class="text-2xl font-bold text-[#9333EA] dark:text-purple-400">
            {{ jobStore.totalJobs }}
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">ประกาศรับสมัคร</div>
          <div class="text-2xl font-bold text-[#3B82F6] dark:text-blue-400">
            {{ jobStore.pendingJobs }}
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">กำลังดำเนินการ</div>
          <div class="text-2xl font-bold text-[#EAB308] dark:text-yellow-400">
            {{ jobStore.inProgressJobs }}
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">เสร็จสิ้น</div>
          <div class="text-2xl font-bold text-[#22C55E] dark:text-green-400">
            {{ jobStore.completedJobs }}
          </div>
        </div>
      </div>

      <!-- Search Bar with Animation -->
      <div class="mt-5 flex items-center gap-2">
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
    <div class="rounded-2xl">
      <!-- Job Cards Grid -->
      <div class="p-1">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Loading State -->
          <div v-if="loading" class="col-span-full flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="jobs.length === 0"
            class="col-span-full flex flex-col shadow-lg items-center justify-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl dark:border dark:border-gray-700"
          >
            <i class="fas fa-clipboard-list text-4xl mb-4 text-[#EABF71] dark:text-[#D4A85C]"></i>
            <p class="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลงาน</p>
          </div>

          <!-- Job Cards -->
          <div
            v-else
            v-for="job in jobs"
            :key="job.id"
            class="bg-white dark:bg-gray-800 rounded-2xl hover:scale-[1.01]shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <!-- Card Header -->
            <div class="p-4 border-b dark:border-gray-700">
              <div class="flex justify-between items-start flex-wrap sm:flex-nowrap">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-gray-100">{{ job.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    {{ job.location }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="viewJobDetails(job)"
                    class="p-2 text-[#7BC4C4] hover:text-[#5DA3A3] dark:text-[#7BC4C4] dark:hover:text-[#5DA3A3] rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="handleOpenEditModal(job)"
                    class="p-2 text-[#81E2C4] hover:text-[#5DC4A7] rounded-full dark:text-[#81E2C4] dark:hover:text-[#5DC4A7] hover:bg-gray-50"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmDelete(job)"
                    class="p-2 text-[#E98585] hover:text-[#da7171] dark:text-[#E98585] dark:hover:text-[#da7171] rounded-full hover:bg-gray-50"
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
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <i class="far fa-calendar-alt w-5"></i>
                <span>{{ formatDate(job.work_date) }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <i class="far fa-clock w-5"></i>
                <span>{{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}</span>
              </div>

              <!-- เปิด modal อัพเดทสถานะ -->
              <div v-if="getJobStatus(job) === 'completed'" class="mt-4">
                <button
                  @click="openWorkStatusModal(job)"
                  class="w-full px-4 py-2 text-sm bg-[#81E2C4] dark:bg-[#5DC4A7] text-white rounded-lg hover:bg-opacity-80 dark:hover:bg-opacity-90 transition-all duration-300"
                >
                  <i class="fas fa-clipboard-check mr-2"></i>
                  อัพเดทสถานะการทำงาน
                  <span
                    v-if="getCompletedWorkCount(job) > 0"
                    class="ml-1 text-white/90 dark:text-white/95"
                  >
                    (ประเมินแล้ว {{ getCompletedWorkCount(job) }})
                  </span>
                </button>
              </div>

              <!-- Positions -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="position in job.JobPositions"
                  :key="position.id"
                  class="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                >
                  {{ position.position_name }}
                </span>
              </div>

              <!-- Participants Info -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- แสดงจำนวนรอดำเนินการ -->
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    <i class="fas fa-user-clock text-yellow-500"></i>
                    รอดำเนินการ: {{ getPendingCount(job) }}
                    <span
                      v-if="hasNewParticipants(job) > 0"
                      class="ml-1 px-2 py-0.5 text-xs bg-red-500 dark:bg-red-600 text-white rounded-full animate-pulse"
                    >
                      ใหม่
                    </span>
                  </span>
                  <!-- แสดงจำนวนอนุมัติแล้ว -->
                  <span class="text-sm text-gray-600 dark:text-gray-400">
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
                  <p class="text-[#6ED7D1] dark:text-[#4CB3B3] font-medium">
                    {{ calculateTotalWage(job) }}
                    <span class="text-[#969696] dark:text-gray-400">บาท</span>
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
      @update="loadJobs"
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
    // สำหรับโหลดข้อมูลครั้งแรก
    async loadInitialData() {
      try {
        await this.jobStore.fetchJobsAndParticipants(this.searchFilters)
      } catch (error) {
        this.showError(error.message || 'ไม่สามารถโหลดข้อมูลงานได้')
      }
    },
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
        published: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
        in_progress: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
        completed: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
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
        published: 'bg-blue-500 dark:bg-blue-400',
        in_progress: 'bg-yellow-500 dark:bg-yellow-400',
        completed: 'bg-green-500 dark:bg-green-400'
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
        await this.loadJobs()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถแก้ไขงานได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    async confirmDelete(job) {
      try {
        // แจ้งเตือนเกี่ยวกับประวัติงาน
        const hasHistory = job.JobPositions?.some((pos) =>
          pos.JobParticipation?.some((p) => p.status === 'approved' || p.work_status)
        )

        if (hasHistory) {
          const firstAlert = await Swal.fire({
            title: 'คำเตือน!',
            html: `
          <div class="text-left">
            <p class="mb-3 text-red-500">⚠️ งานนี้มีประวัติการทำงานที่เกี่ยวข้อง:</p>
            <ul class="list-disc pl-5 mb-3 text-gray-600">
              <li>ประวัติการทำงานของผู้ใช้</li>
              <li>ข้อมูลการประเมินผล</li>
              <li>ประวัติการจ่ายค่าตอบแทน</li>
            </ul>
            <p class="font-semibold text-gray-700">คุณยังต้องการลบหรือไม่?</p>
          </div>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#3B82F6',
            confirmButtonText: 'ดำเนินการต่อ',
            cancelButtonText: 'ยกเลิก'
          })

          if (!firstAlert.isConfirmed) return

          // พิมพ์ยืนยัน
          const confirmText = `DELETE-${job.id}`
          const secondAlert = await Swal.fire({
            title: 'ยืนยันการลบ',
            html: `
          <p class="mb-4">พิมพ์ <strong class="text-red-500">${confirmText}</strong> เพื่อยืนยันการลบ</p>
          <p class="text-sm text-gray-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        `,
            input: 'text',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#3B82F6',
            confirmButtonText: 'ลบถาวร',
            cancelButtonText: 'ยกเลิก',
            preConfirm: (text) => {
              if (text !== confirmText) {
                Swal.showValidationMessage('กรุณาพิมพ์ข้อความให้ถูกต้อง')
              }
              return text
            }
          })

          if (!secondAlert.isConfirmed) return
        } else {
          // ถ้าไม่มีประวัติ ให้แสดงการยืนยันแบบปกติ
          const result = await Swal.fire({
            title: 'ยืนยันการลบงาน',
            text: `คุณต้องการลบงาน "${job.title}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#3B82F6',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
          })

          if (!result.isConfirmed) return
        }

        // ดำเนินการลบ
        await this.jobStore.deleteJob(job.id)

        Swal.fire({
          title: 'ลบงานสำเร็จ',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })

        await this.jobStore.fetchJobsAndParticipants()
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถลบงานได้',
          icon: 'error'
        })
      }
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

    changePage(page) {
      this.jobStore.changePage(page)
    },

    getPendingCount(job) {
      return this.jobStore.getPendingCount(job)
    },
    getApprovedCount(job) {
      return this.jobStore.getApprovedCount(job)
    },

    getTotalApplicants(job) {
      return this.jobStore.getTotalApplicants(job)
    },

    getCompletedWorkCount(job) {
      return this.jobStore.getCompletedWorkCount(job)
    },

    hasNewParticipants(job) {
      return this.jobStore.hasNewParticipants(job)
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
    },
    async refreshJobs() {
      try {
        // โหลดข้อมูลใหม่
        await this.jobStore.fetchJobsAndParticipants()
      } catch (error) {
        console.error('Error refreshing jobs:', error)
      }
    }
  }
}
</script>

<style></style>
