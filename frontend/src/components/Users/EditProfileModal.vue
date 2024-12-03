<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative modal">
      <!-- Overlay -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              class="p-2 w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
            >
              <!-- Header -->
              <div class="px-6 py-4 border-b dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <DialogTitle as="h3" class="text-xl font-semibold text-gray-900 dark:text-white">
                    แก้ไขข้อมูลส่วนตัว
                  </DialogTitle>
                  <button
                    @click="closeModal"
                    class="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 space-y-8">
                <!-- รูปโปรไฟล์ -->
                <div class="flex flex-col items-center gap-4">
                  <div class="relative group">
                    <img
                      :src="localPreviewImage || userInfo?.profile_image || '/default-avatar.png'"
                      class="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700"
                      alt="Profile"
                    />
                    <button
                      @click="$refs.imageInput.click()"
                      class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="fas fa-camera text-white text-xl"></i>
                    </button>
                  </div>
                  <input
                    type="file"
                    @change="handleImageChange"
                    accept="image/*"
                    class="hidden"
                    ref="imageInput"
                  />
                </div>

                <!-- ข้อมูลส่วนตัว -->
                <div class="space-y-4">
                  <h3
                    class="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700"
                  >
                    ข้อมูลส่วนตัว
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >ชื่อ</label
                      >
                      <input
                        v-model="form.first_name"
                        type="text"
                        class="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >นามสกุล</label
                      >
                      <input
                        v-model="form.last_name"
                        type="text"
                        class="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >เบอร์โทร</label
                      >
                      <input
                        v-model="form.phone_number"
                        type="tel"
                        class="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Line ID</label
                      >
                      <input
                        v-model="form.line_id"
                        type="text"
                        class="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow"
                      />
                    </div>
                  </div>
                </div>

                <!-- เอกสาร -->
                <div class="space-y-4">
                  <h3
                    class="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700"
                  >
                    เอกสารสำคัญ
                  </h3>
                  <div class="space-y-6">
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >วุฒิการศึกษา</label
                      >
                      <input
                        type="file"
                        @change="handleCertificateChange"
                        accept=".pdf,.doc,.docx"
                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-400 dark:hover:file:bg-blue-900/70 transition-colors"
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >เอกสารอื่นๆ</label
                      >
                      <input
                        type="file"
                        @change="handleDocumentsChange"
                        accept=".pdf,.doc,.docx"
                        multiple
                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-400 dark:hover:file:bg-blue-900/70 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
                <button
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  @click="confirmAndSave"
                  class="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  :disabled="loading"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                  {{ loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
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
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/userStore'
import axios from 'axios'

export default {
  name: 'EditProfileModal',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    userInfo: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'update'],
  data() {
    return {
      localPreviewImage: null,
      loading: false,
      form: {
        first_name: '',
        last_name: '',
        phone_number: '',
        line_id: ''
      },
      files: {
        profile_image: null,
        education_certificate: null,
        user_documents: null
      }
    }
  },
  watch: {
    userInfo: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            first_name: newVal.first_name || '',
            last_name: newVal.last_name || '',
            phone_number: newVal.phone_number || '',
            line_id: newVal.line_id || ''
          }
        }
      }
    }
  },
  methods: {
    async confirmAndSave() {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการแก้ไขข้อมูล',
          text: 'คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#3B82F6',
          cancelButtonColor: '#EF4444',
          reverseButtons: true
        })

        if (result.isConfirmed) {
          await this.saveChanges()
        }
      } catch (error) {
        console.error('Error in confirmation:', error)
      }
    },
    async saveChanges() {
      try {
        this.loading = true

        const formData = new FormData()

        // เพิ่มข้อมูลพื้นฐาน
        Object.keys(this.form).forEach((key) => {
          if (this.form[key]) {
            formData.append(key, this.form[key])
          }
        })

        // เพิ่มไฟล์
        if (this.files.profile_image) {
          formData.append('profile_image', this.files.profile_image)
        }
        if (this.files.education_certificate) {
          formData.append('education_certificate', this.files.education_certificate)
        }
        if (this.files.user_documents) {
          Array.from(this.files.user_documents).forEach((file) => {
            formData.append('user_documents', file)
          })
        }

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/update-profile`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

        if (response.data) {
          // อัพเดท user store
          const userStore = useUserStore()
          await userStore.fetchUser()

          await Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'ข้อมูลของคุณถูกอัพเดทเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3B82F6'
          })

          this.closeModal()
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })
      } finally {
        this.loading = false
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.files.profile_image = file
        // สร้าง preview
        this.localPreviewImage = URL.createObjectURL(file)
      }
    },
    handleCertificateChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.files.education_certificate = file
      }
    },
    handleDocumentsChange(event) {
      const files = event.target.files
      if (files.length) {
        this.files.user_documents = files
      }
    },
    closeModal() {
      this.$emit('close')
      // รีเซ็ตฟอร์มและไฟล์
      this.localPreviewImage = null
      this.files = {
        profile_image: null,
        education_certificate: null,
        user_documents: null
      }
    }
  }
}
</script>
