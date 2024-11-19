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
          color="green"
        />

        <!-- รายจ่ายรวม -->
        <StatsCard
          title="รายจ่ายรวมเดือนนี้"
          :value="formatCurrency(totalExpenses)"
          icon="fas fa-money-bill-wave"
          color="yellow"
        />

        <!-- จำนวนการสมัครงาน -->
        <StatsCard
          title="การสมัครงานเดือนนี้"
          :value="monthlyApplications"
          icon="fas fa-file-signature"
          color="purple"
        />
      </div>

      <!-- ส่วนที่ 2: Calendar -->
      <div class="lg:col-span-2">
        <!-- Mini Calendar -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <h3 class="text-lg font-semibold mb-4">ปฏิทินงาน</h3>
          <MiniCalendar @date-click="handleDateClick" />
        </div>
      </div>

      <!-- ส่วนที่ 3: User Ratings -->
      <div>
        <!-- User Ratings -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <h3 class="text-lg font-semibold mb-4">คะแนนผู้ใช้งาน</h3>
          <UserRatings :topUsers="topUsers" :averageRating="averageRating" />
        </div>
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
    totalExpenses() {
      return this.dashboardStore.stats.totalExpenses
    },
    monthlyApplications() {
      return this.dashboardStore.stats.monthlyApplications
    },

    topUsers() {
      return this.dashboardStore.topUsers
    },
    averageRating() {
      return this.dashboardStore.averageRating
    },
    jobsPendingApproval() {
      return this.dashboardStore.jobsPendingApproval
    }
  },
  async created() {
    await this.dashboardStore.fetchDashboardData()
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
    },
    handleDateClick(date) {
      this.selectedDate = date
      // จัดการเมื่อคลิกวันที่ในปฏิทิน
    }
  }
}
</script>
