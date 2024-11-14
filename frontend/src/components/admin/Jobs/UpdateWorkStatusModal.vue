<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
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
              class="w-full max-w-4xl transform bg-white rounded-2xl shadow-xl transition-all"
            >
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

              <!-- Content -->
              <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div v-for="position in job.JobPositions" :key="position.id" class="mb-8">
                  <!-- Position Header -->
                  <div class="flex items-center space-x-2 mb-4 pb-2 border-b">
                    <i class="fas fa-briefcase text-[#6ED7D1]"></i>
                    <h3 class="text-lg font-medium text-gray-800">
                      {{ position.position_name }}
                    </h3>
                    <span class="px-2 py-0.5 bg-[#E7F6F6] text-[#5DA3A3] rounded-full text-sm">
                      {{ getPendingParticipants(position).length }} คน
                    </span>
                  </div>

                  <!-- Participants List -->
                  <div class="space-y-4">
                    <div
                      v-for="participant in getPendingParticipants(position)"
                      :key="participant.id"
                      class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <!-- User Info -->
                      <div class="p-4 flex items-center space-x-4 border-b border-gray-100">
                        <img
                          :src="getProfileImage(participant.user.profile_image)"
                          class="w-16 h-16 rounded-full object-cover"
                          alt="Profile"
                        />
                        <div>
                          <h4 class="text-lg font-medium text-gray-900">
                            {{ participant.user?.first_name }}
                            {{ participant.user?.last_name }}
                          </h4>
                          <p class="text-sm text-gray-500 flex items-center mt-1">
                            <i class="fas fa-phone text-[#6ED7D1] mr-2"></i>
                            {{ participant.user?.phone_number }}
                          </p>
                        </div>
                      </div>

                      <!-- Rating & Comment -->
                      <div class="p-4 space-y-4">
                        <!-- Rating -->
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            คะแนนการทำงาน
                          </label>
                          <div class="flex items-center gap-2">
                            <button
                              v-for="n in 5"
                              :key="n"
                              @click="setRating(participant.id, n)"
                              class="text-2xl focus:outline-none"
                            >
                              <i
                                class="fas fa-star"
                                :class="getRatingStarClass(participant.id, n)"
                              ></i>
                            </button>
                            <span class="ml-2 text-sm text-gray-500">
                              {{ ratings[participant.id] || 0 }}/5 คะแนน
                            </span>
                          </div>
                        </div>

                        <!-- Comment -->
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            ความคิดเห็นเพิ่มเติม
                          </label>
                          <textarea
                            v-model="comments[participant.id]"
                            rows="3"
                            class="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#6ED7D1] focus:border-[#6ED7D1] text-sm"
                            placeholder="เพิ่มความคิดเห็นเกี่ยวกับการทำงาน..."
                          ></textarea>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end">
                          <button
                            @click="updateStatus(participant.id)"
                            :disabled="!isFormValid(participant.id)"
                            class="px-6 py-2.5 bg-[#81E2C4] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                          >
                            <i class="fas fa-check"></i>
                            <span>บันทึกการประเมิน</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="getPendingParticipants(position).length === 0"
                      class="text-center py-8"
                    >
                      <i class="fas fa-users text-4xl text-gray-300"></i>
                      <p class="mt-2 text-sm text-gray-500">ไม่มีผู้ใช้ที่รอการประเมิน</p>
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
      comments: {}
    }
  },

  methods: {
    getPendingParticipants(position) {
      // ดึงเฉพาะคนที่ approved และยังไม่เคยถูกประเมิน
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
    }
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
