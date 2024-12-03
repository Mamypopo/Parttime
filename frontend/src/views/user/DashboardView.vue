<template>
  <div class="p-4 md:p-6 space-y-4 md:space-y-6">
    <!-- Header Section  -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div class="space-y-3">
          <h1 class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
            สวัสดี, {{ fullName }}
          </h1>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span
              class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
              :class="getStatusClass(userStore.user?.approved)"
            >
              <i class="fas mr-1.5" :class="getStatusIcon(userStore.user?.approved)"></i>
              {{ getStatusText(userStore.user?.approved) }}
            </span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in userSkills"
                :key="skill"
                class="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-full"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
        <div class="text-left md:text-right mt-4 md:mt-0">
          <p class="text-sm text-gray-500 dark:text-gray-400">วันที่วันนี้</p>
          <p class="text-base md:text-lg font-medium text-gray-800 dark:text-white">
            {{ currentDate }}
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      <!-- คะแนนเฉลี่ย -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">คะแนนเฉลี่ย</p>
            <h3 class="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
              {{ stats.averageRating }}/10
            </h3>
          </div>
          <div
            class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center dark:bg-opacity-50"
          >
            <i class="fas fa-star text-yellow-500"></i>
          </div>
        </div>
      </div>

      <!-- งานที่ทำสำเร็จ -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">งานสำเร็จ</p>
            <h3 class="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
              {{ stats.completedJobs }} งาน
            </h3>
          </div>
          <div
            class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center dark:bg-opacity-50"
          >
            <i class="fas fa-check text-green-500"></i>
          </div>
        </div>
      </div>

      <!-- รายได้เดือนนี้ -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">รายได้เดือนนี้</p>
            <h3 class="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
              {{ formatCurrency(stats.monthlyIncome) }}
            </h3>
          </div>
          <div
            class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center dark:bg-opacity-50"
          >
            <i class="fas fa-wallet text-blue-500"></i>
          </div>
        </div>
      </div>

      <!-- เงานที่กำลังจะมาถึง -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">งานที่กำลังจะมาถึง</p>
            <h3 class="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
              {{ dashboardStore.upcomingDeadlines.length }} งาน
            </h3>
          </div>
          <div
            class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center dark:bg-opacity-50"
          >
            <i class="fas fa-calendar text-purple-500"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Income Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <!-- กราฟรายได้ -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
            สรุปรายได้
          </h2>

          <!-- ตัวเลือกและปุ่มต่างๆ -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- ตัวเลือกช่วงเวลา -->
            <select
              v-model="incomeRange"
              class="text-sm border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="daily">7 วันล่าสุด</option>
              <option value="weekly">4 สัปดาห์ล่าสุด</option>
              <option value="monthly">6 เดือนล่าสุด</option>
              <option value="yearly">รายปี</option>
            </select>

            <!-- ปุ่ม Export -->
            <div class="flex gap-2">
              <button
                @click="exportIncome"
                class="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center gap-2 transition-colors"
              >
                <i class="fas fa-file-excel"></i>
                <span class="hidden sm:inline">Export Excel</span>
              </button>

              <!-- ปุ่ม Print -->
              <button
                @click="printChart"
                class="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-2 transition-colors"
              >
                <i class="fas fa-print"></i>
                <span class="hidden sm:inline">พิมพ์</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="h-48 md:h-64 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4bc0c8]"></div>
        </div>

        <!-- Chart -->
        <div v-else class="h-48 md:h-64">
          <IncomeChart :incomes="recentIncomes" :range="incomeRange" />
        </div>
      </div>

      <!-- ตารางรายได้  -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-4">
          รายได้ล่าสุด
        </h2>
        <div class="space-y-3">
          <div
            v-for="income in recentIncomes"
            :key="income.id"
            class="flex flex-col sm:flex-row justify-between gap-2 p-3 border dark:border-gray-700 rounded-lg"
          >
            <div>
              <h4 class="font-medium text-gray-800 dark:text-white">{{ income.jobTitle }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ income.workplace }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                {{ formatDate(income.date) }}
              </p>
            </div>
            <div class="flex justify-between sm:block">
              <p class="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {{ formatDate(income.date) }}
              </p>
              <span class="text-base md:text-lg font-medium text-green-600 dark:text-green-400">
                {{ formatCurrency(income.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <!-- ตารางงานวันนี้ -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
            ตารางงานวันนี้
          </h2>
          <!-- <router-link to="/user/schedule" class="text-sm text-blue-500 hover:underline">
            ดูทั้งหมด →
          </router-link> -->
        </div>

        <div class="space-y-3">
          <template v-if="todaySchedule && todaySchedule.length > 0">
            <div
              v-for="schedule in todaySchedule"
              :key="schedule.id"
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 border dark:border-gray-700 rounded-lg dark:bg-gray-800/50"
            >
              <div class="flex-1">
                <!-- แสดงเวลาเริ่มและสิ้นสุด -->
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatTimeRange(schedule.start_time, schedule.end_time) }}
                  </span>
                </div>
                <h4 class="font-medium mt-1 text-gray-800 dark:text-white">
                  {{ schedule.title }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ schedule.workplace || schedule.location }}
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
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            ไม่มีตารางงานสำหรับวันนี้
          </div>
        </div>
      </div>

      <!-- งานที่ใกล้ถึงกำหนด -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">งานที่ใกล้ถึงกำหนด</h2>
          <!-- <router-link to="/user/tasks" class="text-sm text-blue-500 hover:underline">
            ดูทั้งหมด →
          </router-link> -->
        </div>
        <div class="space-y-3">
          <template v-if="dashboardStore.upcomingDeadlines.length > 0">
            <div
              v-for="task in dashboardStore.upcomingDeadlines"
              :key="task.id"
              class="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg dark:bg-gray-800/50"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center"
                  :class="{
                    'bg-red-50 dark:bg-red-900/30': task.daysLeft <= 2,
                    'bg-yellow-50 dark:bg-yellow-900/30': task.daysLeft > 2
                  }"
                >
                  <i
                    class="fas fa-exclamation"
                    :class="{
                      'text-red-500 dark:text-red-400': task.daysLeft <= 2,
                      'text-yellow-500 dark:text-yellow-400': task.daysLeft > 2
                    }"
                  ></i>
                </div>
                <div>
                  <h4 class="font-medium text-gray-800 dark:text-white">{{ task.title }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ task.workplace }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-800 dark:text-white">
                  {{ task.formattedDate }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ task.daysLeftText }}</p>
              </div>
            </div>
          </template>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            ไม่มีงานที่ใกล้ถึงกำหนด
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useUserDashboardStore } from '@/stores/userDashboardStore'
import IncomeChart from '@/components/Charts/IncomeChart.vue'
import * as XLSX from 'xlsx'

