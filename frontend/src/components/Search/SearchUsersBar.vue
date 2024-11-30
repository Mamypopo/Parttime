<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <!-- ปุ่มแสดง/ซ่อนสำหรับมือถือ -->
    <button
      class="lg:hidden w-full p-4 text-left bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg flex items-center"
      @click="toggleSearch"
    >
      <i class="fas fa-search mr-2"></i>
      {{ isSearchVisible ? 'ซ่อนการค้นหา' : 'แสดงการค้นหา' }}
    </button>

    <!-- คอมโพเนนต์ค้นหาหลัก -->
    <transition name="fade" mode="out-in">
      <div v-if="isSearchVisible" class="p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- User ID -->
          <div v-if="showUserId" class="relative">
            <input
              v-model="localFilters.userId"
              type="number"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="User ID"
              @input="debouncedSearch"
            />
            <i class="fas fa-id-badge absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>
          </div>

          <!-- ชื่อ-นามสกุล -->
          <div v-if="showName" class="relative">
            <input
              v-model="localFilters.name"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="ชื่อ-นามสกุล"
              @input="debouncedSearch"
            />
            <i class="fas fa-user absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>
          </div>

          <!-- เลขบัตรประชาชน -->
          <div v-if="showIdCard" class="relative">
            <input
              v-model="localFilters.idCard"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="เลขบัตรประชาชน"
              @input="debouncedSearch"
            />
            <i
              class="fa-regular fa-address-card absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"
            ></i>
          </div>

          <!-- ปุ่มค้นหาและล้าง -->
          <div class="flex items-center gap-2">
            <button
              @click="handleSearch"
              class="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              <i class="fas fa-search mr-2"></i>
              ค้นหา
            </button>
            <button
              @click="handleClear"
              class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    showUserId: {
      type: Boolean,
      default: true
    },
    showName: {
      type: Boolean,
      default: true
    },
    showIdCard: {
      type: Boolean,
      default: true
    },
    filters: {
      type: Object,
      default: () => ({
        userId: '',
        name: '',
        idCard: ''
      })
    }
  },

  data() {
    return {
      isSearchVisible: true,
      localFilters: {
        userId: '',
        name: '',
        idCard: ''
      },
      searchTimeout: null
    }
  },

  mounted() {
    this.isSearchVisible = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    clearTimeout(this.searchTimeout)
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.handleSearch()
      }, 200)
    },
    toggleSearch() {
      this.isSearchVisible = !this.isSearchVisible
    },
    handleResize() {
      this.isSearchVisible = window.innerWidth >= 1024
    },
    handleSearch() {
      // กรองเฉพาะค่าที่มีข้อมูล
      const validFilters = Object.entries(this.localFilters)
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

      this.$emit('search', validFilters)
    },
    handleClear() {
      this.localFilters = {
        userId: '',
        name: '',
        idCard: ''
      }
      this.$emit('clear')
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
