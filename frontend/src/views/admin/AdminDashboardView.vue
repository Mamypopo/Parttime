<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- ส่วนที่ 1: Stats Cards -->
      <div class="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- จำนวนผู้ใช้งาน -->
        <StatsCard title="ผู้ใช้งานทั้งหมด" :value="totalUsers" icon="fas fa-users" color="blue" />

        <!-- จำนวนงาน -->
        <StatsCard
          title="งานทั้งหมด"
          :value="totalJobs"
          :sub-stats="[
            { label: 'เปิดรับสมัคร', value: openJobs },
            { label: 'กำลังดำเนินการ', value: inProgressJobs },
            { label: 'เสร็จสิ้น', value: completedJobs }
          ]"
          icon="fas fa-briefcase"
          color="purple"
        />

        <!-- รายจ่ายรวม -->
        <StatsCard
          title="รายจ่ายรวมเดือนนี้"
          :value="dashboardStore.formattedTotalExpenses"
          icon="fas fa-money-bill-wave"
          color="emerald"
        />

        <!-- จำนวนการสมัครงาน -->
        <StatsCard
          title="การสมัครงานเดือนนี้"
          :value="monthlyApplications"
          :sub-stats="[
            { label: 'อนุมัติแล้ว', value: monthlyApplicationsApproved },
            { label: 'ไม่อนุมัติ', value: monthlyApplicationsRejected },
            { label: 'รอพิจารณา', value: monthlyApplicationsPending }
          ]"
          icon="fas fa-file-signature"
          color="orange"
        />
      </div>
      <!-- ผู้ใช้ที่ลงทะเบียนล่าสุด -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">ผู้ใช้ที่รออนุมัติล่าสุด</h3>
          <router-link
            to="/admin/pending-users"
            class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            ดูทั้งหมด <i class="fas fa-arrow-right ml-1"></i>
          </router-link>
        </div>

        <div class="space-y-3">
          <div
            v-for="user in recentRegistrations"
            :key="user.id"
            class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <i class="fas fa-user text-gray-400"></i>
              </div>
              <div>
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-gray-600">{{ user.email }}</div>
                <div class="text-xs text-gray-500">
                  ลงทะเบียนเมื่อ: {{ new Date(user.registeredAt).toLocaleDateString('th-TH') }}
                </div>
              </div>
            </div>
          </div>

          <!-- ข้อความเมื่อไม่มีข้อมูล -->
          <div v-if="!recentRegistrations.length" class="text-center text-gray-500 py-4">
            ไม่มีผู้ใช้ที่รออนุมัติ
          </div>
        </div>
      </div>
      <!-- ส่วนที่ 2: Calendar -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-4 md:p-6">
            <h3
              class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
            >
              ปฏิทินงาน
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">ดูรายละเอียดงานตามวันที่</p>
            <MiniCalendar @date-click="handleDateClick" class="mt-4" />
          </div>
        </div>
      </div>

      <!-- ส่วนที่ 3: User Ratings -->
      <div class="lg:col-span-1">
        <UserRatings :topUsers="topUsers" :averageRating="averageRating" />
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from '@/components/admin/Dashboard/StatsCard.vue'
import MiniCalendar from '@/components/admin/Dashboard/MiniCalendar.vue'
import UserRatings from '@/components/admin/Dashboard/UserRatings.vue'
import { useDashboardStore } from '@/stores/dashboardStore'

export default {
  name: 'AdminDashboard',
  components: {
    StatsCard,
    MiniCalendar,
    UserRatings
  },

  data() {
    return {
      selectedDate: null,
      dashboardStore: useDashboardStore()
    }
  },

  computed: {
    // ดึงข้อมูลจาก store
    totalUsers() {
      return this.dashboardStore.stats.totalUsers
    },
    totalJobs() {
      return this.dashboardStore.stats.totalJobs
    },
    openJobs() {
      return this.dashboardStore.stats.openJobs
    },
    inProgressJobs() {
      return this.dashboardStore.stats.inProgressJobs
    },
    completedJobs() {
      return this.dashboardStore.stats.completedJobs
    },

    monthlyApplications() {
      return this.dashboardStore.stats.monthlyApplications || 0
    },
    monthlyApplicationsApproved() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.approved || 0
    },
    monthlyApplicationsRejected() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.rejected || 0
    },
    monthlyApplicationsPending() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.pending || 0
    },

    topUsers() {
      return this.dashboardStore.topUsers
    },
    averageRating() {
      return this.dashboardStore.averageRating
    },

    recentRegistrations() {
      return this.dashboardStore.stats.recentRegistrations || []
    }
  },
  async created() {
    await this.dashboardStore.fetchDashboardData()
  },
  methods: {
    handleDateClick(date) {
      this.selectedDate = date
    }
  }
}
</script>
