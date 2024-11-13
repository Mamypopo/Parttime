<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <!-- Overlay -->
      <TransitionChild
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Modal Panel -->
          <TransitionChild
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl bg-white rounded-xl shadow-xl">
              <div class="p-6">
                <DialogTitle class="text-xl font-semibold text-gray-800 mb-4">
                  อัพเดทสถานะการทำงาน
                </DialogTitle>

                <!-- ตำแหน่งงานและผู้ทำงาน -->
                <div class="space-y-6">
                  <div v-for="position in job.JobPositions" :key="position.id">
                    <h4 class="font-medium text-gray-700 mb-3">
                      {{ position.position_name }}
                    </h4>

                    <div class="space-y-4">
                      <div
                        v-for="participant in getApprovedParticipants(position)"
                        :key="participant.id"
                        class="bg-gray-50 rounded-xl p-4 transition-all hover:shadow-md"
                      >
                        <!-- ข้อมูลผู้ทำงาน -->
                        <div class="flex items-center justify-between flex-wrap gap-4">
                          <div class="flex items-center gap-3">
                            <img
                              :src="participant.user.profile_image || '/default-avatar.png'"
                              class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              alt="Profile"
                            />
                            <div>
                              <p class="font-medium text-gray-800">
                                {{ participant.user.first_name }} {{ participant.user.last_name }}
                              </p>
                              <p class="text-sm text-gray-500">
                                {{ participant.user.phone_number }}
                              </p>
                            </div>
                          </div>

                          <!-- สถานะการทำงาน -->
                          <div class="flex flex-col gap-3 w-full md:w-auto">
                            <div class="flex flex-wrap gap-2">
                              <button
                                v-for="status in workStatuses"
                                :key="status.value"
                                @click="selectStatus(participant.id, status.value)"
                                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                :class="[
                                  selectedStatuses[participant.id] === status.value
                                    ? 'bg-[#81E2C4] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                ]"
                              >
                                {{ status.label }}
                              </button>
                            </div>

                            <!-- คะแนนและความคิดเห็น -->
                            <div
                              v-if="selectedStatuses[participant.id]"
                              class="space-y-3 mt-3 animate-fade-in"
                            >
                              <div>
                                <label class="text-sm text-gray-600 mb-1 block">
                                  คะแนน (1-5)
                                </label>
                                <input
                                  type="number"
                                  v-model="ratings[participant.id]"
                                  min="1"
                                  max="5"
                                  class="w-full px-3 py-2 border rounded-lg"
                                />
                              </div>
                              <div>
                                <label class="text-sm text-gray-600 mb-1 block">
                                  ความคิดเห็น
                                </label>
                                <textarea
                                  v-model="comments[participant.id]"
                                  rows="2"
                                  class="w-full px-3 py-2 border rounded-lg"
                                ></textarea>
                              </div>
                              <button
                                @click="updateStatus(participant.id)"
                                class="w-full md:w-auto px-4 py-2 bg-[#81E2C4] text-white rounded-lg hover:bg-[#6dcaa8] transition-colors"
                              >
                                บันทึก
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ปุ่มปิด -->
                <div class="flex justify-end mt-6">
                  <button
                    @click="$emit('close')"
                    class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

const props = defineProps({
  show: Boolean,
  job: Object
})

const emit = defineEmits(['close', 'update'])

const selectedStatuses = ref({})
const ratings = ref({})
const comments = ref({})

const workStatuses = [
  { value: 'successful', label: 'สำเร็จ' },
  { value: 'needs_improvement', label: 'ต้องปรับปรุง' },
  { value: 'failed', label: 'ไม่สำเร็จ' }
]

const getApprovedParticipants = (position) => {
  return position.JobParticipation?.filter((p) => p.status === 'approved') || []
}

const selectStatus = (participantId, status) => {
  selectedStatuses.value[participantId] = status
}

const updateStatus = (participationId) => {
  emit('update', {
    participationId,
    status: selectedStatuses.value[participationId],
    rating: ratings.value[participationId],
    comment: comments.value[participationId]
  })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
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
