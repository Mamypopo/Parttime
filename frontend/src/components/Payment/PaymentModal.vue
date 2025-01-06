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
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center">
          <TransitionChild
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
            class="w-full max-w-md"
          >
            <!-- Modal Content -->
            <DialogPanel
              class="relative w-full transform rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all"
            >
              <!-- Loading Overlay -->
              <div
                v-if="paymentStore.isLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-gray-700 bg-opacity-75 rounded-2xl"
              >
                <div class="text-lg font-bold text-white animate-pulse">กำลังโหลด...</div>
              </div>

              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <DialogTitle
                  as="h3"
                  class="text-lg font-extrabold text-center text-gray-800 dark:text-white tracking-wide"
                >
                  ยืนยันการจ่ายเงิน
                </DialogTitle>
              </div>

              <!-- Form -->
              <div class="px-6 py-6 space-y-6">
                <!-- Payment Method -->
                <div>
                  <label
                    class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center"
                  >
                    <i class="fas fa-credit-card mr-2 text-purple-500"></i>
                    วิธีการจ่ายเงิน
                  </label>
                  <div class="grid grid-cols-2 gap-4">
                    <button
                      @click="formData.payment_method = 'cash'"
                      :class="[
                        'flex items-center justify-center p-4 rounded-lg border transition-all duration-200',
                        formData.payment_method === 'cash'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      ]"
                    >
                      <i class="fas fa-money-bill-wave mr-2"></i>
                      <span>เงินสด</span>
                    </button>
                    <button
                      @click="formData.payment_method = 'transfer'"
                      :class="[
                        'flex items-center justify-center p-4 rounded-lg border transition-all duration-200',
                        formData.payment_method === 'transfer'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      ]"
                    >
                      <i class="fas fa-receipt mr-2"></i>
                      <span>โอนเงิน</span>
                    </button>
                  </div>
                </div>
                <!-- Payment Slip -->
                <div v-if="formData.payment_method === 'transfer'" class="space-y-2">
                  <label
                    class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center"
                  >
                    <i class="fas fa-file-upload mr-2 text-purple-500"></i>
                    หลักฐานการโอนเงิน
                  </label>
                  <div class="relative">
                    <label class="cursor-pointer block w-full">
                      <input
                        type="file"
                        accept="image/*"
                        ref="fileInputRef"
                        @change="handleFileUpload"
                        class="hidden"
                        required
                      />
                      <!-- แสดงพื้นที่อัพโหลด -->
                      <div
                        class="flex flex-col items-center justify-center p-4 rounded-lg border border-dashed border-purple-300 dark:border-purple-600 dark:bg-gray-800/50 hover:border-purple-500 transition-colors duration-200"
                      >
                        <!-- ถ้ามีไฟล์ที่เลือก -->
                        <template v-if="formData.payment_slip">
                          <div
                            class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
                          >
                            <i class="fas fa-file-alt text-purple-500"></i>
                            <span>{{ formData.payment_slip.name }}</span>
                            <span class="text-xs text-gray-500">
                              ({{ formatFileSize(formData.payment_slip.size) }})
                            </span>
                          </div>
                          <!-- ปุ่มลบไฟล์ -->
                          <button
                            @click="removeFile"
                            class="mt-2 text-xs text-red-500 hover:text-red-600"
                          >
                            <i class="fas fa-times mr-1"></i>
                            ลบไฟล์
                          </button>
                        </template>

                        <!-- ถ้ายังไม่มีไฟล์ -->
                        <template v-else>
                          <i class="fas fa-cloud-upload-alt text-2xl text-purple-500 mb-2"></i>
                          <span class="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์</span>
                          <span class="text-xs text-gray-400 mt-1"
                            >รองรับไฟล์รูปภาพ JPG, JPEG, PNG</span
                          >
                        </template>
                      </div>
                    </label>
                  </div>
                </div>
                <!-- Payment Note -->
                <div>
                  <label
                    class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center"
                  >
                    <i class="fas fa-sticky-note mr-2 text-purple-500"></i>
                    หมายเหตุ
                  </label>
                  <textarea
                    v-model="formData.payment_note"
                    rows="3"
                    placeholder="ระบุข้อมูลเพิ่มเติม"
                    class="block w-full px-4 py-3 text-sm rounded-lg border dark:border-gray-700 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-400/50 focus:outline-none resize-none transition-all duration-200"
                  ></textarea>
                </div>
              </div>

              <!-- Footer Buttons -->
              <div
                class="flex justify-end items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl"
              >
                <button
                  type="button"
                  @click="$emit('close')"
                  class="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <i class="fas fa-times mr-2"></i>
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="ml-4 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 rounded-lg shadow-lg hover:opacity-90 transition-all duration-200"
                  :disabled="paymentStore.isLoading"
                  @click.prevent="handleSubmit"
                >
                  <span class="flex items-center">
                    <i class="fas fa-check mr-2"></i>
                    {{ paymentStore.isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
                  </span>
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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { usePaymentStore } from '@/stores/paymentStore'
import Swal from 'sweetalert2'
import { ref } from 'vue'

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
      required: true,
      validator(value) {
        // ตรวจสอบว่ามีข้อมูลครบไหม
        return value.id && value.job_participation_id && value.amount
      }
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
  created() {
    // Debug: ตรวจสอบค่า props ที่ได้รับ
    console.log('Payment props received:', this.payment)
  },
  setup() {
    const paymentStore = usePaymentStore()
    return { paymentStore }
  },

  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // เช็คขนาดไฟล์ (ตัวอย่าง: จำกัดที่ 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: 'error',
            title: 'ไฟล์มีขนาดใหญ่เกินไป',
            text: 'กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB',
            confirmButtonText: 'ตกลง'
          })
          event.target.value = '' // รีเซ็ต input
          return
        }
        this.formData.payment_slip = file // เก็บข้อมูลไฟล์ใน formData
      }
    },

    async handleSubmit() {
      try {
        // ขั้นตอนยืนยันก่อนบันทึก
        const confirmation = await Swal.fire({
          title: 'ยืนยันการบันทึก?',
          text: 'กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก'
        })

        if (!confirmation.isConfirmed) {
          return // ยกเลิกการบันทึกหากไม่ได้กดยืนยัน
        }

        // ตรวจสอบว่าเลือกวิธีการชำระเงินหรือยัง
        if (!this.formData.payment_method) {
          throw new Error('กรุณาเลือกวิธีการชำระเงิน')
        }
        // ถ้าเลือกโอนเงินต้องมีสลิป
        if (this.formData.payment_method === 'transfer' && !this.formData.payment_slip) {
          throw new Error('กรุณาแนบหลักฐานการโอนเงิน')
        }

        const formData = new FormData()

        // ข้อมูลพื้นฐาน
        formData.append('payment_status', 'paid')
        formData.append('payment_method', this.formData.payment_method)

        // หมายเหตุ (ถ้ามี)
        if (this.formData.payment_note?.trim()) {
          formData.append('payment_note', this.formData.payment_note.trim())
        }
        // สลิปการโอน (ถ้ามี)
        if (this.formData.payment_slip) {
          formData.append('payment_slip', this.formData.payment_slip)
        }
        // รายการตรวจสอบ
        const checklistItems = {
          payment_method: true,
          slip_uploaded: this.formData.payment_slip ? true : false,
          amount_verified: true,
          notes: this.formData.payment_note?.trim() || ''
        }
        formData.append('checklist_items', JSON.stringify(checklistItems))

        const result = await this.paymentStore.updatePaymentStatus(this.payment.id, formData)
        if (result.success) {
          await Swal.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            showConfirmButton: false,
            timer: 1500
          })
          this.$emit('close')
          this.$emit('refresh')
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        console.error('Submit error:', error)
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
          confirmButtonText: 'ตกลง'
        })
      }
    },
    removeFile() {
      this.formData.payment_slip = null // ลบข้อมูลไฟล์
      // รีเซ็ต input file ด้วย ref
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.value = '' // รีเซ็ตค่าใน input file
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  },
  mounted() {
    this.fileInputRef = ref(null)
  }
}
</script>
