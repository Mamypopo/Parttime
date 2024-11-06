<template>
  <div class="p-4 border-b">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-4">
      <!-- ค้นหาตามชื่องาน -->
      <div class="col-span-12 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1"> ชื่องาน </label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <i class="fas fa-search text-sm"></i>
          </span>
          <input
            v-model="filters.title"
            type="text"
            class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="ค้นหาตามชื่องาน"
          />
        </div>
      </div>

      <!-- ค้นหาตามสถานที่ -->
      <div class="col-span-12 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1"> สถานที่ </label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <i class="fas fa-location-dot text-sm"></i>
          </span>
          <input
            v-model="filters.location"
            type="text"
            class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="ค้นหาตามสถานที่"
          />
        </div>
      </div>

      <!-- ค้นหาตามตำแหน่งงาน -->
      <div class="col-span-12 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1"> ตำแหน่ง </label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <i class="fas fa-users text-sm"></i>
          </span>
          <input
            v-model="filters.position"
            type="text"
            class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="ระบุตำแหน่ง"
          />
        </div>
      </div>

      <!-- สถานะ -->
      <div class="col-span-12 lg:col-span-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
        <div class="relative">
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
            placeholder="เลือกสถานะ"
          />
          <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            <i class="fas fa-chevron-down text-sm"></i>
          </span>

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
      </div>

      <!-- ช่วงค่าจ้าง -->
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1"> ค่าจ้าง (บาท) </label>
        <div class="flex gap-1">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400">
              <i class="fas fa-baht-sign text-sm"></i>
            </span>
            <input
              v-model.number="filters.minWage"
              type="number"
              class="w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="ต่ำสุด"
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
            />
          </div>
        </div>
      </div>

      <!-- ช่วงวันที่ และ ปุ่มค้นหา, ล้างข้อมูล -->
      <div class="col-span-12 lg:col-span-8">
        <label class="block text-sm font-medium text-gray-700 mb-1"> ช่วงวันที่ </label>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-calendar-day text-sm"></i>
            </span>
            <input
              v-model="filters.dateFrom"
              type="date"
              class="pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <span class="text-gray-500">ถึง</span>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i class="fas fa-calendar-day text-sm"></i>
            </span>
            <input
              v-model="filters.dateTo"
              type="date"
              class="pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <!-- ปุ่มค้นหาและล้างข้อมูล จะอยู่ข้างช่องวันที่บนจอใหญ่ และอยู่ด้านล่างในจอเล็ก -->
          <div class="flex gap-2 ml-auto mt-2 lg:mt-0">
            <button
              @click="handleSearch"
              class="px-4 py-1.5 text-sm bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:opacity-90 flex items-center justify-center"
            >
              <i class="fas fa-magnifying-glass mr-1"></i>ค้นหา
            </button>
            <button
              @click="handleClear"
              class="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              <i class="fas fa-xmark mr-1"></i>ล้างข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filters: {
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
      ]
    }
  },
  methods: {
    handleSearch() {
      // สร้าง query params จาก filters ที่มีค่า
      const queryParams = Object.entries(this.filters)
        .filter(([, value]) => value !== '' && value !== null)
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})

      // ส่ง event พร้อม filters ไปยัง parent component
      this.$emit('search', queryParams)
    },
    handleClear() {
      // รีเซ็ตค่า filters
      this.filters = {
        title: '',
        location: '',
        position: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        minWage: null,
        maxWage: null
      }
      // ส่ง event clear
      this.$emit('clear')
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
    }
  }
}
</script>
