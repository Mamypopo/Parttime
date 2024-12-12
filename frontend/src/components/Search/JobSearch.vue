<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <!-- ปุ่มแสดง/ซ่อนสำหรับมือถือ -->
    <button
      class="lg:hidden w-full p-4 text-left bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] hover:from-[#B4A3D2] hover:to-[#D9B5EB] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg flex items-center transform hover:scale-[1.02] transition-all duration-200"
      @click="toggleSearch"
    >
      <i class="fas fa-search mr-2"></i>
      {{ isSearchVisible ? 'ซ่อนการค้นหา' : 'แสดงการค้นหา' }}
    </button>

    <!-- คอมโพเนนต์ค้นหาหลัก -->
    <transition name="fade" mode="out-in">
      <div v-if="isSearchVisible" class="p-4 space-y-4">
        <!-- แถวที่ 1: ID, ชื่องาน, สถานที่, ตำแหน่ง -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- ID -->
          <div class="relative">
            <input
              v-model="filters.id"
              type="number"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="ID"
              @input="debouncedSearch"
            />
            <i class="fas fa-id-badge absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>
          </div>

          <!-- ชื่องาน -->
          <div class="relative">
            <input
              v-model="filters.title"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="ชื่องาน"
              @input="debouncedSearch"
            />
            <i class="fas fa-search absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>
          </div>

          <!-- สถานที่ -->
          <div class="relative">
            <input
              v-model="filters.location"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="สถานที่"
              @input="debouncedSearch"
            />
            <i
              class="fas fa-location-dot absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"
            ></i>
          </div>

          <!-- ตำแหน่ง -->
          <div class="relative">
            <button
              @click="showPositionList = !showPositionList"
              @blur="handlePositionBlur"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-gray-900 dark:text-gray-100 flex justify-between items-center"
            >
              <span>{{ selectedPosition || 'ตำแหน่ง' }}</span>
              <i class="fas fa-chevron-down text-gray-400 dark:text-gray-500"></i>
            </button>
            <!-- Dropdown -->
            <div
              v-if="showPositionList"
              class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="p-1 max-h-[240px] overflow-y-auto">
                <button
                  v-for="pos in positionOptions"
                  :key="pos.value"
                  @click="selectPosition(pos)"
                  class="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
                >
                  {{ pos.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- แถวที่ 2: สถานะ, ค่าจ้าง, วันที่, ปุ่มค้นหา -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- สถานะ -->
          <div class="relative min-w-[150px]">
            <button
              @click="showStatusList = !showStatusList"
              @blur="handleStatusBlur"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-gray-900 dark:text-gray-100 flex justify-between items-center"
            >
              <span>{{ selectedStatus || 'สถานะ' }}</span>
              <i class="fas fa-chevron-down text-gray-400 dark:text-gray-500"></i>
            </button>
            <!-- Dropdown -->
            <div
              v-if="showStatusList"
              class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="p-1">
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  @click="selectStatus(status)"
                  class="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
                >
                  {{ status.label }}
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

          <!-- ค้นหา -->
          <button
            @click="handleSearch"
            class="px-6 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg ml-auto hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <i class="fas fa-search mr-2"></i>
            ค้นหา
          </button>
          <div class="relative group">
            <!-- ล้าง -->
            <button
              @click="handleClear"
              class="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400/50 active:scale-95 shadow-sm"
              title="ล้างการค้นหา"
            >
              <i class="fas fa-undo text-lg"></i>
            </button>
            <!-- Tooltip -->
            <div
              class="absolute -bottom-8 left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap"
            >
              ล้างการค้นหา
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isSearchVisible: true, // ค่าเริ่มต้นให้แสดงในจอปกติ
      searchTimeout: null,
      filters: {
        id: '',
        title: '',
        location: '',
        position: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        minWage: null,
        maxWage: null,
        peopleCount: ''
      },
      showPeopleCountList: false,
      selectedPeopleCount: '',
      peopleCountOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'less_than_5', label: 'น้อยกว่า 5 คน' },
        { value: '5_to_10', label: '5-10 คน' },
        { value: 'more_than_10', label: 'มากกว่า 10 คน' }
      ],
      showStatusList: false,
      selectedStatus: '',
      statusOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'published', label: 'เปิดรับสมัคร' },
        { value: 'in_progress', label: 'กำลังดำเนินการ' },
        { value: 'completed', label: 'เสร็จสิ้น' }
      ],
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
      ]
    }
  },

  mounted() {
    this.isSearchVisible = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)

    clearTimeout(this.searchTimeout)
    window.removeEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    toggleSearch() {
      this.isSearchVisible = !this.isSearchVisible
    },
    handleResize() {
      this.isSearchVisible = window.innerWidth >= 1024
    },

    handleSearch() {
      // กรองเฉพาะค่าที่มีข้อมูล
      const queryParams = Object.entries(this.filters)
        .filter(([key, value]) => {
          if (value === null || value === undefined) return false
          if (typeof value === 'string' && value.trim() === '') return false
          if (typeof value === 'number' && isNaN(value)) return false
          return true
        })
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})
      this.$emit('search', queryParams)
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.handleSearch()
      }, 200)
    },
    handlePeopleCountBlur() {
      setTimeout(() => {
        this.showPeopleCountList = false
      }, 200)
    },

    selectPeopleCount(option) {
      this.selectedPeopleCount = option.label
      this.filters.peopleCount = option.value
      this.showPeopleCountList = false
      this.handleSearch()
    },

    handleClear() {
      this.filters = {
        id: '',
        title: '',
        location: '',
        position: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        minWage: null,
        maxWage: null,
        peopleCount: ''
      }
      this.selectedPeopleCount = ''
      this.selectedStatus = ''
      this.selectedPosition = ''
      this.$emit('clear')
      this.handleSearch()
    },
    handleStatusBlur() {
      setTimeout(() => {
        this.showStatusList = false
      }, 200)
    },
    selectStatus(status) {
      this.selectedStatus = status.label
      // ส่งค่า value เป็นภาษาอังกฤษไปให้ backend
      this.filters.status = status.value
      this.showStatusList = false
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
/* Dropdown animation */
[v-if] {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for dropdowns */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #6b46c1;
}
</style>
