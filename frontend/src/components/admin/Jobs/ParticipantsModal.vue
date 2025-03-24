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
            <div
              class="bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 p-4 md:p-6 rounded-t-2xl"
            >
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
                  class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors duration-200"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <!-- Left Sidebar - Stats & Filters -->
              <div
                class="w-full lg:w-[300px] border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <!-- Stats Cards -->
                <div class="grid grid-cols-2 lg:grid-cols-1 gap-3 p-4">
                  <!-- Pending Filter -->
                  <div
                    @click="toggleFilter('pending')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-200 dark:ring-yellow-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                      <i class="fas fa-clock"></i>
                      <span>รอดำเนินการ</span>
                    </div>
                    <span
                      class="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full text-sm"
                    >
                      {{ getStatusCount('pending') }}
                    </span>
                  </div>

                  <!-- Approved Filter -->
                  <div
                    @click="toggleFilter('approved')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-800'
                        : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-green-800 dark:text-green-300">
                      <i class="fas fa-check"></i>
                      <span>อนุมัติแล้ว</span>
                    </div>
                    <span
                      class="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-sm"
                    >
                      {{ getStatusCount('approved') }}
                    </span>
                  </div>
                  <!-- Rejected Filter -->
                  <div
                    @click="toggleFilter('rejected')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-200 dark:ring-red-800'
                        : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-red-800 dark:text-red-300">
                      <i class="fas fa-times"></i>
                      <span>ไม่ผ่านการอนุมัติ</span>
                    </div>
                    <span
                      class="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full text-sm"
                    >
                      {{ getStatusCount('rejected') }}
                    </span>
                  </div>

                  <!-- Rated Filter -->
                  <div
                    @click="toggleRatingFilter('rated')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      ratingFilter === 'rated'
                        ? 'bg-[#E7F6F6] dark:bg-[#4B9592]/30 ring-2 ring-[#6ED7D1] dark:ring-[#4B9592]'
                        : 'bg-[#F5FAFA] dark:bg-[#4B9592]/20 hover:bg-[#E7F6F6] dark:hover:bg-[#4B9592]/30'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-[#5DA3A3] dark:text-[#6ED7D1]">
                      <i class="fas fa-star"></i>
                      <span>ประเมินแล้ว</span>
                    </div>
                    <span
                      class="bg-[#6ED7D1]/30 dark:bg-[#4B9592]/50 text-[#5DA3A3] dark:text-[#6ED7D1] px-2 py-0.5 rounded-full text-sm"
                    >
                      {{ getRatedCount() }}
                    </span>
                  </div>

                  <!-- cancelled Filter -->
                  <div
                    @click="toggleFilter('cancelled')"
                    class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      statusFilter === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-200 dark:ring-red-800'
                        : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    ]"
                  >
                    <div class="flex items-center gap-2 text-red-800 dark:text-red-300">
                      <i class="fa-solid fa-ban"></i>
                      <span>ยกเลิก</span>
                    </div>
                    <span
                      class="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full text-sm"
                    >
                      {{ getStatusCount('cancelled') }}
                    </span>
                  </div>
                </div>

                <!-- Filters -->
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">ตัวกรอง</h3>
                  <!-- Search -->
                  <div class="relative mb-3">
                    <input
                      v-model="searchTerm"
                      type="text"
                      placeholder="ค้นหาผู้สมัครด้วย ชื่อ หรือ อีเมล..."
                      class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm border-0 focus:ring-2 focus:ring-[#6ED7D1] dark:focus:ring-[#4B9592] focus:outline-none"
                    />
                    <i
                      class="fas fa-search absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
                    ></i>
                  </div>
                </div>
              </div>

              <!-- Right Content - Positions & Participants -->
              <div class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div class="p-4 md:p-6">
                  <div v-for="position in job.JobPositions" :key="position.id" class="mb-8">
                    <!-- Position Header -->
                    <div
                      class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4"
                    >
                      <!-- Position Title with Icon -->
                      <div class="flex items-center gap-2 mb-2 lg:mb-0">
                        <i class="fas fa-user-md text-[#5DA3A3] dark:text-[#4B9592] text-xl"></i>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {{ position.position_name }}
                        </h3>
                      </div>

                      <!-- Position Details -->
                      <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2 lg:gap-4 text-sm"
                      >
                        <!-- จำนวนที่รับ -->
                        <div class="flex items-center gap-1">
                          <i class="fas fa-users text-blue-500 dark:text-blue-300"></i>
                          <span>จำนวนที่รับ:</span>
                          <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ position.required_people }} คน
                          </span>
                        </div>

                        <!-- สมัครแล้ว -->
                        <div class="flex items-center gap-1">
                          <i class="fas fa-list text-indigo-500 dark:text-indigo-300"></i>
                          <span>สมัครแล้ว:</span>
                          <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ position.JobParticipation.length }} คน
                          </span>
                        </div>

                        <!-- รอดำเนินการ -->
                        <div class="flex items-center gap-1">
                          <i class="fas fa-clock text-yellow-500 dark:text-yellow-300"></i>
                          <span>รอดำเนินการ:</span>
                          <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ getStatusCountForPosition(position, 'pending') }} คน
                          </span>
                        </div>

                        <!-- อนุมัติแล้ว -->
                        <div class="flex items-center gap-1">
                          <i class="fas fa-check text-green-500 dark:text-green-300"></i>
                          <span>อนุมัติแล้ว:</span>
                          <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ getStatusCountForPosition(position, 'approved') }} คน
                          </span>
                        </div>

                        <!-- ไม่ผ่านการอนุมัติ -->
                        <div class="flex items-center gap-1">
                          <i class="fa-solid fa-xmark text-red-700 dark:text-red-400"></i>
                          <span>ไม่ผ่านการอนุมัติ:</span>
                          <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ getStatusCountForPosition(position, 'rejected') }} คน
                          </span>
                        </div>

                        <!-- ยกเลิก -->
                        <div class="flex items-center gap-1">
                          <i class="fas fa-ban text-red-500 dark:text-red-300"></i>
                          <span>ยกเลิก:</span>
                          <span class="font-medium text-gray-900 dark:text-gray-100">
                            {{ getStatusCountForPosition(position, 'cancelled') }} คน
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Participants Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      <div
                        v-for="participant in filteredParticipants(position)"
                        :key="participant.id"
                        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div class="p-4">
                          <!-- User Info  -->
                          <div class="flex items-center space-x-3 mb-4">
                            <div
                              class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 text-white flex items-center justify-center text-lg font-semibold"
                            >
                              <img
                                v-if="
                                  participant.user.profile_image &&
                                  participant.user.profile_image.trim() !== ''
                                "
                                :src="getProfileImage(participant.user.profile_image)"
                                class="w-full h-full object-cover"
                                alt="Profile"
                              />
                              <span v-else>
                                {{ participant.user.first_name?.charAt(0).toUpperCase() || '?' }}
                              </span>
                            </div>
                            <div class="flex-1">
                              <!-- ชื่อและเบอร์โทร -->
                              <h4 class="font-medium text-gray-900 dark:text-gray-100">
                                {{ participant.user?.first_name }} {{ participant.user?.last_name }}
                              </h4>
                              <p class="text-sm text-gray-600 dark:text-gray-400">
                                เบอร์โทร: {{ participant.user?.phone_number }}
                              </p>

                              <!-- กล่องปุ่มที่จัดเรียงด้วย Flexbox -->
                              <div class="flex items-center space-x-4 mt-2">
                                <!-- ปุ่มดูประวัติการทำงาน -->
                                <button
                                  @click="handleOpenHistory(participant.user)"
                                  class="text-sm text-[#6ED7D1] hover:text-[#4B9592] dark:text-[#4B9592] hover:underline"
                                >
                                  <i class="fas fa-history mr-1"></i>
                                  ดูประวัติการทำงาน
                                </button>

                                <!-- ปุ่มยกเลิกคำขอ -->
                                <button
                                  v-if="
                                    ['pending', 'approved'].includes(
                                      participant.status?.toLowerCase()
                                    )
                                  "
                                  @click="handleCancelRequest(participant.id)"
                                  class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 hover:underline"
                                >
                                  <i class="fas fa-ban mr-1"></i>
                                  ยกเลิกคำขอ
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Rating Display -->
                          <div v-if="participant.workHistories?.length" class="mb-2">
                            <!-- วันที่ประเมิน -->
                            <div class="mb-3 text-sm text-gray-600 dark:text-gray-400">
                              <i class="fas fa-calendar-alt mr-1.5"></i>
                              วันที่ประเมิน:
                              {{
                                new Date(
                                  participant.workHistories[0].created_at
                                ).toLocaleDateString()
                              }}
                            </div>

                            <!-- ส่วนแสดงสถานะ -->
                            <div class="mb-3">
                              <span
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-4"
                                :class="getStatusClass(participant.status)"
                              >
                                <i class="fas fa-circle text-[0.5rem] mr-1.5"></i>
                                {{ getStatusText(participant.status) }}
                              </span>
                              <span
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                :class="
                                  participant.workHistories[0].is_passed_evaluation
                                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                                    : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                                "
                              >
                                <i class="fa-solid fa-star text-[0.5rem] mr-1.5"></i>
                                {{
                                  participant.workHistories[0].is_passed_evaluation
                                    ? 'ผ่านการประเมิน'
                                    : 'ไม่ผ่านการประเมิน'
                                }}
                              </span>
                            </div>

                            <!-- ส่วนแสดงคะแนน -->
                            <div class="grid grid-cols-2 gap-2 mb-2">
                              <div
                                v-for="(score, index) in scoreItems"
                                :key="index"
                                class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"
                              >
                                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  <i :class="score.icon" class="mr-1"></i>
                                  {{ score.title }}
                                </div>
                                <div
                                  class="text-sm font-bold"
                                  :class="getScoreClass(participant.workHistories[0][score.field])"
                                >
                                  {{ participant.workHistories[0][score.field] || 0 }}/2
                                </div>
                              </div>
                            </div>

                            <!-- คะแนนรวม -->
                            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div class="flex justify-between items-center">
                                <div>
                                  <span class="text-gray-600 dark:text-gray-300 text-sm font-medium"
                                    >คะแนนรวม</span
                                  >
                                </div>
                                <div class="flex items-baseline">
                                  <span
                                    class="text-xl font-bold mr-1"
                                    :class="getTotalScoreClass(participant.workHistories[0])"
                                  >
                                    {{ getTotalScore(participant.workHistories[0]) }}
                                  </span>
                                  <span class="text-sm text-gray-500 dark:text-gray-400">/ 10</span>
                                </div>
                              </div>
                              <!-- แสดงความคิดเห็นทั้งกรณีผ่านและไม่ผ่าน -->
                              <div
                                v-if="participant.workHistories[0].comment"
                                class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                              >
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                  <i class="fas fa-comment-alt mr-2"></i>
                                  {{ participant.workHistories[0].comment }}
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Action Buttons -->
                          <div class="flex gap-2">
                            <button
                              v-if="participant.status === 'pending'"
                              @click="handleApprove(participant.id)"
                              class="flex-1 px-4 py-2 bg-[#6ED7D1] dark:bg-[#4B9592] hover:bg-[#5DA3A3] dark:hover:bg-[#3D7A78] text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <i class="fas fa-check mr-2"></i>
                              อนุมัติ
                            </button>
                            <button
                              v-if="participant.status === 'pending'"
                              @click="handleReject(participant.id)"
                              class="flex-1 px-4 py-2 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <i class="fas fa-times mr-2"></i>
                              ปฏิเสธ
                            </button>
                            <!-- ปุ่มอนุมัติซ้ำ -->
                            <button
                              v-if="participant.status === 'rejected'"
                              @click="handleApprove(participant.id)"
                              class="flex-1 px-4 py-2 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <i class="fas fa-redo mr-2"></i>
                              อนุมัติซ้ำ
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Empty State -->
                      <div
                        v-if="filteredParticipants(position).length === 0"
                        class="col-span-full text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
                      >
                        <i
                          class="fas fa-users text-4xl text-[#EABF71] dark:text-[#B38B4A] mb-3"
                        ></i>
                        <p class="text-gray-500 dark:text-gray-400">
                          ไม่พบผู้สมัคร ถ้ามีผู้สมัครจะแสดงที่นี่
                        </p>
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

  <div>
    <JobHistoryModal
      v-if="showHistoryModal"
      :show="showHistoryModal"
      :user="selectedUser"
      @close="closeHistoryModal"
    />
  </div>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Swal from 'sweetalert2'
