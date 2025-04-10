<template>
  <div class="p-4 md:p-6 transition-all duration-300 ease-in-out">
    <!-- Header -->
    <div class="mb-8 mt-3">
      <div class="flex justify-between items-center mb-6">
        <div class="mb-4 md:mb-0">
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300"
          >
            แก้ไขการประเมิน
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">แก้ไขข้อมูลการประเมินผลการทำงาน</p>
        </div>
        <div>
          <button
            @click="goBack"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <i class="fas fa-arrow-left"></i>
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-xl p-8 mb-6 animate-pulse">
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-8 mx-auto"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-xl p-8 mb-6">
      <div class="flex flex-col items-center justify-center py-8">
        <div
          class="w-24 h-24 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4"
        >
          <i class="fas fa-exclamation-triangle text-3xl"></i>
        </div>
        <p class="text-red-500 dark:text-red-400 text-lg">{{ error }}</p>
        <button
          @click="fetchUserEvaluations"
          class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>

    <!-- ส่วนแสดงรายการประวัติการประเมินทั้งหมด -->
    <div
      v-else-if="allEvaluations && allEvaluations.length > 0 && !selectedEvaluation"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ประวัติการประเมินทั้งหมด
        </h3>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  วันที่ปฏิบัติงาน
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  งาน
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  สถานที่
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  ตำแหน่ง
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  สถานะ
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  คะแนนรวม
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <tr
                v-for="evaluation in allEvaluations"
                :key="evaluation.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(evaluation.jobParticipation?.jobPosition?.job?.work_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ evaluation.jobParticipation?.Job?.title || 'ไม่ระบุ' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ evaluation.jobParticipation?.Job?.location || 'ไม่ระบุ' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ evaluation.jobParticipation?.jobPosition?.position_name || 'ไม่ระบุ' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="`px-2 py-1 text-xs rounded-full ${evaluation.is_passed_evaluation ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`"
                  >
                    {{ evaluation.is_passed_evaluation ? 'ผ่าน' : 'ไม่ผ่าน' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ evaluation.total_score || 'ไม่มีคะแนน' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="selectEvaluation(evaluation)"
                    class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Evaluation Form (แสดงเมื่อเลือกการประเมินแล้ว) -->
    <div
      v-else-if="selectedEvaluation"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
    >
      <!-- User and Job Info -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">แก้ไขการประเมิน</h3>
          <button
            @click="backToList"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <i class="fas fa-arrow-left mr-1"></i> กลับไปยังรายการ
          </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center">
          <div class="flex items-center mb-4 md:mb-0 md:mr-8">
            <div
              class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 flex items-center justify-center mr-3 text-white font-semibold text-base"
            >
              <img
                v-if="selectedEvaluation.jobParticipation.user.profile_image"
                :src="`${baseURL}/uploads/profiles/${selectedEvaluation.jobParticipation.user.profile_image}`"
                :alt="selectedEvaluation.jobParticipation.user.first_name"
                class="w-full h-full object-cover"
              />
              <span v-else>
                {{
                  selectedEvaluation.jobParticipation.user.first_name?.charAt(0).toUpperCase() ||
                  '?'
                }}
              </span>
            </div>
            <div>
              <div class="text-gray-900 dark:text-white font-medium">
                {{ selectedEvaluation.jobParticipation.user.prefix }}
                {{ selectedEvaluation.jobParticipation.user.first_name }}
                {{ selectedEvaluation.jobParticipation.user.last_name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedEvaluation.jobParticipation.user.email }}
              </div>
            </div>
          </div>
          <div class="flex-1">
            <div class="text-gray-900 dark:text-white font-medium">
              {{ selectedEvaluation.jobParticipation.Job.title }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              ตำแหน่ง: {{ selectedEvaluation.jobParticipation.jobPosition.position_name }} | วันที่:
              {{ formatDate(selectedEvaluation.jobParticipation.Job.work_date) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluation Form -->
      <form @submit.prevent="saveEvaluation" class="p-6">
        <!-- Pass/Fail Toggle -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">สถานะการประเมิน</label>
          <div class="flex items-center space-x-4">
            <label class="inline-flex items-center">
              <input
                type="radio"
                v-model="formData.is_passed_evaluation"
                :value="true"
                class="form-radio text-purple-600"
              />
              <span class="ml-2">ผ่านการประเมิน</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                v-model="formData.is_passed_evaluation"
                :value="false"
                class="form-radio text-purple-600"
              />
              <span class="ml-2">ไม่ผ่านการประเมิน</span>
            </label>
          </div>
        </div>

        <!-- Scores (Only shown if passed) -->
        <div
          v-if="formData.is_passed_evaluation"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <div>
            <label class="block text-sm font-medium mb-2">คะแนนการแต่งกาย (0-2)</label>
            <input
              type="number"
              v-model.number="formData.appearance_score"
              min="0"
              max="2"
              class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">คะแนนคุณภาพงาน (0-2)</label>
            <input
              type="number"
              v-model.number="formData.quality_score"
              min="0"
              max="2"
              class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">คะแนนปริมาณงาน (0-2)</label>
            <input
              type="number"
              v-model.number="formData.quantity_score"
              min="0"
              max="2"
              class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">คะแนนมารยาท (0-2)</label>
            <input
              type="number"
              v-model.number="formData.manner_score"
              min="0"
              max="2"
              class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">คะแนนการตรงต่อเวลา (0-2)</label>
            <input
              type="number"
              v-model.number="formData.punctuality_score"
              min="0"
              max="2"
              class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">คะแนนรวม</label>
            <input
              type="number"
              :value="calculateTotalScore"
              disabled
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        <!-- Comment -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">ความคิดเห็น</label>
          <textarea
            v-model="formData.comment"
            rows="4"
            class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
            placeholder="ระบุความคิดเห็นเกี่ยวกับการทำงาน"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="px-6 py-3 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 gap-2"
            :disabled="saving"
          >
            <i class="fas fa-save mr-2"></i>
            <span v-if="saving">กำลังบันทึก...</span>
            <span v-else>บันทึกการประเมิน</span>
          </button>
        </div>
      </form>
    </div>

    <!-- No Evaluations -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl p-8 mb-6">
      <div class="flex flex-col items-center justify-center py-8">
        <div
          class="w-24 h-24 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center mb-4"
        >
          <i class="fas fa-clipboard-list text-3xl"></i>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-lg">ไม่พบข้อมูลการประเมิน</p>
      </div>
    </div>
  </div>
</template>

<script>
import evaluationService from '@/services/evaluationService.js'
import api from '@/services/axios.js'
import Swal from 'sweetalert2'

export default {
  name: 'EditEvaluation',

  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      workHistoryId: null,
      userId: null,
      allEvaluations: [],
      selectedEvaluation: null,
      evaluation: null,
      formData: {
        is_passed_evaluation: true,
        appearance_score: 0,
        quality_score: 0,
        quantity_score: 0,
        manner_score: 0,
        punctuality_score: 0,
        comment: ''
      },
      loading: false,
      saving: false,
      error: null
    }
  },

  computed: {
    calculateTotalScore() {
      if (!this.formData.is_passed_evaluation) return 0

      return (
        Number(this.formData.appearance_score || 0) +
        Number(this.formData.quality_score || 0) +
        Number(this.formData.quantity_score || 0) +
        Number(this.formData.manner_score || 0) +
        Number(this.formData.punctuality_score || 0)
      )
    }
  },

  created() {
    const { userId, id } = this.$route.params

    if (userId) {
      this.userId = userId
      this.fetchUserEvaluations(userId)
    } else if (id) {
      this.workHistoryId = id
      this.fetchEvaluationById(id)
    } else {
      this.error = 'ไม่พบข้อมูลผู้ใช้หรือการประเมิน'
    }
  },

  methods: {
    async fetchUserEvaluations(userId) {
      try {
        this.loading = true
        this.error = null

        const response = await api.get(`/api/users/history/${userId}`)

        if (response.data && response.data.jobHistory) {
          const evaluations = []
          response.data.jobHistory.forEach((job) => {
            if (job.workHistories && job.workHistories.length > 0) {
              job.workHistories.forEach((history) => {
                evaluations.push({
                  ...history,
                  jobParticipation: {
                    ...job,
                    Job: job.jobPosition?.job || {},
                    jobPosition: job.jobPosition || {}
                  }
                })
              })
            }
          })

          this.allEvaluations = evaluations
        } else {
          this.error = 'ไม่พบข้อมูลการประเมิน'
        }
      } catch (error) {
        console.error('Error fetching user evaluations:', error)
        this.error = 'ไม่สามารถดึงข้อมูลการประเมินได้'
      } finally {
        this.loading = false
      }
    },

    async fetchEvaluationById(evaluationId) {
      try {
        this.loading = true
        this.workHistoryId = evaluationId

        const response = await evaluationService.getEvaluationById(evaluationId)

        if (response.data) {
          this.evaluation = response.data
          this.selectedEvaluation = response.data

          this.formData = {
            is_passed_evaluation: this.evaluation.is_passed_evaluation,
            appearance_score: this.evaluation.appearance_score || 0,
            quality_score: this.evaluation.quality_score || 0,
            quantity_score: this.evaluation.quantity_score || 0,
            manner_score: this.evaluation.manner_score || 0,
            punctuality_score: this.evaluation.punctuality_score || 0,
            comment: this.evaluation.comment || ''
          }
        } else {
          this.error = 'ไม่พบข้อมูลการประเมิน'
        }
      } catch (error) {
        console.error('Error fetching evaluation:', error)
        this.error = 'ไม่สามารถดึงข้อมูลการประเมินได้'
      } finally {
        this.loading = false
      }
    },

    selectEvaluation(evaluation) {
      this.selectedEvaluation = evaluation
      this.evaluation = evaluation
      this.workHistoryId = evaluation.id

      this.formData = {
        is_passed_evaluation: evaluation.is_passed_evaluation,
        appearance_score: evaluation.appearance_score || 0,
        quality_score: evaluation.quality_score || 0,
        quantity_score: evaluation.quantity_score || 0,
        manner_score: evaluation.manner_score || 0,
        punctuality_score: evaluation.punctuality_score || 0,
        comment: evaluation.comment || ''
      }
    },

    backToList() {
      this.selectedEvaluation = null
    },

    async saveEvaluation() {
      try {
        this.saving = true

        if (!this.workHistoryId) {
          throw new Error('ไม่พบ ID ของประวัติการทำงาน')
        }

        const dataToSend = {
          ...this.formData,
          total_score: this.calculateTotalScore
        }

        await evaluationService.updateEvaluation(this.workHistoryId, dataToSend)

        if (this.allEvaluations.length > 0) {
          const index = this.allEvaluations.findIndex((e) => e.id === this.workHistoryId)
          if (index !== -1) {
            this.allEvaluations[index] = {
              ...this.allEvaluations[index],
              ...dataToSend
            }
          }
        }

        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'อัปเดตข้อมูลการประเมินเรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          position: 'top-end',
          toast: true
        })

        this.backToList()
      } catch (error) {
        console.error('Error saving evaluation:', error)

        let errorMessage = 'ไม่สามารถบันทึกข้อมูลการประเมินได้'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonColor: '#C5B4E3'
        })
      } finally {
        this.saving = false
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
