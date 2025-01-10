<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div
      class="flex justify-between items-center bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white py-4 px-6 rounded-lg shadow-md mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-semibold">สถานะการจ่ายเงิน</h1>
        <p class="text-sm text-white/90 mt-1">ตรวจสอบสถานะการจ่ายเงินของคุณ</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="paymentStore.isLoading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
        style="border-color: #4bc0c8 transparent #c779d0 transparent"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center"
    >
      {{ error }}
    </div>

    <!-- Payment Cards -->
    <div
      v-else-if="payments.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="p-4 group bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#c779d0]/50 dark:hover:border-[#4bc0c8]/50 hover:shadow-lg hover:shadow-[#c779d0]/10 dark:hover:shadow-[#4bc0c8]/10"
      >
        <!-- Card Header -->
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {{ payment.jobTitle }}
            </h3>
            <span
              :class="[
                'px-3 py-1 text-xs font-medium rounded-full',
                {
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400':
                    payment.status === 'paid',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400':
                    payment.status === 'pending',
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400':
                    payment.status === 'cancelled'
                }
              ]"
            >
              {{ getStatusText(payment.status) }}
            </span>
          </div>

          <!-- Payment Details -->
          <div class="space-y-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <i class="fas fa-calendar-alt mr-2 text-[#feac5e] dark:text-[#feac5e]/70"></i>
              {{ formatDate(payment.workDate) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <i class="fas fa-coins mr-2 text-[#c779d0] dark:text-[#c779d0]/70"></i>
              จำนวนเงิน: {{ formatCurrency(payment.amount) }} บาท
            </p>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="mt-4">
          <button
            @click="openModal(payment.id)"
            class="w-full py-2 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-lg shadow-md hover:opacity-90 transition-all duration-200"
          >
            <i class="fas fa-info-circle mr-2"></i>
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-12">
      <i
        class="fas fa-money-bill-wave text-6xl mb-4 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-transparent bg-clip-text"
      ></i>
      <p class="text-lg text-gray-500 dark:text-gray-400">ยังไม่มีรายการการจ่ายเงิน</p>
    </div>

    <!-- Modal -->
    <PaymentDetailModal
      :is-open="isModalOpen"
      :payment-id="selectedPaymentId"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { usePaymentStore } from '@/stores/paymentStore'
import PaymentDetailModal from '@/components/Payment/PaymentDetailModal.vue'

export default {
  name: 'PaymentStatus',

  components: {
    PaymentDetailModal
  },
  data() {
    return {
      paymentStore: usePaymentStore(),
      payments: [],
      error: null,
      isModalOpen: false,
      selectedPaymentId: null
    }
  },

  async created() {
    try {
      this.loading = true
      await this.paymentStore.fetchUserPayments()
      this.payments = this.paymentStore.payments
    } catch (error) {
      console.error('Error fetching payments:', error)
      this.error = error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    } finally {
      this.loading = false
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount)
    },

    getPaymentMethodText(method) {
      const methods = {
        cash: 'เงินสด',
        transfer: 'โอนเงิน'
      }
      return methods[method] || method
    },

    getStatusText(status) {
      const statusText = {
        paid: 'จ่ายแล้ว',
        pending: 'รอการจ่าย',
        cancelled: 'ยกเลิก'
      }
      return statusText[status] || status
    },
    openModal(paymentId) {
      this.selectedPaymentId = paymentId
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
      this.selectedPaymentId = null
    }
  }
}
</script>
