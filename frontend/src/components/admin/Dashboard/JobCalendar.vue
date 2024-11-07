<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-gray-800 flex items-center">
        <i class="fas fa-calendar-alt text-[#81E2C4] mr-2"></i>
        ปฏิทินงาน
      </h2>
    </div>

    <!-- FullCalendar Component -->
    <FullCalendar ref="fullCalendar" :options="calendarOptions" class="job-calendar" />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import thLocale from '@fullcalendar/core/locales/th'
import { useJobStore } from '@/stores/jobStore'

export default {
  name: 'JobCalendar',

  components: {
    FullCalendar
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: thLocale,
        events: this.getEvents(), // กำหนด events โดยตรง
        eventClick: this.handleEventClick,
        eventDidMount: this.handleEventMount,
        height: 'auto',
        contentHeight: 800,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      }
    }
  },
  async created() {
    this.jobStore = useJobStore()
    await this.jobStore.fetchJobs() // รอให้โหลดข้อมูลเสร็จ
    this.updateEvents() // อัปเดต events หลังจากข้อมูลถูกโหลด
  },
  watch: {
    'jobStore.jobs': {
      handler() {
        this.updateEvents()
      },
      deep: true
    }
  },
  methods: {
    updateEvents() {
      if (this.$refs.fullCalendar && Array.isArray(this.jobStore.jobs)) {
        const calendarApi = this.$refs.fullCalendar.getApi()
        calendarApi.removeAllEvents()
        const events = this.getEvents()
        console.log(events) // ตรวจสอบข้อมูลที่จะแสดงบนปฏิทิน
        calendarApi.addEventSource(events)
      }
    },

    getEvents() {
      if (!this.jobStore?.jobs || !Array.isArray(this.jobStore.jobs)) return []

      return this.jobStore.jobs
        .map((job) => {
          console.log('งาน:', job.title)
          console.log('วันที่ทำงาน:', job.work_date)
          console.log('เวลาเริ่ม:', job.start_time)
          console.log('เวลาสิ้นสุด:', job.end_time)

          const workDate = job.work_date ? new Date(job.work_date) : null
          const startTime = job.start_time ? job.start_time : '00:00:00'
          const endTime = job.end_time ? job.end_time : '23:59:59'

          const start = workDate
            ? new Date(`${workDate.toISOString().split('T')[0]}T${startTime}`)
            : null
          const end = workDate
            ? new Date(`${workDate.toISOString().split('T')[0]}T${endTime}`)
            : null

          console.log('start:', start)
          console.log('end:', end)

          if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
            console.error('Invalid date or time for job:', job.title)
            return null // ข้ามงานที่มีข้อมูลไม่ถูกต้อง
          }

          return {
            id: job.id,
            title: job.title,
            start: start.toISOString(),
            end: end.toISOString(),
            extendedProps: {
              location: job.location,
              positions: job.JobPositions,
              details: job.details
            },
            backgroundColor: this.getStatusColor(job.status),
            borderColor: this.getStatusColor(job.status)
          }
        })
        .filter((event) => event !== null) // กรองงานที่มีข้อมูลไม่ถูกต้องออก
    },
    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case 'open':
          return '#4CAF50'
        case 'closed':
          return '#FF5252'
        case 'full':
          return '#FF9800'
        default:
          return '#9899ee'
      }
    },

    handleEventClick(info) {
      if (!this.jobStore?.jobs) return

      const jobId = parseInt(info.event.id)
      const selectedJob = this.jobStore.jobs.find((job) => job.id === jobId)
      if (selectedJob) {
        this.$emit('select-job', selectedJob)
      }
    },

    handleEventMount(info) {
      // เพิ่ม Tooltip หรือจัดการข้อมูลเพิ่มเติมที่ต้องการแสดงบนปฏิทิน
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

<style scoped>
.job-calendar {
  .fc-toolbar-title {
    color: #333;
  }
  .fc-button-primary {
    background-color: #81e2c4;
    border-color: #81e2c4;
    color: white;
  }
}
</style>
