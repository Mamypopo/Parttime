<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative modal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 dark:bg-black/40 backdrop-blur-sm" />
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
              class="w-full max-w-lg transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl transition-all"
            >
              <!-- Header -->
              <div class="border-b dark:border-gray-700 px-4 py-3">
                <DialogTitle
                  class="text-lg font-medium text-gray-900 dark:text-white flex items-center"
                >
                  <i class="fas fa-receipt mr-2 text-emerald-500"></i>
                  รายละเอียดการจ่ายเงิน
                </DialogTitle>
              </div>

              <!-- Content -->
              <div class="px-4 py-3">
                <div v-if="loading" class="space-y-3 animate-pulse">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>

                <div v-else-if="payment" class="space-y-4">
                  <!-- Job Info -->
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-white flex items-center">
                        <i class="fas fa-briefcase mr-2 text-indigo-500"></i>
                        {{ payment.job_participation.jobPosition.job.location }}
                      </h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <i class="far fa-calendar mr-2 text-orange-500"></i>
                        {{ formatDate(payment.job_participation.jobPosition.job.work_date) }}
                        <i class="far fa-clock mx-2 text-sky-500"></i>
                        {{ formatTime(payment.job_participation.jobPosition.job.start_time) }} -
                        {{ formatTime(payment.job_participation.jobPosition.job.end_time) }}
                      </p>
                    </div>
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getStatusClass(payment.payment_status)
                      ]"
                    >
                      {{ getStatusText(payment.payment_status) }}
                    </span>
                  </div>

                  <!-- Payment Info -->
                  <div class="border-t dark:border-gray-700 pt-3">
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span class="text-gray-500 dark:text-gray-400 flex items-center">
                          <i class="fas fa-coins mr-2 text-yellow-500"></i>
                          จำนวนเงิน
                        </span>
                        <p class="font-medium text-gray-900 dark:text-white">
                          {{ formatCurrency(payment.amount) }}
                        </p>
                      </div>
                      <div v-if="payment.payment_status === 'paid'">
                        <span class="text-gray-500 dark:text-gray-400 flex items-center">
                          <i class="far fa-calendar-check mr-2 text-green-500"></i>
                          วันที่จ่ายเงิน
                        </span>
                        <p class="text-gray-900 dark:text-white">
                          {{ formatDate(payment.paid_at) }}
                        </p>
                      </div>
                      <div v-if="payment.payment_status === 'paid'">
                        <span class="text-gray-500 dark:text-gray-400 flex items-center">
                          <i class="fas fa-money-bill-wave mr-2 text-teal-500"></i>
                          วิธีการจ่ายเงิน
                        </span>
                        <p class="text-gray-900 dark:text-white">
                          {{ getPaymentMethodText(payment.payment_method) }}
                        </p>
                      </div>
                      <div v-if="payment.payment_status === 'paid'">
                        <span class="text-gray-500 dark:text-gray-400 flex items-center">
                          <i class="fas fa-user-check mr-2 text-purple-500"></i>
                          ผู้จ่ายเงิน
                        </span>
                        <p class="text-gray-900 dark:text-white">
                          {{ payment.paid_by?.first_name }} {{ payment.paid_by?.last_name }}
                        </p>
                      </div>
                    </div>

                    <!-- Email Status -->
                    <div
                      v-if="payment.payment_status === 'paid'"
                      class="mt-3 flex items-center text-sm"
                    >
                      <span class="text-gray-500 dark:text-gray-400 flex items-center mr-2">
                        <i class="fas fa-envelope mr-2 text-blue-500"></i>
                        สถานะอีเมล:
                      </span>
                      <span
                        :class="[
                          'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                          payment.email_sent
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        ]"
                      >
                        <i v-if="payment.email_sent" class="fas fa-check-circle mr-1"></i>
                        {{ payment.email_sent ? 'ส่งแล้ว' : 'รอการส่ง' }}
                      </span>
                      <span
                        v-if="payment.email_sent && payment.email_sent_at"
                        class="ml-2 text-xs text-gray-500"
                      >
                        {{ formatDate(payment.email_sent_at) }}
                      </span>
                    </div>
                  </div>

                  <!-- Payment Slip -->
                  <div v-if="payment?.payment_method === 'transfer' && payment?.payment_slip">
                    <div v-if="!imageError" class="relative">
                      <img
                        :src="getPaymentSlipUrl(payment.payment_slip)"
                        :alt="`สลิปการโอนเงิน - ${payment.id}`"
                        class="w-full max-h-48 object-contain rounded-lg"
                        @error="handleImageError"
                      />
                    </div>
                    <div v-else class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                      <i class="fas fa-image-slash text-gray-400 text-2xl mb-2"></i>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        ไม่สามารถโหลดรูปสลิปได้
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="border-t dark:border-gray-700 px-4 py-3 flex gap-2">
                <!-- ปุ่มปิด -->
                <button
                  type="button"
                  class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-lg shadow-gray-500/10 dark:shadow-gray-900/30 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:shadow-gray-600/20 dark:hover:shadow-gray-900/40 hover:-translate-y-0.5 active:shadow-none active:translate-y-0 transform transition-all duration-200 group"
                  @click="closeModal"
                >
                  <i
                    class="fas fa-xmark text-red-500 group-hover:text-red-600 transition-colors"
                  ></i>
                  <span class="relative inline-flex">ปิด</span>
                </button>

                <!-- ปุ่มดาวน์โหลด -->
                <button
                  v-if="payment?.payment_slip"
                  type="button"
                  class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:shadow-none active:translate-y-0 transform transition-all duration-200 group"
                  @click="downloadSlip"
                >
                  <i
                    class="fas fa-download text-white/90 group-hover:text-white transition-opacity"
                  ></i>
                  <span class="relative inline-flex"> ดาวน์โหลดสลิป </span>
                </button>
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

