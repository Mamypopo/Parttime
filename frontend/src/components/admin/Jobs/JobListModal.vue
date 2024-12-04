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
              class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 rounded-t-2xl"
              >
                <DialogTitle class="text-lg font-semibold text-white">
                  <i class="fas fa-list-ul mr-2"></i>
                  {{ title }}
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
                <div class="space-y-3">
                  <div
                    v-for="event in events"
                    :key="event.id"
                    class="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 border border-gray-100 dark:border-gray-600 hover:shadow-md"
                    @click="showJobDetail(event)"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                          <i class="fas fa-briefcase mr-2 text-[#81E2C4] dark:text-[#4B9592]"></i>
                          {{ event.title }}
                        </h3>
                        <div class="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div v-if="event.location" class="flex items-center">
                            <i
                              class="fas fa-map-marker-alt w-5 text-[#81E2C4] dark:text-[#4B9592]"
                            ></i>
                            {{ event.location }}
                          </div>
                          <div class="flex items-center">
                            <i class="fas fa-clock w-5 text-[#81E2C4] dark:text-[#4B9592]"></i>
                            {{ formatTime(event.start_time) }} - {{ formatTime(event.end_time) }}
                          </div>
                          <div v-if="event.JobPositions?.length" class="flex items-center">
                            <i class="fas fa-users w-5 text-[#81E2C4] dark:text-[#4B9592]"></i>
                            {{ event.JobPositions.length }} ตำแหน่ง
                          </div>
                        </div>
                      </div>
                      <span
                        class="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                        :class="getStatusClass(event.status)"
                      >
                        {{ getStatusText(event.status) }}
                      </span>
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

export default {
  name: 'JobListModal',

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
    title: {
      type: String,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    showJobDetail(event) {
      this.$emit('select-job', event)
      this.closeModal()
    },

    closeModal() {
      this.$emit('close')
    },

    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'published':
          return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
        case 'in_progress':
          return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
        case 'completed':
          return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    },

    getStatusText(status) {
      switch (status?.toUpperCase()) {
        case 'PUBLISHED':
          return 'ประกาศรับสมัคร'
        case 'IN_PROGRESS':
          return 'กำลังดำเนินงาน'
        case 'COMPLETED':
          return 'เสร็จสิ้น'
        default:
          return status || 'ไม่ระบุสถานะ'
      }
    }
  }
}
</script>
