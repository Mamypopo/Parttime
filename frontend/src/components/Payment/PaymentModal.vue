<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen p-4">
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

      <!-- Modal Content -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div class="px-6 py-4 relative">
          <!-- Loading Overlay -->
          <div
            v-if="paymentStore.isLoading"
            class="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center rounded-lg"
          >
            <div class="text-white animate-pulse">กำลังโหลด...</div>
          </div>

          <!-- Header -->
          <h3
            class="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-4"
          >
            {{ mode === 'create' ? 'สร้างรายการจ่ายเงินใหม่' : 'แก้ไขรายการจ่ายเงิน' }}
          </h3>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- เลือกงาน -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                เลือกงาน
              </label>
              <select
                v-model="selectedJobId"
                @change="handleJobChange"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                required
              >
                <option value="">กรุณาเลือกงาน</option>
                <option v-for="job in jobs" :key="job.id" :value="job.id">
                  {{ job.title }} ({{ paymentStore.formatDate(job.work_date) }})
                </option>
              </select>
            </div>

            <!-- เลือกตำแหน่ง -->
            <div v-if="selectedJobId">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ตำแหน่ง
              </label>
              <select
                v-model="selectedPositionId"
                @change="handlePositionChange"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                required
              >
                <option value="">เลือกตำแหน่ง</option>
                <option
                  v-for="position in selectedJobPositions"
                  :key="position.id"
                  :value="position.id"
                >
                  {{ position.position_name }} - {{ position.wage }} บาท
                </option>
              </select>
            </div>

            <!-- เลือกผู้เข้าร่วมงาน -->
            <div v-if="selectedPositionId">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ผู้เข้าร่วมงาน
              </label>
              <select
                v-model="formData.job_participation_id"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                required
              >
                <option value="">เลือกผู้เข้าร่วมงาน</option>
                <option
                  v-for="participant in filteredParticipants"
                  :key="participant.job_participation_id"
                  :value="participant.job_participation_id"
                >
                  {{ participant.user.first_name }} {{ participant.user.last_name }} ({{
                    participant.work_days
                  }}
                  วัน)
                </option>
              </select>
            </div>

            <!-- จำนวนเงิน -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                จำนวนเงิน
              </label>
              <input
                type="number"
                v-model="formData.amount"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                readonly
                required
              />
            </div>

            <!-- หมายเหตุ -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                หมายเหตุ
              </label>
              <textarea
                v-model="formData.payment_note"
                class="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                rows="3"
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 transition-all duration-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                :disabled="paymentStore.isLoading"
              >
                {{ paymentStore.isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePaymentStore } from '@/stores/paymentStore'
import Swal from 'sweetalert2'
export default {
  props: {
    payment: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'create'
    }
  },

  data() {
    return {
      selectedJobId: '',
      selectedPositionId: '',
      jobPositions: [],
      formData: {
        job_participation_id: '',
        amount: '',
        payment_status: 'pending',
        payment_method: 'cash',
        payment_note: '',
        payment_slip: null
      }
    }
  },

  setup() {
    const paymentStore = usePaymentStore()
    return { paymentStore }
  },

  async created() {
    await this.paymentStore.fetchCompletedJobs()
  },

  computed: {
    jobs() {
      return this.paymentStore.completedJobs
    },
    jobParticipants() {
      return this.paymentStore.jobParticipants[this.selectedJobId] || []
    },
    selectedJobPositions() {
      const selectedJob = this.jobs.find((job) => job.id === parseInt(this.selectedJobId))
      return selectedJob?.JobPositions || []
    },
    filteredParticipants() {
      // ข้อมูลที่ได้มาไม่มี jobPosition แต่มี job_participation_id
      const participants = this.jobParticipants
      return participants.filter((participant) => {
        // เช็คว่ามี payment_status เป็น pending
        return participant.payment_status === 'pending'
      })
    }
  },
  methods: {
    async handleJobChange() {
      if (this.selectedJobId) {
        await this.paymentStore.fetchJobParticipantsByJob(this.selectedJobId) // เปลี่ยนเป็นใช้ fetchJobParticipantsByJob
        this.selectedPositionId = ''
        this.formData.job_participation_id = ''
        this.formData.amount = ''
      }
    },

    handlePositionChange() {
      if (this.selectedPositionId) {
        const position = this.selectedJobPositions.find(
          (pos) => pos.id === parseInt(this.selectedPositionId)
        )
        this.formData.amount = position?.wage || 0
      }
      this.formData.job_participation_id = ''
    },

    handleFileUpload(event) {
      this.formData.payment_slip = event.target.files[0]
    },

    async handleSubmit() {
      try {
        // ตรวจสอบวิธีการชำระเงิน
        if (!this.formData.payment_method) {
          await Swal.fire({
            icon: 'warning',
            title: 'กรุณาเลือกวิธีการชำระเงิน',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3085d6'
          })
          return
        }

        // ตรวจสอบสลิปการโอนเงิน
        if (this.formData.payment_method === 'transfer' && !this.formData.payment_slip) {
          await Swal.fire({
            icon: 'warning',
            title: 'กรุณาแนบสลิปการโอนเงิน',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3085d6'
          })
          return
        }

        // ยืนยันการบันทึก
        const result = await Swal.fire({
          title: 'ยืนยันการบันทึก?',
          text: 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        })

        if (result.isConfirmed) {
          if (!this.formData.payment_note) {
            this.formData.payment_note = 'จ่ายเงินสำหรับงาน ' + this.selectedJob?.title
          }

          this.paymentStore.isLoading = true
          await this.$emit('save', this.formData)

          // แจ้งเตือนสำเร็จ
          await Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'ระบบได้ส่งอีเมลแจ้งเตือนไปยังผู้รับเงินแล้ว',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3085d6'
          })

          // ปิด modal
          this.$emit('close')
        }
      } catch (error) {
        console.error('Failed to save payment:', error)

        // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3085d6'
        })
      } finally {
        this.paymentStore.isLoading = false
      }
    }
  }
}
</script>
