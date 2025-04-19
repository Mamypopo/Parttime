<template>
  <div class="mini-calendar">
    <!-- Header with Month/Year Selection -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <!-- Year Selector -->
        <select
          v-model="selectedYear"
          class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-purple-400 dark:hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
          @change="handleYearChange"
        >
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year + 543 }}
          </option>
        </select>

        <!-- Month Selector (Dropdown) -->
        <select
          v-model="selectedMonth"
          class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-purple-400 dark:hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
          @change="handleMonthChange"
        >
          <option v-for="(month, index) in monthOptions" :key="index" :value="index">
            {{ month }}
          </option>
        </select>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-[400px]">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-purple-400"
        ></div>
      </div>

      <div v-else>
        <!-- Week Days Header -->
        <div
          class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
        >
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            <span
              class="bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
            >
              {{ day }}
            </span>
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7">
          <div
            v-for="date in calendarDates"
            :key="date.date"
            class="relative min-h-[50px] md:aspect-square p-1 md:p-2 border-b border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            <!-- Day Number -->
            <span
              class="inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-xs md:text-sm rounded-full"
              :class="{
                'text-gray-400 dark:text-gray-600': !date.isCurrentMonth,
                'text-gray-900 dark:text-gray-100': date.isCurrentMonth && !isToday(date),
                'bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold shadow-sm':
                  isToday(date)
              }"
            >
              {{ date.dayOfMonth }}
            </span>

            <!-- จุดแสดงสถานะ -->
            <div
              class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full absolute top-0.5 right-0.5 md:top-1 md:right-1"
              :class="getStatusDot(date.date)"
              v-if="hasEvents(date)"
            ></div>

            <div v-if="hasEvents(date)" class="mt-1 space-y-0.5">
              <!-- แสดงงานแรก -->
              <div
                class="text-[10px] p-1 rounded-md cursor-pointer transition-all duration-300"
                :class="getEventClasses(getEvents(date)[0])"
                @click.stop="showEventDetails(getEvents(date)[0])"
              >
                <div class="font-medium truncate">{{ getEvents(date)[0].title }}</div>
              </div>

              <!-- ถ้ามีงานมากกว่า 1 ชิ้น -->
              <div
                v-if="getEvents(date).length > 1"
                class="text-[9px] text-center py-0.5 px-1 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                @click.stop="showAllEvents(date)"
              >
                +{{ getEvents(date).length - 1 }} งาน
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Job Detail Modal -->
    <JobDetailModal :is-open="!!selectedEvent" :job="selectedEvent" @close="selectedEvent = null" />

    <JobListModal
      :is-open="showJobList"
      :title="jobListTitle"
      :events="jobListEvents"
      @close="closeJobList"
      @select-job="showEventDetails"
    />
  </div>
</template>

<script>
import { useDashboardStore } from '@/stores/dashboardStore'
import JobDetailModal from '@/components/admin/Jobs/JobDetailModal.vue'
import JobListModal from '@/components/admin/Jobs/JobListModal.vue'

import { debounce } from 'lodash'

export default {
  name: 'MiniCalendar',
  components: {
    JobDetailModal,
    JobListModal
  },

  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedEvent: null,
      showMultipleJobs: false,
      weekDays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
      store: useDashboardStore(),
      showJobList: false,
      jobListTitle: '',
      jobListEvents: [],
      monthOptions: [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม'
      ]
    }
  },

  async created() {
    await this.loadDashboardData()
  },

  computed: {
    currentMonthText() {
      return this.currentDate.toLocaleString('th-TH', {
        month: 'long',
        year: 'numeric'
      })
    },

    calendarDates() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const dates = []

      // วันจากเดือนก่อนหน้า
      for (let i = 0; i < firstDay.getDay(); i++) {
        const date = new Date(year, month, -i)
        dates.unshift({
          date: date,
          dayOfMonth: date.getDate(),
          isCurrentMonth: false
        })
      }

      // วันในเดือนปัจจุบัน
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        dates.push({
          date: date,
          dayOfMonth: i,
          isCurrentMonth: true
        })
      }

      // วันจากเดือนถัดไป
      const remainingDays = 42 - dates.length
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i)
        dates.push({
          date: date,
          dayOfMonth: date.getDate(),
          isCurrentMonth: false
        })
      }

      return dates
    },

    loading() {
      return this.store.loading
    },

    calendarEvents() {
      return this.store.calendarEvents
    },

    yearOptions() {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
    },

    selectedYear: {
      get() {
        return this.currentDate.getFullYear()
      },
      set(value) {
        this.currentDate = new Date(value, this.currentDate.getMonth(), 1)
      }
    },

    selectedMonth: {
      get() {
        return this.currentDate.getMonth()
      },
      set(value) {
        this.currentDate = new Date(this.currentDate.getFullYear(), value, 1)
      }
    }
  },

  methods: {
    isToday(date) {
      const today = new Date()
      return date.date.toDateString() === today.toDateString()
    },

    async handleYearChange() {
      await this.debouncedLoadData()
    },

    async handleMonthChange() {
      await this.debouncedLoadData()
    },

    async loadDashboardData() {
      await this.store.fetchDashboardData(
        this.currentDate.getMonth(),
        this.currentDate.getFullYear()
      )
    },

    debouncedLoadData: debounce(async function () {
      await this.loadDashboardData()
    }, 300),

    async previousMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      )
      await this.debouncedLoadData()
    },

    async nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      )
      await this.debouncedLoadData()
    },

    handleDateClick(date) {
      this.selectedDate = date.date
      this.$emit('date-click', date.date)
    },

    isSelectedDate(date) {
      if (!this.selectedDate) return false
      return date.date.toDateString() === this.selectedDate.toDateString()
    },

    hasEvents(date) {
      return this.getEvents(date).length > 0
    },

    getEvents(date) {
      return this.calendarEvents.filter(
        (event) => new Date(event.work_date).toDateString() === date.date.toDateString()
      )
    },
    showEventDetails(event) {
      this.selectedEvent = this.store.formatEventDetails(event)
    },
    getEventClasses(event) {
      const status = this.store.getJobStatus(event.work_date)
      return this.store.getEventClasses(status)
    },

    getStatusDot(date) {
      return this.store.getStatusDot(date)
    },

    showAllEvents(date) {
      const events = this.getEvents(date)
      const formattedDate = date.date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      this.jobListTitle = `งานทั้งหมดวันที่ ${formattedDate}`
      this.jobListEvents = events
      this.showJobList = true
    },

    closeJobList() {
      this.showJobList = false
      this.jobListEvents = []
    }
  }
}
</script>

<style scoped>
.mini-calendar {
  @apply transition-all duration-300;
}

.calendar-event-enter-active,
.calendar-event-leave-active {
  transition: all 0.3s ease;
}

.calendar-event-enter-from,
.calendar-event-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
