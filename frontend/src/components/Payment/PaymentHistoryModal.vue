<template>
  <TransitionRoot appear :show="show" as="div">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all"
            >
              <DialogTitle as="div" class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  ประวัติการจ่ายเงิน
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <i class="fas fa-times"></i>
                </button>
              </DialogTitle>
              <div class="space-y-4">
                <!-- Payment Details -->
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="text-gray-500 dark:text-gray-400">ชื่อ-นามสกุล</div>
                    <div class="text-gray-900 dark:text-white">
                      {{ payment.job_participation.user.first_name }}
                      {{ payment.job_participation.user.last_name }}
                    </div>

                    <div class="text-gray-500 dark:text-gray-400">ตำแหน่ง</div>
                    <div class="text-gray-900 dark:text-white">
                      {{ payment.job_participation.jobPosition.position_name }}
                    </div>

                    <div class="text-gray-500 dark:text-gray-400">จำนวนเงิน</div>
                    <div class="text-gray-900 dark:text-white">
                      {{ formatCurrency(payment.amount) }}
                    </div>

                    <div class="text-gray-500 dark:text-gray-400">สถานะส่งอีเมล</div>
                    <div class="text-gray-900 dark:text-white">
                      <span v-if="payment.email_sent">
                        ส่งแล้วเมื่อ {{ formatDate(payment.email_sent_at) }}
                      </span>
                      <span v-else class="text-red-500">ยังไม่ส่ง</span>
                    </div>
                  </div>
                </div>
                <!-- Payment History Table -->
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300"
                        >
                          วันที่จ่าย
                        </th>
                        <th
                          class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300"
                        >
                          วิธีการจ่าย
                        </th>
                        <th
                          class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300"
                        >
                          หลักฐาน
                        </th>
                        <th
                          class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300"
                        >
                          วันที่ส่งอีเมล
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                      <tr v-for="history in paymentHistory" :key="history.id">
                        <td class="p-3 text-sm text-gray-900 dark:text-white">
                          {{ formatDate(history.paid_at) }}
                        </td>
                        <td class="p-3">
                          <span
                            :class="[
                              {
                                'px-2 py-1 rounded-full text-xs': true,
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300':
                                  history.payment_method === 'cash',
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                                  history.payment_method !== 'cash'
                              }
                            ]"
                          >
                            {{ history.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน' }}
                          </span>
                        </td>
                        <td class="p-3">
                          <button
                            v-if="history.payment_slip"
                            @click="viewSlip(history.payment_slip)"
                            class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <i class="fas fa-receipt mr-1"></i>
                            ดูสลิป
                          </button>
                          <span v-else class="text-gray-400">-</span>
                        </td>
                        <td class="p-3 text-sm text-gray-900 dark:text-white">
                          {{ history.email_sent_at ? formatDate(history.email_sent_at) : '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
    <!-- Slip Modal -->
    <SlipModal :show-slip="showSlip" :slip-url="slipUrl" @close="closeSlipModal" />
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { usePaymentStore } from '@/stores/paymentStore'
import SlipModal from '@/components/Payment/SlipModal.vue'

export default {
  name: 'PaymentHistoryModal',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild,
    SlipModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    payment: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      paymentHistory: [],
      showSlip: false,
      slipUrl: ''
    }
  },
  computed: {
    paymentStore() {
      return usePaymentStore()
    },
    baseURL() {
      return this.paymentStore.baseURL
    }
  },
  methods: {
    formatCurrency(amount) {
      if (!amount) return '฿0.00'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount)
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async loadPaymentHistory() {
      if (!this.payment?.job_participation?.id) return
      try {
        const response = await this.paymentStore.fetchPaymentHistoryByParticipant(
          this.payment.job_participation.id
        )
        this.paymentHistory = response.history || []
      } catch (error) {
        console.error('Failed to load payment history:', error)
        this.paymentHistory = []
      }
    },
    viewSlip(slipPath) {
      this.slipUrl = this.getDocumentUrl(slipPath, 'slip')
      this.showSlip = true
    },
    closeSlipModal() {
      this.showSlip = false
      this.slipUrl = ''
    },
    getDocumentUrl(path, type) {
      if (!path || path === '-') return null

      const cleanPath = path.replace(/[[\]"]/g, '')
      const uploadFolder = type === 'slip' ? 'payment-slips' : 'documents'

      return `${this.baseURL}/uploads/${uploadFolder}/${cleanPath}`
    }
  },
  watch: {
    payment: {
      handler: 'loadPaymentHistory',
      immediate: true
    }
  }
}
</script>
