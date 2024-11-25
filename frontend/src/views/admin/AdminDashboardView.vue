<template>
  <div class="p-6 space-y-6">
    <!-- Section 1: Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="ผู้ใช้งานทั้งหมด" :value="totalUsers" icon="fas fa-users" color="blue" />
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
      <StatsCard
        title="รายจ่ายรวมเดือนนี้"
        :value="dashboardStore.formattedTotalExpenses"
        icon="fas fa-money-bill-wave"
        color="emerald"
      />
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

    <!-- Section 2: Calendar and User Ratings -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar Section -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div class="p-6">
          <h3
            class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
          >
            ปฏิทินงาน
          </h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">ดูรายละเอียดงานตามวันที่</p>
          <MiniCalendar @date-click="handleDateClick" class="mt-4" />
        </div>
      </div>

      <!-- User Ratings Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div class="p-6">
          <h3
            class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
          >
            คะแนนผู้ใช้งาน
          </h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">ดูผู้ใช้งานที่มีคะแนนสูงสุด</p>
          <UserRatings :topUsers="topUsers" :averageRating="averageRating" class="mt-4" />
        </div>
      </div>
    </div>

    <!-- Section 3: Pending Users -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div class="p-6">
        <h3
          class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
        >
          ผู้ใช้ที่ลงทะเบียนล่าสุด
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          ดูรายชื่อผู้ใช้งานที่เพิ่งลงทะเบียน
        </p>
        <PendingUsersList :users="recentRegistrations" class="mt-4" />
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from '@/components/admin/Dashboard/StatsCard.vue'
import MiniCalendar from '@/components/admin/Dashboard/MiniCalendar.vue'
import UserRatings from '@/components/admin/Dashboard/UserRatings.vue'
import PendingUsersList from '@/components/admin/Dashboard/PendingUsersList.vue'

import { useDashboardStore } from '@/stores/dashboardStore'

export default {
  name: 'AdminDashboard',
  components: {
    StatsCard,
    MiniCalendar,
    UserRatings,
    PendingUsersList
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
      return this.dashboardStore.stats.jobs?.total || 0 // เพิ่ม jobs object
    },
    openJobs() {
      return this.dashboardStore.stats.jobs?.open || 0
    },
    inProgressJobs() {
      return this.dashboardStore.stats.jobs?.inProgress || 0
    },
    completedJobs() {
      return this.dashboardStore.stats.jobs?.completed || 0
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
