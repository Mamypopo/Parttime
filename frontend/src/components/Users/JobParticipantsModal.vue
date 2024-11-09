<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" @click="$emit('close')" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
          enter-to="opacity-100 sm:scale-100 translate-y-0"
          leave="duration-200 ease-in"
          leave-from="opacity-100 sm:scale-100 translate-y-0"
          leave-to="opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
        >
          <DialogPanel class="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
            <!-- Header -->
            <div
              class="sticky top-0 z-10 flex justify-between items-center p-6 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] rounded-t-xl"
            >
              <DialogTitle class="text-2xl font-semibold text-white">
                รายชื่อผู้เข้าร่วมงาน
                <p class="text-sm font-normal text-white/80 mt-1">{{ job.title }}</p>
              </DialogTitle>
              <button
                @click="$emit('close')"
                class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- Content -->
            <div class="bg-gray-50 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <div v-for="position in job.JobPositions" :key="position.id" class="mb-6">
                <!-- Position header -->
                <div class="px-6 pt-6">
                  <h4 class="font-semibold text-gray-800 flex items-center justify-between">
                    <span>{{ position.position_name }}</span>
                    <span
                      class="text-sm font-medium px-3 py-1 rounded-full bg-[#E7F6F6] text-[#5DA3A3]"
                    >
                      {{ getParticipantsByPosition(position.id).length }}/{{
                        position.required_people
                      }}
                      คน
                    </span>
                  </h4>
                </div>

                <!-- Table -->
                <div class="px-6 mt-4">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                          >
                            ชื่อ-นามสกุล
                          </th>
                          <th
                            scope="col"
                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            อีเมล
                          </th>
                          <th
                            scope="col"
                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            สถานะ
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        <tr
                          v-for="participant in getParticipantsByPosition(position.id)"
                          :key="participant.id"
                          class="hover:bg-gray-50"
                        >
                          <td class="whitespace-nowrap py-4 pl-4 pr-3">
                            <div class="flex items-center">
                              <img
                                :src="getProfileImage(participant.user.profile_image)"
                                class="h-10 w-10 rounded-full object-cover ring-2 ring-[#9899ee]/20"
                                :alt="participant.user.first_name"
                              />
                              <div class="ml-4">
                                <div class="font-medium text-gray-900">
                                  {{ participant.user.first_name }} {{ participant.user.last_name }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {{ participant.user.email }}
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              class="px-2.5 py-1 text-xs font-medium rounded-full bg-[#E7F6F6] text-[#5DA3A3]"
                            >
                              อนุมัติแล้ว
                            </span>
                          </td>
                        </tr>

                        <!-- Empty state -->
                        <tr v-if="getParticipantsByPosition(position.id).length === 0">
                          <td colspan="3" class="px-6 py-8 text-center text-gray-400">
                            <i class="fas fa-users text-2xl mb-2"></i>
                            <p>ยังไม่มีผู้เข้าร่วมในตำแหน่งนี้</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

export default {
  name: 'JobParticipantsModal',

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
      required: true
    }
  },

  methods: {
    getProfileImage(image) {
      return image
        ? `${import.meta.env.VITE_API_URL}/uploads/profiles/${image}`
        : '/default-avatar.png'
    },

    getParticipantsByPosition(positionId) {
      return this.job.JobParticipation.filter((p) => p.job_position_id === positionId)
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
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 20px;
  border: 2px solid #f3f4f6;
}
</style>
