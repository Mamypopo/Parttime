<template>
  <div class="payment-management p-4 md:p-6">
    <!-- Header และ Job Selection -->
    <div class="mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div class="flex items-center gap-3 mb-4 md:mb-0">
          <h2
            class="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
          >
            จ่ายเงินผู้เข้าร่วมงาน
          </h2>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          <i class="fas fa-info-circle mr-1"></i>
          เลือกงานเพื่อดูรายการจ่ายเงิน
        </div>
        <button
          v-if="selectedJob"
          @click="exportToExcel"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors duration-200"
        >
          <i class="fas fa-file-excel"></i>
          <span>Export Excel</span>
        </button>
      </div>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <i class="fas fa-briefcase text-gray-400 dark:text-gray-500"></i>
        </div>
        <select
          v-model="selectedJob"
          @change="loadPayments"
          class="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors appearance-none"
        >
          <option value="" class="text-gray-500 dark:text-gray-400">-- กรุณาเลือกงาน --</option>
          <option v-for="job in jobs" :key="job.id" :value="job" class="py-2">
            {{ job.title }} ({{ formatDate(job.work_date) }})
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <i class="fas fa-chevron-down text-gray-400 dark:text-gray-500"></i>
        </div>
      </div>
    </div>
    <!-- สรุปสถานะการจ่ายเงิน -->
    <div
      v-if="selectedJob"
      class="mb-6 bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-lg transition-colors"
    >
      <div class="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <!-- ทั้งหมด -->
        <div
          class="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border border-blue-200 dark:border-gray-700 hover:border-gray-500 transition-colors"
        >
          <div class="flex flex-col h-full">
            <p class="text-xs md:text-sm text-blue-600 dark:text-blue-400 mb-2">ทั้งหมด</p>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ totalParticipants }}
                </span>
                <span class="text-xs md:text-sm text-blue-500 dark:text-blue-400/70">คน</span>
              </div>
              <div class="text-blue-500 dark:text-blue-400">
                <i class="fas fa-users text-lg md:text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- รอจ่าย -->
        <div
          class="bg-orange-50 dark:bg-gray-800 p-4 rounded-xl border border-orange-300 dark:border-gray-700 hover:border-gray-500 transition-colors"
        >
          <div class="flex flex-col h-full">
            <p class="text-xs md:text-sm text-orange-500 dark:text-orange-400 mb-2">รอจ่าย</p>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-xl md:text-2xl font-bold text-orange-500 dark:text-orange-400">
                  {{ pendingPayments.length }}
                </span>
                <span class="text-xs md:text-sm text-orange-400/70">คน</span>
              </div>
              <div class="text-orange-500 dark:text-orange-400">
                <i class="fas fa-clock text-lg md:text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- จ่ายแล้ว -->
        <div
          class="bg-green-50 dark:bg-gray-800 p-4 rounded-xl border border-green-300 dark:border-gray-700 hover:border-gray-500 transition-colors"
        >
          <div class="flex flex-col h-full">
            <p class="text-xs md:text-sm text-green-500 dark:text-green-400 mb-2">จ่ายแล้ว</p>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-xl md:text-2xl font-bold text-green-500 dark:text-green-400">
                  {{ paidPayments.length }}
                </span>
                <span class="text-xs md:text-sm text-green-400/70">คน</span>
              </div>
              <div class="text-green-500 dark:text-green-400">
                <i class="fas fa-check-circle text-lg md:text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div
        class="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-300 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <i class="fas fa-chart-pie text-gray-500 dark:text-gray-400"></i>
            <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400"
              >ความคืบหน้าการจ่ายเงิน</span
            >
          </div>
          <span class="text-xs md:text-sm text-green-500 dark:text-green-400">
            {{ Math.round(paymentProgress) }}% เสร็จสิ้น
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
          <div
            class="bg-green-500 h-full rounded-full transition-all duration-500"
            :style="{ width: `${paymentProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- ตารางแสดงรายการ -->
    <div
      v-if="selectedJob"
      class="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-lg"
    >
      <!-- Tab Headers -->
      <div class="flex border-b dark:border-gray-700">
        <button
          @click="activeTab = 'pending'"
          :class="[
            'flex-1 py-3 px-4 text-sm font-medium',
            activeTab === 'pending'
              ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 border-b-2 border-orange-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ]"
        >
          รอจ่ายเงิน ({{ pendingPayments.length }})
        </button>
        <button
          @click="activeTab = 'paid'"
          :class="[
            'flex-1 py-3 px-4 text-sm font-medium',
            activeTab === 'paid'
              ? 'bg-green-50 dark:bg-green-900/10 text-green-600 border-b-2 border-green-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ]"
        >
          จ่ายแล้ว ({{ paidPayments.length }})
        </button>
      </div>
      <!-- จำนวนรายการต่อหน้า -->
      <div class="p-4 flex justify-end">
        <select
          v-model="itemsPerPage"
          class="border dark:border-gray-700 rounded px-2 py-1 text-sm"
        >
          <option value="5">5 รายการ</option>
          <option value="10">10 รายการ</option>
          <option value="20">20 รายการ</option>
          <option value="50">50 รายการ</option>
        </select>
      </div>
      <!-- Pending Payments Table -->
      <div v-show="activeTab === 'pending'" class="overflow-x-auto">
        <table
          v-if="paginatedPendingPayments.length > 0"
          class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        >
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
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
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                จำนวนเงิน
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="payment in paginatedPendingPayments" :key="payment.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="getProfileImage(payment.job_participation.user.profile_image)"
                    class="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ payment.job_participation.user.first_name }}
                      {{ payment.job_participation.user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ payment.job_participation.user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ payment.job_participation.jobPosition.position_name }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {{ formatCurrency(payment.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click="openPaymentModal(payment)"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  จ่ายเงิน
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>ไม่มีรายการที่รอจ่าย</p>
        </div>
      </div>
      <!-- Paid Payments Table -->
      <div v-show="activeTab === 'paid'" class="overflow-x-auto">
        <table
          v-if="paginatedPaidPayments.length > 0"
          class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        >
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
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
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                จำนวนเงิน
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                วันที่จ่าย
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                ดูประวัติ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="payment in paginatedPaidPayments" :key="payment.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="getProfileImage(payment.job_participation.user.profile_image)"
                    class="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ payment.job_participation.user.first_name }}
                      {{ payment.job_participation.user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ payment.job_participation.user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ payment.job_participation.jobPosition.position_name }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {{ formatCurrency(payment.amount) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-100"
              >
                {{ formatDate(payment.paid_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click="viewPaymentHistory(payment)"
                  class="text-blue-500 hover:text-blue-600"
                >
                  <i class="fas fa-history"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <i class="fas fa-check-circle text-4xl mb-2"></i>
          <p>ไม่มีรายการที่จ่ายแล้ว</p>
        </div>
      </div>
      <!-- Pagination -->
      <div
        v-if="activeTab === 'pending' && pendingPayments.length > itemsPerPage"
        class="p-4 flex justify-center gap-2"
      >
        <button
          v-for="page in totalPendingPages"
          :key="page"
          @click="pendingPage = page"
          :class="[
            'px-3 py-1 rounded border',
            pendingPage === page ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800'
          ]"
        >
          {{ page }}
        </button>
      </div>
      <div
        v-if="activeTab === 'paid' && paidPayments.length > itemsPerPage"
        class="p-4 flex justify-center gap-2"
      >
        <button
          v-for="page in totalPaidPages"
          :key="page"
          @click="paidPage = page"
          :class="[
            'px-3 py-1 rounded border',
            paidPage === page ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPaymentModal"
      :payment="{
        id: selectedPayment.id,
        job_participation_id: selectedPayment.job_participation_id, // เปลี่ยนจาก jobId
        amount: selectedPayment.amount
      }"
      @close="closePaymentModal"
      @refresh="loadPayments"
    />
    <!-- History Modal -->
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
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'
export default {
  name: 'PaymentManagement',
  components: {
    PaymentModal,
    PaymentHistoryModal
  },
  data() {
    return {
      selectedJob: null,
      showPaymentModal: false,
      selectedPayment: null,
      showHistoryModal: false,
      itemsPerPage: 5,
      pendingPage: 1,
      paidPage: 1,
      activeTab: 'pending'
    }
  },
  computed: {
    paymentStore() {
      return usePaymentStore()
    },
    jobs() {
      return this.paymentStore.jobs || []
    },
    pendingPayments() {
      return this.paymentStore.pendingPayments || []
    },
    paidPayments() {
      return this.paymentStore.paidPayments || []
    },
    isLoading() {
      return this.paymentStore.isLoading
    },
    totalParticipants() {
      return (this.pendingPayments?.length || 0) + (this.paidPayments?.length || 0)
    },

    paymentProgress() {
      if (!this.totalParticipants) return 0
      return (this.paidPayments.length / this.totalParticipants) * 100
    },
    // สำหรับ pagination
    paginatedPendingPayments() {
      if (!this.pendingPayments) return []
      const start = (this.pendingPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.pendingPayments.slice(start, end)
    },
    paginatedPaidPayments() {
      if (!this.paidPayments) return []
      const start = (this.paidPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.paidPayments.slice(start, end)
    },
    totalPendingPages() {
      return Math.ceil((this.pendingPayments?.length || 0) / this.itemsPerPage)
    },
    totalPaidPages() {
      return Math.ceil((this.paidPayments?.length || 0) / this.itemsPerPage)
    }
  },
  async created() {
    try {
      await this.paymentStore.fetchJobs()
    } catch (error) {
      console.error('Failed to load jobs:', error)
    }
  },
  methods: {
    async loadPayments() {
      if (!this.selectedJob) return
      try {
        await this.paymentStore.fetchAllJobPayments(this.selectedJob.id)
      } catch (error) {
        console.error('Failed to load payments:', error)
      }
    },

    exportToExcel() {
      if (!this.selectedJob) return

      // รวมข้อมูลทั้งหมด
      const allPayments = [...this.pendingPayments, ...this.paidPayments]

      // จัดรูปแบบข้อมูลสำหรับ Excel
      const excelData = allPayments.map((payment) => ({
        'ชื่อ-นามสกุล': `${payment.user.first_name} ${payment.user.last_name}`,
        เบอร์โทร: payment.user.phone,
        จำนวนเงิน: payment.amount,
        สถานะ: payment.status === 'pending' ? 'รอจ่าย' : 'จ่ายแล้ว',
        วันที่จ่าย: payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('th-TH') : '-',
        หมายเหตุ: payment.note || '-'
      }))

      // สร้าง summary sheet
      const summary = {
        ชื่องาน: this.selectedJob.title,
        วันที่: new Date(this.selectedJob.work_date).toLocaleDateString('th-TH'),
        จำนวนคนทั้งหมด: this.totalParticipants,
        จ่ายแล้ว: this.paidPayments.length,
        รอจ่าย: this.pendingPayments.length,
        ยอดเงินทั้งหมด: allPayments.reduce((sum, p) => sum + p.amount, 0),
        ยอดเงินที่จ่ายแล้ว: this.paidPayments.reduce((sum, p) => sum + p.amount, 0),
        ยอดเงินที่รอจ่าย: this.pendingPayments.reduce((sum, p) => sum + p.amount, 0)
      }

      // สร้าง workbook
      const wb = XLSX.utils.book_new()

      // เพิ่ม summary sheet
      const summaryWS = XLSX.utils.json_to_sheet([summary], { header: Object.keys(summary) })
      XLSX.utils.book_append_sheet(wb, summaryWS, 'สรุป')

      // เพิ่ม payments sheet
      const paymentsWS = XLSX.utils.json_to_sheet(excelData)
      XLSX.utils.book_append_sheet(wb, paymentsWS, 'รายละเอียดการจ่าย')

      // กำหนดความกว้างคอลัมน์
      const wscols = [
        { wch: 25 }, // ชื่อ-นามสกุล
        { wch: 15 }, // เบอร์โทร
        { wch: 12 }, // จำนวนเงิน
        { wch: 10 }, // สถานะ
        { wch: 15 }, // วันที่จ่าย
        { wch: 20 } // หมายเหตุ
      ]
      paymentsWS['!cols'] = wscols

      // ดาวน์โหลดไฟล์
      XLSX.writeFile(
        wb,
        `สรุปการจ่ายเงิน_${this.selectedJob.title}_${new Date().toLocaleDateString('th-TH')}.xlsx`
      )
    },

    openPaymentModal(payment) {
      this.selectedPayment = payment
      this.showPaymentModal = true
    },
    closePaymentModal() {
      this.showPaymentModal = false
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
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount)
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
