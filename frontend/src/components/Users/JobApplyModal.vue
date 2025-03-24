<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative modal">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-lg transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <DialogTitle as="div" class="px-6 py-4 border-b dark:border-gray-700">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ getStepTitle }}
                  </h3>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </DialogTitle>

              <!-- Content -->
              <div class="px-6 py-4">
                <!-- Step 1: เลือกตำแหน่ง -->
                <div v-if="currentStep === 1">
                  <div class="space-y-3">
                    <div
                      v-for="position in job.JobPositions"
                      :key="position.id"
                      class="p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                      :class="[
                        selectedPosition?.id === position.id
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                      ]"
                      @click="selectPosition(position)"
                    >
                      <div class="space-y-3">
                        <!-- หัวข้อและค่าจ้าง -->
                        <div class="flex justify-between items-start">
                          <div>
                            <h4
                              class="font-medium text-gray-900 dark:text-white flex items-center gap-2"
                            >
                              <i
                                class="fas fa-briefcase text-cyan-500/70 dark:text-cyan-400/70"
                              ></i>
                              {{ position.position_name }}
                            </h4>
                            <p
                              class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1"
                            >
                              <i class="fas fa-users text-gray-400 dark:text-gray-500"></i>
                              รับ {{ position.required_people }} คน
                            </p>
                          </div>
                          <span
                            class="text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-2"
                          >
                            <i class="fas fa-coins text-yellow-500/70 dark:text-yellow-400/70"></i>
                            {{ formatCurrency(position.wage) }}
                          </span>
                        </div>

                        <!-- รายละเอียดตำแหน่ง -->
                        <div
                          v-if="position.details"
                          class="text-sm text-gray-600 dark:text-gray-300 flex gap-2"
                        >
                          <i
                            class="fas fa-info-circle text-blue-500/70 dark:text-blue-400/70 mt-1"
                          ></i>
                          <span>{{ position.details }}</span>
                        </div>

                        <!-- สถานะ -->
                        <div class="flex items-center gap-3 text-sm">
                          <span
                            class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            :class="getPositionStatusClass(position.status)"
                          >
                            <i class="fas fa-circle-dot text-[10px]"></i>
                            {{ getPositionStatusText(position.status) }}
                          </span>
                          <span
                            v-if="position.application_count"
                            class="text-gray-500 dark:text-gray-400 flex items-center gap-1.5"
                          >
                            <i class="fas fa-user-check text-gray-400 dark:text-gray-500"></i>
                            มีผู้สมัครแล้ว {{ position.application_count }} คน
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 2: ยืนยันข้อมูล -->
                <div v-if="currentStep === 2">
                  <div class="space-y-4">
                    <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <h4 class="font-medium text-gray-900 dark:text-white mb-3">ข้อมูลงาน</h4>
                      <div class="space-y-3 text-sm">
                        <p class="flex justify-between">
                          <span class="text-gray-500 dark:text-gray-400">ตำแหน่ง:</span>
                          <span class="text-gray-900 dark:text-white">{{
                            selectedPosition.position_name
                          }}</span>
                        </p>
                        <p class="flex justify-between">
                          <span class="text-gray-500 dark:text-gray-400">ค่าจ้าง:</span>
                          <span class="text-cyan-600 dark:text-cyan-400">{{
                            formatCurrency(selectedPosition.wage)
                          }}</span>
                        </p>
                        <p class="flex justify-between">
                          <span class="text-gray-500 dark:text-gray-400">วันที่:</span>
                          <span class="text-gray-900 dark:text-white">{{
                            formatDate(job.work_date)
                          }}</span>
                        </p>
                        <p class="flex justify-between">
                          <span class="text-gray-500 dark:text-gray-400">เวลา:</span>
                          <span class="text-gray-900 dark:text-white">
                            {{ formatTime(job.start_time) }} - {{ formatTime(job.end_time) }}
                          </span>
                        </p>
                        <!-- ปรับส่วนแสดงสถานที่ -->
                        <div class="flex flex-col space-y-1">
                          <span class="text-gray-500 dark:text-gray-400">สถานที่:</span>
                          <span class="text-gray-900 dark:text-white text-right break-words">{{
                            job.location
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 3: สำเร็จ -->
                <div v-if="currentStep === 3" class="text-center py-6">
                  <div class="mb-4">
                    <i class="fas fa-check-circle text-5xl text-green-500 dark:text-green-400"></i>
                  </div>
                  <h4 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    สมัครงานสำเร็จ
                  </h4>
                  <p class="text-gray-500 dark:text-gray-400">
                    คุณสามารถติดตามสถานะได้ที่ "งานของฉัน"
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                <button
                  v-if="currentStep !== 3"
                  @click="prevStep"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  :disabled="currentStep === 1"
                >
                  ย้อนกลับ
                </button>
                <div class="flex gap-3 ml-auto">
                  <button
                    v-if="currentStep === 3"
                    @click="goToMyJobs"
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  >
                    ไปที่งานของฉัน
                  </button>
                  <button
                    v-else
                    @click="nextStep"
                    class="px-4 py-2 rounded-lg text-sm font-medium"
                    :class="[
                      canProceed
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    ]"
                    :disabled="!canProceed"
                  >
                    {{ currentStep === 2 ? 'ยืนยันการสมัคร' : 'ถัดไป' }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useJobStore } from '@/stores/jobStore'

import Swal from 'sweetalert2'
export default {
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle
  },

  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    job: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'applied'],

  data() {
    return {
      currentStep: 1,
      selectedPosition: null
    }
  },

  computed: {
    getStepTitle() {
      switch (this.currentStep) {
        case 1:
          return 'เลือกตำแหน่งที่ต้องการสมัคร'
        case 2:
          return 'ยืนยันข้อมูลการสมัคร'
        case 3:
          return 'สมัครงานสำเร็จ'
        default:
          return ''
      }
    },

    canProceed() {
      switch (this.currentStep) {
        case 1:
          return !!this.selectedPosition
        case 2:
          return true
        default:
          return false
      }
    }
  },

  methods: {
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

    selectPosition(position) {
      this.selectedPosition = position
    },

    async nextStep() {
      if (this.currentStep === 1 && !this.selectedPosition) {
        await Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกตำแหน่ง',
          text: 'โปรดเลือกตำแหน่งที่ต้องการสมัครก่อนดำเนินการต่อ',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#06B6D4',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        })
        return
      }

      if (this.currentStep === 2) {
        try {
          const jobStore = useJobStore()
          await jobStore.applyForJob(this.job.id, this.selectedPosition.id)
          await Swal.fire({
            icon: 'success',
            title: 'สมัครงานสำเร็จ!',
            text: 'คุณสามารถติดตามสถานะได้ที่ "งานของฉัน"',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true
          })

          this.currentStep++
          this.$emit('applied')
        } catch (error) {
          await Swal.fire({
            icon: 'warning',
            title: error.response?.data?.message || 'ไม่สามารถสมัครงานได้',
            text: error.response?.data?.details || 'กรุณาลองใหม่อีกครั้ง',
            footer: error.response?.data?.position
              ? `ตำแหน่ง: ${error.response.data.position}`
              : '',
            confirmButtonText: 'เข้าใจแล้ว',
            confirmButtonColor: '#06B6D4'
          })
          this.closeModal()
        }
      } else {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    goToMyJobs() {
      this.$router.push('/user/my-jobs')
      this.closeModal()
    },

    closeModal() {
      this.currentStep = 1
      this.selectedPosition = null
      this.$emit('close')
    },
    getPositionStatusClass(status) {
      switch (status?.toUpperCase()) {
        case 'OPEN':
          return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        case 'CLOSED':
          return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        case 'FULL':
          return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
        case 'PENDING':
          return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
          return 'ไม่ระบุสถานะ'
      }
    }
  }
}
</script>
