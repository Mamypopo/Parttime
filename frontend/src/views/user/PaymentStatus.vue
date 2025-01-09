<template>
  <div class="max-w-5xl p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">สถานะการจ่ายเงิน</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">ตรวจสอบสถานะการจ่ายเงินของคุณ</p>
    </div>

    <!-- Loading State -->
    <div v-if="paymentStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="n in 3"
        :key="n"
        class="animate-pulse bg-gray-100 dark:bg-gray-800 h-32 rounded-lg"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center"
    >
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition duration-300"
      >
        <!-- Card Header -->
        <div class="p-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {{ payment.jobTitle }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(payment.workDate) }}</p>
        </div>

        <!-- Card Body -->
        <div class="p-4">
          <div class="flex justify-between items-center mb-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">สถานะ</p>
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

          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">จำนวนเงิน</p>
            <p class="font-medium text-gray-800 dark:text-white">
              {{ formatCurrency(payment.amount) }}
            </p>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="p-4 border-t dark:border-gray-700 text-center">
          <button
            @click="openModal(payment.id)"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="payments.length === 0 && !paymentStore.isLoading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลการจ่ายเงิน</p>
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