import JobHistoryModal from '@/components/Users/JobHistoryModal.vue'
import { useUserHistoryStore } from '@/stores/userHistoryStore'

import { useJobStore } from '@/stores/jobStore'

export default {
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    JobHistoryModal
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
  emits: ['close', 'update', 'update:job', 'approve', 'reject'],
  data() {
    return {
      currentFilter: 'pending',
      loading: false,
      searchTerm: '',
      statusFilter: null,
      ratingFilter: null,
      showHistoryModal: false,
      position: null,
      selectedUser: null,
      userJobs: [],
      userHistoryStore: useUserHistoryStore(),
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
  setup() {
    const jobStore = useJobStore()
    return { jobStore }
  },
  computed: {
    isFilterActive() {
      return this.statusFilter !== null
    }
  },
  async mounted() {
    if (this.participant?.user?.id) {
      await this.loadUserHistory(this.participant.user.id)
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

    getStatusCountForPosition(position, status) {
      return position.JobParticipation.filter((p) => p.status === status).length
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
                  p.id === participationId ? { ...p, status: 'approved' } : p
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
          pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
          approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          cancelled:
            'text-rose-600 dark:text-rose-400 border-rose-400 bg-rose-50 dark:bg-rose-900/20',
          in_progress: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
        }[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
      )
    },

    getStatusText(status) {
      return (
        {
          pending: 'รอดำเนินการ',
          approved: 'อนุมัติแล้ว',
          rejected: 'ไม่ผ่านการอนุมัติ',
          completed: 'เสร็จสิ้น',
          cancelled: 'ยกเลิก',
          in_progress: 'กำลังดำเนินการ'
        }[status] || 'ไม่ระบุสถานะ'
      )
    },

    getTotalScore(workHistory) {
      return workHistory?.total_score || 0
    },

    getScoreClass(score) {
      score = Number(score) || 0
      if (score === 2) return 'text-green-500 dark:text-green-400'
      if (score === 1) return 'text-blue-600 dark:text-blue-400'
      return 'text-red-600 dark:text-red-400'
    },

    getTotalScoreClass(workHistory) {
      const total = this.getTotalScore(workHistory)
      if (total >= 8) return 'text-green-600 dark:text-green-400' // ดีมาก
      if (total >= 6) return 'text-yellow-600 dark:text-yellow-400' // ปานกลาง
      if (total >= 4) return 'text-orange-600 dark:text-orange-400' // ค่อนข้างต่ำ
      return 'text-red-500 dark:text-red-400' // ต่ำ
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
    },

    async handleOpenHistory(user) {
      if (!user?.id) return

      this.selectedUser = user
      try {
        await this.userHistoryStore.fetchUserHistory(user.id)

        // ตรวจสอบว่ามีประวัติการทำงานหรือไม่
        if (!this.userHistoryStore.history?.length) {
          Swal.fire({
            title: 'ไม่พบประวัติการทำงาน',
            text: 'ผู้ใช้งานนี้ยังไม่มีประวัติการทำงาน',
            icon: 'info',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#6366f1'
          })
          return
        }

        this.showHistoryModal = true
      } catch (error) {
        if (error.response?.status === 404) {
          Swal.fire({
            title: 'ไม่พบประวัติการทำงาน',
            text: 'ผู้ใช้งานนี้ยังไม่มีประวัติการทำงาน',
            icon: 'info',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#6366f1'
          })
          return
        }

        // กรณี error อื่นๆ
        console.error('Error fetching user history:', error)
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลประวัติการทำงานได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    closeHistoryModal() {
      this.showHistoryModal = false
      this.selectedUser = null
      this.userHistoryStore.clearHistory()
    },

    async handleCancelRequest(participationId) {
      try {
        const position = this.job.JobPositions.find((pos) =>
          pos.JobParticipation.some((p) => p.id === participationId)
        )
        const participant = position?.JobParticipation.find((p) => p.id === participationId)

        if (!position || !participant) {
          await Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ข้อมูลตำแหน่งหรือผู้ใช้ไม่ถูกต้อง'
          })
          return
        }

        // ยืนยันก่อนยกเลิก
        const confirm = await Swal.fire({
          title: `ยืนยันการยกเลิกสำหรับ ${participant.user.first_name} ${participant.user.last_name}`,
          text: 'คุณต้องการยกเลิกคำขอนี้ใช่หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6e7881',
          input: 'text',
          inputPlaceholder: 'พิมพ์ "ยืนยัน" เพื่อยืนยันการยกเลิก',
          inputValidator: (value) => {
            return value !== 'ยืนยัน' && 'กรุณาพิมพ์ "ยืนยัน" เพื่อยืนยันการยกเลิก'
          }
        })

        if (confirm.isConfirmed) {
          const result = await this.jobStore.adminCancelJobParticipation({
            jobId: this.job.id,
            jobPositionId: position.id,
            userId: participant.user.id
          })

          if (result.success) {
            await this.jobStore.fetchJobsAndParticipants()
            this.$emit('update:job', {
              ...this.job,
              JobPositions: this.job.JobPositions.map((pos) => ({
                ...pos,
                JobParticipation: pos.JobParticipation.map((p) =>
                  p.id === participationId ? { ...p, status: 'cancelled' } : p
                )
              }))
            })
            this.$emit('close')
            await Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: 'คำขอถูกยกเลิกแล้ว',
              timer: 1500,
              showConfirmButton: false
            })
          } else {
            throw new Error(result.message || 'ไม่สามารถยกเลิกคำขอได้')
          }
        }
      } catch (error) {
        console.error('Error:', error)
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message
        })
      }
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

/* Responsive Transitions */
@media (max-width: 1024px) {
  .lg\:flex-row {
    transition: all 0.3s ease-in-out;
  }
}

/* Light mode scrollbar */
.modal-scroll::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-scroll::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 4px;
}

.modal-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (prefers-color-scheme: dark) {
  .modal-scroll::-webkit-scrollbar,
  .overflow-auto::-webkit-scrollbar {
    display: none;
  }
}
</style>
