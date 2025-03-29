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
              type="text"
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

            <div class="relative group">
              <button
                @click="handleClear"
                class="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400/50 active:scale-95 shadow-sm"
              >
                <i class="fas fa-undo"></i>
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
