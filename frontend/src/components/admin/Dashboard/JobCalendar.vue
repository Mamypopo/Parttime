<template>
  <div class="rounded-xl">
    <!-- Title Section -->
    <div class="mb-5">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <i class="fas fa-calendar-alt text-[#81E2C4]"></i> ปฏิทินงาน
      </h2>

      <!-- Status Legend -->
      <div class="flex gap-4 mt-3 flex-wrap text-xs text-gray-600">
        <div class="font-medium mr-2">สถานะการรับสมัคร (ต่อตำแหน่ง):</div>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
          <span>เปิดรับสมัคร</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#EA6B6B]"></span>
          <span>เต็มแล้ว</span>
        </div>

        <div class="font-medium ml-4 mr-2">สถานะงาน:</div>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#F3C998]"></span>
          <span>กำลังดำเนินการ</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#CDE45F]"></span>
          <span>เสร็จสิ้น</span>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="jobStore.loading" class="flex flex-col items-center justify-center p-8">
      <div
        class="w-10 h-10 border-4 border-t-[#81E2C4] border-b-[#6ED7D1] rounded-full animate-spin"
      ></div>
      <p class="mt-3 text-gray-700">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error Message -->
    <div
      v-else-if="jobStore.error"
      class="flex flex-col items-center justify-center p-8 bg-red-100 rounded-lg"
    >
      <p class="text-red-600 font-semibold">{{ jobStore.error }}</p>
      <button
        @click="refreshCalendar"
        class="mt-4 px-5 py-2 bg-[#81E2C4] hover:bg-[#6ED7D1] text-white rounded-lg shadow transition"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>

    <!-- Calendar Section -->
    <div v-else>
      <!-- เพิ่ม relative และ z-0 -->
      <FullCalendar :options="calendarOptions" class="border-gray-200 rounded-lg" />
    </div>

    <!-- Job Detail Modal -->
    <JobDetailModal :is-open="isModalOpen" :job="selectedJob" @close="closeModal" />
  </div>
</template>

<script>
import { useJobStore } from '@/stores/jobStore'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import thLocale from '@fullcalendar/core/locales/th'
import JobDetailModal from '../Jobs/JobDetailModal.vue'

export default {
  name: 'JobCalendar',
  components: {
    FullCalendar,
    JobDetailModal
  },

  data() {
    return {
      jobStore: useJobStore(),
      isModalOpen: false,
      selectedJob: null,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: thLocale,
        events: [],
        eventClick: this.handleEventClick,
        height: 'auto',
        contentHeight: 'auto',
        slotMinWidth: 50,
        eventOverlap: false, // ป้องกันการทับซ้อน
        slotEventOverlap: false, // ป้องกันการทับซ้อนใน timeGrid
        eventDisplay: 'block', // ให้แสดงแบบบล็อกเต็มพื้นที่
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        },
        dayCellContent: (arg) => {
          const events = arg.view.calendar.getEvents().filter((event) => {
            return event.start?.toDateString() === arg.date.toDateString()
          })

          if (events.length > 0) {
            return {
              html: `
            <div class="flex items-center gap-4">
          <span class="w-3 h-3 rounded-full  ${
            events[0].extendedProps.completed ? 'bg-[#CDE45F]' : 'bg-[#F3C998]'
          }" title="สถานะงาน"></span>
          <span>${arg.dayNumberText}</span>
        </div>
            `
            }
          }

          return arg.dayNumberText
        }
      }
    }
  },

  async created() {
    await this.refreshCalendar()
  },

  methods: {
    updateEvents() {
      if (!this.jobStore.jobs?.length) return

      const events = this.jobStore.jobs.map((job) => {
        const positions =
          job.JobPositions?.map(
            (pos) => `
        <div class="inline-flex items-center mr-1 mb-1 truncate">
          <span class="px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs flex items-center gap-1 overflow-hidden ">
          <span class="truncate">${pos.position_name}</span>
            <span class="w-2 h-2 rounded-full  ${this.getRecruitmentStatusColor(pos.status)}"
                  title="${
                    pos.status === 'open'
                      ? 'เปิดรับสมัคร'
                      : pos.status === 'closed'
                        ? 'ปิดรับสมัคร'
                        : pos.status === 'full'
                          ? 'เต็มแล้ว'
                          : 'ไม่ระบุสถานะ'
                  }">
            </span>
          </span>
        </div>
      `
          ).join('') || ''

        const startTime = new Date(job.start_time).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })
        const endTime = new Date(job.end_time).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        })

        return {
          id: job.id,
          title: job.title,
          start: job.start_time,
          end: job.end_time,
          backgroundColor: 'white',
          textColor: 'black',
          borderColor: 'transparent',
          extendedProps: {
            jobId: job.id,
            title: job.title,
            time: `${startTime} - ${endTime}`,
            positions,
            location: job.location || 'ไม่ระบุสถานที่',
            completed: job.completed
          },
          classNames: ['event-custom', 'calendar-event']
        }
      })

      this.calendarOptions = {
        ...this.calendarOptions,
        eventContent: (arg) => ({
          html: `
       <div class="p-2 w-full min-h-[80px]">
         <div class="text-xs truncate">
          <span class="text-lime-600 ">ชื่อ:</span>
          <span class="text-gray-600">${arg.event.extendedProps.title}</span>
        </div>
      <div class="flex justify-between items-start mb-1">
        <div class="text-xs truncate">
          <span class="text-lime-600  ">สถานที่:</span>
          <span class="text-gray-600">${arg.event.extendedProps.location}</span>
        </div>

      </div>
      <div class="flex flex-wrap gap-1 mb-2">
        ${arg.event.extendedProps.positions}
      </div>
      <div class="text-xs text-gray-500 truncate">
         <span class="text-lime-600">เวลา:</span>
        ${arg.event.extendedProps.time}
      </div>
    </div>
      `
        }),
        events,
        eventClick: this.handleEventClick // เพิ่ม event click handler
      }
    },

    getRecruitmentStatusColor(status) {
      const statusColor = {
        open: 'bg-[#22C55E]', // เขียว - เปิดรับสมัคร
        closed: 'bg-[#EA6B6B]' // ส้ม - เต็มแล้ว
      }
      return statusColor[status?.toLowerCase()] || 'bg-gray-300'
    },

    handleEventClick(info) {
      info.jsEvent.preventDefault()
      const jobId = info.event.extendedProps.jobId
      this.selectedJob = this.jobStore.jobs.find((job) => job.id === jobId)
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
      this.selectedJob = null
    },

    async refreshCalendar() {
      try {
        await this.jobStore.fetchJobs()
        this.updateEvents()
      } catch (error) {
        console.error('Error refreshing calendar:', error)
      }
    }
  },

  watch: {
    'jobStore.jobs': {
      handler() {
        this.updateEvents()
      },
      deep: true
    }
  }
}
</script>

