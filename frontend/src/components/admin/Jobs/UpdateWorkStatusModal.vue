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
          <DialogPanel class="w-full max-w-5xl transform bg-white rounded-2xl shadow-xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] px-6 py-4 rounded-t-2xl">
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
              <div class="w-1/3 border-r border-gray-200 flex flex-col">
                <!-- Position Tabs -->
                <div class="border-b border-gray-200">
                  <div class="px-2 flex overflow-x-auto">
                    <button
                      v-for="position in job.JobPositions"
                      :key="position.id"
                      @click="activeTab = position.id"
                      class="py-3 px-4 inline-flex items-center whitespace-nowrap"
                      :class="[
                        activeTab === position.id
                          ? 'text-[#6ED7D1] border-b-2 border-[#6ED7D1]'
                          : 'text-gray-500 hover:text-gray-700'
                      ]"
                    >
                      {{ position.position_name }}
                      <span
                        v-if="getPendingParticipants(position).length"
                        class="ml-2 px-2 py-0.5 bg-[#f76363] text-white rounded-full text-xs animate-bounce"
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
                          ? 'bg-[#E7F6F6] border-[#6ED7D1]'
                          : 'hover:bg-gray-50 border-transparent'
                      ]"
                    >
                      <div class="flex items-center space-x-3">
                        <img
                          :src="getProfileImage(participant.user.profile_image)"
                          class="w-12 h-12 rounded-full object-cover border-2"
                          :class="[
                            selectedParticipant?.id === participant.id
                              ? 'border-[#6ED7D1]'
                              : 'border-white'
                          ]"
                          alt="Profile"
                        />
                        <div>
                          <h4 class="font-medium text-gray-900">
                            {{ participant.user?.first_name }}
                            {{ participant.user?.last_name }}
                          </h4>
                          <p class="text-sm text-gray-500">{{ participant.user?.phone_number }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="getPendingParticipants(position).length === 0"
                      class="text-center py-8"
                    >
                      <p class="text-gray-500">ไม่มีผู้ใช้ที่รอการประเมิน</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Content - Evaluation Form -->
              <div class="w-2/3 p-6 overflow-y-auto">
                <div v-if="selectedParticipant" class="space-y-6">
                  <!-- Rating -->
                  <div class="bg-white rounded-xl p-6 border border-gray-200">
                    <label class="block text-sm font-medium text-gray-700 mb-4">
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
                    <p class="text-center mt-2 text-gray-500">
                      {{ ratings[selectedParticipant.id] || 0 }}/5 คะแนน
                    </p>
                  </div>

                  <!-- Comment -->
                  <div class="bg-white rounded-xl p-6 border border-gray-200">
                    <label class="block text-sm font-medium text-gray-700 mb-4">
                      ความคิดเห็นเพิ่มเติม
                    </label>
                    <textarea
                      v-model="comments[selectedParticipant.id]"
                      rows="4"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="เพิ่มความคิดเห็นเกี่ยวกับการทำงาน..."
                    ></textarea>
                  </div>

                  <!-- Submit Button -->
                  <button
                    @click="updateStatus(selectedParticipant.id)"
                    :disabled="!isFormValid(selectedParticipant.id)"
                    class="w-full py-3 bg-[#81E2C4] text-white rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <i class="fas fa-check"></i>
                    <span>บันทึกการประเมิน</span>
                  </button>
                </div>

                <!-- No Selection State -->
                <div
                  v-else
                  class="h-full flex items-center justify-center text-center text-gray-500"
                >
                  <div>
                    <i class="fas fa-user-check text-4xl mb-3 text-[#EABF71]"></i>
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
