<template>
  <div class="p-4 space-y-6">
    <!-- Profile Header -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
    >
      <div class="relative h-40 md:h-48">
        <!-- Background Cover -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80"
        >
          <div class="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        </div>

        <!-- Profile Image -->
        <div class="absolute -bottom-16 left-6 md:left-8">
          <div class="group relative">
            <div
              class="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white dark:border-gray-800 ring-4 ring-[#9899ee]/30 dark:ring-[#6667AA] overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
            >
              <img
                :src="user.profile_image || '/default-avatar.png'"
                class="w-full h-full object-cover"
                alt="Profile"
                @click="openImagePreview"
              />
            </div>
            <div
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
              @click="openImagePreview"
            >
              <i class="fas fa-camera text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="pt-20 md:pt-8 pb-6 px-6 md:px-8 md:ml-44">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <!-- ข้อมูลส่วนตัว -->
          <div class="text-center md:text-left space-y-2">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
              {{ user.fullName }}
            </h1>
            <p
              class="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2"
            >
              <i class="fas fa-envelope text-sm"></i>
              {{ user.email }}
            </p>
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span
                class="inline-flex items-center px-3 py-1 text-sm rounded-full transition-colors duration-200"
                :class="getStatusClass"
              >
                <i class="fas fa-check-circle mr-1.5" v-if="user.approved"></i>
                <i class="fas fa-clock mr-1.5" v-else></i>
                {{ getStatusText }}
              </span>
            </div>
          </div>

          <!-- Edit Button -->
          <button
            @click="openEditModal"
            class="self-center md:self-start px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 dark:bg-violet-400/10 dark:hover:bg-violet-400/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <i class="fas fa-edit"></i>
            <span>แก้ไขข้อมูล</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Skills Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <i class="fas fa-tools text-violet-500"></i>
        ทักษะและความสามารถ
      </h2>
      <div class="flex flex-wrap gap-2">
        <template v-if="user.skills && user.skills.length > 0">
          <span
            v-for="skill in userSkills"
            :key="skill"
            class="px-4 py-2 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-xl text-sm font-medium"
          >
            {{ skill }}
          </span>
        </template>
        <span v-else class="text-gray-500 dark:text-gray-400">ยังไม่ได้เพิ่มทักษะ</span>
      </div>
    </div>

    <!-- Info Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- ข้อมูลพื้นฐาน -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
      >
        <h2
          class="text-lg font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-user-circle text-violet-500 dark:text-violet-400"></i>
          ข้อมูลพื้นฐาน
        </h2>

        <!-- Grid Layout สำหรับข้อมูล -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          <!-- ข้อมูลส่วนตัว -->
          <div class="space-y-6">
            <!-- ชื่อ-นามสกุล -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10"
            >
              <div
                class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
              >
                <i class="fas fa-user text-violet-500 dark:text-violet-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">ชื่อ-นามสกุล</p>
                <p class="text-gray-800 dark:text-white font-medium">{{ user.fullName || '-' }}</p>
              </div>
            </div>

            <!-- เพศ -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10"
            >
              <div
                class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
              >
                <i class="fas fa-venus-mars text-violet-500 dark:text-violet-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">เพศ</p>
                <p class="text-gray-800 dark:text-white font-medium">
                  {{ formatGender(user.gender) }}
                </p>
              </div>
            </div>

            <!-- อายุ -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10"
            >
              <div
                class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
              >
                <i class="fas fa-birthday-cake text-violet-500 dark:text-violet-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">อายุ</p>
                <p class="text-gray-800 dark:text-white font-medium">
                  {{ user.age ? `${user.age} ปี` : '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- ข้อมูลการติดต่อ -->
          <div class="space-y-6">
            <!-- เบอร์โทรศัพท์ -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10"
            >
              <div
                class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
              >
                <i class="fas fa-phone text-violet-500 dark:text-violet-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">เบอร์โทรศัพท์</p>
                <p class="text-gray-800 dark:text-white font-medium">
                  {{ formatPhoneNumber(user.phone_number) }}
                </p>
              </div>
            </div>

            <!-- Line ID -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10"
            >
              <div
                class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
              >
                <i class="fab fa-line text-violet-500 dark:text-violet-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">Line ID</p>
                <p class="text-gray-800 dark:text-white font-medium">{{ user.line_id || '-' }}</p>
              </div>
            </div>

            <!-- วันเกิด -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-900/10"
            >
              <div
                class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
              >
                <i class="fas fa-calendar text-violet-500 dark:text-violet-400 text-lg"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">วันเกิด</p>
                <p class="text-gray-800 dark:text-white font-medium">
                  {{ formatDate(user.birth_date) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- เอกสาร -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
      >
        <h2
          class="text-lg font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2"
        >
          <i class="fas fa-file-alt text-violet-500 dark:text-violet-400"></i>
          เอกสาร
        </h2>
        <div class="space-y-6">
          <!-- วุฒิการศึกษา -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center"
            >
              <i class="fas fa-graduation-cap text-violet-500 dark:text-violet-400"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">วุฒิการศึกษา</p>
              <a
                v-if="getDocumentUrl(user.education_certificate, 'certificate')"
                :href="getDocumentUrl(user.education_certificate, 'certificate')"
                target="_blank"
                class="inline-flex items-center gap-2 text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors duration-200"
              >
                <i class="fas fa-external-link-alt"></i>
                <span>ดูเอกสาร</span>
              </a>
              <p v-else class="text-gray-500 dark:text-gray-400">ยังไม่ได้อัพโหลดเอกสาร</p>
            </div>
          </div>

          <!-- เอกสารอื่นๆ -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center"
            >
              <i class="fas fa-file-alt text-violet-500 dark:text-violet-400"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">เอกสารอื่นๆ</p>
              <a
                v-if="getDocumentUrl(user.documents, 'documents')"
                :href="getDocumentUrl(user.documents, 'documents')"
                target="_blank"
                class="inline-flex items-center gap-2 text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors duration-200"
              >
                <i class="fas fa-external-link-alt"></i>
                <span>ดูเอกสาร</span>
              </a>
              <p v-else class="text-gray-500 dark:text-gray-400">ยังไม่ได้อัพโหลดเอกสาร</p>
            </div>
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
    userSkills() {
      const skills = this.userStore.user?.skills
      if (!skills) return []
      const skillsArray =
        typeof skills === 'string' ? JSON.parse(skills.replace(/'/g, '"')) : skills

      return skillsArray.map((skill) => skill.toString().replace(/[[\]"]+/g, ''))
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
