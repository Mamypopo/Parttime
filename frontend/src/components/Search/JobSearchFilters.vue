<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
    <!-- แถวบน: ค้นหา + สถานที่ -->
    <div class="flex flex-wrap gap-4 mb-4">
      <!-- ค้นหา -->
      <div class="relative flex-1 min-w-[200px]">
        <input
          v-model="filters.title"
          type="text"
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-0 rounded-lg"
          placeholder="ค้นหางาน..."
          @keydown.enter="handleSearch"
        />
        <i class="fas fa-search absolute left-3.5 top-3 text-gray-400"></i>
      </div>

      <!-- สถานที่ -->
      <div class="relative flex-1 min-w-[200px]">
        <input
          v-model="filters.location"
          type="text"
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-0 rounded-lg"
          placeholder="สถานที่..."
        />
        <i class="fas fa-location-dot absolute left-3.5 top-3 text-gray-400"></i>
      </div>
    </div>

    <!-- แถวล่าง: ตัวกรองทั้งหมด -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- ตำแหน่ง -->
      <div class="relative min-w-[150px]">
        <button
          @click="showPositionList = !showPositionList"
          class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-left"
        >
          {{ selectedPosition || 'ตำแหน่ง' }}
          <i class="fas fa-chevron-down absolute right-3 top-3 text-gray-400"></i>
        </button>
        <!-- Dropdown -->
        <div
          v-if="showPositionList"
          class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <div class="p-1 max-h-[240px] overflow-y-auto">
            <button
              v-for="pos in positionOptions"
              :key="pos.value"
              @click="selectPosition(pos)"
              class="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
            >
              {{ pos.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- ค่าจ้าง -->
      <div class="relative min-w-[120px]">
        <input
          v-model.number="filters.minWage"
          type="number"
          class="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border-0 rounded-lg"
          placeholder="ค่าจ้าง"
        />
        <i class="fas fa-baht-sign absolute left-3 top-3 text-gray-400"></i>
      </div>

      <!-- วันที่ -->
      <input
        v-model="filters.workDate"
        type="date"
        class="min-w-[120px] px-4 py-2 bg-gray-50 dark:bg-gray-900 border-0 rounded-lg"
      />

      <!-- ตรงกับทักษะ -->
      <button
        @click="toggleMatchSkills"
        :class="[
          'px-4 py-2 rounded-lg',
          filters.matchSkills
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'bg-gray-50 dark:bg-gray-900'
        ]"
      >
        <i class="fas fa-user-check mr-2"></i>
        ตรงกับทักษะ
      </button>

      <!-- ค้นหา -->
      <button
        @click="handleSearch"
        class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg ml-auto"
      >
        ค้นหา
      </button>

      <!-- ล้าง -->
      <button @click="handleClear" class="p-2 text-gray-400 hover:text-gray-600">
        <i class="fas fa-undo"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { useJobStore } from '@/stores/jobStore'

export default {
  name: 'JobSearchFilters',
  data() {
    return {
      filters: {
        title: '',
        location: '',
        position: '',
        minWage: null,
        maxWage: null,
        workDate: '',
        status: '',
        matchSkills: false
      },
      showPositionList: false,
      selectedPosition: '',
      positionOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'เอกซเรย์', label: 'เอกซเรย์' },
        { value: 'พยาบาล', label: 'พยาบาล' },
        { value: 'น้ำหนัก ส่วนสูง', label: 'น้ำหนัก ส่วนสูง' },
        { value: 'ทะเบียน', label: 'ทะเบียน' },
        { value: 'การได้ยิน', label: 'การได้ยิน' },
        { value: 'เจาะเลือด', label: 'เจาะเลือด' },
        { value: 'เป่าปอด', label: 'เป่าปอด' },
        { value: 'ตาอาชีวะ', label: 'ตาอาชีวะ' },
        { value: 'ตาทั่วไป', label: 'ตาทั่วไป' },
        { value: 'มวลกระดูก', label: 'มวลกระดูก' },
        { value: 'เก็บปัสสาวะ', label: 'เก็บปัสสาวะ' },
        { value: 'คลื่นไฟฟ้าหัวใจ', label: 'คลื่นไฟฟ้าหัวใจ' },
        { value: 'กล้ามเนื้อ', label: 'กล้ามเนื้อ' },
        { value: 'มะเร็งปากมดลูก', label: 'มะเร็งปากมดลูก' },
        { value: 'อัลตร้าซาวด์', label: 'อัลตร้าซาวด์' },
        { value: 'ผู้ช่วยแพทย์', label: 'ผู้ช่วยแพทย์' },
        { value: 'วัดความดัน', label: 'วัดความดัน' }
        // เพิ่มตำแหน่งอื่นๆ ตามที่มีในระบบ
      ],
      showStatusList: false,
      selectedStatus: '',
      statusOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'published', label: 'เปิดรับสมัคร' },
        { value: 'in_progress', label: 'กำลังดำเนินการ' },
        { value: 'completed', label: 'เสร็จสิ้น' }
      ]
    }
  },
  methods: {
    async handleSearch() {
      const jobStore = useJobStore()
      const queryParams = Object.entries(this.filters)
        .filter(([, value]) => {
          if (value === null || value === undefined) return false
          if (typeof value === 'string' && value.trim() === '') return false
          if (typeof value === 'number' && isNaN(value)) return false
          return true
        })
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})

      try {
        jobStore.setUserSearchFilters(queryParams) // เปลี่ยนเป็น setUserSearchFilters
        await jobStore.searchJobs()
      } catch (error) {
        console.error('Error searching jobs:', error)
      }
    },

    handleClear() {
      const jobStore = useJobStore()
      this.filters = {
        title: '',
        location: '',
        position: '',
        minWage: null,
        maxWage: null,
        workDate: '',
        status: ''
      }
      this.selectedPosition = ''
      this.selectedStatus = ''
      jobStore.clearUserSearchFilters()
      jobStore.searchJobs()
    },
    toggleMatchSkills() {
      this.filters.matchSkills = !this.filters.matchSkills
      this.handleSearch()
    },
    handlePositionBlur() {
      setTimeout(() => {
        this.showPositionList = false
      }, 200)
    },
    selectPosition(position) {
      this.selectedPosition = position.label
      this.filters.position = position.value
      this.showPositionList = false
      this.handleSearch()
    },
    handleStatusBlur() {
      setTimeout(() => {
        this.showStatusList = false
      }, 200)
    },
    selectStatus(status) {
      this.selectedStatus = status.label
      this.filters.status = status.value
      this.showStatusList = false
      this.handleSearch()
    }
  }
}
</script>
