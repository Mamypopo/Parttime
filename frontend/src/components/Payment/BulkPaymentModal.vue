<template>
  <TransitionRoot appear :show="true">
    <Dialog as="div" class="relative modal" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-600/50 dark:bg-black/50" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
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
              class="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all"
            >
              <div class="flex justify-between items-center mb-4">
                <DialogTitle as="h3" class="text-lg font-medium text-gray-900 dark:text-white">
                  จ่ายเงินหลายรายการ
                </DialogTitle>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- เลือกงาน -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >เลือกงาน</label
                >
                <select
                  v-model="selectedJobId"
                  @change="handleJobChange"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="">กรุณาเลือกงาน</option>
                  <option v-for="job in jobs" :key="job.id" :value="job.id">
                    {{ job.title }}
                  </option>
                </select>
              </div>

              <!-- Loading State -->
              <div v-if="isLoading" class="text-center py-4">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"
                ></div>
                <p class="mt-2 text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
              </div>

              <!-- รายการผู้รอรับเงิน -->
              <div v-else-if="unpaidParticipants.length > 0" class="mt-4">
                <div
                  class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0"
                >
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="selectAll"
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">เลือกทั้งหมด</span>
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    เลือก {{ selectedParticipants.length }} จาก
                    {{ unpaidParticipants.length }} รายการ
                  </span>
                </div>

                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <!-- ส่วนหัวตาราง -->
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="w-12 px-6 py-3">
                          <input
                            type="checkbox"
                            v-model="selectAll"
                            @change="toggleSelectAll"
                            class="rounded border-gray-300 dark:border-gray-600"
                          />
                        </th>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          ชื่อ-นามสกุล
                        </th>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          ตำแหน่ง
                        </th>
                        <th
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          จำนวนเงิน
                        </th>
                      </tr>
                    </thead>
                    <!-- เนื้อหาตาราง -->
                    <tbody
                      class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    >
                      <tr v-for="participant in unpaidParticipants" :key="participant.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            v-model="selectedParticipants"
                            :value="participant.id"
                            class="rounded border-gray-300 dark:border-gray-600"
                          />
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                        >
                          {{ participant.user?.first_name }} {{ participant.user?.last_name }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                        >
                          {{ participant.job?.position_name || '-' }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                        >
                          {{ formatCurrency(participant.job?.wage || 0) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Pagination -->
                  <div
                    class="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0"
                  >
                    <div class="flex space-x-2">
                      <button
                        @click="currentPage--"
                        :disabled="currentPage === 1"
                        class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span class="px-3 py-1 text-gray-700 dark:text-gray-200">
                        หน้า {{ currentPage }} จาก {{ totalPages }}
                      </span>
                      <button
                        @click="currentPage++"
                        :disabled="currentPage >= totalPages"
                        class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      แสดง {{ (currentPage - 1) * itemsPerPage + 1 }} -
                      {{ Math.min(currentPage * itemsPerPage, unpaidParticipants.length) }}
                      จาก {{ unpaidParticipants.length }} รายการ
                    </div>
                  </div>
                </div>

                <!-- ปุ่มจ่ายเงิน -->
                <div class="mt-4 flex justify-end">
                  <button
                    @click="handleBulkPayment"
                    :disabled="!selectedParticipants.length"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    จ่ายเงิน ({{ selectedParticipants.length }} รายการ)
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="selectedJobId" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">ไม่พบรายการที่รอจ่ายเงิน</p>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { usePaymentStore } from '@/stores/paymentStore'
import Swal from 'sweetalert2'

export default {
  name: 'BulkPaymentModal',

  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
  },

  setup() {
    const paymentStore = usePaymentStore()
    return { paymentStore }
  },

  data() {
    return {
      selectedJobId: null,
      selectedParticipants: [],
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      selectAll: false
    }
  },

  computed: {
    jobs() {
      return this.paymentStore.completedJobs || []
    },
    unpaidParticipants() {
      if (!this.selectedJobId) return []
      return this.paymentStore.jobParticipants[this.selectedJobId] || []
    },
    totalPages() {
      return Math.ceil(this.unpaidParticipants.length / this.itemsPerPage)
    }
  },
  created() {
    // สร้าง instance ของ store ใน created hook
    this.paymentStore = usePaymentStore()
    this.fetchInitialData()
  },
  methods: {
    async fetchInitialData() {
      try {
        await this.paymentStore.fetchCompletedJobs()
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount)
    },

    async handleJobChange() {
      if (!this.selectedJobId) return

      this.isLoading = true
      this.selectedParticipants = []

      try {
        await this.paymentStore.fetchJobParticipantsByJob(this.selectedJobId)
      } catch (error) {
        console.error('Failed to fetch participants:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลผู้รอรับเงินได้'
        })
      } finally {
        this.isLoading = false
      }
    },

    async handleBulkPayment() {
      if (!this.selectedParticipants.length) return

      try {
        const result = await Swal.fire({
          title: 'ยืนยันการจ่ายเงิน',
          text: `ต้องการจ่ายเงินให้ ${this.selectedParticipants.length} คนใช่หรือไม่?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'จ่ายเงิน',
          cancelButtonText: 'ยกเลิก'
        })

        if (!result.isConfirmed) return

        this.isLoading = true

        // แปลงข้อมูลให้เป็น array ธรรมดาก่อนส่ง
        const payload = {
          job_id: this.selectedJobId,
          participant_ids: Array.from(this.selectedParticipants), // แปลงจาก Set หรือ Proxy เป็น array ธรรมดา
          payment_method: 'cash'
        }

        console.log('Component sending:', payload)

        await this.paymentStore.handleBulkPayment(payload)

        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'จ่ายเงินเรียบร้อยแล้ว'
        })

        await this.handleJobChange()
        this.selectedParticipants = []
      } catch (error) {
        console.error('Failed to process payment:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถดำเนินการจ่ายเงินได้'
        })
      } finally {
        this.isLoading = false
      }
    },
    toggleSelectAll() {
      if (this.selectAll) {
        // ถ้าเลือกทั้งหมด ให้เพิ่ม id ของทุกคนที่ยังไม่ได้จ่ายเงิน
        this.selectedParticipants = this.unpaidParticipants
          .filter((p) => p.payment_status !== 'paid')
          .map((p) => p.id)
      } else {
        // ถ้ายกเลิกการเลือกทั้งหมด ให้ล้าง array
        this.selectedParticipants = []
      }
    }
  }
}
</script>
