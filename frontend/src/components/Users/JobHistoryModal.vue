<template>
  <TransitionRoot appear :show="show" as="template">
    <Teleport to="body">
      <Dialog as="div" @close="handleClose" class="relative modal">
        <TransitionChild
          as="template"
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
          <div class="flex min-h-full items-center justify-center p-4 text-center">
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
                class="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
              >
                <!-- Header -->
                <div
                  class="sticky top-0 z-10 flex justify-between items-center p-6 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4B9592] dark:to-[#6667AA] rounded-t-xl"
                >
                  <DialogTitle class="text-2xl font-semibold text-white">
                    ประวัติการทำงาน
                    <p class="text-sm font-normal text-white/80 mt-1">
                      {{ user?.first_name }} {{ user?.last_name }}
                    </p>
                  </DialogTitle>
                  <button
                    @click="$emit('close')"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>

                <!-- Content -->
                <div
                  class="p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto max-h-[calc(100vh-8rem)]"
                >
                  <div class="space-y-4">
                    <!-- สรุปภาพรวม -->
                    <div
                      class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-400 dark:border-purple-500"
                    >
                      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                        สรุปการทำงาน
                      </h3>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- จำนวนงานทั้งหมด -->
                        <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <p class="text-sm text-gray-500 dark:text-gray-400">งานทั้งหมด</p>
                          <p class="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                            {{ jobs?.length || 0 }}
                          </p>
                        </div>

                        <!-- คะแนนเฉลี่ย -->
                        <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                          <p class="text-sm text-gray-500 dark:text-gray-400">คะแนนเฉลี่ย</p>
                          <div class="flex items-center justify-center gap-1">
                            <p class="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                              {{ averageRating.toFixed(1) }}
                            </p>
                            <i class="fas fa-star text-yellow-400 dark:text-yellow-300 text-xl"></i>
                          </div>
                        </div>

                        <!-- จำนวนรีวิว -->
                        <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <p class="text-sm text-gray-500 dark:text-gray-400">จำนวนรีวิว</p>
                          <p class="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                            {{ totalReviews }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- รายการงาน -->
                    <div v-if="jobs?.length > 0">
                      <div
                        v-for="job in jobs"
                        :key="job.id"
                        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4"
                      >
                        <div class="flex justify-between items-start mb-3">
                          <div class="flex items-center gap-3">
                            <div
                              class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
                            >
                              <i
                                class="fas fa-briefcase text-purple-600 dark:text-purple-400 text-xl"
                              ></i>
                            </div>
                            <div>
                              <h3 class="font-medium text-gray-900 dark:text-gray-100 text-lg">
                                {{ job.title }}
                              </h3>
                              <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ job.position_name }}
                              </p>
                            </div>
                          </div>

                          <!-- แสดงคะแนน -->
                          <div v-if="job.workHistories?.length" class="flex items-center gap-1">
                            <span
                              class="text-lg font-semibold text-yellow-500 dark:text-yellow-400"
                            >
                              {{ job.workHistories[0].rating }}
                            </span>
                            <i class="fas fa-star text-yellow-400 dark:text-yellow-300"></i>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div class="space-y-2">
                            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <i
                                class="fas fa-map-marker-alt w-5 text-gray-400 dark:text-gray-500"
                              ></i>
                              <span>{{ job.location }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <i class="fas fa-calendar w-5 text-gray-400 dark:text-gray-500"></i>
                              <span>วันที่ทำงาน: {{ formatDate(job.work_date) }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <i class="fas fa-coins w-5 text-gray-400 dark:text-gray-500"></i>
                              <span>ค่าตอบแทน: {{ job.wage.toLocaleString() }} บาท</span>
                            </div>
                          </div>

                          <!-- ส่วนแสดงความคิดเห็น -->
                          <div
                            v-if="job.workHistories?.length"
                            class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                          >
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              ความคิดเห็นจากผู้ว่าจ้าง:
                            </p>
                            <p class="text-gray-700 dark:text-gray-300">
                              {{ job.workHistories[0].comment || '-' }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- ข้อความเมื่อไม่มีข้อมูล -->
                    <div v-else class="text-center py-12">
                      <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                      >
                        <i class="fas fa-history text-2xl text-gray-400 dark:text-gray-500"></i>
                      </div>
                      <p class="text-gray-500 dark:text-gray-400">ไม่พบประวัติการทำงาน</p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Teleport>
  </TransitionRoot>
</template>
<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

export default {
  name: 'JobHistoryModal',

  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
  },
  emits: ['close'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: () => ({})
    },
    jobs: {
      type: Array,
      default: () => []
    },
    totalJobs: {
      type: Number,
      default: 0
    }
  },

  computed: {
    averageRating() {
      const ratedJobs =
        this.jobs?.filter(
          (job) =>
            job.workHistories &&
            job.workHistories.length > 0 &&
            job.workHistories[0].rating !== null
        ) || []

      if (!ratedJobs.length) return 0
      const totalRating = ratedJobs.reduce((sum, job) => {
        const rating = job.workHistories[0].rating
        return sum + (rating || 0)
      }, 0)

      return totalRating / ratedJobs.length
    },

    totalReviews() {
      // นับเฉพาะงานที่มีการให้คะแนนและความคิดเห็น
      return (
        this.jobs?.filter(
          (job) =>
            job.workHistories &&
            job.workHistories.length > 0 &&
            (job.workHistories[0].rating !== null || job.workHistories[0].comment)
        ).length || 0
      )
    }
  },

  methods: {
    handleClose() {
      this.$emit('close')
    },
    formatDate(date) {
      if (!date) return 'ไม่ระบุวันที่'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getStatusClass(status) {
      switch (status) {
        case 'successful':
          return 'bg-green-100 text-green-800'
        case 'failed':
          return 'bg-red-100 text-red-800'
        case 'needs_improvement':
          return 'bg-orange-100 text-orange-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'successful':
          return 'ทำงานสำเร็จ'
        case 'failed':
          return 'ไม่สำเร็จ'
        case 'needs_improvement':
          return 'ต้องปรับปรุง'
        case 'pending':
          return 'กำลังทำงาน'
        default:
          return 'ไม่ระบุสถานะ'
      }
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
