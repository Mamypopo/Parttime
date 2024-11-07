<template>
  <div class="p-4 border-b">
    <!-- ปุ่มแว่นขยายสำหรับหน้าจอเล็ก -->
    <button
      class="lg:hidden mb-4 p-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg flex items-center"
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
              class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
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
              class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
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
              class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
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
              class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
              placeholder="ตำแหน่ง"
            />
            <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <i class="fas fa-chevron-down text-sm"></i>
            </span>

            <!-- Position List Dropdown -->
            <div
              v-if="showPositionList"
              class="absolute z-10 w-full mt-1 bg-gray-100 rounded-lg shadow-lg border border-purple-100"
            >
              <div class="p-2 space-y-1">
                <button
                  v-for="position in positionOptions"
                  :key="position.value"
                  type="button"
                  class="block w-full text-left px-3 py-2 hover:bg-[#C5B4E3] hover:bg-opacity-40 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
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
              class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
              placeholder="สถานะ"
            />
            <!-- Status List Dropdown -->
            <div
              v-if="showStatusList"
              class="absolute z-10 w-full mt-1 bg-gray-100 rounded-lg shadow-lg border border-purple-100"
            >
              <div class="p-2 space-y-1">
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  type="button"
                  class="block w-full text-left px-3 py-2 hover:bg-[#C5B4E3] hover:bg-opacity-40 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400">
                  <i class="fas fa-baht-sign text-sm"></i>
                </span>
                <input
                  v-model.number="filters.minWage"
                  type="number"
                  class="w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="ค่าจ้างต่ำสุด"
                  @keydown.enter="handleSearch"
                />
              </div>
              <span class="text-gray-500 self-center">-</span>
              <div class="relative flex-1">
                <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400">
                  <i class="fas fa-baht-sign text-sm"></i>
                </span>
                <input
                  v-model.number="filters.maxWage"
                  type="number"
                  class="w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="สูงสุด"
                  @keydown.enter="handleSearch"
                />
              </div>
            </div>
          </div>

          <!-- วันที่ -->
          <div class="lg:col-span-5">
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="relative flex-1">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fas fa-calendar-day text-sm"></i>
                </span>
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  @keydown.enter="handleSearch"
                />
              </div>
              <span class="hidden sm:block text-gray-500 self-center">-</span>
              <div class="relative flex-1">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fas fa-calendar-day text-sm"></i>
                </span>
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  @keydown.enter="handleSearch"
                />
              </div>
            </div>
          </div>

          <!-- ปุ่มค้นหาและล้างข้อมูล -->
          <div class="lg:col-span-2 flex gap-2 self-end">
            <button
              @click="handleSearch"
              class="flex-1 py-1.5 text-sm bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:opacity-90 flex items-center justify-center"
            >
              <i class="fas fa-magnifying-glass mr-1"></i>ค้นหา
            </button>
            <button
              @click="handleClear"
              class="flex-1 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
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
        maxWage: null
      },
      showStatusList: false,
      selectedStatus: '',
      statusOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'completed', label: 'เสร็จสิ้น' },
        { value: 'in_progress', label: 'กำลังดำเนินการ' }
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
      const queryParams = Object.entries(this.filters)
        .filter(([, value]) => value !== '' && value !== null)

        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})

      this.$emit('search', queryParams)
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
        maxWage: null
      }
      this.selectStatus({ value: '' })
      this.$emit('clear')
      this.selectPosition({ value: '', label: 'ทั้งหมด' })
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
/* เพิ่ม transition แบบ fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
