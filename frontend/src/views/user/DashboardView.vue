<template>
  <div class="p-6 space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800">
            สวัสดี, {{ userStore.user?.first_name }}
          </h1>
          <p class="text-gray-500 mt-1">ยินดีต้อนรับกลับมา</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">วันที่วันนี้</p>
          <p class="text-lg font-medium text-gray-800">{{ currentDate }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- งานที่ได้รับมอบหมาย -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">งานที่ได้รับมอบหมาย</p>
            <h3 class="text-2xl font-semibold mt-1">5</h3>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-tasks text-blue-500 text-xl"></i>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/user/tasks" class="text-sm text-blue-500 hover:underline">
            ดูรายละเอียด →
          </router-link>
        </div>
      </div>

      <!-- งานที่กำลังทำ -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">งานที่กำลังทำ</p>
            <h3 class="text-2xl font-semibold mt-1">2</h3>
          </div>
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-spinner text-green-500 text-xl"></i>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/user/tasks" class="text-sm text-green-500 hover:underline">
            ดูรายละเอียด →
          </router-link>
        </div>
      </div>

      <!-- การแจ้งเตือน -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">การแจ้งเตือน</p>
            <h3 class="text-2xl font-semibold mt-1">3</h3>
          </div>
          <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <i class="fas fa-bell text-yellow-500 text-xl"></i>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/user/notifications" class="text-sm text-yellow-500 hover:underline">
            ดูรายละเอียด →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Tasks -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-lg font-semibold mb-4">งานล่าสุด</h2>
      <div class="space-y-4">
        <div
          v-for="task in recentTasks"
          :key="task.id"
          class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                task.status === 'pending'
                  ? 'bg-yellow-50 text-yellow-500'
                  : task.status === 'in_progress'
                    ? 'bg-blue-50 text-blue-500'
                    : 'bg-green-50 text-green-500'
              ]"
            >
              <i
                :class="[
                  'fas',
                  task.status === 'pending'
                    ? 'fa-clock'
                    : task.status === 'in_progress'
                      ? 'fa-spinner'
                      : 'fa-check'
                ]"
              ></i>
            </div>
            <div>
              <h3 class="font-medium">{{ task.title }}</h3>
              <p class="text-sm text-gray-500">{{ task.workplace }}</p>
            </div>
          </div>
          <div class="text-right">
            <p
              class="text-sm font-medium"
              :class="[
                task.status === 'pending'
                  ? 'text-yellow-500'
                  : task.status === 'in_progress'
                    ? 'text-blue-500'
                    : 'text-green-500'
              ]"
            >
              {{ task.statusText }}
            </p>
            <p class="text-sm text-gray-500">{{ task.date }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Preview -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">ตารางงานวันนี้</h2>
        <router-link to="/user/schedule" class="text-sm text-cyan-500 hover:underline">
          ดูทั้งหมด →
        </router-link>
      </div>
      <div class="space-y-3">
        <div
          v-for="schedule in todaySchedule"
          :key="schedule.id"
          class="flex items-center gap-4 p-3 border rounded-lg"
        >
          <div class="w-16 text-center">
            <p class="text-sm text-gray-500">{{ schedule.time }}</p>
          </div>
          <div class="flex-1">
            <h4 class="font-medium">{{ schedule.title }}</h4>
            <p class="text-sm text-gray-500">{{ schedule.workplace }}</p>
          </div>
          <div class="w-24 text-right">
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full',
                schedule.status === 'upcoming'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-green-50 text-green-600'
              ]"
            >
              {{ schedule.statusText }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'

export default {
  name: 'DashboardView',

  setup() {
    const userStore = useUserStore()

    const currentDate = ref(
      new Date().toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    )

    const recentTasks = ref([
      {
        id: 1,
        title: 'พนักงานเสิร์ฟ',
        workplace: 'ร้านอาหารบ้านสวน',
        status: 'in_progress',
        statusText: 'กำลังทำงาน',
        date: '15 มี.ค. 2024'
      },
      {
        id: 2,
        title: 'แคชเชียร์',
        workplace: 'ร้านกาแฟ Morning',
        status: 'pending',
        statusText: 'รอดำเนินการ',
        date: '16 มี.ค. 2024'
      },
      {
        id: 3,
        title: 'พนักงานจัดเรียงสินค้า',
        workplace: 'ซุปเปอร์มาร์เก็ต ABC',
        status: 'completed',
        statusText: 'เสร็จสิ้น',
        date: '14 มี.ค. 2024'
      }
    ])

    const todaySchedule = ref([
      {
        id: 1,
        time: '09:00',
        title: 'พนักงานเสิร์ฟ',
        workplace: 'ร้านอาหารบ้านสวน',
        status: 'upcoming',
        statusText: 'กำลังจะถึง'
      },
      {
        id: 2,
        time: '14:00',
        title: 'แคชเชียร์',
        workplace: 'ร้านกาแฟ Morning',
        status: 'completed',
        statusText: 'เสร็จสิ้น'
      }
    ])

    return {
      userStore,
      currentDate,
      recentTasks,
      todaySchedule
    }
  }
}
</script>
