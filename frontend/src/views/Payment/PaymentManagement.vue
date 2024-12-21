<template>
  <div class="payment-management p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
        จ่ายเงินผู้เข้าร่วมงาน
      </h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm md:text-base">
        เลือกงานเพื่อดูรายการที่จ่ายแล้วหรือรอจ่ายเงิน
      </p>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 flex space-x-4">
      <button
        :class="{
          'bg-blue-500 text-white': selectedStatus === 'pending',
          'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300':
            selectedStatus !== 'pending'
        }"
        class="px-4 py-2 rounded-md"
        @click="switchStatus('pending')"
      >
        รอจ่ายเงิน
      </button>
      <button
        :class="{
          'bg-blue-500 text-white': selectedStatus === 'paid',
          'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300': selectedStatus !== 'paid'
        }"
        class="px-4 py-2 rounded-md"
        @click="switchStatus('paid')"
      >
        จ่ายแล้ว
      </button>
    </div>

    <!-- Job Cards -->
    <div
      v-if="paginatedJobs.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
    >
      <div
        v-for="job in paginatedJobs"
        :key="job.id"
        @click="selectJob(job)"
        class="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow p-4 hover:shadow-md transition duration-200"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ job.title }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">สถานที่: {{ job.location }}</p>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          วันที่: {{ formatDate(job.start_time) }} - {{ formatDate(job.end_time) }}
        </p>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          รายการที่{{ selectedStatus === 'pending' ? 'รอจ่ายเงิน' : 'จ่ายแล้ว' }}:
          {{ selectedStatus === 'pending' ? job.pendingPaymentsCount : job.paidPaymentsCount }}
        </p>
      </div>
    </div>

    <!-- Job Pagination -->
    <div v-if="totalJobPages > 1" class="mt-4 flex justify-between items-center">
      <button
        class="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-md"
        :disabled="currentJobPage === 1"
        @click="changeJobPage(currentJobPage - 1)"
      >
        ก่อนหน้า
      </button>
      <span class="text-gray-600 dark:text-gray-400">
        หน้า {{ currentJobPage }} จาก {{ totalJobPages }}
      </span>
      <button
        class="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-md"
        :disabled="currentJobPage === totalJobPages"
        @click="changeJobPage(currentJobPage + 1)"
      >
        ถัดไป
      </button>
    </div>

    <!-- Payment Table -->
    <div v-if="selectedJob && !isLoading && filteredPayments.length > 0" class="overflow-x-auto">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
        รายการ{{ selectedStatus === 'pending' ? 'ที่รอจ่ายเงิน' : 'ที่จ่ายแล้ว' }}สำหรับงาน:
        {{ selectedJob.title }}
      </h3>
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">ชื่อ</th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">ตำแหน่ง</th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-right">
              จำนวนเงิน
            </th>
            <th
              v-if="selectedStatus === 'pending'"
              class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center"
            >
              การดำเนินการ
            </th>
            <th
              v-if="selectedStatus === 'paid'"
              class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center"
            >
              ดูประวัติ
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in filteredPayments"
            :key="payment.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">
              <div class="flex items-center space-x-4">
                <img
                  :src="getProfileImage(payment.job_participation.user.profile_image)"
                  class="h-10 w-10 rounded-full"
                  alt="Avatar"
                />
                <div>
                  <h3 class="text-gray-900 dark:text-white font-semibold">
                    {{ payment.job_participation.user.first_name }}
                    {{ payment.job_participation.user.last_name }}
                  </h3>
                </div>
              </div>
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">
              {{ payment.job_participation.jobPosition.position_name }}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-right">
              {{ formatCurrency(payment.amount) }}
            </td>
            <td
              v-if="selectedStatus === 'pending'"
              class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center"
            >
              <button
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                @click="openPaymentDialog(payment)"
              >
                จ่ายเงิน
              </button>
            </td>
            <td
              v-if="selectedStatus === 'paid'"
              class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center"
            >
              <button
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                @click="viewPaymentHistory(payment)"
              >
                ดูประวัติ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="selectedJob && !isLoading"
      class="text-center py-12 text-gray-500 dark:text-gray-400"
    >
      ไม่พบรายการ{{ selectedStatus === 'pending' ? 'ที่รอจ่ายเงิน' : 'ที่จ่ายแล้ว' }}
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPaymentDialog"
      :show="showPaymentDialog"
      :payment="selectedPayment"
      @close="closePaymentDialog"
      @confirm="handlePayment"
    />

    <!-- Payment History Modal -->
    <PaymentHistoryModal
      v-if="showHistoryModal"
      :show="showHistoryModal"
      :payment="selectedPayment"
      @close="closeHistoryModal"
    />
  </div>
