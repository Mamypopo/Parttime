<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative modal" @close="closeModal">
      <!-- Background Overlay -->
      <TransitionChild
        as="template"
        enter="transition-opacity duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="transition-all duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="transition-all duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl pointer-events-auto"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 rounded-t-2xl"
              >
                <DialogTitle class="text-lg font-semibold text-white">
                  <i class="fas fa-clipboard-list mr-2"></i>
                  รายละเอียดงาน #ID: {{ job?.id }} /
                  <template v-if="adminStore.getAdmin.role === 'admin'">
                    {{ job?.title }}
                  </template>
                  <template v-else>
                    {{ job?.location }}
                  </template>
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                >
                  <i class="fas fa-xmark text-xl"></i>
                </button>
              </div>

              <!-- Content -->
              <div class="p-4">
                <div class="space-y-4">
                  <!-- ข้อมูลพื้นฐาน -->
                  <div class="grid grid-cols-2 gap-4">
                    <!-- <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <i class="fas fa-briefcase mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i
                        >ชื่องาน
                      </h4>
                      <p class="mt-1 text-gray-900 dark:text-gray-100">{{ job?.title }}</p>
                    </div> -->
                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <i class="fas fa-map-marker-alt mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i
                        >สถานที่
                      </h4>
                      <p class="mt-1 text-gray-900 dark:text-gray-100">{{ job?.location }}</p>
                    </div>
                  </div>

                  <!-- ส่วนแสดงผู้ดูแลงานตรงนี้ -->
                  <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                    <h4
                      class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3"
                    >
                      <i class="fas fa-user-shield mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i>
                      ผู้ดูแลงาน
                    </h4>

                    <div class="space-y-2">
                      <div v-if="job?.JobAdmins?.length" class="grid gap-2">
                        <div
                          v-for="admin in job.JobAdmins"
                          :key="admin.id"
                          class="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <div class="font-medium text-gray-900 dark:text-gray-100">
                              {{ admin.admin.first_name }} {{ admin.admin.last_name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                              {{ admin.admin.phone }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        ยังไม่มีผู้ดูแลงาน
                      </div>
                    </div>
                  </div>
                  <!-- วันและเวลา -->
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <i class="fas fa-calendar mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i
                        >วันที่
                      </h4>
                      <p class="mt-1 text-gray-900 dark:text-gray-100">
                        {{ formatDate(job?.work_date) }}
                      </p>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <i class="fas fa-clock mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i>เริ่ม
                      </h4>
                      <p class="mt-1 text-gray-900 dark:text-gray-100">
                        {{ formatTime(job?.start_time) }}
                      </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <i class="fas fa-clock mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i>สิ้นสุด
                      </h4>
                      <p class="mt-1 text-gray-900 dark:text-gray-100">
                        {{ formatTime(job?.end_time) }}
                      </p>
                    </div>
                  </div>

                  <!-- รายละเอียดเพิ่มเติม -->
                  <div v-if="job?.details" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                    <h4
                      class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2"
                    >
                      <i class="fas fa-info-circle mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i
                      >รายละเอียดเพิ่มเติม
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {{ job?.details }}
                    </p>
                  </div>

                  <!-- ตำแหน่งงาน -->
                  <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                    <h4
                      class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2"
                    >
                      <i class="fas fa-users mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i>ตำแหน่งงาน
                    </h4>
                    <div class="space-y-2">
                      <div
                        v-for="position in job?.JobPositions"
                        :key="position.id"
                        class="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <div class="flex justify-between items-center mb-2">
                          <span class="font-medium text-[#81E2C4] dark:text-[#4B9592]">
                            {{ position.position_name }}
                          </span>
                          <span
                            class="px-3 py-1 rounded-full text-xs font-medium"
                            :class="getStatusClass(position.status)"
                          >
                            {{ getStatusText(position.status) }}
                          </span>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-sm">
                          <div class="flex items-center text-gray-600 dark:text-gray-100">
                            <i class="fas fa-coins mr-2"></i>
                            <span>{{ position.wage }} บาท</span>
                          </div>
                          <div class="flex items-center text-gray-600 dark:text-gray-100">
                            <i class="fas fa-user-friends mr-2"></i>
                            <span>ต้องการ {{ position.required_people }} คน</span>
                          </div>
                        </div>

                        <div
                          v-if="position.details"
                          class="mt-2 pt-2 border-t dark:border-gray-700"
                        >
                          <div class="text-sm text-gray-600 dark:text-gray-400">
                            <div class="flex items-start space-x-2">
                              <i
                                class="fas fa-info-circle mt-1 text-[#81E2C4] dark:text-[#4B9592]"
                              ></i>
                              <div class="flex-1">
                                <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  รายละเอียดตำแหน่ง:
                                </h5>
                                <p class="whitespace-pre-line">{{ position.details }}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          v-if="position.requirements"
                          class="mt-2 pt-2 border-t dark:border-gray-700"
                        >
                          <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            คุณสมบัติ:
                          </h5>
                          <ul
                            class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1"
                          >
                            <li
                              v-for="(req, index) in position.requirements.split('\n')"
                              :key="index"
                            >
                              {{ req }}
                            </li>
                          </ul>
                        </div>

                        <div
                          v-if="position.applicants_count"
                          class="mt-2 pt-2 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <div class="flex items-center">
                            <i class="fas fa-users mr-2"></i>
                            <span>ผู้สมัคร: {{ position.applicants_count }} คน</span>
                          </div>
                        </div>
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
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useAdminStore } from '@/stores/adminStore'

export default {
  name: 'JobDetailModal',

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
      default: false
    },
    job: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      adminStore: useAdminStore()
    }
  },

  methods: {
    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'open':
          return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        case 'closed':
          return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
        case 'full':
          return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
        case 'pending':
          return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    },

    getStatusText(status) {
      switch (status?.toUpperCase()) {
        case 'OPEN':
          return 'เปิดรับสมัคร'
        case 'CLOSED':
          return 'ปิดรับสมัคร'
        case 'FULL':
          return 'เต็มแล้ว'
        case 'PENDING':
          return 'รอดำเนินการ'
        default:
          return status || 'ไม่ระบุสถานะ'
      }
    },

    closeModal() {
      this.$emit('close')
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>
