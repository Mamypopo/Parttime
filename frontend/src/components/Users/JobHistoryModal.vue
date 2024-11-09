<template>
  <TransitionRoot appear :show="show" as="template">
    <Teleport to="body">
      <Dialog as="div" @close="handleClose" class="relative z-50">
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
              <DialogPanel class="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
                <!-- Header -->
                <div
                  class="sticky top-0 z-10 flex justify-between items-center p-6 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] rounded-t-xl"
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
                <div class="p-6 bg-gray-50 overflow-y-auto max-h-[calc(100vh-8rem)]">
                  <div class="space-y-4">
                    <!-- สรุปภาพรวม -->
                    <div class="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
                      <h3 class="text-lg font-medium text-gray-800 mb-2">สรุปการทำงาน</h3>
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <!-- งานทั้งหมด -->
                        <div class="text-center p-3 bg-purple-50 rounded-lg">
                          <p class="text-sm text-gray-500">งานทั้งหมด</p>
                          <p class="text-2xl font-semibold text-purple-600">
                            {{ jobs?.length || 0 }}
                          </p>
                        </div>

                        <!-- งานที่สำเร็จ -->
                        <div class="text-center p-3 bg-green-50 rounded-lg">
                          <p class="text-sm text-gray-500">งานที่สำเร็จ</p>
                          <p class="text-2xl font-semibold text-green-600">
                            {{ successfulJobs }}
                          </p>
                        </div>

                        <!-- งานที่กำลังทำ -->
                        <div class="text-center p-3 bg-yellow-50 rounded-lg">
                          <p class="text-sm text-gray-500">งานที่กำลังทำ</p>
                          <p class="text-2xl font-semibold text-yellow-600">
                            {{ pendingJobs }}
                          </p>
                        </div>

                        <!-- งานที่ต้องปรับปรุง -->
                        <div class="text-center p-3 bg-orange-50 rounded-lg">
                          <p class="text-sm text-gray-500">งานที่ต้องปรับปรุง</p>
                          <p class="text-2xl font-semibold text-orange-600">
                            {{ needsImprovementJobs }}
                          </p>
                        </div>

                        <!-- งานที่ไม่สำเร็จ -->
                        <div class="text-center p-3 bg-red-50 rounded-lg">
                          <p class="text-sm text-gray-500">งานที่ไม่สำเร็จ</p>
                          <p class="text-2xl font-semibold text-red-600">
                            {{ failedJobs }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- รายการงาน -->
                    <div v-if="jobs?.length > 0">
                      <div
                        v-for="job in jobs"
                        :key="job.id"
                        class="bg-white rounded-lg shadow p-4 mb-4"
                      >
                        <div class="flex justify-between items-start mb-3">
                          <div class="flex items-center gap-3">
                            <!-- ไอคอนตามประเภทงาน -->
                            <div
                              class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center"
                            >
                              <i class="fas fa-briefcase text-purple-600 text-xl"></i>
                            </div>
                            <div>
                              <h3 class="font-medium text-gray-900 text-lg">{{ job.title }}</h3>
                              <p class="text-sm text-gray-500">{{ job.position_name }}</p>
                            </div>
                          </div>
                          <span
                            :class="[
                              'px-3 py-1.5 text-sm font-medium rounded-full',
                              getStatusClass(job.status)
                            ]"
                          >
                            {{ getStatusText(job.status) }}
                          </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div class="space-y-2">
                            <div class="flex items-center gap-2 text-gray-600">
                              <i class="fas fa-map-marker-alt w-5 text-gray-400"></i>
                              <span>{{ job.location }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-gray-600">
                              <i class="fas fa-calendar w-5 text-gray-400"></i>
                              <span>วันที่เริ่มงาน: {{ formatDate(job.created_at) }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-gray-600">
                              <i class="fas fa-clock w-5 text-gray-400"></i>
                              <span>วันที่ทำงาน: {{ formatDate(job.work_date) }}</span>
                            </div>
                          </div>
                          <div class="space-y-2">
                            <div class="flex items-center gap-2 text-gray-600">
                              <i class="fas fa-coins w-5 text-gray-400"></i>
                              <span>ค่าตอบแทน: {{ job.wage.toLocaleString() }} บาท</span>
                            </div>
                            <div class="flex items-center gap-2 text-gray-600">
                              <i class="fas fa-clock w-5 text-gray-400"></i>
                              <span>อัพเดทล่าสุด: {{ formatDate(job.updated_at) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- ข้อความเมื่อไม่มีข้อมูล -->
                    <div v-else class="text-center py-12">
                      <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <i class="fas fa-history text-2xl text-gray-400"></i>
                      </div>
                      <p class="text-gray-500">ไม่พบประวัติการทำงาน</p>
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
      // เพิ่ม prop ใหม่
      type: Number,
      default: 0
    }
  },

  computed: {
    successfulJobs() {
      return (this.jobs || []).filter((job) => job?.status === 'successful').length
    },
    pendingJobs() {
      return (this.jobs || []).filter((job) => job?.status === 'pending').length
    },
    needsImprovementJobs() {
      return (this.jobs || []).filter((job) => job?.status === 'needs_improvement').length
    },
    failedJobs() {
      return (this.jobs || []).filter((job) => job?.status === 'failed').length
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
