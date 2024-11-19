<template>
  <div class="p-4 border-b dark:border-gray-700">
    <!-- ปุ่มแว่นขยายสำหรับหน้าจอเล็ก -->
    <button
      class="lg:hidden mb-4 p-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 text-white rounded-lg flex items-center"
      @click="toggleSearch"
    >
      <i class="fas fa-search mr-1"></i> ค้นหา
    </button>

    <!-- คอมโพเนนต์ค้นหาหลัก -->
    <transition name="fade" mode="out-in">
      <div v-if="isSearchVisible" class="grid grid-cols-12 gap-4">
        <!-- User ID Search -->
        <div v-if="showUserId" class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"
            >
              <i class="fas fa-id-badge text-sm"></i>
            </span>
            <input
              v-model="localFilters.userId"
              type="text"
              placeholder="ค้นหาด้วย User ID"
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              @keydown.enter="handleSearch"
            />
          </div>
        </div>

        <!-- Name Search -->
        <div v-if="showName" class="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4">
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"
            >
              <i class="fas fa-search text-sm"></i>
            </span>
            <input
              v-model="localFilters.name"
              type="text"
              placeholder="ค้นหาด้วยชื่อ-นามสกุล"
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              @keydown.enter="handleSearch"
            />
          </div>
        </div>

        <!-- ID Card Search -->
        <div v-if="showIdCard" class="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"
            >
              <i class="fa-regular fa-address-card text-sm"></i>
            </span>
            <input
              v-model="localFilters.idCard"
              type="text"
              placeholder="ค้นหาด้วยเลขบัตรประชาชน"
              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
              @keydown.enter="handleSearch"
            />
          </div>
        </div>

        <!-- Search Buttons -->
        <div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 flex items-end gap-2">
          <button
            @click="handleSearch"
            class="flex-1 py-1.5 px-4 text-sm bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center"
          >
            <i class="fas fa-magnifying-glass mr-1.5"></i>ค้นหา
          </button>
          <button
            @click="handleClear"
            class="flex-1 py-1.5 px-4 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center"
          >
            <i class="fas fa-xmark mr-1.5"></i>ล้าง
          </button>
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
      isSearchVisible: true, // ค่าเริ่มต้นให้แสดงในจอปกติ
      localFilters: {
        userId: '',
        name: '',
        idCard: ''
      }
    }
  },

  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true,
      immediate: true
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
      this.$emit('search', this.localFilters)
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
/* เพิ่ม transition แบบ fade */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
