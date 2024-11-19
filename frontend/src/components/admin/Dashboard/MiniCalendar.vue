<template>
  <div class="mini-calendar">
    <!-- ส่วนหัวปฏิทิน -->
    <div class="flex justify-between items-center mb-4">
      <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-full">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="font-medium">{{ currentMonthText }}</span>
      <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- ตารางปฏิทิน -->
    <div class="grid grid-cols-7 gap-1">
      <!-- หัวตาราง (วันในสัปดาห์) -->
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm text-gray-500 font-medium py-1"
      >
        {{ day }}
      </div>

      <!-- ช่องวันที่ -->
      <div
        v-for="date in calendarDates"
        :key="date.date"
        class="relative min-h-[80px] p-2 border rounded-lg"
        :class="getDateClasses(date)"
        @click="handleDateClick(date)"
      >
        <!-- ตัวเลขวันที่ -->
        <span class="absolute top-1 left-1">{{ date.dayOfMonth }}</span>

        <!-- แสดงงานในวันนั้นๆ -->
        <div v-if="hasEvents(date)" class="mt-6 space-y-1">
          <div
            v-for="event in getEvents(date)"
            :key="event.id"
            class="text-xs p-1 rounded cursor-pointer truncate"
            :class="getEventClasses(event)"
            @click.stop="showEventDetails(event)"
          >
            <!-- ชื่องาน -->
            <div class="font-medium">{{ event.title }}</div>
            <!-- เวลาและสถานที่ -->
            <div class="text-[10px] opacity-75">
              {{ formatTime(event.work_date) }}
              <span v-if="event.location"> | {{ event.location }} </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal แสดงรายละเอียดงาน -->
    <JobDetailModal :is-open="!!selectedEvent" :job="selectedEvent" @close="selectedEvent = null" />
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboardStore'
import JobDetailModal from '@/components/admin/Jobs/JobDetailModal.vue'

export default {
  name: 'MiniCalendar',
  components: {
    JobDetailModal
  },
  data() {
    const store = useDashboardStore()
    const { calendarEvents } = storeToRefs(store)

    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedEvent: null,
      weekDays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
      store,
      calendarEvents
    }
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

      // เพิ่มวันจากเดือนก่อนหน้า
      for (let i = 0; i < firstDay.getDay(); i++) {
        const date = new Date(year, month, -i)
        dates.unshift({
          date: date,
          dayOfMonth: date.getDate(),
          isCurrentMonth: false
        })
      }

      // เพิ่มวันในเดือนปัจจุบัน
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        dates.push({
          date: date,
          dayOfMonth: i,
          isCurrentMonth: true
        })
      }

      // เพิ่มวันจากเดือนถัดไป
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
    }
  },

  methods: {
    previousMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      )
    },

    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      )
    },

    handleDateClick(date) {
      this.selectedDate = date.date
      this.$emit('date-click', date.date)
    },

    getDateClasses(date) {
      return {
        'text-gray-400': !date.isCurrentMonth,
        'text-gray-900': date.isCurrentMonth,
        'bg-blue-50': this.isSelectedDate(date),
        'hover:bg-gray-50': !this.isSelectedDate(date),
        'cursor-pointer': true
      }
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

    getEventClasses(event) {
      const baseClasses = 'hover:opacity-75'
      switch (event.status) {
        case 'published':
          return `${baseClasses} bg-blue-100 text-blue-800`
        case 'in_progress':
          return `${baseClasses} bg-yellow-100 text-yellow-800`
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    },

    formatTime(date) {
      return new Date(date).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    showEventDetails(event) {
      this.selectedEvent = {
        id: event.id,
        title: event.title,
        location: event.location,
        work_date: event.work_date,
        start_time: event.start_time,
        end_time: event.end_time,
        details: event.details || '',
        status: event.status || 'PENDING',
        // แก้ไขการแมป JobPositions
        JobPositions:
          event.JobPositions?.map((pos) => ({
            id: pos.id,
            position_name: pos.position_name, // เปลี่ยนจาก title เป็น position_name
            wage: pos.wage,
            required_people: pos.required_people,
            details: pos.details || '',
            status: this.getPositionStatus(pos),
            // เพิ่มข้อมูลผู้สมัคร
            JobParticipation:
              pos.JobParticipation?.map((participation) => ({
                id: participation.id,
                status: participation.status,
                user: participation.user
              })) || []
          })) || [],
        creator: event.creator,
        created_at: event.created_at,
        updated_at: event.updated_at
      }
    },

    getPositionStatus(position) {
      if (!position) return 'PENDING'
      // ใช้ status จาก position โดยตรง
      return position.status?.toUpperCase() || 'PENDING'
    }
  }
}
</script>

<style scoped>
.mini-calendar {
  @apply p-4;
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
