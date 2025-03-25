<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative modal">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
            >
              <!-- Header -->
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center justify-between"
              >
                <span>Import ผู้ใช้งานจาก Excel</span>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <i class="fas fa-times"></i>
                </button>
              </DialogTitle>

              <!-- Content -->
              <div class="mt-4">
                <!-- Upload Zone -->
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                  @drop.prevent="handleDrop"
                  @dragover.prevent
                  @click="$refs.fileInput.click()"
                >
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept=".xlsx,.xls"
                    @change="handleFileSelect"
                  />

                  <div v-if="!selectedFile" class="space-y-3">
                    <i class="fas fa-file-excel text-4xl text-gray-400 dark:text-gray-500"></i>
                    <div class="space-y-2">
                      <p class="text-gray-600 dark:text-gray-400">
                        ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        รองรับไฟล์ .xlsx, .xls ขนาดไม่เกิน 5MB
                      </p>
                    </div>
                  </div>

                  <div
                    v-else
                    class="flex items-center justify-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  >
                    <i class="fas fa-file-excel text-green-500"></i>
                    <span class="text-gray-900 dark:text-white">{{ selectedFile.name }}</span>
                    <button
                      @click.stop="clearFile"
                      class="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <!-- File Requirements -->
                <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <p class="font-medium mb-2">ข้อกำหนดไฟล์:</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>ไฟล์ Excel (.xlsx, .xls)</li>
                    <li>ขนาดไฟล์ไม่เกิน 5MB</li>
                    <li>ต้องมีคอลัมน์: ชื่อ-นามสกุล, คำนำหน้า</li>
                  </ul>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!selectedFile || isLoading"
                  @click="handleImport"
                >
                  <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
                  <span>{{ isLoading ? 'กำลังอัพโหลด...' : 'Import' }}</span>
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
import adminService from '@/services/adminService'
import Swal from 'sweetalert2'

export default {
  name: 'ImportUsersModal',

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
    }
  },

  data() {
    return {
      selectedFile: null,
      isLoading: false
    }
  },

  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (this.validateFile(file)) {
          this.selectedFile = file
        }
      }
    },

    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) {
        if (this.validateFile(file)) {
          this.selectedFile = file
        }
      }
    },

    validateFile(file) {
      const validExtensions = ['.xlsx', '.xls']
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

      if (!validExtensions.includes(extension)) {
        Swal.fire({
          icon: 'error',
          title: 'ไฟล์ไม่ถูกต้อง',
          text: 'กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น'
        })
        return false
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'ไฟล์มีขนาดใหญ่เกินไป',
          text: 'กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB'
        })
        return false
      }

      return true
    },

    async handleImport() {
      if (!this.selectedFile) return

      this.isLoading = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        const response = await adminService.importUsers(formData)
        this.$emit('success')
        this.closeModal()

        const duplicateEmails = response.data.errors[0]?.split('แถวที่ 1:')[1]?.trim()

        if (response.data.errors.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Import เสร็จสิ้น (มีบางรายการไม่สำเร็จ)',
            html: `
              <div class="text-left">
                <div class="mb-3">
                  <span class="font-semibold text-green-600">นำเข้าสำเร็จ:</span> ${response.data.imported} รายการ
                </div>
                ${
                  response.data.errors.length > 0
                    ? `
                  <div class="mb-3">
                    <span class="font-semibold text-red-600">ผิดพลาด:</span> ${response.data.errors.length} รายการ
                  </div>
                  <div class="mt-4">
                    <p class="font-semibold mb-2 text-gray-700">รายการที่ผิดพลาด:</p>
                    <div class="error-list">
                      ${duplicateEmails
                        .split('แถวที่')
                        .map((email) => {
                          if (!email.trim()) return ''
                          return `<div class="error-item">• อีเมล ${email.trim()}</div>`
                        })
                        .join('')}
                    </div>
                  </div>
                  `
                    : ''
                }
              </div>
            `,
            confirmButtonText: 'ตกลง',
            customClass: {
              container: 'import-result-modal',
              popup: 'rounded-xl',
              htmlContainer: 'custom-html-container'
            }
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Import สำเร็จ',
            text: `นำเข้าข้อมูลผู้ใช้สำเร็จ ${response.data.imported} รายการ`,
            showConfirmButton: false,
            timer: 1500,
            position: 'top-end',
            toast: true
          })
        }
      } catch (error) {
        console.error('Import error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถ import ไฟล์ได้',
          confirmButtonText: 'ตกลง'
        })
      } finally {
        this.isLoading = false
      }
    },

    clearFile() {
      this.selectedFile = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    closeModal() {
      this.clearFile()
      this.$emit('close')
    }
  }
}
</script>

<style>
.import-result-modal .swal2-popup {
  @apply max-w-xl;
}

.import-result-modal .custom-html-container {
  @apply text-left;
  max-height: 60vh !important;
  overflow-y: auto !important;
}

.error-list {
  @apply bg-red-50 p-4 rounded-lg mt-3 text-sm space-y-1;
  max-height: 40vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

.error-list::-webkit-scrollbar {
  width: 6px;
}

.error-list::-webkit-scrollbar-track {
  @apply bg-red-50;
}

.error-list::-webkit-scrollbar-thumb {
  @apply bg-red-200 rounded-full;
}

.error-item {
  @apply flex items-start space-x-2 py-1;
}

.error-item::before {
  content: '•';
  @apply text-red-400;
}

.status-success {
  @apply text-green-600 font-medium;
}

.status-error {
  @apply text-red-600 font-medium;
}
</style>
