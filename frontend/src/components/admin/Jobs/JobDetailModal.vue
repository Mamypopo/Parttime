<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

    <!-- ปรับขนาด Modal ให้เล็กลง -->
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl">
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] rounded-t-2xl"
        >
          <h3 class="text-lg font-semibold text-white">
            <i class="fas fa-clipboard-list mr-2"></i>
            รายละเอียดงาน #{{ job.id }} / {{ job.title }}
          </h3>
          <button @click="closeModal" class="text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="space-y-4">
            <!-- ข้อมูลพื้นฐาน -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-3 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 flex items-center">
                  <i class="fas fa-briefcase mr-2 text-purple-500"></i>ชื่องาน
                </h4>
                <p class="mt-1">{{ job.title }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 flex items-center">
                  <i class="fas fa-map-marker-alt mr-2 text-purple-500"></i>สถานที่
                </h4>
                <p class="mt-1">{{ job.location }}</p>
              </div>
            </div>

            <!-- วันและเวลา -->
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-gray-50 p-3 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 flex items-center">
                  <i class="fas fa-calendar mr-2 text-purple-500"></i>วันที่
                </h4>
                <p class="mt-1">{{ formatDate(job.work_date) }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 flex items-center">
                  <i class="fas fa-clock mr-2 text-purple-500"></i>เริ่ม
                </h4>
                <p class="mt-1">{{ formatTime(job.start_time) }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl">
                <h4 class="text-sm font-medium text-gray-700 flex items-center">
                  <i class="fas fa-clock mr-2 text-purple-500"></i>สิ้นสุด
                </h4>
                <p class="mt-1">{{ formatTime(job.end_time) }}</p>
              </div>
            </div>

            <!-- ตำแหน่งงาน -->
            <div class="bg-gray-50 p-3 rounded-xl">
              <h4 class="text-sm font-medium text-gray-700 flex items-center mb-2">
                <i class="fas fa-users mr-2 text-purple-500"></i>ตำแหน่งงาน
              </h4>
              <div class="space-y-2">
                <div
                  v-for="position in job.JobPositions"
                  :key="position.id"
                  class="bg-white p-3 rounded-xl border border-gray-100"
                >
                  <!-- หัวข้อตำแหน่ง -->
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-purple-600">{{ position.position_name }}</span>
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="getStatusClass(position.status)"
                    >
                      {{ getStatusText(position.status) }}
                    </span>
                  </div>

                  <!-- รายละเอียดตำแหน่ง -->
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="flex items-center text-gray-600">
                      <i class="fas fa-coins mr-2"></i>
                      <span>{{ position.wage }} บาท</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                      <i class="fas fa-user-friends mr-2"></i>
                      <span>ต้องการ {{ position.required_people }} คน</span>
                    </div>
                  </div>

                  <!-- รายละเอียดตำแหน่ง -->
                  <div v-if="position.details" class="mt-2 pt-2 border-t">
                    <div class="text-sm text-gray-600">
                      <div class="flex items-start space-x-2">
                        <i class="fas fa-info-circle mt-1 text-purple-500"></i>
                        <div class="flex-1">
                          <h5 class="font-medium text-gray-700 mb-1">รายละเอียดตำแหน่ง:</h5>
                          <p class="whitespace-pre-line">{{ position.details }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- คุณสมบัติที่ต้องการ -->
                  <div v-if="position.requirements" class="mt-2 pt-2 border-t">
                    <h5 class="text-sm font-medium text-gray-700 mb-1">คุณสมบัติ:</h5>
                    <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li v-for="(req, index) in position.requirements.split('\n')" :key="index">
                        {{ req }}
                      </li>
                    </ul>
                  </div>

                  <!-- จำนวนผู้สมัคร -->
                  <div
                    v-if="position.applicants_count"
                    class="mt-2 pt-2 border-t text-sm text-gray-600"
                  >
                    <div class="flex items-center">
                      <i class="fas fa-users mr-2"></i>
                      <span>ผู้สมัคร: {{ position.applicants_count }} คน</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- รายละเอียดเพิ่มเติม -->
            <div v-if="job.details" class="bg-gray-50 p-3 rounded-xl">
              <h4 class="text-sm font-medium text-gray-700 flex items-center mb-2">
                <i class="fas fa-info-circle mr-2 text-purple-500"></i>รายละเอียดเพิ่มเติม
              </h4>
              <p class="text-sm text-gray-600 whitespace-pre-line">{{ job.details }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end p-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:opacity-90"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobDetailModal',
  props: {
    isOpen: Boolean,
    job: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    getStatusClass(status) {
      switch (status?.toUpperCase()) {
        case 'OPEN':
          return 'bg-green-100 text-green-800'
        case 'CLOSED':
          return 'bg-red-100 text-red-800'
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    },

    getStatusText(status) {
      switch (status?.toUpperCase()) {
        case 'OPEN':
          return 'เปิดรับสมัคร'
        case 'CLOSED':
          return 'ปิดรับสมัคร'
        case 'PENDING':
          return 'รอดำเนินการ'
        default:
          return status || 'ไม่ระบุสถานะ'
      }
    },
    closeModal() {
      this.$emit('close')
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatDateTime(datetime) {
      if (!datetime) return '-'
      return new Date(datetime).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getStatusClass(status) {
      switch (status) {
        case 'OPEN':
          return 'bg-green-100 text-green-800'
        case 'CLOSED':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }
}
</script>
