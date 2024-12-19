<template>
  <TransitionRoot appear :show="show" as="template">
    <Teleport to="body">
      <Dialog as="div" @close="$emit('close')" class="relative modal">
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
                class="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
              >
                <!-- Header -->
                <div
                  class="p-6 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80"
                >
                  <div class="flex justify-between items-center">
                    <DialogTitle class="text-3xl font-semibold text-white">
                      ผลการประเมิน
                      <p class="text-base font-base text-white/90 mt-1">งาน : {{ job?.title }}</p>
                    </DialogTitle>
                    <button
                      @click="$emit('close')"
                      class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                    >
                      <i class="fas fa-times text-xl"></i>
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6 bg-gray-50 dark:bg-gray-900/50">
                  <!-- คะแนนการประเมิน -->
                  <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div
                      v-for="(score, index) in scoreItems"
                      :key="index"
                      class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <i
                          :class="[
                            score.icon,
                            'mr-2',
                            getScoreIconClass(evaluation?.[score.field])
                          ]"
                        ></i>
                        {{ score.title }}
                      </div>
                      <div
                        class="text-xl font-bold"
                        :class="getScoreClass(evaluation?.[score.field])"
                      >
                        {{ evaluation?.[score.field] || 0 }}/2
                      </div>
                    </div>
                  </div>

                  <!-- คะแนนรวม -->
                  <div
                    v-if="evaluation?.is_passed_evaluation"
                    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                  >
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-lg font-medium text-gray-800 dark:text-gray-200"
                        >คะแนนรวม</span
                      >
                      <div class="flex items-baseline">
                        <span class="text-3xl font-bold mr-2" :class="getTotalScoreClass()">
                          {{ getTotalScore() }}
                        </span>
                        <span class="text-gray-500 dark:text-gray-400">/10</span>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        :class="getProgressBarClass()"
                        :style="{ width: `${(getTotalScore() / 10) * 100}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- แสดงข้อความเมื่อไม่ผ่านการประเมิน -->
                  <div
                    v-else
                    class="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-6"
                  >
                    <div class="flex justify-center items-center">
                      <span class="text-lg font-medium">ไม่ผ่านการประเมิน</span>
                    </div>
                  </div>

                  <!-- ความคิดเห็น -->
                  <div
                    v-if="evaluation?.comment"
                    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      ความคิดเห็นเพิ่มเติม
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300">{{ evaluation.comment }}</p>
                  </div>

                  <!-- วันที่ประเมิน -->
                  <div class="evaluation-date mt-4 text-right">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      <i class="fas fa-calendar-alt mr-2"></i>
                      ประเมินเมื่อ:
                      {{ evaluation?.created_at ? formatDate(evaluation.created_at) : 'ไม่ระบุ' }}
                    </span>
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
    show: {
      type: Boolean,
      default: false
    },
    job: {
      type: Object,
      default: null
    },
    evaluation: {
      type: Object,
      default: null
    }
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
          title: 'ตรงต่อเวลา',
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

    getTotalScore() {
      if (!this.evaluation || !this.evaluation.total_score) return 0
      return this.evaluation.total_score
    },

    getScoreIconClass() {
      return 'text-gray-500 dark:text-gray-300' // สีคงที่สำหรับไอคอน
    },

    getProgressBarClass() {
      const score = this.getTotalScore()
      if (score === null)
        return 'bg-gradient-to-r from-pink-300 to-red-300 dark:from-pink-700 dark:to-red-700' // สีพาสเทลแดง-ชมพูสำหรับค่า null (ไม่ผ่าน)
      if (score >= 8)
        return 'bg-gradient-to-r from-green-200 to-green-400 dark:from-green-600 dark:to-green-800' // สีพาสเทลเขียวสำหรับดีมาก
      if (score >= 6)
        return 'bg-gradient-to-r from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800' // สีพาสเทลเหลืองสำหรับปานกลาง
      if (score >= 4)
        return 'bg-gradient-to-r from-orange-200 to-orange-400 dark:from-orange-600 dark:to-orange-800' // สีพาสเทลส้มสำหรับค่อนข้างต่ำ
      return 'bg-gradient-to-r from-red-200 to-red-400 dark:from-red-600 dark:to-red-800' // สีพาสเทลแดงสำหรับคะแนนต่ำ
    },

    getScoreClass(score) {
      if (score === null) return 'text-red-500 dark:text-red-600' // สีแดงเข้มสำหรับค่า null (ไม่ผ่าน)
      const numScore = Number(score) || 0
      if (numScore >= 2) return 'text-green-500 dark:text-green-400' // สีเขียวสำหรับคะแนนสูง
      if (numScore >= 1) return 'text-blue-500 dark:text-blue-400' // สีฟ้าสำหรับคะแนนปานกลาง
      return 'text-red-500 dark:text-red-400' // สีแดงสำหรับคะแนนต่ำ
    },

    getTotalScoreClass() {
      const total = this.getTotalScore()
      if (total === null) return 'text-red-500 dark:text-red-600' // สีแดงเข้มสำหรับค่า null (ไม่ผ่าน)
      if (total >= 8) return 'text-green-600 dark:text-green-400' // ดีมาก
      if (total >= 6) return 'text-yellow-600 dark:text-yellow-400' // ปานกลาง
      if (total >= 4) return 'text-orange-600 dark:text-orange-400' // ค่อนข้างต่ำ
      return 'text-red-600 dark:text-red-400' // สีแดงสำหรับคะแนนต่ำ
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
