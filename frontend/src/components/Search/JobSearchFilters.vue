<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <!-- ปุ่มแสดง/ซ่อนสำหรับมือถือ -->
    <button
      class="lg:hidden w-full p-4 text-left bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] hover:from-[#feac5e]/90 hover:via-[#c779d0]/90 hover:to-[#4bc0c8]/90 dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80 text-white rounded-lg flex items-center transform hover:scale-[1.02] transition-all duration-200"
      @click="toggleFilters"
    >
      <i class="fas fa-filter mr-2"></i>
      {{ isFiltersVisible ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง' }}
    </button>

    <!-- คอมโพเนนต์ตัวกรองหลัก -->
    <transition name="fade" mode="out-in">
      <div v-if="isFiltersVisible" class="p-4 space-y-4">
        <!-- แถวบน: ค้นหา + สถานที่ -->
        <div class="flex flex-wrap gap-4">
          <!-- ค้นหา -->
          <div class="relative flex-1 min-w-[200px]">
            <input
              v-model="filters.title"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="ค้นหางาน..."
              @input="debouncedSearch"
            />
            <i class="fas fa-search absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>
          </div>

          <!-- สถานที่ -->
          <div class="relative flex-1 min-w-[200px]">
            <input
              v-model="filters.location"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="สถานที่..."
              @input="debouncedSearch"
            />
            <i
              class="fas fa-location-dot absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"
            ></i>
          </div>
        </div>

        <!-- แถวล่าง: ตัวกรองทั้งหมด -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- ตำแหน่ง -->
          <div class="relative min-w-[150px]">
            <button
              @click="showPositionList = !showPositionList"
              @blur="handlePositionBlur"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:border-[#c779d0] dark:hover:border-[#c779d0]/50 transition-colors duration-200"
            >
              <span>{{ selectedPosition || 'ตำแหน่ง' }}</span>
              <i class="fas fa-chevron-down text-gray-400 dark:text-gray-500"></i>
            </button>
            <!-- Dropdown -->
            <div
              v-if="showPositionList"
              class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-[#c779d0]/20 dark:border-[#c779d0]/30"
            >
              <div class="p-1 max-h-[240px] overflow-y-auto">
                <button
                  v-for="pos in positionOptions"
                  :key="pos.value"
                  @click="selectPosition(pos)"
                  class="w-full px-3 py-2 text-left hover:bg-gradient-to-r hover:from-[#feac5e]/5 hover:via-[#c779d0]/5 hover:to-[#4bc0c8]/5 dark:hover:from-[#feac5e]/10 dark:hover:via-[#c779d0]/10 dark:hover:to-[#4bc0c8]/10 rounded"
                >
                  {{ pos.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- ค่าจ้าง -->
          <div class="flex items-center gap-2">
            <!-- Min Wage -->
            <div class="relative min-w-[120px]">
              <input
                v-model.number="filters.minWage"
                type="number"
                class="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="ค่าจ้างต่ำสุด"
                @input="debouncedSearch"
              />
              <i
                class="fas fa-baht-sign absolute left-3 top-3 text-gray-400 dark:text-gray-500"
              ></i>
            </div>

            <span class="text-gray-400">-</span>

            <!-- Max Wage -->
            <div class="relative min-w-[120px]">
              <input
                v-model.number="filters.maxWage"
                type="number"
                class="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="ค่าจ้างสูงสุด"
                @input="debouncedSearch"
              />
              <i
                class="fas fa-baht-sign absolute left-3 top-3 text-gray-400 dark:text-gray-500"
              ></i>
            </div>
          </div>

          <!-- วันที่ -->
          <input
            v-model="filters.workDate"
            type="date"
            class="min-w-[120px] px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
          />

          <!-- ตรงกับทักษะ -->
          <button
            @click="toggleMatchSkills"
            :class="[
              'px-4 py-2.5 rounded-lg border transition-all duration-300 transform hover:scale-105',
              filters.matchSkills
                ? 'bg-gradient-to-r from-[#feac5e]/10 via-[#c779d0]/10 to-[#4bc0c8]/10 dark:from-[#feac5e]/20 dark:via-[#c779d0]/20 dark:to-[#4bc0c8]/20 border-[#c779d0] dark:border-[#c779d0]/50 text-[#c779d0] dark:text-[#c779d0]/90'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#c779d0] dark:hover:border-[#c779d0]/50'
            ]"
          >
            <i class="fas fa-user-check mr-2"></i>
            ตรงกับทักษะ
          </button>

          <!-- ค้นหา -->
          <button
            @click="handleSearch"
            class="px-6 py-2.5 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] dark:from-[#feac5e]/80 dark:via-[#c779d0]/80 dark:to-[#4bc0c8]/80 text-white rounded-lg ml-auto hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <i class="fas fa-search mr-2"></i>
            ค้นหา
          </button>

          <!-- ล้าง -->
          <button
            @click="handleClear"
            class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
          >
            <i class="fas fa-undo"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { useJobStore } from '@/stores/jobStore'

export default {
  name: 'JobSearchFilters',

  data() {
    return {
      isFiltersVisible: true,
      searchTimeout: null,
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
      ]
    }
  },

  mounted() {
    this.isFiltersVisible = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    clearTimeout(this.searchTimeout)
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    toggleFilters() {
      this.isFiltersVisible = !this.isFiltersVisible
    },

    handleResize() {
      this.isFiltersVisible = window.innerWidth >= 1024
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.handleSearch()
      }, 200)
    },
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
        jobStore.setUserSearchFilters(queryParams)
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
        status: '',
        matchSkills: false
      }
      this.selectedPosition = ''
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
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Hover effects */
input:hover,
button:hover {
  transition: all 0.2s ease;
}

/* Dropdown animation */
[v-if] {
  transition: all 0.2s ease-in-out;
}

/* Loading state */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Custom scrollbar for dropdowns */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c779d0 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c779d0;
  background-image: linear-gradient(to bottom, #feac5e, #c779d0, #4bc0c8);
  border-radius: 3px;
}

/* Dark mode scrollbar */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-image: linear-gradient(to bottom, #feac5e80, #c779d080, #4bc0c880);
}

/* Input focus styles */
input:focus,
button:focus {
  outline: none;
  border-color: #c779d0;
  box-shadow: 0 0 0 1px #c779d0;
}

.dark input:focus,
.dark button:focus {
  border-color: #c779d080;
  box-shadow: 0 0 0 1px #c779d080;
}

/* Hover animations */
button:not(:disabled):hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

button:not(:disabled):active {
  transform: translateY(0);
}
</style>
