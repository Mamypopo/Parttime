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

          <!-- การเรียงลำดับ -->
          <div class="relative">
            <select
              v-model="localFilters.sortBy"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 appearance-none cursor-pointer outline-none"
              @change="debouncedSearch"
            >
              <option value="">เรียงลำดับตามค่าเริ่มต้น</option>
              <option value="rating_desc">คะแนนสูงสุด → ต่ำสุด</option>
              <option value="rating_asc">คะแนนต่ำสุด → สูงสุด</option>
              <option value="jobs_desc">จำนวนงานมากสุด → น้อยสุด</option>
              <option value="jobs_asc">จำนวนงานน้อยสุด → มากสุด</option>
            </select>
            <i class="fas fa-sort absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>
            <i
              class="fas fa-chevron-down absolute right-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none"
            ></i>
          </div>

          <!-- ทักษะ  -->
          <div class="relative">
            <div
              @click="toggleSkillDropdown"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 cursor-pointer flex justify-between items-center"
            >
              <span>{{
                localFilters.skills.length > 0
                  ? `ทักษะ (${localFilters.skills.length})`
                  : 'เลือกทักษะ'
              }}</span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <i class="fas fa-tools absolute left-3.5 top-3 text-gray-400 dark:text-gray-500"></i>

            <!-- Dropdown Menu -->
            <div
              v-if="showSkillDropdown"
              class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div class="p-2 border-b border-gray-100 dark:border-gray-700 flex justify-between">
                <button
                  @click="selectAllSkills"
                  class="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  @click="clearSkills"
                  class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  ล้างการเลือก
                </button>
              </div>
              <div class="p-2">
                <div
                  v-for="skill in availableSkills"
                  :key="skill"
                  class="flex items-center px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  @click="toggleSkill(skill)"
                >
                  <input
                    type="checkbox"
                    :checked="localFilters.skills.includes(skill)"
                    class="mr-2"
                    @click.stop="toggleSkill(skill)"
                  />
                  <span>{{ skill }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ปุ่มค้นหาและล้าง -->
          <div class="flex items-center gap-2 lg:col-start-4 lg:justify-end">
            <button
              @click="handleSearch"
              class="flex-1 lg:flex-none lg:w-auto px-6 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
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

        <!-- แสดงทักษะที่เลือก -->
        <div
          v-if="localFilters.skills.length > 0"
          class="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-100 dark:border-gray-700 rounded-lg"
        >
          <div
            v-for="skill in localFilters.skills"
            :key="skill"
            class="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1 rounded-full flex items-center"
          >
            <span>{{ skill }}</span>
            <button @click="removeSkill(skill)" class="ml-1 text-xs">
              <i class="fas fa-times"></i>
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
        idCard: '',
        skills: [],
        sortBy: ''
      })
    }
  },

  data() {
    return {
      isSearchVisible: true,
      localFilters: {
        userId: '',
        name: '',
        idCard: '',
        skills: [],
        sortBy: ''
      },
      searchTimeout: null,
      showSkillDropdown: false,
      availableSkills: [
        'เอกซเรย์',
        'พยาบาล',
        'น้ำหนัก ส่วนสูง',
        'ทะเบียน',
        'การได้ยิน',
        'เจาะเลือด',
        'เป่าปอด',
        'ตาอาชีวะ',
        'ตาทั่วไป',
        'มวลกระดูก',
        'เก็บปัสสาวะ',
        'คลื่นไฟฟ้าหัวใจ',
        'กล้ามเนื้อ',
        'มะเร็งปากมดลูก',
        'อัลตร้าซาวด์',
        'ผู้ช่วยแพทย์',
        'วัดความดัน',
        'ยานพาหนะ',
        'หมอ',
        'ล่าม',
        'รอบเอว',
        'นม-ขนม'
      ]
    }
  },

  mounted() {
    this.isSearchVisible = window.innerWidth >= 1024
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleClickOutside)

    // ตั้งค่าเริ่มต้นจาก props
    this.localFilters = { ...this.filters }
    if (!this.localFilters.skills) {
      this.localFilters.skills = []
    }
  },

  beforeUnmount() {
    clearTimeout(this.searchTimeout)
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleClickOutside)
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
      this.$emit('search', { ...this.localFilters })
    },

    handleClear() {
      this.localFilters = {
        userId: '',
        name: '',
        idCard: '',
        skills: [],
        sortBy: ''
      }
      this.$emit('clear')
    },

    toggleSkillDropdown(event) {
      event.stopPropagation()
      this.showSkillDropdown = !this.showSkillDropdown
    },

    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.relative')
      if (dropdown && !dropdown.contains(event.target)) {
        this.showSkillDropdown = false
      }
    },

    toggleSkill(skill) {
      if (this.localFilters.skills.includes(skill)) {
        this.localFilters.skills = this.localFilters.skills.filter((s) => s !== skill)
      } else {
        this.localFilters.skills.push(skill)
      }
      this.debouncedSearch()
    },

    selectAllSkills() {
      this.localFilters.skills = [...this.availableSkills]
      this.debouncedSearch()
    },

    clearSkills() {
      this.localFilters.skills = []
      this.debouncedSearch()
    },

    removeSkill(skill) {
      this.localFilters.skills = this.localFilters.skills.filter((s) => s !== skill)
      this.debouncedSearch()
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  border-radius: 20px;
}
</style>
