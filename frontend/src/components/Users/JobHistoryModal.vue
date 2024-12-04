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
          <div class="flex min-h-full items-center justify-center p-4">
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
                  class="sticky top-0 z-10 flex justify-between items-center p-6 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4B9592] dark:to-[#6667AA]"
                >
                  <DialogTitle class="text-2xl font-semibold text-white">
                    ประวัติการทำงาน
                    <p class="text-sm font-normal text-white/80 mt-1">
                      {{ user?.first_name }} {{ user?.last_name }}
                    </p>
                  </DialogTitle>
                  <button
                    @click="$emit('close')"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>

                <!-- Content -->
                <div
                  class="p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto max-h-[calc(100vh-8rem)]"
                >
                  <!-- No data message -->
                  <div v-if="!jobs?.length" class="text-center py-8">
                    <div
                      class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <i class="fas fa-file-alt text-gray-400 text-xl"></i>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลการประเมิน</p>
                  </div>

                  <!-- Job History List -->
                  <div v-else class="space-y-6">
                    <div class="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6">
                      <div class="flex justify-between items-center">
                        <div>
                          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                            คะแนนรวมทั้งหมด
                          </h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            จากการประเมินทั้งหมด {{ jobs.length }} ครั้ง
                          </p>
                        </div>
                        <div class="flex items-baseline">
                          <span
                            class="text-3xl font-bold mr-2"
                            :class="getOverallScoreClass(getOverallScore())"
                          >
                            {{ getOverallScore() }}
                          </span>
                          <span class="text-gray-500 dark:text-gray-400">/ 10</span>
                        </div>
                      </div>
                    </div>
                    <div v-for="job in jobs" :key="job.id" class="mb-6">
                      <div class="bg-white dark:bg-gray-800 rounded-xl p-6">
                        <!-- Job Header -->
                        <div class="flex justify-between items-center mb-4">
                          <div>
                            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {{ job.jobPosition?.job?.title }}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                              {{ job.jobPosition?.position_name }}
                            </p>
                          </div>
                          <!-- สถานะงาน -->
                          <div
                            :class="{
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
                                job.workHistories?.[0]?.is_passed_evaluation,
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400':
                                !job.workHistories?.[0]?.is_passed_evaluation
                            }"
                            class="px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {{
                              job.workHistories?.[0]?.is_passed_evaluation
                                ? 'ผ่านการประเมิน'
                                : 'ไม่ผ่านการประเมิน'
                            }}
                          </div>
                        </div>

                        <!-- คะแนนการประเมิน -->
                        <div
                          v-if="job.workHistories?.[0]?.is_passed_evaluation"
                          class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4"
                        >
                          <div
                            v-for="(score, index) in scoreItems"
                            :key="index"
                            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                          >
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              <i :class="score.icon" class="mr-2"></i>
                              {{ score.title }}
                            </div>
                            <div
                              class="text-xl font-bold"
                              :class="getScoreClass(job.workHistories?.[0]?.[score.field])"
                            >
                              {{ job.workHistories?.[0]?.[score.field] || 0 }}/2
                            </div>
                          </div>
                        </div>

                        <!-- คะแนนรวม -->
                        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                          <div class="flex justify-between items-center">
                            <div>
                              <span class="text-gray-600 dark:text-gray-300 text-lg font-medium"
                                >คะแนนรวม</span
                              >
                              <p class="text-sm text-gray-500 mt-1">คะแนนเต็ม 10 คะแนน</p>
                            </div>
                            <div class="flex items-baseline">
                              <span
                                class="text-3xl font-bold mr-2"
                                :class="getTotalScoreClass(job)"
                              >
                                {{ getTotalScore(job) }}
                              </span>
                              <span class="text-gray-500 dark:text-gray-400">/ 10</span>
                            </div>
                          </div>

                          <!-- แถบแสดงคะแนน -->
                          <div
                            class="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
                          >
                            <div
                              class="h-full rounded-full transition-all duration-300"
                              :class="getProgressBarClass(job)"
                              :style="{ width: `${(getTotalScore(job) / 10) * 100}%` }"
                            ></div>
                          </div>
                        </div>

                        <!-- ความคิดเห็น -->
                        <div
                          v-if="job.workHistories?.[0]?.comment"
                          class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <p class="text-sm text-gray-600 dark:text-gray-300">
                            <i class="fas fa-comment-alt mr-2"></i>
                            {{ job.workHistories[0].comment }}
                          </p>
                        </div>

                        <!-- วันที่ประเมิน -->
                        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                          <i class="fas fa-calendar-alt mr-2"></i>
                          ประเมินเมื่อ: {{ formatDate(job.workHistories?.[0]?.created_at) }}
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
    </Teleport>
  </TransitionRoot>
</template>
<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { mapState } from 'pinia'
import { useUserHistoryStore } from '@/stores/userHistoryStore'

