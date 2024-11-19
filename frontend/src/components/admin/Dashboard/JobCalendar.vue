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
        // Time Grid Options
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        slotDuration: '00:30:00',
        slotMinWidth: 70,
        slotLabelInterval: '01:00',
        expandRows: true,
        allDaySlot: false,
        eventMinHeight: 30,
        nowIndicator: true,

        // Event Display Options
        eventOverlap: false,
        slotEventOverlap: false,
        eventDisplay: 'block',
        eventOrder: 'start,-duration,allDay,title',

        // Locale & Time Format
        locale: thLocale,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        },

        // Events Configuration
        events: [],
        height: 'auto',
        contentHeight: 'auto',
        dayMaxEvents: 3,

        // Custom Renderers
        moreLinkContent: (args) => ({
          html: `<div class="more-link">+${args.num} งาน</div>`
        }),

        dayCellContent: (arg) => {
          const events = arg.view.calendar.getEvents().filter((event) => {
            return event.start?.toDateString() === arg.date.toDateString()
          })

          if (events.length > 0) {
            return {
              html: `
                <div class="flex items-center gap-4">
                  <span class="w-3 h-3 rounded-full ${
                    events[0].extendedProps.completed ? 'bg-[#CDE45F]' : 'bg-[#F3C998]'
                  }" title="สถานะงาน"></span>
                  <span>${arg.dayNumberText}</span>
                </div>
              `
            }
          }
          return arg.dayNumberText
        },

        // Event Handlers
        eventClick: this.handleEventClick,
        eventDidMount: (info) => {
          info.el.setAttribute(
            'title',
            `${info.event.extendedProps.title}\n${info.event.extendedProps.location}\n${info.event.extendedProps.time}`
          )
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
          <div class="calendar-event-content p-2 w-full min-h-[80px] hover:shadow-lg transition-shadow rounded-lg">
            <div class="event-header mb-1">
              <div class="text-xs font-semibold truncate">
                <i class="fas fa-bookmark text-lime-600 mr-1"></i>
                ${arg.event.extendedProps.title}
              </div>
            </div>
            
            <div class="event-body">
              <div class="text-xs truncate mb-1">
                <i class="fas fa-map-marker-alt text-lime-600 mr-1"></i>
                ${arg.event.extendedProps.location}
              </div>
              
              <div class="flex flex-wrap gap-1 mb-1">
                ${arg.event.extendedProps.positions}
              </div>
              
              <div class="text-xs text-gray-500 truncate">
                <i class="far fa-clock text-lime-600 mr-1"></i>
                ${arg.event.extendedProps.time}
              </div>
            </div>
          </div>
          `
        }),
        events,
        eventClick: this.handleEventClick,
        eventDidMount: (info) => {
          info.el.setAttribute(
            'title',
            `${info.event.extendedProps.title}\n${info.event.extendedProps.location}\n${info.event.extendedProps.time}`
          )
        }
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
/* เพิ่ม styles สำหรับมุมมองสัปดาห์และวัน */
.fc-timegrid-event-harness {
  margin: 0 !important;
}

.fc-timegrid-event {
  @apply border-0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* ปรับ event container ในมุมมองสัปดาห์/วัน */
.fc-timegrid-event .calendar-event-content {
  @apply h-full w-full rounded-md !important;
  margin: 1px !important;
  min-height: unset !important;
}

/* ปรับความสูงของ event ให้พอดีกับ cell */
.fc-timegrid-event .event-body {
  @apply h-full flex flex-col justify-between;
}

/* แก้ไขการแสดงผลที่เกินขอบเขต */
.fc-timegrid-cols {
  @apply overflow-hidden !important;
}

.fc-timegrid-col-events {
  @apply overflow-hidden !important;
}

/* ปรับขนาดตัวอักษรใน event สำหรับมุมมองสัปดาห์/วัน */
.fc-timegrid-event .calendar-event-content {
  font-size: 0.75rem !important;
}

/* ปรับ spacing ใน event */
.fc-timegrid-event .event-header,
.fc-timegrid-event .event-body {
  @apply p-1 !important;
}

/* ซ่อนบาง elements ในมุมมองสัปดาห์/วัน เมื่อพื้นที่น้อย */
@media (max-height: 600px) {
  .fc-timegrid-event .event-body > *:not(:first-child) {
    display: none;
  }
}

/* ปรับ z-index เพื่อป้องกันการทับซ้อน */
.fc-timegrid-event {
  z-index: 1 !important;
}

.fc-timegrid-now-indicator-line {
  z-index: 2 !important;
}

/* เพิ่ม transition เพื่อให้การเปลี่ยนขนาดนุ่มนวล */
.fc-timegrid-event {
  transition: heigh;
}

/* Calendar Grid Styles */
.fc-timegrid-event-harness {
  margin: 0 !important;
}

.fc-timegrid-event {
  @apply border-0 !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 1 !important;
  transition: height 0.2s ease-in-out !important;
}

/* Event Content Styles */
.fc-timegrid-event .calendar-event-content {
  @apply h-full w-full rounded-md !important;
  margin: 1px !important;
  min-height: unset !important;
  font-size: 0.75rem !important;
}

.fc-timegrid-event .event-body {
  @apply h-full flex flex-col justify-between;
}

/* Container Overflow Control */
.fc-timegrid-cols,
.fc-timegrid-col-events {
  @apply overflow-hidden !important;
}

/* Event Spacing */
.fc-timegrid-event .event-header,
.fc-timegrid-event .event-body {
  @apply p-1 !important;
}

/* Responsive Adjustments */
@media (max-height: 600px) {
  .fc-timegrid-event .event-body > *:not(:first-child) {
    display: none;
  }
}

/* Z-index Management */
.fc-timegrid-now-indicator-line {
  z-index: 2 !important;
}

/* More Link Styling */
.more-link {
  @apply bg-[#81E2C4] text-white px-2 py-1 rounded-full text-xs
         hover:bg-[#6ED7D1] transition-colors cursor-pointer;
}
</style>
