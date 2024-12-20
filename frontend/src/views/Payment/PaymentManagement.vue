<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Navbar -->

      <!-- Main Content Area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <!-- Header -->
        <header class="bg-white dark:bg-gray-800 shadow">
          <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">จัดการการเงิน</h1>
              <button
                @click="showCreateModal = true"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <i class="fas fa-plus"></i>
                <span>สร้างรายการใหม่</span>
              </button>
              <!-- เพิ่มปุ่มจ่ายเงินหลายรายการ -->
              <div class="flex gap-4">
                <button
                  @click="showBulkPayment = true"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <i class="fas fa-money-bill-wave mr-2"></i>
                  จ่ายเงินหลายรายการ
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Stats Cards -->
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- การจ่ายเงินทั้งหมด -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <i class="fas fa-money-bill text-blue-600 dark:text-blue-300"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    การจ่ายเงินทั้งหมด
                  </p>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ totalPayments }}
                  </p>
                </div>
              </div>
            </div>

            <!-- รอดำเนินการ -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <i class="fas fa-clock text-yellow-600 dark:text-yellow-300"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">รอดำเนินการ</p>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ pendingPayments }}
                  </p>
                </div>
              </div>
            </div>

            <!-- จ่ายแล้ว -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <i class="fas fa-check text-green-600 dark:text-green-300"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">จ่ายแล้ว</p>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ paidPayments }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ยกเลิก -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <i class="fas fa-times text-red-600 dark:text-red-300"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">ยกเลิก</p>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ cancelledPayments }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- สถานะ -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >สถานะ</label
                >
                <select
                  v-model="filters.status"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="pending">รอดำเนินการ</option>
                  <option value="paid">จ่ายแล้ว</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>

              <!-- วิธีการจ่าย -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >วิธีการจ่าย</label
                >
                <select
                  v-model="filters.method"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="cash">เงินสด</option>
                  <option value="transfer">โอนเงิน</option>
                </select>
              </div>

              <!-- วันที่เริ่ม -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >วันที่เริ่ม</label
                >
                <input
                  type="date"
                  v-model="filters.dateFrom"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <!-- วันที่สิ้นสุด -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >วันที่สิ้นสุด</label
                >
                <input
                  type="date"
                  v-model="filters.dateTo"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Table -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <!-- Mobile View -->
            <div class="block sm:hidden">
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <div v-for="payment in payments" :key="payment.id" class="p-4">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ payment.job_participation.user.first_name }}
                        {{ payment.job_participation.user.last_name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">รหัส: {{ payment.id }}</p>
                    </div>
                    <span :class="getStatusClass(payment.payment_status)">
                      {{ getStatusText(payment.payment_status) }}
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      งาน: {{ payment.job_participation.jobPosition.job.title }}
                    </p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      จำนวนเงิน: {{ formatCurrency(payment.amount) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      วิธีการจ่าย: {{ getMethodText(payment.payment_method) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      วันที่: {{ formatDate(payment.created_at) }}
                    </p>
                  </div>
                  <div class="mt-3 flex justify-end space-x-3">
                    <button
                      @click="openEditModal(payment)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      v-if="payment.payment_status === 'pending'"
                      @click="confirmCancel(payment)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop View -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      รหัส
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      ชื่อ-นามสกุล
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      งาน
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      จำนวนเงิน
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      สถานะ
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      วิธีการจ่าย
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      วันที่
                    </th>
                    <th
                      class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr
                    v-for="payment in payments"
                    :key="payment.id"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{ payment.id }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ payment.job_participation.user.first_name }}
                        {{ payment.job_participation.user.last_name }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">
                        {{ payment.job_participation.jobPosition.job.title }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ formatCurrency(payment.amount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(payment.payment_status)">
                        {{ getStatusText(payment.payment_status) }}
                      </span>
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{ getMethodText(payment.payment_method) }}
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{ formatDate(payment.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex justify-end space-x-3">
                        <button
                          @click="openEditModal(payment)"
                          class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          v-if="payment.payment_status === 'pending'"
                          @click="confirmCancel(payment)"
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Loading State -->
                  <tr v-if="paymentStore.loading" class="animate-pulse">
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                  <!-- Empty State -->
                  <tr v-if="!paymentStore.loading && payments.length === 0">
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- Mobile Pagination -->
          <div class="flex justify-between items-center sm:hidden">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-4 py-2 border rounded-md text-sm"
              :class="[
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              ก่อนหน้า
            </button>
            <span class="text-sm text-gray-700"> หน้า {{ currentPage }} จาก {{ totalPages }} </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border rounded-md text-sm"
              :class="[
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              ถัดไป
            </button>
          </div>

          <!-- Desktop Pagination -->
          <div class="hidden sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                แสดง
                <span class="font-medium">{{ startItem }}</span>
                ถึง
                <span class="font-medium">{{ endItem }}</span>
                จาก
                <span class="font-medium">{{ totalItems }}</span>
                รายการ
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  v-for="page in paginationPages"
                  :key="page"
                  @click="setPage(page)"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
              </nav>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <PaymentModal
          v-if="showCreateModal || showEditModal"
          :payment="selectedPayment"
          :mode="selectedPayment ? 'edit' : 'create'"
          @close="closeModal"
          @save="savePayment"
        />

        <BulkPaymentModal v-if="showBulkPayment" @close="showBulkPayment = false" />
      </main>
    </div>
  </div>
</template>
<script>
import { usePaymentStore } from '@/stores/paymentStore'
import PaymentModal from '@/components/Payment/PaymentModal.vue'
import BulkPaymentModal from '@/components/Payment/BulkPaymentModal.vue'

export default {
  name: 'PaymentManagement',

  components: {
    PaymentModal,
    BulkPaymentModal
  },

  data() {
    return {
      paymentStore: usePaymentStore(),
      showBulkPayment: false,
      showCreateModal: false,
      showEditModal: false,
      showCancelModal: false,
      selectedPayment: null,
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      payments: [],
      filters: {
        status: '',
        method: '',
        dateFrom: '',
        dateTo: ''
      }
    }
  },

  computed: {
    totalPayments() {
      return this.totalItems
    },

    pendingPayments() {
      return this.payments.filter((p) => p.payment_status === 'pending').length
    },

    paidPayments() {
      return this.payments.filter((p) => p.payment_status === 'paid').length
    },

    cancelledPayments() {
      return this.payments.filter((p) => p.payment_status === 'cancelled').length
    },

    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage)
    },

    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },

    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
    },

    paginationPages() {
      const pages = []
      const maxVisiblePages = window.innerWidth < 640 ? 3 : 5 // responsive

      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1)

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }
  },

  methods: {
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }
      return `px-2 py-1 text-xs font-medium rounded-full ${classes[status] || ''}`
    },

    getStatusText(status) {
      const texts = {
        pending: 'รอดำเนินการ',
        paid: 'จ่ายแล้ว',
        cancelled: 'ยกเลิก'
      }
      return texts[status] || status
    },

    getMethodText(method) {
      return method === 'cash' ? 'เงินสด' : 'โอนเงิน'
    },

    async fetchPayments() {
      try {
        const response = await this.paymentStore.fetchPayments({
          page: this.currentPage,
          limit: this.itemsPerPage,
          ...this.filters
        })
        this.payments = response.data
        this.totalItems = response.total
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      }
    },

    async setPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        await this.fetchPayments()
      }
    },

    async prevPage() {
      await this.setPage(this.currentPage - 1)
    },

    async nextPage() {
      await this.setPage(this.currentPage + 1)
    },

    openEditModal(payment) {
      this.selectedPayment = payment
      this.showEditModal = true
    },

    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.selectedPayment = null
    },

    async savePayment(paymentData) {
      try {
        if (this.selectedPayment) {
          await this.paymentStore.updatePayment(this.selectedPayment.id, paymentData)
        } else {
          await this.paymentStore.createPayment(paymentData)
        }
        this.closeModal()
        await this.fetchPayments()
      } catch (error) {
        console.error('Failed to save payment:', error)
      }
    },

    confirmCancel(payment) {
      this.selectedPayment = payment
      this.showCancelModal = true
    },

    async cancelPayment() {
      try {
        await this.paymentStore.updatePayment(this.selectedPayment.id, {
          status: 'cancelled'
        })
        this.showCancelModal = false
        this.selectedPayment = null
        await this.fetchPayments()
      } catch (error) {
        console.error('Failed to cancel payment:', error)
      }
    },

    handleResize() {
      // Update pagination when window is resized
      this.$forceUpdate()
    }
  },

  watch: {
    filters: {
      handler() {
        this.currentPage = 1
        this.fetchPayments()
      },
      deep: true
    }
  },

  mounted() {
    this.fetchPayments()
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
