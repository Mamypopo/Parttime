<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" class="relative modal" @close="$emit('close')">
      <!-- Backdrop -->
      <TransitionChild
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <!-- Modal Content -->
            <DialogPanel
              class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
            >
              <!-- Loading Overlay -->
              <div
                v-if="paymentStore.isLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-75 rounded-lg"
              >
                <div class="text-lg font-bold text-white animate-pulse">กำลังโหลด...</div>
              </div>

              <!-- Header -->
              <DialogTitle
                as="h3"
                class="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-4"
              >
                ยืนยันการจ่ายเงิน
              </DialogTitle>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- วิธีการจ่ายเงิน -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    วิธีการจ่ายเงิน
                  </label>
                  <select
                    v-model="formData.payment_method"
                    class="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:outline-none"
                    required
                  >
                    <option value="">เลือกวิธีการจ่ายเงิน</option>
                    <option value="cash">เงินสด</option>
                    <option value="transfer">โอนเงิน</option>
                  </select>
                </div>

                <!-- หลักฐานการโอนเงิน -->
                <div v-if="formData.payment_method === 'transfer'">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    หลักฐานการโอนเงิน
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    @change="handleFileUpload"
                    class="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:outline-none"
                    required
                  />
                </div>

                <!-- หมายเหตุ -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    หมายเหตุ
                  </label>
                  <textarea
                    v-model="formData.payment_note"
                    class="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:outline-none"
                    rows="3"
                  ></textarea>
                </div>

                <!-- Buttons -->
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-gray-500"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 hover:shadow-lg"
                    :disabled="paymentStore.isLoading"
                  >
                    {{ paymentStore.isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { usePaymentStore } from '@/stores/paymentStore'
import Swal from 'sweetalert2'

export default {
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot
  },
  props: {
    payment: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      formData: {
        payment_method: '',
        payment_note: '',
        payment_slip: null
      }
    }
  },

  setup() {
    const paymentStore = usePaymentStore()
    return { paymentStore }
  },

  methods: {
    handleFileUpload(event) {
      this.formData.payment_slip = event.target.files[0]
    },

    async handleSubmit() {
      try {
        if (!this.formData.payment_method) {
          await Swal.fire({
            icon: 'warning',
            title: 'กรุณาเลือกวิธีการชำระเงิน',
            confirmButtonText: 'ตกลง'
          })
          return
        }

        if (this.formData.payment_method === 'transfer' && !this.formData.payment_slip) {
          await Swal.fire({
            icon: 'warning',
            title: 'กรุณาแนบสลิปการโอนเงิน',
            confirmButtonText: 'ตกลง'
          })
          return
        }

        const result = await Swal.fire({
          title: 'ยืนยันการบันทึก?',
          text: 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
          this.$emit('confirm', this.formData)
        }
      } catch (error) {
        console.error('Failed to submit payment:', error)
      }
    }
  }
}
</script>
