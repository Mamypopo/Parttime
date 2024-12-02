<template>
  <div class="p-4 md:p-6 space-y-4 md:space-y-6">
    <!-- Header Section  -->
    <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div class="space-y-3">
          <h1 class="text-xl md:text-2xl font-semibold text-gray-800">
            สวัสดี, {{ userStore.user?.first_name }}
          </h1>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span class="px-3 py-1 text-sm rounded-full w-fit" :class="statusClass">
              {{ userStore.user?.status || 'พร้อมทำงาน' }}
            </span>
            <!-- ทักษะ - แสดงแบบ wrap -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in userSkills"
                :key="skill"
                class="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-full"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
        <div class="text-left md:text-right mt-4 md:mt-0">
          <p class="text-sm text-gray-500">วันที่วันนี้</p>
          <p class="text-base md:text-lg font-medium text-gray-800">{{ currentDate }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      <!-- คะแนนเฉลี่ย -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500">คะแนนเฉลี่ย</p>
            <h3 class="text-lg md:text-2xl font-semibold">{{ stats.averageRating }}/10</h3>
          </div>
          <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-star text-yellow-500"></i>
          </div>
        </div>
      </div>

      <!-- งานที่ทำสำเร็จ -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500">งานสำเร็จ</p>
            <h3 class="text-lg md:text-2xl font-semibold">{{ stats.completedJobs }} งาน</h3>
          </div>
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-check text-green-500"></i>
          </div>
        </div>
      </div>

      <!-- รายได้เดือนนี้ -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500">รายได้เดือนนี้</p>
            <h3 class="text-lg md:text-2xl font-semibold">
              {{ formatCurrency(stats.monthlyIncome) }}
            </h3>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-wallet text-blue-500"></i>
          </div>
        </div>
      </div>

      <!-- ชั่วโมงทำงาน -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500">ชั่วโมงทำงานเดือนนี้</p>
            <h3 class="text-lg md:text-2xl font-semibold">{{ monthlyWorkHours }} ชม.</h3>
          </div>
          <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-clock text-purple-500"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Income Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <!-- กราฟรายได้ -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 class="text-base md:text-lg font-semibold">สรุปรายได้</h2>
          <div class="flex flex-wrap gap-2">
            <button
              @click="exportIncome"
              class="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 w-full sm:w-auto"
            >
              <i class="fas fa-file-excel mr-1"></i> Export Excel
            </button>
            <select
              v-model="incomeRange"
              class="text-sm border rounded-lg px-2 py-1 w-full sm:w-auto"
            >
              <option value="daily">รายวัน</option>
              <option value="weekly">รายสัปดาห์</option>
              <option value="monthly">รายเดือน</option>
            </select>
          </div>
        </div>
        <div class="h-48 md:h-64">
          <!-- Chart Component -->
        </div>
      </div>

      <!-- ตารางรายได้  -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 class="text-base md:text-lg font-semibold mb-4">รายได้ล่าสุด</h2>
        <div class="space-y-3">
          <div
            v-for="income in recentIncomes"
            :key="income.id"
            class="flex flex-col sm:flex-row justify-between gap-2 p-3 border rounded-lg"
          >
            <div>
              <h4 class="font-medium">{{ income.jobTitle }}</h4>
              <p class="text-sm text-gray-500">{{ income.workplace }}</p>
              <p class="text-xs text-gray-500 sm:hidden">{{ formatDate(income.date) }}</p>
            </div>
            <div class="flex justify-between sm:block">
              <p class="text-sm text-gray-500 hidden sm:block">{{ formatDate(income.date) }}</p>
              <span class="text-base md:text-lg font-medium text-green-600">
                {{ formatCurrency(income.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule & Upcoming Deadlines -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <!-- ตารางงานวันนี้ -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-base md:text-lg font-semibold">ตารางงานวันนี้</h2>
          <router-link to="/user/schedule" class="text-sm text-blue-500 hover:underline">
            ดูทั้งหมด →
          </router-link>
        </div>

        <div class="space-y-3">
          <template v-if="todaySchedule && todaySchedule.length > 0">
            <div
              v-for="schedule in todaySchedule"
              :key="schedule.id"
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 border rounded-lg"
            >
              <div class="flex-1">
                <!-- แสดงเวลาเริ่มและสิ้นสุด -->
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500">
                    {{ formatTimeRange(schedule.start_time, schedule.end_time) }}
                  </span>
                </div>
                <h4 class="font-medium mt-1">{{ schedule.title || 'เอกชนรับ' }}</h4>
                <p class="text-sm text-gray-500">
                  {{ schedule.workplace || schedule.location || 'ad1' }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="getStatusClass(schedule.status)"
                  class="px-2 py-1 text-xs rounded-full whitespace-nowrap"
                >
                  {{ getStatusText(schedule.status) }}
                </span>
              </div>
            </div>
          </template>
          <div v-else class="text-center py-8 text-gray-500">ไม่มีตารางงานสำหรับวันนี้</div>
        </div>
      </div>

      <!-- งานที่ใกล้ถึงกำหนด -->
      <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">งานที่ใกล้ถึงกำหนด</h2>
          <router-link to="/user/tasks" class="text-sm text-blue-500 hover:underline">
            ดูทั้งหมด →
          </router-link>
        </div>
        <div class="space-y-3">
          <div
            v-for="task in upcomingDeadlines"
            :key="task.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <i class="fas fa-exclamation text-red-500"></i>
              </div>
              <div>
                <h4 class="font-medium">{{ task.title }}</h4>
                <p class="text-sm text-gray-500">{{ task.workplace }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-red-500">{{ task.deadline }}</p>
              <p class="text-xs text-gray-500">เหลือ {{ task.remainingTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useUserDashboardStore } from '@/stores/userDashboardStore'

export default {
  name: 'DashboardView',

  data() {
    return {
      userStore: useUserStore(),
      dashboardStore: useUserDashboardStore(),
      incomeRange: 'monthly',
      upcomingDeadlines: [
        {
          id: 1,
          title: 'ส่งรายงานการทำงาน',
          workplace: 'ร้านอาหารบ้านสวน',
          deadline: '16 มี.ค. 2024',
          remainingTime: '2 วัน'
        },
        {
          id: 2,
          title: 'ส่งเอกสารการเงิน',
          workplace: 'ร้านกาแฟ Morning',
          deadline: '17 มี.ค. 2024',
          remainingTime: '3 วัน'
        }
      ]
    }
  },
  async mounted() {
    if (!this.userStore.user) {
      await this.userStore.fetchUserProfile()
    }
    console.log('User Data:', this.userStore.user)
    await this.dashboardStore.fetchDashboardData()
    console.log('Dashboard Data:', {
      stats: this.dashboardStore.stats,
      recentIncomes: this.dashboardStore.recentIncomes,
      todaySchedule: this.dashboardStore.todaySchedule
    })
  },
  computed: {
    // ข้อมูลผู้ใช้
    userSkills() {
      const skills = this.userStore.user?.skills
      if (!skills) return []

      // ถ้าเป็น string ให้แปลงเป็น array ก่อน
      const skillsArray =
        typeof skills === 'string' ? JSON.parse(skills.replace(/'/g, '"')) : skills

      return skillsArray.map((skill) => skill.toString().replace(/[[\]"]+/g, ''))
    },

    userName() {
      return this.userStore.user?.first_name || 'ผู้ใช้งาน'
    },
    loading() {
      return this.dashboardStore.loading
    },
    error() {
      return this.dashboardStore.error
    },
    currentDate() {
      return new Date().toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    stats() {
      return this.dashboardStore.stats
    },
    todaySchedule() {
      return this.dashboardStore.todaySchedule
    },
    monthlyWorkHours() {
      return this.stats.totalWorkHours || 0
    },
    recentIncomes() {
      return this.dashboardStore.recentIncomes
    }
  },

  methods: {
    async fetchDashboardData() {
      try {
        // TODO: เพิ่ม API calls เพื่อดึงข้อมูล
        // const response = await axios.get('/api/dashboard')
        // this.averageRating = response.data.averageRating
        // this.completedJobs = response.data.completedJobs
        // etc...
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    },

    exportIncome() {
      // TODO: เพิ่มฟังก์ชัน export Excel
      console.log('Exporting income data...', this.incomeRange)
    },

    async updateIncomeRange() {
      // TODO: อัพเดทข้อมูลรายได้ตามช่วงเวลาที่เลือก
      console.log('Updating income range:', this.incomeRange)
    },
    formatCurrency(amount) {
      return this.dashboardStore.formatCurrency(amount)
    },
    statusClass() {
      const status = this.userStore.user?.status || 'available'
      return {
        'bg-green-50 text-green-600': status === 'available',
        'bg-yellow-50 text-yellow-600': status === 'busy',
        'bg-red-50 text-red-600': status === 'unavailable'
      }
    },
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateString)
          return '-'
        }
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Error formatting date:', error)
        return '-'
      }
    },

    formatTimeRange(startTime, endTime) {
      try {
        const start = new Date(startTime)
        const end = new Date(endTime)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return '08:00 - 17:00' // ค่าเริ่มต้นถ้าเกิดข้อผิดพลาด
        }

        const startStr = start.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })

        const endStr = end.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })

        return `${startStr} - ${endStr}`
      } catch (error) {
        console.error('Error formatting time range:', error)
        return '08:00 - 17:00' // ค่าเริ่มต้นถ้าเกิดข้อผิดพลาด
      }
    },

    getStatusText(status) {
      const statusMap = {
        pending: 'รอการยืนยัน',
        approved: 'ยืนยันแล้ว',
        rejected: 'ถูกปฏิเสธ',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก',
        default: 'รอดำเนินการ'
      }
      return statusMap[status] || statusMap.default
    },

    getStatusClass(status) {
      return {
        'bg-yellow-50 text-yellow-600': status === 'pending',
        'bg-green-50 text-green-600': status === 'approved',
        'bg-red-50 text-red-600': status === 'rejected',
        'bg-blue-50 text-blue-600': status === 'completed',
        'bg-gray-50 text-gray-600': status === 'cancelled'
      }
    }
  },

  async mounted() {
    await this.dashboardStore.fetchDashboardData()
  },

  watch: {
    incomeRange: {
      handler: 'updateIncomeRange',
      immediate: true
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
</style>
