<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
            <DialogPanel class="w-full max-w-5xl bg-white rounded-2xl shadow-xl">
              <!-- Header -->
              <div class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                  <div>
                    <DialogTitle class="text-2xl font-semibold text-white flex items-center gap-3">
                      <i class="fas fa-users"></i>
                      รายชื่อผู้สมัคร
                    </DialogTitle>
                    <p class="text-white/80 mt-2 flex items-center gap-2">
                      <i class="fas fa-briefcase text-sm"></i>
                      {{ job.title }}
                    </p>
                  </div>
                  <button
                    @click="$emit('close')"
                    class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all duration-200"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                </div>

                <!-- Search & Filter -->
                <div class="mt-6 flex gap-4">
                  <div class="relative flex-1 min-w-[200px]">
                    <input
                      v-model="searchTerm"
                      type="text"
                      placeholder="ค้นหาผู้สมัครจากชื่อหรืออีเมล..."
                      class="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:border-white/40"
                    />
                    <i class="fas fa-search absolute left-3.5 top-3.5 text-white/60"></i>
                  </div>
                  <div class="relative">
                    <select
                      v-model="statusFilter"
                      class="appearance-none pl-4 pr-10 py-2.5 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <option value="" class="bg-white text-gray-700">สถานะทั้งหมด</option>
                      <option value="pending" class="bg-white text-gray-700">รอดำเนินการ</option>
                      <option value="approved" class="bg-white text-gray-700">อนุมัติแล้ว</option>
                      <option value="rejected" class="bg-white text-gray-700">
                        ไม่ผ่านการอนุมัติ
                      </option>
                    </select>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60"
                    >
                      <i class="fas fa-chevron-down"></i>
                    </div>
                  </div>

                  <!-- คะแนน -->
                  <div class="relative">
                    <select
                      v-model="ratingFilter"
                      class="appearance-none pl-4 pr-10 py-2.5 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <option value="" class="bg-white text-gray-700">คะแนนทั้งหมด</option>
                      <option value="rated" class="bg-white text-gray-700">ประเมินแล้ว</option>
                      <option value="unrated" class="bg-white text-gray-700">
                        ยังไม่ได้ประเมิน
                      </option>
                    </select>
                    <div
                      class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60"
                    >
                      <i class="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
                <!-- แสดงจำนวนผู้สมัครทั้งหมด -->
                <div class="flex items-center gap-2 ml-auto pt-3">
                  <span class="text-white/80">ทั้งหมด:</span>
                  <span class="px-3 py-1 bg-white/20 rounded-full text-white font-medium">
                    {{ getTotalParticipants() }} คน
                  </span>
                </div>
              </div>

              <!-- หลัง Header และก่อน Content -->
              <div class="bg-white px-6 py-4 border-b">
                <div class="grid grid-cols-4 gap-4">
                  <!-- รอดำเนินการ -->
                  <div class="bg-[#FEF9C3] rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-yellow-800 text-sm">รอดำเนินการ</p>
                        <p class="text-2xl font-semibold text-yellow-900">
                          {{ getStatusCount('pending') }}
                        </p>
                      </div>
                      <div class="bg-yellow-200 rounded-full p-3">
                        <i class="fas fa-clock text-yellow-600"></i>
                      </div>
                    </div>
                  </div>

                  <!-- อนุมัติแล้ว -->
                  <div class="bg-[#DCFCE7] rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-green-800 text-sm">อนุมัติแล้ว</p>
                        <p class="text-2xl font-semibold text-green-900">
                          {{ getStatusCount('approved') }}
                        </p>
                      </div>
                      <div class="bg-green-200 rounded-full p-3">
                        <i class="fas fa-check text-green-600"></i>
                      </div>
                    </div>
                  </div>

                  <!-- ไม่ผ่านการอนุมัติ -->
                  <div class="bg-[#FEE2E2] rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-red-800 text-sm">ไม่ผ่านการอนุมัติ</p>
                        <p class="text-2xl font-semibold text-red-900">
                          {{ getStatusCount('rejected') }}
                        </p>
                      </div>
                      <div class="bg-red-200 rounded-full p-3">
                        <i class="fas fa-times text-red-600"></i>
                      </div>
                    </div>
                  </div>

                  <!-- ประเมินแล้ว -->
                  <div class="bg-[#E0F2FE] rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-blue-800 text-sm">ประเมินแล้ว</p>
                        <p class="text-2xl font-semibold text-blue-900">
                          {{ getRatedCount() }}
                        </p>
                      </div>
                      <div class="bg-blue-200 rounded-full p-3">
                        <i class="fas fa-star text-blue-600"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Content -->
              <div class="bg-gray-50 p-6 max-h-[calc(100vh-15rem)] overflow-y-auto">
                <div v-for="position in job.JobPositions" :key="position.id" class="mb-8">
                  <!-- Position Header -->
                  <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full bg-[#E7F6F6] flex items-center justify-center"
                      >
                        <i class="fas fa-user-md text-[#5DA3A3]"></i>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-800">
                          {{ position.position_name }}
                        </h3>
                        <p class="text-sm text-gray-500">
                          จำนวนที่รับ: {{ position.required_people }} คน
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="flex -space-x-2">
                        <template
                          v-for="(participant, index) in filteredParticipants(position)"
                          :key="index"
                        >
                          <img
                            v-if="index < 3"
                            :src="getProfileImage(participant.user.profile_image)"
                            class="w-8 h-8 rounded-full border-2 border-white"
                            :alt="participant.user.first_name"
                          />
                        </template>
                      </div>
                      <span
                        class="px-3 py-1 bg-[#E7F6F6] text-[#5DA3A3] rounded-full text-sm font-medium"
                      >
                        {{ filteredParticipants(position).length }}/{{ position.required_people }}
                        คน
                      </span>
                    </div>
                  </div>

                  <!-- Participants Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="participant in filteredParticipants(position)"
                      :key="participant.id"
                      class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div class="p-4">
                        <!-- User Info -->
                        <div class="flex items-start gap-4">
                          <img
                            :src="getProfileImage(participant.user.profile_image)"
                            class="w-14 h-14 rounded-full object-cover ring-2 ring-[#9899ee]/20"
                            :alt="participant.user.first_name"
                          />
                          <div class="flex-1">
                            <div class="flex items-start justify-between">
                              <div>
                                <h4 class="font-medium text-gray-900">
                                  {{ participant.user.first_name }} {{ participant.user.last_name }}
                                </h4>
                                <p class="text-sm text-gray-500">{{ participant.user.email }}</p>
                              </div>
                              <!--StatusBadge  -->
                              <span
                                class="px-3 py-1 rounded-full text-sm font-medium"
                                :class="getStatusClass(participant.status)"
                              >
                                {{ getStatusText(participant.status) }}
                              </span>
                            </div>

                            <!-- Rating & Review -->
                            <div
                              v-if="participant.workHistories?.length > 0"
                              class="mt-3 pt-3 border-t"
                            >
                              <div class="flex items-center gap-2">
                                <div class="flex gap-0.5">
                                  <i
                                    v-for="n in 5"
                                    :key="n"
                                    class="fas fa-star text-sm"
                                    :class="
                                      n <= participant.workHistories[0].rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-200'
                                    "
                                  ></i>
                                </div>
                                <span class="text-sm font-medium text-gray-700">
                                  {{ participant.workHistories[0].rating }}/5
                                </span>
                                <button
                                  v-if="participant.workHistories[0].comment"
                                  @click="showCommentDetail(participant.workHistories[0])"
                                  class="ml-2 text-sm text-[#6ED7D1] hover:text-[#5DA3A3] flex items-center gap-1"
                                >
                                  <i class="fas fa-comment-dots"></i>
                                  ดูความคิดเห็น
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div v-if="participant.status === 'pending'" class="mt-4 flex gap-2">
                          <button
                            @click="handleApprove(participant.id)"
                            :disabled="loading"
                            class="flex-1 px-4 py-2 bg-[#6ED7D1] hover:bg-[#5DA3A3] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <i class="fas fa-check mr-2"></i>
                            {{ loading ? 'กำลังดำเนินการ...' : 'อนุมัติ' }}
                          </button>
                          <button
                            @click="handleReject(participant.id)"
                            :disabled="loading"
                            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <i class="fas fa-times mr-2"></i>
                            {{ loading ? 'กำลังดำเนินการ...' : 'ปฏิเสธ' }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="filteredParticipants(position).length === 0"
                      class="md:col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300"
                    >
                      <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <i class="fas fa-users text-gray-400 text-2xl"></i>
                      </div>
                      <p class="text-gray-500 mb-2">ยังไม่มีผู้สมัครในตำแหน่งนี้</p>
                      <p class="text-sm text-gray-400">เมื่อมีผู้สมัครเข้ามา รายชื่อจะแสดงที่นี่</p>
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
    show: {
      type: Boolean,
      required: true
    },
    job: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update:job', 'approve', 'reject'],
  data() {
    return {
      loading: false,
      searchTerm: '',
      statusFilter: '',
      ratingFilter: ''
    }
  },

  methods: {
    filteredParticipants(position) {
      return (
        position.JobParticipation?.filter((participant) => {
          // ค้นหาจากชื่อและอีเมล
          const matchSearch = this.searchTerm
            ? participant.user.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              participant.user.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              participant.user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
            : true

          // กรองตามสถานะ
          const matchStatus = this.statusFilter ? participant.status === this.statusFilter : true

          // กรองตามการประเมิน
          const matchRating = this.ratingFilter
            ? this.ratingFilter === 'rated'
              ? participant.workHistories?.length > 0
              : participant.workHistories?.length === 0
            : true

          return matchSearch && matchStatus && matchRating
        }) || []
      )
    },

    getTotalParticipants() {
      return this.job.JobPositions.reduce((total, position) => {
        return total + (position.JobParticipation?.length || 0)
      }, 0)
    },

    getStatusCount(status) {
      return this.job.JobPositions.reduce((total, position) => {
        return total + (position.JobParticipation?.filter((p) => p.status === status).length || 0)
      }, 0)
    },

    getRatedCount() {
      return this.job.JobPositions.reduce((total, position) => {
        return (
          total +
          (position.JobParticipation?.filter((p) => p.workHistories?.length > 0).length || 0)
        )
      }, 0)
    },

    showCommentDetail(workHistory) {
      const createdAt = new Date(workHistory.created_at).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      Swal.fire({
        title: 'ความคิดเห็นจากการประเมิน',
        html: `
          <div class="text-left">
            <div class="flex items-center justify-center gap-1 mb-4">
              ${Array(5)
                .fill()
                .map(
                  (_, i) => `
                <i class="fas fa-star ${i < workHistory.rating ? 'text-yellow-400' : 'text-gray-200'}"></i>
              `
                )
                .join('')}
              <span class="ml-2 font-medium">${workHistory.rating}/5</span>
            </div>
            <p class="text-gray-600 mb-3">${workHistory.comment}</p>
            <p class="text-sm text-gray-400">ประเมินเมื่อ ${createdAt}</p>
          </div>
        `,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#6ED7D1'
      })
    },

    async handleApprove(participationId) {
      try {
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
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        }[status] || 'bg-gray-100 text-gray-800'
      )
    },

    getStatusText(status) {
      return (
        {
          pending: 'รอดำเนินการ',
          approved: 'อนุมัติแล้ว',
          rejected: 'ไม่ผ่านการอนุมัติ'
        }[status] || status
      )
    },

    getStatusStyle(status) {
      return (
        {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        }[status] || ''
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
<style scoped>
.modal-scroll::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-scroll::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 4px;
}

.modal-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

select option {
  @apply py-2 px-4;
}

/* ซ่อน default arrow ของ select */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* เพิ่ม hover effect สำหรับ options */
select option:hover {
  @apply bg-gray-100;
}
</style>
