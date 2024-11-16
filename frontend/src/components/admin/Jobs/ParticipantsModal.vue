<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative modal" @close="$emit('close')">
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
          <DialogPanel
            class="w-full max-w-[90vw] h-[90vh] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden relative"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] p-4 md:p-6 rounded-t-2xl">
              <div class="flex justify-between items-center">
                <div>
                  <DialogTitle
                    class="text-xl md:text-2xl font-semibold text-white flex items-center gap-3"
                  >
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
            </div>

            <!-- Main Content -->
            <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <!-- Left Sidebar - Stats & Filters -->
              <div
                class="w-full lg:w-[300px] border-b lg:border-b-0 lg:border-r border-gray-200 bg-white"
              >
                <!-- Stats Cards -->
                <div class="grid grid-cols-2 lg:grid-cols-1 gap-3 p-4">
                  <!-- Filter Status Buttons -->
                  <div
                    @click="toggleFilter('pending')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'pending'
                        ? 'bg-yellow-100 ring-2 ring-yellow-200'
                        : 'bg-yellow-50 hover:bg-yellow-100'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-yellow-800">
                      <i class="fas fa-clock"></i>
                      <span>รอดำเนินการ</span>
                    </div>
                    <span class="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-sm">
                      {{ getStatusCount('pending') }}
                    </span>
                  </div>

                  <div
                    @click="toggleFilter('approved')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'approved'
                        ? 'bg-green-100 ring-2 ring-green-200'
                        : 'bg-green-50 hover:bg-green-100'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-green-800">
                      <i class="fas fa-check"></i>
                      <span>อนุมัติแล้ว</span>
                    </div>
                    <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-sm">
                      {{ getStatusCount('approved') }}
                    </span>
                  </div>

                  <div
                    @click="toggleFilter('rejected')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'rejected'
                        ? 'bg-red-100 ring-2 ring-red-200'
                        : 'bg-red-50 hover:bg-red-100'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-red-800">
                      <i class="fas fa-times"></i>
                      <span>ไม่ผ่านการอนุมัติ</span>
                    </div>
                    <span class="bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-sm">
                      {{ getStatusCount('rejected') }}
                    </span>
                  </div>

                  <div
                    @click="toggleRatingFilter('rated')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      ratingFilter === 'rated'
                        ? 'bg-[#E7F6F6] ring-2 ring-[#6ED7D1]'
                        : 'bg-[#F5FAFA] hover:bg-[#E7F6F6]'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-[#5DA3A3]">
                      <i class="fas fa-star"></i>
                      <span>ประเมินแล้ว</span>
                    </div>
                    <span class="bg-[#6ED7D1]/30 text-[#5DA3A3] px-2 py-0.5 rounded-full text-sm">
                      {{ getRatedCount() }}
                    </span>
                  </div>
                </div>

                <!-- Filters -->
                <div class="p-4 border-t border-gray-200">
                  <h3 class="text-sm font-medium text-gray-700 mb-3">ตัวกรอง</h3>
                  <!-- Search -->
                  <div class="relative mb-3">
                    <input
                      v-model="searchTerm"
                      type="text"
                      placeholder="ค้นหาผู้สมัคร..."
                      class="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-[#6ED7D1]"
                    />
                    <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                  </div>
                </div>
              </div>

              <!-- Right Content - Positions & Participants -->
              <div class="flex-1 overflow-auto bg-gray-50">
                <div class="p-4 md:p-6">
                  <div v-for="position in job.JobPositions" :key="position.id" class="mb-8">
                    <!-- Position Header -->
                    <div class="flex items-center justify-between mb-4">
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
                          <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span>จำนวนที่รับ: {{ position.required_people }} คน</span>
                            <span>•</span>
                            <span>สมัครแล้ว: {{ filteredParticipants(position).length }} คน</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Participants Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      <div
                        v-for="participant in filteredParticipants(position)"
                        :key="participant.id"
                        class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div class="p-4">
                          <!-- User Info -->
                          <div class="flex items-center space-x-3 mb-4">
                            <img
                              :src="getProfileImage(participant.user.profile_image)"
                              class="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                              alt="Profile"
                            />
                            <div>
                              <h4 class="font-medium text-gray-900">
                                {{ participant.user?.first_name }}
                                {{ participant.user?.last_name }}
                              </h4>
                              <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-phone text-[#6ED7D1] mr-2"></i>
                                {{ participant.user?.phone_number }}
                              </p>
                            </div>
                          </div>

                          <!-- Status Badge -->
                          <div class="mb-4">
                            <span
                              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              :class="getStatusClass(participant.status)"
                            >
                              <i class="fas fa-circle text-[0.5rem] mr-1.5"></i>
                              {{ getStatusText(participant.status) }}
                            </span>
                          </div>

                          <!-- Rating Display -->
                          <div v-if="participant.workHistories?.length" class="mb-4">
                            <div class="flex items-center gap-1">
                              <template v-for="n in 5" :key="n">
                                <i
                                  class="fas fa-star text-sm"
                                  :class="[
                                    n <= participant.workHistories[0].rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  ]"
                                ></i>
                              </template>
                              <span class="ml-2 text-sm text-gray-600">
                                {{ participant.workHistories[0].rating }}/5
                              </span>
                            </div>
                            <p class="mt-2 text-sm text-gray-600 line-clamp-2">
                              {{ participant.workHistories[0].comment }}
                            </p>
                          </div>

                          <!-- Action Buttons -->
                          <div class="flex gap-2">
                            <button
                              v-if="participant.status === 'pending'"
                              @click="handleApprove(participant.id)"
                              class="flex-1 px-4 py-2 bg-[#6ED7D1] hover:bg-[#5DA3A3] text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <i class="fas fa-check mr-2"></i>
                              อนุมัติ
                            </button>
                            <button
                              v-if="participant.status === 'pending'"
                              @click="handleReject(participant.id)"
                              class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <i class="fas fa-times mr-2"></i>
                              ปฏิเสธ
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Empty State -->
                      <div
                        v-if="filteredParticipants(position).length === 0"
                        class="col-span-full text-center py-8 bg-white rounded-xl border border-dashed border-gray-300"
                      >
                        <i class="fas fa-users text-4xl text-[#EABF71] mb-3"></i>
                        <p class="text-gray-500">ไม่พบผู้สมัคร ถ้ามีผู้สมัครจะแสดงที่นี่</p>
                      </div>
                    </div>
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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Swal from 'sweetalert2'
import { useJobStore } from '@/stores/jobStore'

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
      currentFilter: 'pending',
      loading: false,
      searchTerm: '',
      statusFilter: null,
      ratingFilter: null
    }
  },
  setup() {
    const jobStore = useJobStore()
    return { jobStore }
  },
  computed: {
    isFilterActive() {
      return this.statusFilter !== null
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
      return this.jobStore.getProfileImage(image)
    },
    toggleFilter(status) {
      this.statusFilter = this.statusFilter === status ? null : status
      this.ratingFilter = null
    },
    toggleRatingFilter(rating) {
      this.ratingFilter = this.ratingFilter === rating ? null : rating
      this.statusFilter = null
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

.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: #c5c5c5 #f1f1f1;
}

.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive Transitions */
@media (max-width: 1024px) {
  .lg\:flex-row {
    transition: all 0.3s ease-in-out;
  }
}
</style>
