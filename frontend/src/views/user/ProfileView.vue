<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Profile Header -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div class="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500">
        <div class="absolute -bottom-12 left-6">
          <div
            class="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            @click="openImagePreview"
          >
            <img
              :src="user.profile_image || '/default-avatar.png'"
              class="w-full h-full object-cover"
              alt="Profile"
            />
          </div>
        </div>
      </div>
      <div class="pt-16 pb-6 px-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 class="text-xl font-semibold text-gray-800 dark:text-white">
              {{ user.fullName }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
            <div class="mt-2">
              <span
                class="inline-flex items-center px-3 py-1 text-sm rounded-full"
                :class="getStatusClass"
              >
                {{ getStatusText }}
              </span>
            </div>
          </div>
          <button
            @click="openEditModal"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <i class="fas fa-edit"></i>
            <span class="hidden sm:inline">แก้ไขข้อมูล</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ข้อมูลพื้นฐาน -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-medium mb-6 text-gray-800 dark:text-white">ข้อมูลพื้นฐาน</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="space-y-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">ชื่อ-นามสกุล</p>
            <p class="text-gray-800 dark:text-white">{{ user.fullName || '-' }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">อีเมล</p>
            <p class="text-gray-800 dark:text-white">{{ user.email || '-' }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">เบอร์โทรศัพท์</p>
            <p class="text-gray-800 dark:text-white">{{ formatPhoneNumber(user.phone_number) }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">Line ID</p>
            <p class="text-gray-800 dark:text-white">{{ user.line_id || '-' }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">เพศ</p>
            <p class="text-gray-800 dark:text-white">{{ formatGender(user.gender) }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-gray-500 dark:text-gray-400">วันเกิด</p>
            <p class="text-gray-800 dark:text-white">{{ formatDate(user.birth_date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- เอกสาร -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-medium mb-6 text-gray-800 dark:text-white">เอกสาร</h2>
        <div class="space-y-6">
          <!-- วุฒิการศึกษา -->
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">วุฒิการศึกษา</p>
            <div v-if="getDocumentUrl(user.education_certificate, 'certificate')">
              <a
                :href="getDocumentUrl(user.education_certificate, 'certificate')"
                target="_blank"
                class="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <i class="fas fa-file-alt mr-2"></i>
                ดูไฟล์วุฒิการศึกษา
              </a>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">ยังไม่ได้อัพโหลดวุฒิการศึกษา</p>
          </div>

          <!-- เอกสารอื่นๆ -->
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">เอกสารอื่นๆ</p>
            <div v-if="getDocumentUrl(user.documents, 'documents')">
              <a
                :href="getDocumentUrl(user.documents, 'documents')"
                target="_blank"
                class="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <i class="fas fa-file-alt mr-2"></i>
                ดูไฟล์เอกสาร
              </a>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">ยังไม่ได้อัพโหลดเอกสาร</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Image Preview Modal -->
  <TransitionRoot appear :show="isImagePreviewOpen" as="template">
    <Dialog as="div" @close="closeImagePreview" class="relative modal">
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <DialogOverlay class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
            <DialogPanel class="relative">
              <!-- Close button -->
              <button
                @click="closeImagePreview"
                class="absolute -top-4 -right-4 text-white/90 hover:text-white bg-white/30 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              >
                <i class="fas fa-times text-xl"></i>
              </button>

              <div class="max-h-[80vh] overflow-auto rounded-lg">
                <!-- Image -->
                <img
                  :src="user.profile_image || '/default-avatar.png'"
                  class="max-h-[80vh] max-w-[90vw] rounded-lg"
                  alt="Profile Preview"
                />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
  <!-- Edit Profile Modal -->
  <EditProfileModal
    :is-open="isEditModalOpen"
    :user-info="user"
    @close="closeEditModal"
    @update="handleProfileUpdate"
  />
</template>

<script>
import EditProfileModal from '@/components/Users/EditProfileModal.vue'
import {
  Dialog,
  DialogOverlay,
  DialogPanel,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { useUserStore } from '@/stores/userStore.js'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.extend(buddhistEra)

export default {
  name: 'ProfileView',
  components: {
    EditProfileModal,
    Dialog,
    DialogOverlay,
    DialogPanel,
    TransitionRoot,
    TransitionChild
  },
  data() {
    return {
      userStore: useUserStore(),
      isEditModalOpen: false,
      isImagePreviewOpen: false,
      baseURL: import.meta.env.VITE_API_URL
    }
  },
  computed: {
    user() {
      return this.userStore.getUser
    },
    getStatusClass() {
      return {
        'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400': this.user.approved,
        'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400':
          !this.user.approved
      }
    },
    getStatusText() {
      return this.user.approved ? 'ยืนยันตัวตนแล้ว' : 'รอการยืนยันตัวตน'
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).locale('th').format('D MMMM BBBB')
    },
    formatPhoneNumber(phone) {
      if (!phone) return '-'
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    },
    formatGender(gender) {
      if (!gender) return '-'
      const genderMap = {
        male: 'ชาย',
        female: 'หญิง',
        other: 'อื่นๆ'
      }
      return genderMap[gender.toLowerCase()] || gender
    },
    getDocumentUrl(path, type) {
      if (!path || path === '-') return null
      const cleanPath = path.replace(/[[\]"]/g, '')
      const uploadFolder = type === 'certificate' ? 'certificates' : 'documents'
      return `${this.baseURL}/uploads/${uploadFolder}/${cleanPath}`
    },
    openImagePreview() {
      if (this.user.profile_image) {
        this.isImagePreviewOpen = true
      }
    },
    closeImagePreview() {
      this.isImagePreviewOpen = false
    },
    openEditModal() {
      this.isEditModalOpen = true
    },
    closeEditModal() {
      this.isEditModalOpen = false
    },
    async handleProfileUpdate(formData) {
      try {
        await this.userStore.updateProfile(formData)
        Swal.fire({
          icon: 'success',
          title: 'อัพเดทข้อมูลสำเร็จ',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })
        this.closeEditModal()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถอัพเดทข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })
      }
    }
  }
}
</script>