<style>
/* Header Toolbar */
.fc .fc-toolbar.fc-header-toolbar {
  @apply mb-6 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] 
         rounded-xl p-4 shadow-sm border border-gray-100;
}
.fc .fc-toolbar-title {
  @apply text-xl font-semibold text-white;
}
/* ปุ่มต่างๆ */
.fc-button-group {
  @apply rounded-lg overflow-hidden shadow-sm;
}

.fc .fc-button-primary {
  @apply bg-white border-0 text-gray-700 hover:bg-gray-50 
         px-4 py-2 text-sm font-medium transition-colors !important;
}

.fc .fc-button-primary:not(:disabled).fc-button-active {
  @apply bg-[#81E2C4] text-white hover:bg-[#6ED7D1] !important;
}

/* ปุ่ม Today */
.fc .fc-today-button {
  @apply bg-white text-gray-700 border rounded-lg border-gray-200 
         hover:bg-gray-50 shadow-sm !important;
}

.fc .fc-today-button:disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed !important;
}

/* หัวเรื่อง */
.fc .fc-toolbar-title {
  @apply text-xl font-bold text-gray-800 
         bg-clip-text bg-gradient-to-r from-[#81E2C4] to-[#6ED7D1];
}

/* จัดการ Layout */
.fc-header-toolbar {
  @apply flex flex-wrap justify-between items-center gap-4;
}

.fc-toolbar-chunk {
  @apply flex items-center gap-2;
}

/* Responsive */
@media (max-width: 768px) {
  .fc-header-toolbar {
    @apply flex-col items-stretch;
  }

  .fc-toolbar-chunk {
    @apply justify-center;
  }

  .fc .fc-toolbar-title {
    @apply text-lg text-center;
  }
}

/* หัวตาราง */
.fc .fc-col-header {
  @apply bg-gradient-to-b from-gray-50 to-white;
}

.fc .fc-col-header-cell {
  @apply py-3 border-gray-200;
}

.fc .fc-col-header-cell-cushion {
  @apply text-sm font-semibold text-gray-600 uppercase tracking-wider;
}

/* Animation */
.fc .fc-button-primary {
  @apply transform transition-all duration-200 ease-in-out 
         hover:scale-105 active:scale-95;
}

/* Hover Effects */
.fc .fc-button-primary:hover {
  @apply shadow-md;
}

/* Focus States */
.fc .fc-button-primary:focus {
  @apply outline-none ring-2 ring-[#81E2C4] ring-opacity-50;
}

/* Custom Shadows */
.fc-header-toolbar {
  @apply shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)];
}
</style>