export default {
  name: 'DashboardView',
  components: {
    IncomeChart
  },
  data() {
    return {
      userStore: useUserStore(),
      dashboardStore: useUserDashboardStore(),
      incomeRange: 'monthly'
    }
  },
  async mounted() {
    await this.dashboardStore.fetchDashboardData()
  },
  computed: {
    // ข้อมูลผู้ใช้
    userSkills() {
      const skills = this.userStore.user?.skills
      if (!skills) return []
      const skillsArray =
        typeof skills === 'string' ? JSON.parse(skills.replace(/'/g, '"')) : skills

      return skillsArray.map((skill) => skill.toString().replace(/[[\]"]+/g, ''))
    },

    fullName() {
      return `${this.userStore.user?.first_name || ''} ${this.userStore.user?.last_name || ''}`.trim()
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
    recentIncomes() {
      return this.dashboardStore.recentIncomes
    },
    upcomingDeadlines() {
      return this.dashboardStore.upcomingDeadlines
    }
  },

  methods: {
    async updateIncomeRange() {
      await this.dashboardStore.fetchDashboardData(this.incomeRange)
      // อัพเดทข้อมูลกราฟตามช่วงเวลาที่เลือก
    },
    printChart() {
      window.print()
    },
    exportIncome() {
      try {
        // สร้างข้อมูลสำหรับ export
        const data = this.recentIncomes.map((income) => ({
          วันที่: this.formatDate(income.date),
          งาน: income.jobTitle,
          สถานที่: income.workplace,
          จำนวนเงิน: income.amount
        }))

        // สร้าง workbook
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(data)

        // ตั้งค่าความกว้างคอลัมน์
        const colWidths = [
          { wch: 15 }, // วันที่
          { wch: 30 }, // งาน
          { wch: 25 }, // สถานที่
          { wch: 15 } // จำนวนเงิน
        ]
        ws['!cols'] = colWidths

        // เพิ่ม worksheet ลงใน workbook
        XLSX.utils.book_append_sheet(wb, ws, 'รายได้')

        // บันทึกไฟล์
        const fileName = `income_report_${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(wb, fileName)
      } catch (error) {
        console.error('Error exporting income:', error)
        // TODO: แสดง error message
      }
    },

    formatCurrency(amount) {
      return this.dashboardStore.formatCurrency(amount)
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
        approved: 'พร้อมทำงาน',
        rejected: 'ไม่พร้อมทำงาน',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก',
        default: 'รอดำเนินการ'
      }
      return statusMap[status] || statusMap.default
    },

    getStatusClass(status) {
      return {
        'bg-yellow-50 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800':
          status === 'pending',
        'bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-300 border border-green-200 dark:border-green-800':
          status === 'approved',
        'bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800':
          status === 'rejected',
        'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800':
          status === 'completed',
        'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700':
          status === 'cancelled'
      }
    },

    // เพิ่ม method สำหรับไอคอนตามสถานะ
    getStatusIcon(status) {
      return {
        'fa-clock': status === 'pending',
        'fa-check-circle': status === 'approved',
        'fa-times-circle': status === 'rejected',
        'fa-check-double': status === 'completed',
        'fa-ban': status === 'cancelled',
        'fa-question-circle': !status // default
      }
    }
  },

  watch: {
    incomeRange: {
      handler() {
        this.updateIncomeRange()
      }
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