export default {
  name: 'JobHistoryModal',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
  },
  props: {
    show: Boolean,
    user: Object
  },
  emits: ['close', 'onBeforeEnter', 'onAfterEnter', 'onBeforeLeave', 'onAfterLeave'],

  data() {
    return {
      scoreItems: [
        {
          title: 'การแต่งกาย',
          field: 'appearance_score',
          icon: 'fas fa-tshirt'
        },
        {
          title: 'คุณภาพงาน',
          field: 'quality_score',
          icon: 'fas fa-star'
        },
        {
          title: 'ปริมาณงาน',
          field: 'quantity_score',
          icon: 'fas fa-chart-line'
        },
        {
          title: 'มารยาท',
          field: 'manner_score',
          icon: 'fas fa-smile'
        },
        {
          title: 'การตรงต่อเวลา',
          field: 'punctuality_score',
          icon: 'fas fa-clock'
        }
      ]
    }
  },

  computed: {
    ...mapState(useUserHistoryStore, {
      jobs: 'history'
    })
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    hasScores(job) {
      if (!job.workHistories?.[0]) return false
      const scores = [
        'appearance_score',
        'quality_score',
        'quantity_score',
        'manner_score',
        'punctuality_score'
      ]
      return scores.some((score) => job.workHistories[0][score] !== null)
    },
    getScore(job, field) {
      const score = job.workHistories?.[0]?.[field]
      return score !== null ? score : '-'
    },
    getScoreColor(job) {
      if (!job.workHistories?.[0]) return 'gray'
      return job.workHistories[0].is_passed_evaluation ? 'green' : 'red'
    },
    getStatusClass(status) {
      switch (status) {
        case 'approved':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        case 'rejected':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      }
    },
    getScoreClass(score) {
      const numScore = Number(score)
      if (!numScore) return 'text-gray-400 dark:text-gray-500'
      return numScore === 2
        ? 'text-green-600 dark:text-green-400'
        : numScore === 1
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400'
    },
    getProgressBarClass(job) {
      const score = this.getTotalScore(job)
      if (score >= 8) return 'bg-green-500 dark:bg-green-400'
      if (score >= 6) return 'bg-yellow-500 dark:bg-yellow-400'
      return 'bg-red-500 dark:bg-red-400'
    },
    getTotalScore(job) {
      // ถ้าไม่มีประวัติการทำงาน หรือไม่ผ่านการประเมิน ให้คะแนน 0
      if (!job.workHistories?.[0]) return 0
      if (!job.workHistories[0].is_passed_evaluation) return 0

      const scores = [
        'appearance_score',
        'quality_score',
        'quantity_score',
        'manner_score',
        'punctuality_score'
      ]
      return scores.reduce((sum, field) => {
        const score = Number(job.workHistories[0][field]) || 0
        return sum + score
      }, 0)
    },

    getTotalScoreClass(job) {
      const total = this.getTotalScore(job)
      if (total >= 8) return 'text-green-600 dark:text-green-400'
      if (total >= 6) return 'text-yellow-600 dark:text-yellow-400'
      return 'text-red-600 dark:text-red-400'
    },
    getOverallScore() {
      if (!this.jobs?.length) return 0
      // รวมคะแนนทั้งหมด รวมถึงงานที่ไม่ผ่านการประเมิน (จะได้ 0 คะแนน)
      const totalScores = this.jobs.reduce((sum, job) => {
        // หารด้วยจำนวนงานทั้งหมด ไม่ว่าจะผ่านหรือไม่ผ่าน
        return sum + this.getTotalScore(job)
      }, 0)
      return (totalScores / this.jobs.length).toFixed(1)
    },
    getOverallScoreClass(score) {
      const numScore = parseFloat(score)
      if (numScore >= 8) return 'text-green-600 dark:text-green-400'
      if (numScore >= 6) return 'text-yellow-600 dark:text-yellow-400'
      return 'text-red-600 dark:text-red-400'
    },
    getStatusText(status) {
      switch (status) {
        case 'approved':
          return 'ผ่านการอนุมัติ'
        case 'rejected':
          return 'ไม่ผ่านการอนุมัติ'
        default:
          return 'รอดำเนินการ'
      }
    },
    formatDate(date) {
      if (!date) return 'ไม่ระบุ'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    onBeforeEnter() {
      this.$emit('onBeforeEnter')
    },
    onAfterEnter() {
      this.$emit('onAfterEnter')
    },
    onBeforeLeave() {
      this.$emit('onBeforeLeave')
    },
    onAfterLeave() {
      this.$emit('onAfterLeave')
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
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #9899ee;
}

@media (prefers-color-scheme: dark) {
  .overflow-y-auto {
    scrollbar-color: #9899ee #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #9899ee;
  }
}
</style>
