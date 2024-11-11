<template>
  <div class="p-4 md:p-6">
    <!-- Tabs -->
    <div class="mb-6">
      <nav class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentTab = tab.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium',
            currentTab === tab.value
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ tab.name }}
          <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-white">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 max-w-xs">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาจากชื่องาน..."
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>
        <div class="flex-1 max-w-xs">
          <select
            v-model="selectedJob"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          >
            <option value="">งานทั้งหมด</option>
            <option v-for="job in uniqueJobs" :key="job.id" :value="job.id">
              {{ job.title }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"
      ></div>
      <p class="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredApplicants.length" class="bg-white rounded-lg p-12 text-center">
      <div class="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
        <i class="fas fa-users text-3xl text-gray-400"></i>
      </div>
      <p class="mt-4 text-gray-500">ไม่พบข้อมูลผู้สมัครงาน</p>
    </div>

    <!-- Jobs List -->
    <div v-else class="space-y-6">
      <div
        v-for="job in groupedApplicants"
        :key="job.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Job Header -->
        <div class="p-4 bg-gray-50 border-b">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ job.title }}</h3>
              <div class="mt-1 text-sm text-gray-500 space-x-4">
                <span>
                  <i class="far fa-calendar-alt mr-1"></i>
                  {{ formatDate(job.work_date) }}
                </span>
                <span>
                  <i class="fas fa-map-marker-alt mr-1"></i>
                  {{ job.location }}
                </span>
                <span>
                  <i class="fas fa-users mr-1"></i>
                  ผู้สมัคร: {{ job.applicants.length }} คน
                </span>
              </div>
            </div>
            <div class="text-sm">
              <span :class="getJobStatusClass(job.status)">
                {{ getJobStatusText(job.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Applicants Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ชื่อ-นามสกุล
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ตำแหน่ง
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  เบอร์โทร
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  อีเมล
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  สถานะ
                </th>
                <th
                  class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="applicant in job.applicants" :key="applicant.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <img
                      :src="applicant.user.profile_image || '/default-avatar.png'"
                      class="w-10 h-10 rounded-full object-cover"
                      alt="Profile"
                    />
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">
                        {{ applicant.user.first_name }} {{ applicant.user.last_name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ applicant.position.position_name }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ applicant.user.phone_number }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  {{ applicant.user.email }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="getStatusClass(applicant.status)">
                    {{ getStatusText(applicant.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center space-x-2">
                    <!-- Action buttons based on status -->
                    <template v-if="applicant.status === 'pending'">
                      <button
                        @click="approveParticipation(applicant.id)"
                        class="p-1 text-green-600 hover:text-green-800"
                        title="อนุมัติ"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                      <button
                        @click="rejectParticipation(applicant.id)"
                        class="p-1 text-red-600 hover:text-red-800"
                        title="ไม่อนุมัติ"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </template>

                    <template v-else-if="['approved', 'in_progress'].includes(applicant.status)">
                      <button
                        @click="updateWorkStatus(applicant.id, 'successful')"
                        class="p-1 text-green-600 hover:text-green-800"
                        title="งานสำเร็จ"
                      >
                        <i class="fas fa-check-double"></i>
                      </button>
                      <button
                        @click="updateWorkStatus(applicant.id, 'failed')"
                        class="p-1 text-red-600 hover:text-red-800"
                        title="งานล้มเหลว"
                      >
                        <i class="fas fa-times-circle"></i>
                      </button>
                      <button
                        @click="updateWorkStatus(applicant.id, 'improvement')"
                        class="p-1 text-yellow-600 hover:text-yellow-800"
                        title="ต้องปรับปรุง"
                      >
                        <i class="fas fa-exclamation-triangle"></i>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useJobStore } from '@/stores/jobStore'
import Swal from 'sweetalert2'

export default {
  name: 'JobApplicants',

  data() {
    return {
      jobStore: useJobStore(),
      jobs: [],
      loading: false,
      currentTab: 'pending',
      searchQuery: '',
      selectedJob: '',
      tabs: [
        { name: 'รอตรวจสอบ', value: 'pending' },
        { name: 'อนุมัติแล้ว', value: 'approved' },
        { name: 'สำเร็จ', value: 'successful' },
        { name: 'ล้มเหลว', value: 'failed' },
        { name: 'ต้องปรับปรุง', value: 'improvement' },
        { name: 'ปฏิเสธ', value: 'rejected' }
      ]
    }
  },

  computed: {
    allApplicants() {
      return this.jobs.flatMap((job) =>
        job.JobPositions.flatMap((position) =>
          position.JobParticipation.map((participant) => ({
            ...participant,
            position,
            job
          }))
        )
      )
    },
    tabCounts() {
      if (!this.jobStore?.jobsWithParticipants) return {}

      const counts = {
        pending: 0,
        approved: 0,
        successful: 0,
        failed: 0,
        improvement: 0,
        rejected: 0
      }

      this.jobStore.jobsWithParticipants.forEach((job) => {
        job.JobPositions?.forEach((position) => {
          position.JobParticipation?.forEach((participant) => {
            if (participant?.status) {
              counts[participant.status] = (counts[participant.status] || 0) + 1
            }
          })
        })
      })

      return counts
    },
    // ดึงงานที่ไม่ซ้ำกันสำหรับ dropdown
    uniqueJobs() {
      if (!this.jobStore?.jobsWithParticipants) return []

      const jobs = this.jobStore.jobsWithParticipants
      const uniqueJobsMap = new Map()

      jobs.forEach((job) => {
        if (job && job.id && !uniqueJobsMap.has(job.id)) {
          uniqueJobsMap.set(job.id, {
            id: job.id,
            title: job.title || 'ไม่ระบุชื่องาน'
          })
        }
      })

      return Array.from(uniqueJobsMap.values())
    },

    // จัดกลุ่มผู้สมัครตามงาน
    groupedApplicants() {
      if (!this.jobStore?.jobsWithParticipants) return []

      let filtered = [...this.jobStore.jobsWithParticipants]

      // กรองตามงานที่เลือก
      if (this.selectedJob) {
        filtered = filtered.filter((job) => job?.id === parseInt(this.selectedJob))
      }

      const searchLower = this.searchQuery?.toLowerCase().trim() || ''

      // กรองงานตามคำค้นหา
      if (searchLower) {
        filtered = filtered.filter(
          (job) =>
            job?.title?.toLowerCase().includes(searchLower) ||
            job?.location?.toLowerCase().includes(searchLower)
        )
      }

      return filtered
        .map((job) => {
          if (!job) return null

          const applicants =
            job.JobPositions?.reduce((acc, position) => {
              if (!position?.JobParticipation) return acc

              const validParticipants = position.JobParticipation.filter((participant) => {
                // ตรวจสอบว่ามี status ก่อนเปรียบเทียบ
                return participant?.status && participant.status === this.currentTab
              }).map((participant) => ({
                ...participant,
                position: {
                  id: position.id,
                  position_name: position.position_name || 'ไม่ระบุตำแหน่ง'
                }
              }))

              return [...acc, ...validParticipants]
            }, []) || []

          return {
            id: job.id,
            title: job.title || 'ไม่ระบุชื่องาน',
            work_date: job.work_date,
            location: job.location || 'ไม่ระบุสถานที่',
            status: job.status || 'draft',
            applicants: applicants.filter((a) => a !== null && a !== undefined)
          }
        })
        .filter((job) => job && job.applicants?.length > 0)
    },
    filteredApplicants() {
      if (!this.jobStore?.jobsWithParticipants) return []

      // แปลง searchQuery เป็นตัวพิมพ์เล็กและ trim
      const searchLower = this.searchQuery?.toLowerCase().trim() || ''

      // รวมผู้สมัครจากทุกงานเข้าด้วยกัน
      const allApplicants = this.jobStore.jobsWithParticipants.flatMap(
        (job) =>
          job.JobPositions?.flatMap(
            (position) =>
              position.JobParticipation?.map((participant) => ({
                ...participant,
                jobTitle: job.title,
                position: {
                  id: position.id,
                  position_name: position.position_name
                }
              })) || []
          ) || []
      )

      // กรองตามสถานะและคำค้นหา
      return allApplicants.filter((participant) => {
        if (!participant?.user) return false

        // เช็คสถานะตรงกับแท็บที่เลือก
        const matchesTab = participant.status === this.currentTab

        // ค้นหาจากข้อมูลผู้สมัคร
        const searchFields = [
          participant.user.first_name,
          participant.user.last_name,
          participant.user.email,
          participant.user.phone_number,
          participant.position?.position_name,
          participant.jobTitle
        ]

        const matchesSearch =
          !searchLower ||
          searchFields.some((field) => field?.toString().toLowerCase().includes(searchLower))

        return matchesTab && matchesSearch
      })
    }
  },

  methods: {
    // แก้ไข method getTabCount
    getTabCount(status) {
      return this.tabCounts[status] || 0
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getJobStatusClass(status) {
      if (!status) return '' // ถ้าไม่มี status ให้ return empty string

      const classes = {
        active: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
        draft: 'bg-yellow-100 text-yellow-800'
      }
      return `px-3 py-1 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`
    },

    // แก้ไข method getStatusClass
    getStatusClass(status) {
      if (!status) return '' // ถ้าไม่มี status ให้ return empty string

      const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        successful: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        improvement: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-gray-100 text-gray-800'
      }
      return `px-2 py-1 text-xs rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`
    },

    // แก้ไข method getStatusText
    getStatusText(status) {
      if (!status) return 'ไม่ระบุสถานะ' // ถ้าไม่มี status ให้แสดงข้อความ default

      const texts = {
        pending: 'รอตรวจสอบ',
        approved: 'อนุมัติแล้ว',
        successful: 'สำเร็จ',
        failed: 'ล้มเหลว',
        improvement: 'ต้องปรับปรุง',
        rejected: 'ปฏิเสธ'
      }
      return texts[status] || status
    },

    // แก้ไข method getJobStatusText
    getJobStatusText(status) {
      if (!status) return 'ไม่ระบุสถานะ' // ถ้าไม่มี status ให้แสดงข้อความ default

      const texts = {
        active: 'เปิดรับสมัคร',
        closed: 'ปิดรับสมัคร',
        draft: 'ฉบับร่าง'
      }
      return texts[status] || status
    },

    async approveParticipation(id) {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการอนุมัติ',
          text: 'คุณต้องการอนุมัติผู้สมัครนี้ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#81E2C4',
          cancelButtonColor: '#E98585'
        })

        if (result.isConfirmed) {
          await this.jobStore.approveOrRejectParticipation(id, 'approved')
          await this.refreshData()

          Swal.fire({
            title: 'สำเร็จ!',
            text: 'อนุมัติผู้สมัครเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500
          })
        }
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message,
          icon: 'error'
        })
      }
    },

    async rejectParticipation(id) {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการปฏิเสธ',
          text: 'คุณต้องการปฏิเสธผู้สมัครนี้ใช่หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#E98585',
          cancelButtonColor: '#6B7280'
        })

        if (result.isConfirmed) {
          await this.jobStore.approveOrRejectParticipation(id, 'rejected')
          await this.refreshData()

          Swal.fire({
            title: 'สำเร็จ!',
            text: 'ปฏิเสธผู้สมัครเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500
          })
        }
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message,
          icon: 'error'
        })
      }
    },

    async updateWorkStatus(id, status) {
      const statusTexts = {
        successful: 'งานสำเร็จ',
        failed: 'งานล้มเหลว',
        improvement: 'ต้องปรับปรุง'
      }

      try {
        const result = await Swal.fire({
          title: `ยืนยันการอัพเดทสถานะ`,
          text: `คุณต้องการอัพเดทสถานะเป็น "${statusTexts[status]}" ใช่หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: status === 'successful' ? '#81E2C4' : '#E98585',
          cancelButtonColor: '#6B7280'
        })

        if (result.isConfirmed) {
          await this.jobStore.updateParticipationStatus(id, status)
          await this.refreshData()

          Swal.fire({
            title: 'สำเร็จ!',
            text: 'อัพเดทสถานะเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500
          })
        }
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message,
          icon: 'error'
        })
      }
    },

    async refreshData() {
      try {
        await this.jobStore.fetchJobsWithParticipants()
      } catch (error) {
        // จัดการ error ถ้าจำเป็น
      }
    }
  },
  watch: {
    // เมื่อมีการอัพเดทข้อมูลใน store
    'jobStore.jobsWithParticipants': {
      handler(newVal) {
        if (!newVal || newVal.length === 0) {
          this.refreshData()
        }
      },
      deep: true
    },

    // เมื่อเปลี่ยนแท็บ
    currentTab: {
      handler() {
        this.refreshData()
      }
    },

    // เมื่อเลือกงาน
    selectedJob: {
      handler() {
        this.refreshData()
      }
    }
  },
  async created() {
    await this.refreshData()
  }
}
</script>
