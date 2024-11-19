<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative modal" @close="$emit('close')">
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
          <DialogPanel
            class="w-full max-w-5xl transform bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4B9592] dark:to-[#6667AA] px-6 py-4 rounded-t-2xl"
            >
              <div class="flex justify-between items-center">
                <DialogTitle class="text-xl font-medium text-white">
                  ประเมินผลการทำงาน
                  <p class="text-sm text-white/80 mt-1">{{ job?.title }}</p>
                </DialogTitle>
                <button @click="$emit('close')" class="text-white/70 hover:text-white">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div class="flex h-[calc(100vh-200px)]">
              <!-- Left Sidebar - Position Tabs & User List -->
              <div class="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <!-- Position Tabs -->
                <div class="border-b border-gray-200 dark:border-gray-700">
                  <div class="px-2 flex overflow-x-auto">
                    <button
                      v-for="position in job.JobPositions"
                      :key="position.id"
                      @click="activeTab = position.id"
                      class="py-3 px-4 inline-flex items-center whitespace-nowrap"
                      :class="[
                        activeTab === position.id
                          ? 'text-[#6ED7D1] dark:text-[#4B9592] border-b-2 border-[#6ED7D1] dark:border-[#4B9592]'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      ]"
                    >
                      {{ position.position_name }}
                      <span
                        v-if="getPendingParticipants(position).length"
                        class="ml-2 px-2 py-0.5 bg-[#f76363] dark:bg-red-600 text-white rounded-full text-xs animate-bounce"
                      >
                        {{ getPendingParticipants(position).length }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- User List -->
                <div class="overflow-y-auto flex-1 p-2">
                  <div
                    v-for="position in filteredPositions"
                    :key="position.id"
                    v-show="activeTab === position.id"
                  >
                    <div
                      v-for="participant in getPendingParticipants(position)"
                      :key="participant.id"
                      @click="selectParticipant(participant)"
                      class="p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200"
                      :class="[
                        selectedParticipant?.id === participant.id
                          ? 'bg-[#E7F6F6] dark:bg-[#4B9592]/30 border-[#6ED7D1] dark:border-[#4B9592]'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'
                      ]"
                    >
                      <div class="flex items-center space-x-3">
                        <img
                          :src="getProfileImage(participant.user.profile_image)"
                          class="w-12 h-12 rounded-full object-cover border-2"
                          :class="[
                            selectedParticipant?.id === participant.id
                              ? 'border-[#6ED7D1] dark:border-[#4B9592]'
                              : 'border-white dark:border-gray-700'
                          ]"
                          alt="Profile"
                        />
                        <div>
                          <h4 class="font-medium text-gray-900 dark:text-gray-100">
                            {{ participant.user?.first_name }}
                            {{ participant.user?.last_name }}
                          </h4>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ participant.user?.phone_number }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="getPendingParticipants(position).length === 0"
                      class="text-center py-8"
                    >
                      <p class="text-gray-500 dark:text-gray-400">ไม่มีผู้ใช้ที่รอการประเมิน</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Content - Evaluation Form -->
              <div class="w-2/3 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div v-if="selectedParticipant" class="space-y-6">
                  <!-- Rating -->
                  <div
                    class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      คะแนนการทำงาน
                    </label>
                    <div class="flex items-center justify-center gap-3">
                      <button
                        v-for="n in 5"
                        :key="n"
                        @click="setRating(selectedParticipant.id, n)"
                        class="text-3xl focus:outline-none transition-all duration-200 transform hover:scale-110"
                      >
                        <i
                          class="fas fa-star"
                          :class="getRatingStarClass(selectedParticipant.id, n)"
                        ></i>
                      </button>
                    </div>
                    <p class="text-center mt-2 text-gray-500 dark:text-gray-400">
                      {{ ratings[selectedParticipant.id] || 0 }}/5 คะแนน
                    </p>
                  </div>

                  <!-- Comment -->
                  <div
                    class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      ความคิดเห็นเพิ่มเติม
                    </label>
                    <textarea
                      v-model="comments[selectedParticipant.id]"
                      rows="4"
                      class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                      placeholder="เพิ่มความคิดเห็นเกี่ยวกับการทำงาน..."
                    ></textarea>
                  </div>

                  <!-- Submit Button -->
                  <button
                    @click="updateStatus(selectedParticipant.id)"
                    :disabled="!isFormValid(selectedParticipant.id)"
                    class="w-full py-3 bg-[#81E2C4] dark:bg-[#4B9592] text-white rounded-xl hover:bg-opacity-90 dark:hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <i class="fas fa-check"></i>
                    <span>บันทึกการประเมิน</span>
                  </button>
                </div>

                <!-- No Selection State -->
                <div
                  v-else
                  class="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400"
                >
                  <div>
                    <i
                      class="fas fa-user-check text-4xl mb-3 text-[#EABF71] dark:text-[#B38B4A]"
                    ></i>
                    <p>กรุณาเลือกผู้ใช้ที่ต้องการประเมิน</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useJobStore } from '@/stores/jobStore'

export default {
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
  },

  props: {
    show: {
      type: Boolean,
      required: true
    },
    job: {
      type: Object,
      required: true
    }
  },

  setup() {
    const jobStore = useJobStore()
    return { jobStore }
  },

  data() {
    return {
      ratings: {},
      comments: {},
      activeTab: null,
      selectedParticipant: null
    }
  },

  computed: {
    filteredPositions() {
      return (
        this.job?.JobPositions?.filter(
          (position) => this.getPendingParticipants(position).length > 0
        ) || []
      )
    }
  },

  watch: {
    show(newVal) {
      if (newVal && this.filteredPositions.length > 0) {
        this.activeTab = this.filteredPositions[0].id
      }
    }
  },

  methods: {
    getPendingParticipants(position) {
      return (
        position.JobParticipation?.filter(
          (p) => p.status === 'approved' && !p.workHistories?.length
        ) || []
      )
    },

    setRating(participationId, rating) {
      this.ratings[participationId] = rating
    },

    isFormValid(participationId) {
      return this.ratings[participationId] && this.comments[participationId]?.trim()
    },

    async updateStatus(participationId) {
      if (!this.isFormValid(participationId)) return

      this.$emit('update', {
        participationId,
        rating: this.ratings[participationId],
        comment: this.comments[participationId]
      })
    },

    getProfileImage(image) {
      return this.jobStore.getProfileImage(image)
    },

    getRatingStarClass(participationId, number) {
      return {
        'text-yellow-400': number <= (this.ratings[participationId] || 0),
        'text-gray-300': number > (this.ratings[participationId] || 0),
        'hover:text-yellow-400': true
      }
    },
    selectParticipant(participant) {
      this.selectedParticipant = participant
    }
  }
}
</script>

<style scoped>
/* Light mode scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #4b9592;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #3d7a78;
  }
}
</style>
