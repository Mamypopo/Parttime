<template>
  <div class="p-4 border-b dark:border-gray-700">
    <!-- ปุ่มแว่นขยายสำหรับหน้าจอเล็ก -->
    <button
      class="lg:hidden mb-4 p-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg flex items-center"
      @click="toggleSearch"
    >
      <i class="fas fa-search mr-1"></i> ค้นหา
    </button>

    <!-- คอมโพเนนต์ค้นหาหลัก -->
    <transition name="fade" mode="out-in">
      <div v-if="isSearchVisible" class="space-y-3">
        <!-- แถวที่ 1: ID, ชื่องาน, สถานที่, ตำแหน่ง -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-id-badge text-sm"></i>
            </span>
            <input
              v-model="filters.id"
              type="text"
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              placeholder="ID"
              @keydown.enter="handleSearch"
            />
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-search text-sm"></i>
            </span>
            <input
              v-model="filters.title"
              type="text"
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              placeholder="ชื่องาน"
              @keydown.enter="handleSearch"
            />
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-location-dot text-sm"></i>
            </span>
            <input
              v-model="filters.location"
              type="text"
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              placeholder="สถานที่"
              @keydown.enter="handleSearch"
            />
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-users text-sm"></i>
            </span>
            <input
              type="text"
              v-model="selectedPosition"
              @click="showPositionList = true"
              @blur="handlePositionBlur"
              readonly
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              placeholder="ตำแหน่ง"
            />
            <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <i class="fas fa-chevron-down text-sm"></i>
            </span>

            <!-- Position List Dropdown -->
            <div
              v-if="showPositionList"
              class="absolute z-[9999] w-full mt-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg border border-purple-100 dark:border-gray-700"
            >
              <div class="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                <button
                  v-for="position in positionOptions"
                  :key="position.value"
                  type="button"
                  class="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-[#C5B4E3] hover:bg-opacity-40 dark:hover:bg-purple-600 dark:hover:bg-opacity-20 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                  @click="selectPosition(position)"
                >
                  {{ position.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- แถวที่ 2: สถานะ, ค่าจ้าง, วันที่, ปุ่มค้นหา -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
          <!-- สถานะ -->
          <div class="lg:col-span-2 relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-filter text-sm"></i>
            </span>
            <input
              type="text"
              v-model="selectedStatus"
              @click="showStatusList = true"
              @blur="handleStatusBlur"
              readonly
              class="block w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 cursor-pointer"
              placeholder="สถานะ"
            />
            <!-- Status List Dropdown -->
            <div
              v-if="showStatusList"
              class="absolute z-10 w-full mt-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg border border-purple-100 dark:border-gray-700"
            >
              <div class="p-2 space-y-1">
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  type="button"
                  class="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-[#C5B4E3] hover:bg-opacity-40 dark:hover:bg-purple-600 dark:hover:bg-opacity-20 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                  @click="selectStatus(status)"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- ค่าจ้าง -->
          <div class="lg:col-span-3">
            <div class="flex gap-1">
              <div class="relative flex-1">
                <span
                  class="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 dark:text-gray-500"
                >
                  <i class="fas fa-baht-sign text-sm"></i>
                </span>
                <input
                  v-model.number="filters.minWage"
                  type="number"
                  class="w-full pl-7 pr-2 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                  placeholder="ค่าจ้างต่ำสุด"
                  @keydown.enter="handleSearch"
                />
              </div>
              <span class="text-gray-500 dark:text-gray-40 self-center">-</span>
              <div class="relative flex-1">
                <span
                  class="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 dark:text-gray-500"
                >
                  <i class="fas fa-baht-sign text-sm"></i>
                </span>
                <input
                  v-model.number="filters.maxWage"
                  type="number"
                  class="w-full pl-7 pr-2 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                  placeholder="สูงสุด"
                  @keydown.enter="handleSearch"
                />
              </div>
            </div>
          </div>

          <!-- จำนวนคน -->
          <div class="lg:col-span-3">
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"
              >
                <i class="fas fa-users text-sm"></i>
              </span>
              <input
                type="text"
                v-model="selectedPeopleCount"
                @click="showPeopleCountList = true"
                @blur="handlePeopleCountBlur"
                readonly
                class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 cursor-pointer"
                placeholder="จำนวนคน"
              />

              <!-- People Count Dropdown -->
              <div
                v-if="showPeopleCountList"
                class="absolute z-10 w-full mt-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg border border-purple-100 dark:border-gray-700"
              >
                <div class="p-2 space-y-1">
                  <button
                    v-for="option in peopleCountOptions"
                    :key="option.value"
                    type="button"
                    class="block w-full text-left px-3 py-2 hover:bg-[#C5B4E3] hover:bg-opacity-40 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                    @click="selectPeopleCount(option)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- วันที่ -->
          <div class="lg:col-span-5">
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="relative flex-1">
                <span
                  class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"
                >
                  <i class="fas fa-calendar-day text-sm"></i>
                </span>
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                  @keydown.enter="handleSearch"
                />
              </div>
              <span class="hidden sm:block text-gray-500 dark:text-gray-400 self-center">-</span>
              <div class="relative flex-1">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fas fa-calendar-day text-sm"></i>
                </span>
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                  @keydown.enter="handleSearch"
                />
              </div>
            </div>
          </div>

          <!-- ปุ่มค้นหาและล้างข้อมูล -->
          <div class="lg:col-span-2 flex gap-2 self-end">
            <button
              @click="handleSearch"
              class="flex-1 py-1.5 text-sm bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg hover:opacity-90 flex items-center justify-center"
            >
              <i class="fas fa-magnifying-glass mr-1"></i>ค้นหา
            </button>
            <button
              @click="handleClear"
              class="flex-1 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center"
            >
              <i class="fas fa-xmark mr-1"></i>ล้าง
            </button>
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
        { value: 'X-ray', label: 'X-ray' },
        { value: 'Nurse', label: 'Nurse' },
        { value: 'Medic', label: 'Medic' },
        { value: 'Register', label: 'Register' },
        { value: 'Blood test', label: 'Blood test' },
        { value: 'Blowing lungs', label: 'Blowing lungs' },
        { value: 'Ear exam', label: 'Ear exam' }
        // เพิ่มตำแหน่งอื่นๆ ตามที่มีในระบบ
      ]
    }
  },

  watch: {
    filters: {
      deep: true,
      handler() {
        this.handleSearch()
      }
    }
  },
  mounted() {
    this.isSearchVisible = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
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

/* เพิ่ม hover effects */
input:hover,
button:hover {
  transition: all 0.2s ease;
}
/* ปรับแต่ง dropdown animation */
[v-if] {
  transition: all 0.2s ease-in-out;
}
/* เพิ่ม loading indicator styles ถ้าต้องการ */
.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>
