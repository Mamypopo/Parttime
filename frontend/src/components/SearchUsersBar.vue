<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
    <!-- User ID Search -->
    <div v-if="showUserId" class="relative">
      <input 
        v-model="localFilters.userId"
        type="text" 
        placeholder="ค้นหาด้วย User ID"
        class="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200"
      >
      <span class="absolute left-2 top-2.5">
        <i class="text-[#64748B] fa-solid fa-id-badge"></i>
      </span>
    </div>

    <!-- Name Search -->
    <div v-if="showName" class="relative">
      <input 
        v-model="localFilters.name"
        type="text" 
        placeholder="ค้นหาด้วยชื่อ-นามสกุล"
        class="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200"
      >
      <span class="absolute left-2 top-2.5">
        <i class="text-[#64748B] fa-solid fa-user"></i>
      </span>
    </div>

    <!-- ID Card Search -->
    <div v-if="showIdCard" class="relative">
      <input 
        v-model="localFilters.idCard"
        type="text" 
        placeholder="ค้นหาด้วยเลขบัตรประชาชน"
        class="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200"
      >
      <span class="absolute left-2 top-2.5">
        <i class="text-[#64748B] fa-solid fa-address-card"></i>
      </span>
    </div>

    <!-- Search Buttons -->
    <div class="flex gap-2">
      <button @click="handleSearch" 
              class="flex-1 md:flex-none bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 text-sm">
        <i class="fas fa-search mr-2"></i>ค้นหา
      </button>
      <button @click="handleClear" 
              class="flex-1 md:flex-none bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 text-sm">
        <i class="fas fa-undo mr-2"></i>ล้าง
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    // กำหนดว่าจะแสดงช่องค้นหาอะไรบ้าง
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
    // รับค่า filters จาก parent
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
      localFilters: {
        userId: '',
        name: '',
        idCard: ''
      }
    }
  },

  watch: {
    // sync filters from parent
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
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