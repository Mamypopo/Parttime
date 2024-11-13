<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <!-- Backdrop with blur effect -->
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
        <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
              <!-- Header with gradient -->
              <div class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] p-6">
                <div class="flex justify-between items-center">
                  <DialogTitle class="text-2xl font-semibold text-white">
                    รายชื่อผู้สมัคร
                    <p class="text-sm font-normal text-white/80 mt-1">{{ job.title }}</p>
                  </DialogTitle>
                  <button
                    @click="$emit('close')"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="bg-gray-50 p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <div v-for="position in job.JobPositions" :key="position.id" class="mb-6">
                  <!-- Position header -->
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-800">
                      {{ position.position_name }}
                    </h3>
                    <span class="px-3 py-1 bg-[#E7F6F6] text-[#5DA3A3] rounded-full text-sm">
                      {{ position.JobParticipation?.length || 0 }}/{{ position.required_people }} คน
                    </span>
                  </div>

                  <!-- Participants list -->
                  <div class="space-y-4">
                    <div
                      v-for="participant in position.JobParticipation"
                      :key="participant.id"
                      class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex justify-between items-center gap-6">
                        <!-- User info -->
                        <div class="flex items-center space-x-4">
                          <img
                            :src="getProfileImage(participant.user.profile_image)"
                            class="w-12 h-12 rounded-full object-cover ring-2 ring-[#9899ee]/20"
                            :alt="participant.user.firstname"
                          />
                          <div>
                            <p class="font-medium text-gray-900">
                              {{ participant.user.firstname }} {{ participant.user.lastname }}
                            </p>
                            <p class="text-sm text-gray-500">{{ participant.user.email }}</p>
                          </div>
                        </div>

                        <!-- Actions/Status -->
                        <div v-if="participant.status === 'pending'" class="flex gap-2">
                          <button
                            @click="handleApprove(participant.id)"
                            :disabled="loading"
                            class="px-4 py-2 bg-[#6ED7D1] hover:bg-[#5DA3A3] text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                          >
                            <i class="fas fa-check mr-2"></i>
                            {{ loading ? 'กำลังดำเนินการ...' : 'อนุมัติ' }}
                          </button>
                          <button
                            @click="handleReject(participant.id)"
                            :disabled="loading"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                          >
                            <i class="fas fa-times mr-2"></i>
                            {{ loading ? 'กำลังดำเนินการ...' : 'ปฏิเสธ' }}
                          </button>
                        </div>
                        <span
                          v-else
                          :class="getStatusClass(participant.status)"
                          class="px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {{ getStatusText(participant.status) }}
                        </span>
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div
                      v-if="!position.JobParticipation?.length"
                      class="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300"
                    >
                      <i class="fas fa-users text-gray-400 text-2xl mb-2"></i>
                      <p class="text-gray-500">ยังไม่มีผู้สมัครในตำแหน่งนี้</p>
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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Swal from 'sweetalert2'

export default {
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot
  },
  props: {
    job: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && Array.isArray(value.JobPositions)
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },

  methods: {
    async handleApprove(participationId) {
      try {
        // ขอการยืนยันก่อน
        const confirm = await Swal.fire({
          title: 'ยืนยันการอนุมัติ',
          text: 'คุณต้องการอนุมัติผู้สมัครนี้ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#6ED7D1',
          cancelButtonColor: '#d33'
        })

        if (confirm.isConfirmed) {
          const result = await new Promise((resolve) => {
            this.$emit('approve', participationId, resolve)
          })

          if (result?.success) {
            this.$emit('update:job', {
              ...this.job,
              JobPositions: this.job.JobPositions.map((position) => ({
                ...position,
                JobParticipation: position.JobParticipation.map((p) =>
                  p.id === participationId ? { ...p, status: 'rejected' } : p
                )
              }))
            })
            await Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: result.message,
              timer: 1500,
              showConfirmButton: false
            })
          } else {
            throw new Error(result?.message || 'ไม่สามารถอนุมัติได้')
          }
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message
        })
      }
    },
    async handleReject(participationId) {
      try {
        const confirm = await Swal.fire({
          title: 'ยืนยันการปฏิเสธ',
          text: 'คุณต้องการปฏิเสธผู้สมัครนี้ใช่หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6e7881'
        })

        if (confirm.isConfirmed) {
          const result = await new Promise((resolve) => {
            this.$emit('reject', participationId, resolve)
          })

          if (result?.success) {
            this.$emit('update:job', {
              ...this.job,
              JobPositions: this.job.JobPositions.map((position) => ({
                ...position,
                JobParticipation: position.JobParticipation.map((p) =>
                  p.id === participationId ? { ...p, status: 'rejected' } : p
                )
              }))
            })

            await Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: result.message,
              timer: 1500,
              showConfirmButton: false
            })
          } else {
            throw new Error(result?.message || 'ไม่สามารถปฏิเสธได้')
          }
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message
        })
      }
    },
    getStatusClass(status) {
      return (
        {
          approved: 'bg-green-100 text-green-600',
          rejected: 'bg-red-100 text-red-600'
        }[status] || ''
      )
    },
    getStatusText(status) {
      return (
        {
          approved: 'อนุมัติแล้ว',
          rejected: 'ปฏิเสธแล้ว',
          pending: 'รอดำเนินการ'
        }[status] || status
      )
    },
    getProfileImage(image) {
      return image
        ? `${import.meta.env.VITE_API_URL}/uploads/profiles/${image}`
        : '/default-avatar.png'
    }
  }
}
</script>
