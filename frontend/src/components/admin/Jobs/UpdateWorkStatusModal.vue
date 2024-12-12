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
        <div class="flex min-h-full items-center justify-center p-2 md:p-4">
          <DialogPanel
            class="w-full max-w-5xl transform bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 px-4 md:px-6 py-3 md:py-4 rounded-t-2xl"
            >
              <div class="flex justify-between items-center">
                <DialogTitle class="text-lg md:text-xl font-medium text-white">
                  ประเมินผลการทำงาน
                  <p class="text-xs md:text-sm text-white/80 mt-1">{{ job?.title }}</p>
                </DialogTitle>
                <button
                  @click="$emit('close')"
                  class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div class="flex flex-col md:flex-row h-[calc(100vh-200px)]">
              <!-- Left Sidebar - Position Tabs & User List -->
              <div
                class="w-full md:w-1/3 h-[250px] md:h-auto md:border-r border-gray-200 dark:border-gray-700 flex flex-col"
              >
                <!-- Position Tabs -->
                <div class="border-b border-gray-200 dark:border-gray-700">
                  <div class="px-2 flex overflow-x-auto">
                    <button
                      v-for="position in job.JobPositions"
                      :key="position.id"
                      @click="activeTab = position.id"
                      class="py-2 md:py-3 px-3 md:px-4 inline-flex items-center whitespace-nowrap text-sm md:text-base"
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
                      class="p-2 md:p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200"
                      :class="[
                        selectedParticipant?.id === participant.id
                          ? 'bg-[#E7F6F6] dark:bg-[#4B9592]/30 border-[#6ED7D1] dark:border-[#4B9592]'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'
                      ]"
                    >
                      <div class="flex items-center space-x-2 md:space-x-3">
                        <img
                          :src="getProfileImage(participant.user.profile_image)"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2"
                          :class="[
                            selectedParticipant?.id === participant.id
                              ? 'border-[#6ED7D1] dark:border-[#4B9592]'
                              : 'border-white dark:border-gray-700'
                          ]"
                          alt="Profile"
                        />
                        <div>
                          <h4
                            class="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100"
                          >
                            {{ participant.user?.first_name }}
                            {{ participant.user?.last_name }}
                          </h4>
                          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {{ participant.user?.phone_number }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="getPendingParticipants(position).length === 0"
                      class="text-center py-6 md:py-8"
                    >
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        ไม่มีผู้ใช้ที่รอการประเมิน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Content - Evaluation Form -->
              <div
                class="w-full md:w-2/3 p-3 md:p-6 rounded-xl overflow-y-auto bg-gray-50 dark:bg-gray-900"
              >
                <div v-if="selectedParticipant" class="space-y-4 md:space-y-6">
                  <!-- Rating Categories -->
                  <div
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <h3
                      class="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100 flex flex-col md:flex-row md:items-center md:justify-between mb-2"
                    >
                      การประเมินผลการทำงาน
                      <!-- Rating Legend -->
                      <div
                        class="mt-2 md:mt-1 text-xs text-gray-500 flex flex-col md:flex-row items-start md:items-center gap-2"
                      >
                        <span class="flex items-center">
                          <i class="fas fa-star text-yellow-400 mr-1"></i>
                          <i class="fas fa-star text-yellow-400 mr-1"></i>
                          = ดี (2 คะแนน)
                        </span>
                        <span class="flex items-center">
                          <i class="fas fa-star text-yellow-400 mr-1"></i>
                          = พอใช้ (1 คะแนน)
                        </span>
                      </div>
                    </h3>

                    <!-- Rating Categories -->
                    <div class="space-y-4 md:space-y-6">
                      <div
                        v-for="(category, key) in ratingCategories"
                        :key="key"
                        class="border-b dark:border-gray-700 pb-3 md:pb-4 last:border-0"
                      >
                        <div class="flex justify-between items-center mb-2">
                          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ category.label }}
                          </label>
                          <span
                            class="text-sm font-medium"
                            :class="
                              getCategoryScoreColor(getRatingScore(selectedParticipant?.id, key))
                            "
                          >
                            {{ getRatingScore(selectedParticipant?.id, key) }}/2 คะแนน
                          </span>
                        </div>

                        <div class="flex items-center gap-2">
                          <button
                            v-for="n in 2"
                            :key="n"
                            @click="setRating(selectedParticipant?.id, key, n)"
                            class="text-xl md:text-2xl focus:outline-none transition-all duration-200 transform hover:scale-110"
                          >
                            <i
                              class="fas fa-star"
                              :class="[
                                getRatingScore(selectedParticipant?.id, key) >= n
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-400'
                              ]"
                            ></i>
                          </button>
                          <button
                            v-if="getRatingScore(selectedParticipant?.id, key) > 0"
                            @click="setRating(selectedParticipant?.id, key, 0)"
                            class="ml-2 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>

                        <p class="mt-1 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {{ category.description }}
                        </p>
                      </div>
                    </div>

                    <!-- สรุปคะแนน -->
                    <div class="mb-4 md:mb-6">
                      <h4
                        class="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 md:mb-4"
                      >
                        สรุปการประเมิน
                      </h4>
                      <div
                        class="flex justify-between items-center p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span
                          class="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300"
                          >คะแนนรวมทั้งหมด</span
                        >
                        <span
                          class="text-xl md:text-2xl font-bold"
                          :class="getTotalScoreColor(getTotalScore(selectedParticipant?.id))"
                        >
                          {{ getTotalScore(selectedParticipant?.id) }}/10
                        </span>
                      </div>
                    </div>

                    <!-- Comment Field -->
                    <div class="mb-4 md:mb-6">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#EAC6FC]/50 transition-all duration-200"
                      >
                        ความคิดเห็นเพิ่มเติม <span class="text-red-500">*</span>
                      </label>
                      <textarea
                        v-model="comments[selectedParticipant.id]"
                        rows="3"
                        class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#6ED7D1] dark:focus:ring-[#4B9592] focus:border-transparent dark:bg-gray-800 focus:outline-none"
                        placeholder="กรุณาใส่ความคิดเห็น..."
                      ></textarea>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col md:flex-row gap-3 md:gap-4">
                      <button
                        @click="confirmReject"
                        class="flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm md:text-base"
                      >
                        <i class="fas fa-ban mr-2"></i>
                        ไม่ผ่านงาน
                      </button>

                      <button
                        @click="submitEvaluation"
                        :disabled="!isFormValid(selectedParticipant?.id)"
                        class="flex-1 px-4 py-2 bg-[#6ED7D1] dark:bg-[#4B9592] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm md:text-base"
                      >
                        <i class="fas fa-check mr-2"></i>
                        บันทึกการประเมิน
                      </button>
                    </div>
                  </div>
                </div>

                <!-- No Selection State -->
                <div
                  v-else
                  class="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400"
                >
                  <div>
                    <i
                      class="fas fa-user-check text-3xl md:text-4xl mb-3 text-[#EABF71] dark:text-[#B38B4A]"
                    ></i>
                    <p class="text-sm md:text-base">กรุณาเลือกผู้ใช้ที่ต้องการประเมิน</p>
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
import { useAdminUserStore } from '@/stores/adminUserStore'
import Swal from 'sweetalert2'
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

  data() {
    return {
      jobStore: useJobStore(),
      adminStore: useAdminUserStore(),
      ratings: {},
      comments: {},
      activeTab: null,
      selectedParticipant: null,
      ratingCategories: {
        appearance: {
          label: 'การแต่งกาย',
          description: 'ความเรียบร้อย สะอาด เหมาะสมกับงาน'
        },
        quality: {
          label: 'คุณภาพการตรวจ',
          description: 'ความละเอียด ถูกต้อง ตรงตามมาตรฐาน'
        },
        quantity: {
          label: 'ปริมาณ',
          description: 'ความรวดเร็ว และปริมาณงานที่ทำได้'
        },
        manner: {
          label: 'มารยาท',
          description: 'การมีสัมมาคารวะ มนุษยสัมพันธ์ การสื่อสาร'
        },
        punctuality: {
          label: 'ตรงเวลา',
          description: 'มาทำงานตรงเวลา และอยู่จนงานเสร็จ'
        }
      }
    }
  },

  computed: {
    filteredPositions() {
      return (
        this.job?.JobPositions?.filter(
          (position) => this.getPendingParticipants(position).length > 0
        ) || []
      )
    },
    // กรองเฉพาะผู้ที่ยังไม่ได้รับการประเมิน
    eligibleParticipants() {
      if (!this.job?.JobPositions) return []

      const participants = []
      this.job.JobPositions.forEach((position) => {
        position.JobParticipation?.forEach((participation) => {
          // เช็คว่ายังไม่มีประวัติการประเมิน
          if (
            participation.status === 'approved' &&
            (!participation.workHistories || participation.workHistories.length === 0)
          ) {
            participants.push({
              ...participation,
              position_name: position.position_name,
              wage: position.wage
            })
          }
        })
      })

      return participants
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
    async submitEvaluation() {
      if (!this.isFormValid(this.selectedParticipant.id)) return

      // ยืนยันก่อนดำเนินการ
      const confirmResult = await Swal.fire({
        title: 'ยืนยันการบันทึกการประเมิน',
        html: `
      <div class="text-left">
        <p class="text-gray-700">คุณต้องการบันทึกการประเมินสำหรับ</p>
        <b>${this.selectedParticipant.user.first_name} ${this.selectedParticipant.user.last_name}</b>
        <p class="text-sm text-gray-500 mt-2">โปรดตรวจสอบข้อมูลก่อนยืนยัน</p>
      </div>
    `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#F44336',
        reverseButtons: true
      })

      if (!confirmResult.isConfirmed) return // ยกเลิกถ้าผู้ใช้ไม่ยืนยัน

      try {
        const ratings = {
          appearance: parseInt(this.ratings[this.selectedParticipant.id].appearance),
          quality: parseInt(this.ratings[this.selectedParticipant.id].quality),
          quantity: parseInt(this.ratings[this.selectedParticipant.id].quantity),
          manner: parseInt(this.ratings[this.selectedParticipant.id].manner),
          punctuality: parseInt(this.ratings[this.selectedParticipant.id].punctuality)
        }

        await this.jobStore.updateWorkEvaluation({
          participationId: this.selectedParticipant.id,
          ratings,
          comment: this.comments[this.selectedParticipant.id],
          isPassedEvaluation: true
        })

        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'บันทึกการประเมินเรียบร้อยแล้ว'
        })
        this.$emit('close')
        this.$emit('evaluation-updated')
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถบันทึกการประเมินได้'
        })
      }
    },

    async confirmReject() {
      const result = await Swal.fire({
        title: 'ยืนยันการไม่ผ่านงาน',
        html: `
            <div class="text-left">
                <p>คุณต้องการให้ <b>${this.selectedParticipant.user.first_name} ${this.selectedParticipant.user.last_name}</b> ไม่ผ่านงานใช่หรือไม่?</p>
                <p class="text-red-500 text-sm mt-2">* การดำเนินการนี้จะทำให้ผู้ใช้ไม่สามารถใช้งานระบบได้ชั่วคราว</p>
                <p class="text-red-500 text-sm">* ผู้ใช้จะต้องติดต่อผู้ดูแลระบบเพื่อขออนุมัติการใช้งานใหม่</p>
            </div>
        `,
        input: 'textarea',
        inputLabel: 'เหตุผลที่ไม่ผ่าน (ไม่บังคับ)',
        inputPlaceholder: 'กรุณาระบุเหตุผล...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
        reverseButtons: true
      })

      if (result.isConfirmed) {
        try {
          await this.jobStore.updateWorkEvaluation({
            participationId: this.selectedParticipant.id,
            comment: result.value,
            isPassedEvaluation: false
          })

          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'บันทึกการไม่ผ่านงานเรียบร้อยแล้ว'
          })

          this.$emit('close')
          this.$emit('evaluation-updated')
        } catch (error) {
          console.error('Error in confirmReject:', error)
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.response?.data?.message || 'ไม่สามารถบันทึกการไม่ผ่านงานได้'
          })
        }
      }
    },
    getPendingParticipants(position) {
      return (
        position.JobParticipation?.filter(
          (p) => p.status === 'approved' && !p.workHistories?.length
        ) || []
      )
    },

    getRatingScore(participationId, category) {
      return this.ratings[participationId]?.[category] || 0
    },

    setRating(participationId, category, rating) {
      if (!this.ratings[participationId]) {
        this.ratings[participationId] = {}
      }
      this.ratings[participationId][category] = rating
    },

    getTotalScore(participationId) {
      if (!participationId) return 0

      return Object.keys(this.ratingCategories).reduce((total, key) => {
        return total + (this.getRatingScore(participationId, key) || 0)
      }, 0)
    },

    getCategoryScoreColor(score) {
      if (score === 2) return 'text-green-500'
      if (score === 1) return 'text-yellow-500'
      return 'text-gray-400'
    },

    getTotalScoreColor(score) {
      if (score >= 8) return 'text-green-500'
      if (score >= 5) return 'text-yellow-500'
      return 'text-red-500'
    },

    // getRatingStarClass(participationId, category, number) {
    //   const score = this.getRatingScore(participationId, category)
    //   return {
    //     'text-yellow-400': number <= score,
    //     'text-gray-300': number > score,
    //     'hover:text-yellow-400': true
    //   }
    // },

    isFormValid(participationId) {
      return (
        // ต้องให้คะแนนครบทุกด้าน
        Object.keys(this.ratingCategories).every(
          (category) => this.getRatingScore(participationId, category) > 0
        ) &&
        // ต้องมีความคิดเห็น
        this.comments[participationId]?.trim()
      )
    },

    getProfileImage(image) {
      return this.jobStore.getProfileImage(image)
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
  width: 4px;
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

/* Mobile Optimizations */
@media (max-width: 768px) {
  .modal {
    padding: 0.5rem;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 3px;
  }

  .dialog-panel {
    margin: 0;
    max-height: calc(100vh - 2rem);
  }

  .rating-container {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
