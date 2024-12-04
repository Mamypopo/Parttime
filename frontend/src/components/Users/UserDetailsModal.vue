<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" @close="closeModal" class="relative modal">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" @click="closeModal" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
          enter-to="opacity-100 sm:scale-100 translate-y-0"
          leave="duration-200 ease-in"
          leave-from="opacity-100 sm:scale-100 translate-y-0"
          leave-to="opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
        >
          <HeadlessDialogPanel
            class="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
          >
            <!-- Header -->
            <div
              class="sticky top-0 z-10 flex justify-between items-center p-6 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 rounded-t-xl"
            >
              <HeadlessDialogTitle class="text-2xl font-semibold text-white">
                รายละเอียดผู้ใช้ #{{ user.id }}
              </HeadlessDialogTitle>
              <button
                @click="closeModal"
                class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- Content -->
            <div
              class="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto max-h-[calc(100vh-8rem)]"
            >
              <!-- Profile Image -->
              <div class="flex flex-col items-center">
                <div
                  class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg ring-4 ring-[#9899ee]/30 dark:ring-[#6667AA]/30 mb-4 cursor-pointer transform transition-transform hover:scale-105"
                  @click="openImagePreview"
                >
                  <img
                    v-if="user.profileImage"
                    :src="adminUserStore.getProfileImage(user.profileImage)"
                    :alt="user.fullName"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display = 'none'"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center text-white font-medium text-3xl"
                  >
                    {{ user.fullName.charAt(0) }}
                  </div>
                </div>
                <div class="text-center">
                  <p class="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {{ user.fullName }}
                  </p>
                  <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                </div>
              </div>

              <!-- Basic Info -->
              <div
                class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2"
              >
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  ข้อมูลพื้นฐาน
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="(item, index) in userInfo" :key="index" class="space-y-1">
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.label }}</p>
                    <p class="text-base font-medium text-gray-800 dark:text-gray-100">
                      {{ item.value || '-' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Skills -->
              <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  ทักษะความสามารถ
                </h3>
                <div class="flex flex-wrap gap-3">
                  <span
                    v-for="skill in user.skills"
                    :key="skill"
                    class="px-3 py-1 text-sm font-medium rounded-full bg-purple-200 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 shadow-sm"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>

              <!-- Documents -->
              <div
                v-for="doc in documents"
                :key="doc.title"
                class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <h3 class="text-lg font-semibold text-gray-700 mb-4 dark:text-gray-200">
                  {{ doc.title }}
                </h3>
                <div v-if="doc.file" class="flex items-center gap-2">
                  <a
                    :href="doc.url"
                    target="_blank"
                    class="text-[#6ED7D1] hover:text-[#4bb3af] dark:text-[#4CB3B3] dark:hover:text-[#3A8A8A] inline-flex items-center transition-colors duration-200 font-semibold"
                  >
                    <i :class="[doc.icon, 'mr-2']"></i>
                    {{ doc.label }}
                  </a>
                </div>
                <p v-else class="text-gray-400 dark:text-gray-500 text-sm">ไม่มีไฟล์แนบ</p>
              </div>
            </div>
          </HeadlessDialogPanel>
        </TransitionChild>
      </div>
    </HeadlessDialog>
  </TransitionRoot>

  <!-- Image Preview Modal -->
  <TransitionRoot appear :show="isImagePreviewOpen" as="template">
    <HeadlessDialog as="div" @close="closeImagePreview" class="relative modal">
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
            <HeadlessDialogPanel class="relative w-full max-w-3xl mx-auto">
              <!-- Close Button -->
              <button
                @click="closeImagePreview"
                class="absolute -top-4 -right-4 text-white/90 hover:text-white bg-white/30 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              >
                <i class="fas fa-times text-xl"></i>
              </button>

              <!-- Image Container -->
              <div class="max-h-[80vh] overflow-auto rounded-lg">
                <img
                  :src="adminUserStore.getProfileImage(user.profileImage)"
                  :alt="user.fullName"
                  class="w-full h-auto object-contain rounded-lg shadow-2xl"
                  style="max-height: calc(80vh - 2rem)"
                />
              </div>
            </HeadlessDialogPanel>
          </TransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>

<script>
import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  DialogTitle as HeadlessDialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { useAdminUserStore } from '@/stores/adminUserStore'

export default {
  components: {
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild
  },
  emits: ['close', 'onClose'],
  props: {
    isOpen: Boolean,
    user: Object
  },

  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      isImagePreviewOpen: false
    }
  },
  setup() {
    const adminUserStore = useAdminUserStore()
    return {
      adminUserStore
    }
  },
  computed: {
    userInfo() {
      return [
        { label: 'ชื่อ-นามสกุล', value: this.user.fullName },
        { label: 'อีเมล', value: this.user.email },
        { label: 'เบอร์โทรศัพท์', value: this.user.phoneNumber },
        { label: 'เลขบัตรประชาชน', value: this.user.idCardNumber },
        { label: 'Line ID', value: this.user.lineId },
        { label: 'เพศ', value: this.user.gender },
        { label: 'วันเกิด', value: this.user.birthDate },
        { label: 'อายุ', value: `${this.user.age} ปี` }
      ]
    },

    documents() {
      return [
        {
          title: 'วุฒิการศึกษา',
          file: this.user.educationCertificate,
          url: this.getDocumentUrl(this.user.educationCertificate, 'certificate'),
          icon: 'fas fa-file-pdf',
          label: 'ดูไฟล์วุฒิการศึกษา'
        },
        {
          title: 'เอกสารประกอบ',
          file: this.user.documents,
          url: this.getDocumentUrl(this.user.documents, 'document'),
          icon: 'fas fa-folder-open',
          label: 'ดูเอกสารประกอบ'
        }
      ].filter((doc) => doc.url !== null)
    }
  },

  methods: {
    openImagePreview() {
      if (this.user.profileImage) {
        this.isImagePreviewOpen = true
      }
    },

    closeImagePreview() {
      this.isImagePreviewOpen = false
    },
    closeModal() {
      this.$emit('close')
    },
    getDocumentUrl(path, type) {
      if (!path || path === '-') return null

      const cleanPath = path.replace(/[[\]"]/g, '')
      const uploadFolder = type === 'certificate' ? 'certificates' : 'documents'

      return `${this.baseURL}/uploads/${uploadFolder}/${cleanPath}`
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
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 20px;
  border: 2px solid #f3f4f6;
}
</style>
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
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 20px;
  border: 2px solid #f3f4f6;
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-y-auto {
    scrollbar-color: #9899ee #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #9899ee;
    border: 2px solid #1f2937;
  }
}
</style>