</template>

<script>
import { usePaymentStore } from '@/stores/paymentStore'
import PaymentModal from '@/components/Payment/PaymentModal.vue'
import PaymentHistoryModal from '@/components/Payment/PaymentHistoryModal.vue'

export default {
  name: 'PaymentManagement',
  components: { PaymentModal, PaymentHistoryModal },
  data() {
    return {
      selectedJob: null,
      selectedStatus: 'pending', // ใช้สำหรับกรองสถานะ
      showPaymentDialog: false,
      selectedPayment: null,
      currentJobPage: 1,
      itemsPerPage: 6,
      totalJobPages: 1,
      showHistoryModal: false
    }
  },
  computed: {
    paymentStore() {
      return usePaymentStore()
    },
    jobs() {
      return this.paymentStore.jobs || []
    },
    paginatedJobs() {
      const start = (this.currentJobPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.jobs.slice(start, end)
    },
    filteredPayments() {
      return this.selectedStatus === 'pending'
        ? this.paymentStore.pendingPayments
        : this.paymentStore.paidPayments
    },
    isLoading() {
      return this.paymentStore.isLoading
    },
    error() {
      return this.paymentStore.error
    }
  },
  async created() {
    try {
      await this.paymentStore.fetchJobs()
      this.totalJobPages = Math.ceil(this.jobs.length / this.itemsPerPage)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    }
  },
  methods: {
    async selectJob(job) {
      this.selectedJob = job
      await this.loadPayments()
    },
    async loadPayments() {
      if (!this.selectedJob) return
      try {
        if (this.selectedStatus === 'pending') {
          await this.paymentStore.fetchPendingPayments(this.selectedJob.id)
        } else {
          await this.paymentStore.fetchPaidPayments(this.selectedJob.id)
        }
      } catch (error) {
        console.error('Failed to load payments:', error)
      }
    },
    switchStatus(status) {
      this.selectedStatus = status
      this.selectedJob = null // รีเซ็ต Job ที่เลือกเมื่อเปลี่ยนสถานะ
    },
    async changeJobPage(page) {
      if (page < 1 || page > this.totalJobPages) return
      this.currentJobPage = page
    },
    openPaymentDialog(payment) {
      this.selectedPayment = payment
      this.showPaymentDialog = true
    },
    closePaymentDialog() {
      this.showPaymentDialog = false
      this.selectedPayment = null
    },
    viewPaymentHistory(payment) {
      this.selectedPayment = payment
      this.showHistoryModal = true
    },
    closeHistoryModal() {
      this.showHistoryModal = false
      this.selectedPayment = null
    },
    async handlePayment(paymentData) {
      try {
        const result = await this.paymentStore.updatePaymentStatus(
          this.selectedPayment.id,
          paymentData
        )
        if (result.success) {
          await this.loadPayments()
          this.closePaymentDialog()
        }
      } catch (error) {
        console.error('Payment failed:', error)
      }
    },
    getProfileImage(image) {
      return image
        ? `${this.paymentStore.baseURL}/uploads/profiles/${image}`
        : '/default-avatar.png'
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>
