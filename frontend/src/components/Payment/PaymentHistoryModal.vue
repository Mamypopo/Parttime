<template>
  <TransitionRoot appear :show="show" as="div">
    <Dialog as="div" @close="$emit('close')" class="relative modal">
      <!-- Backdrop -->
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
      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-3 md:p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
            class="w-full max-w-2xl"
          >
            <DialogPanel
              class="w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
            >
              <!-- Modal Content -->
              <div class="flex flex-col max-h-[90vh]">
                <!-- Header -->
                <div class="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  <DialogTitle as="div" class="flex justify-between items-center">
                    <h3
                      class="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                    >
                      <i class="fas fa-history mr-3 text-purple-500"></i>
                      ประวัติการจ่ายเงิน
                    </h3>
                    <button
                      @click="$emit('close')"
                      class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </DialogTitle>
                </div>
                <!-- Body -->
                <div class="overflow-y-auto">
                  <div class="p-4 md:p-6 space-y-6">
                    <!-- Payment Details Card -->
                    <div
                      class="bg-purple-50 dark:bg-gray-700/50 rounded-xl p-4 md:p-5 border border-purple-100 dark:border-purple-900"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <i class="fas fa-user mr-2 text-purple-500"></i>
                            ชื่อ-นามสกุล
                          </div>
                          <div class="font-medium text-gray-900 dark:text-white">
                            {{ payment.job_participation.user.first_name }}
                            {{ payment.job_participation.user.last_name }}
                          </div>
                        </div>
                        <div class="space-y-1">
                          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <i class="fas fa-briefcase mr-2 text-purple-500"></i>
                            ตำแหน่ง
                          </div>
                          <div class="font-medium text-gray-900 dark:text-white">
                            {{ payment.job_participation.jobPosition.position_name }}
                          </div>
                        </div>
                        <div class="space-y-1">
                          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <i class="fas fa-money-bill-wave mr-2 text-purple-500"></i>
                            จำนวนเงิน
                          </div>
                          <div class="font-medium text-gray-900 dark:text-white">
                            {{ formatCurrency(payment.amount) }}
                          </div>
                        </div>
                        <div class="space-y-1">
                          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <i class="fas fa-envelope mr-2 text-purple-500"></i>
                            สถานะส่งอีเมล
                          </div>
                          <div>
                            <span
                              v-if="payment.email_sent"
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            >
                              <i class="fas fa-check mr-1"></i>
                              ส่งแล้วเมื่อ {{ formatDate(payment.email_sent_at) }}
                            </span>
                            <span
                              v-else
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            >
                              <i class="fas fa-times mr-1"></i>
                              ยังไม่ส่ง
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Payment History Table -->
                    <div class="rounded-xl border border-gray-200 dark:border-gray-700">
                      <div class="w-full overflow-x-auto">
                        <table class="w-full table-auto">
                          <thead class="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                              >
                                <div class="flex items-center">
                                  <i class="fas fa-calendar mr-2"></i>
                                  วันที่จ่าย
                                </div>
                              </th>
                              <th
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                              >
                                <div class="flex items-center">
                                  <i class="fas fa-credit-card mr-2"></i>
                                  วิธีการจ่าย
                                </div>
                              </th>
                              <th
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                              >
                                <div class="flex items-center">
                                  <i class="fas fa-receipt mr-2"></i>
                                  หลักฐาน
                                </div>
                              </th>
                              <th
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                              >
                                <div class="flex items-center">
                                  <i class="fas fa-envelope mr-2"></i>
                                  วันที่ส่งอีเมล
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody
                            class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800"
                          >
                            <tr
                              v-for="history in paymentHistory"
                              :key="history.id"
                              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <td
                                class="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                              >
                                {{ formatDate(history.paid_at) }}
                              </td>
                              <td class="px-4 py-3 whitespace-nowrap">
                                <span
                                  :class="[
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    history.payment_method === 'cash'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  ]"
                                >
                                  <i
                                    :class="[
                                      'mr-1',
                                      history.payment_method === 'cash'
                                        ? 'fas fa-money-bill-wave'
                                        : 'fas fa-exchange-alt'
                                    ]"
                                  ></i>
                                  {{ history.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน' }}
                                </span>
                              </td>
                              <td class="px-4 py-3 whitespace-nowrap">
                                <button
                                  v-if="history.payment_slip"
                                  @click="viewSlip(history.payment_slip)"
                                  class="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                  <i class="fas fa-receipt mr-1"></i>
                                  ดูสลิป
                                </button>
                                <span v-else class="text-gray-400">-</span>
                              </td>
                              <td
                                class="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                              >
                                {{
                                  history.email_sent_at ? formatDate(history.email_sent_at) : '-'
                                }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
    baseApiUrl() {
      return this.paymentStore.baseApiUrl
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
      const uploadFolder = type === 'slip' ? 'payment_slip' : 'documents'

      return `${this.baseApiUrl}/uploads/${uploadFolder}/${cleanPath}`
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

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #9899ee;
}

@media (prefers-color-scheme: dark) {
  .overflow-y-auto {
    scrollbar-color: #9899ee #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #9899ee;
  }
}
</style>