export default {
  name: 'PaymentDetailModal',

  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
  },

  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    paymentId: {
      type: [Number, String],
      default: null
    }
  },

  data() {
    return {
      paymentStore: usePaymentStore(),
      payment: null,
      loading: false,
      imageError: false
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal && this.paymentId) {
        this.fetchPaymentDetail()
      }
    }
  },

  methods: {
    async fetchPaymentDetail() {
      if (!this.paymentId) return
      try {
        this.loading = true
        const detail = await this.paymentStore.fetchPaymentDetail(this.paymentId)
        this.payment = detail
      } catch (error) {
        console.error('Error fetching payment detail:', error)
      } finally {
        this.loading = false
      }
    },

    getPaymentSlipUrl(filename) {
      if (!filename) return ''
      try {
        return `${import.meta.env.VITE_API_URL}/uploads/payment_slip/${filename}`
      } catch (error) {
        console.error('Error generating payment slip URL:', error)
        return ''
      }
    },

    handleImageError() {
      // console.error('ไม่สามารถโหลดรูปสลิปได้:', this.payment?.payment_slip)
      this.imageError = true
    },

    closeModal() {
      this.$emit('close')
    },

    async downloadSlip() {
      if (!this.payment?.payment_slip) return

      try {
        const response = await fetch(this.getPaymentSlipUrl(this.payment.payment_slip))
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `slip-${this.payment.id}${this.getFileExtension(this.payment.payment_slip)}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } catch (error) {
        console.error('Error downloading slip:', error)
      }
    },

    getFileExtension(filename) {
      return filename.substring(filename.lastIndexOf('.'))
    },

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
    formatTime(datetime) {
      return new Date(datetime).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getPaymentMethodText(method) {
      const methods = {
        cash: 'เงินสด',
        transfer: 'โอนเงิน'
      }
      return methods[method] || method
    },
    getStatusClass(status) {
      return {
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': status === 'paid',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400':
          status === 'pending',
        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400': status === 'cancelled'
      }
    },
    getStatusText(status) {
      const statusText = {
        paid: 'จ่ายแล้ว',
        pending: 'รอการจ่าย',
        cancelled: 'ยกเลิก'
      }
      return statusText[status] || status
    }
  }
}
</script>
