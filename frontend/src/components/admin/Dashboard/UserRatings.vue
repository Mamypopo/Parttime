<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <h3 class="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 flex items-center justify-center shadow-inner"
        >
          <i class="fas fa-star text-yellow-500 dark:text-yellow-400 text-lg"></i>
        </div>
        <span>คะแนนการทำงาน</span>
      </h3>
      <select
        v-model="sortOption"
        class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:border-yellow-400 dark:hover:border-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
      >
        <option value="rating">เรียงตามคะแนน</option>
        <option value="jobCount">เรียงตามจำนวนงาน</option>
      </select>
    </div>

    <!-- Average Rating -->
    <div
      class="text-center mb-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-inner"
    >
      <div
        class="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-yellow-400 dark:to-amber-300 bg-clip-text text-transparent mb-3"
      >
        {{ Number(averageRating).toFixed(1) }}
      </div>
      <div class="flex items-center justify-center gap-2 my-3">
        <i
          v-for="i in 5"
          :key="i"
          class="fas fa-star text-xl transition-all duration-300"
          :class="
            i <= Math.round(averageRating)
              ? 'text-yellow-400 dark:text-yellow-300 animate-pulse'
              : 'text-gray-200 dark:text-gray-600'
          "
        ></i>
      </div>
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนเฉลี่ยทั้งหมด</div>
    </div>

    <!-- Top Users List -->
    <div class="space-y-4">
      <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 px-2">
        {{ sortOption === 'rating' ? 'ผู้ใช้งานคะแนนสูงสุด' : 'ผู้ใช้งานที่รับงานมากที่สุด' }}
      </div>

      <!-- User List -->
      <div v-if="paginatedUsers.length" class="space-y-3">
        <div
          v-for="(user, index) in paginatedUsers"
          :key="user.id"
          class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
        >
          <!-- User Info -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <div
                v-if="index < 3"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-lg transform group-hover:scale-110 transition-transform"
                :class="getMedalClass(index)"
              >
                <i class="fa-solid fa-fire"></i>
              </div>
              <div class="relative w-12 h-12">
                <img
                  v-if="user.profile_image && user.profile_image.trim() !== ''"
                  :src="dashboardStore.getProfileImageUrl(user.profile_image)"
                  :alt="user.name"
                  class="w-12 h-12 rounded-xl object-cover border-2 transition-transform duration-300 group-hover:scale-105"
                  :class="getBorderClass(index)"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 text-white font-semibold flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-105"
                  :class="getBorderClass(index)"
                >
                  {{ user.name?.split(' ')[0]?.charAt(0).toUpperCase() || '?' }}
                </div>
              </div>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <i class="fas fa-briefcase"></i>
                {{ user.jobCount || 0 }} งาน
              </div>
            </div>
          </div>

          <!-- Score Display -->
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            v-tippy="{
              content: `คะแนนเฉลี่ย: ${user.averageScores?.total?.toFixed(1) || '0.0'}`,
              placement: 'left'
            }"
          >
            <span class="font-semibold" :class="getTotalScoreClass(user.averageScores?.total)">
              {{ user.averageScores?.total?.toFixed(1) || '0.0' }}
            </span>
            <i class="fas fa-star" :class="getTotalScoreClass(user.averageScores?.total)"></i>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        ไม่พบข้อมูลผู้ใช้งาน
      </div>

      <!-- Pagination -->
      <div v-if="paginatedUsers.length" class="flex justify-center gap-2 mt-6">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 text-sm rounded-lg transition-colors"
          :class="[
            currentPage === 1
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          ก่อนหน้า
        </button>
        <span class="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
          หน้า {{ currentPage }} จาก {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 text-sm rounded-lg transition-colors"
          :class="[
            currentPage === totalPages
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          ถัดไป
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { tippy } from 'vue-tippy'
import { useDashboardStore } from '@/stores/dashboardStore'

export default {
  directives: {
    tippy
  },

  data() {
    return {
      sortOption: 'rating',
      currentPage: 1,
      itemsPerPage: 5,
      dashboardStore: useDashboardStore()
    }
  },

  async created() {
    try {
      await this.dashboardStore.fetchTopUsersRatings()
    } catch (error) {
      console.error('Error loading ratings:', error)
    }
  },

  computed: {
    averageRating() {
      return this.dashboardStore.averageRating || 0
    },
    topUsers() {
      return (
        this.dashboardStore.topUsers?.map((user) => ({
          id: user.id,
          name: user.name,
          profile_image: user.profile_image,
          jobCount: user.jobCount || 0,
          averageScores: {
            total: user.averageScores?.total || 0,
            appearance: user.averageScores?.appearance || 0,
            manner: user.averageScores?.manner || 0,
            punctuality: user.averageScores?.punctuality || 0,
            quality: user.averageScores?.quality || 0,
            quantity: user.averageScores?.quantity || 0
          }
        })) || []
      )
    },
    sortedUsers() {
      if (!this.topUsers?.length) return []

      return [...this.topUsers].sort((a, b) => {
        if (this.sortOption === 'rating') {
          return (b.averageScores?.total || 0) - (a.averageScores?.total || 0)
        } else if (this.sortOption === 'jobCount') {
          return (b.jobCount || 0) - (a.jobCount || 0)
        }
        return 0
      })
    },
    paginatedUsers() {
      if (!this.sortedUsers) return []
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.sortedUsers.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.sortedUsers.length / this.itemsPerPage)
    }
  },

  methods: {
    previousPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    getMedalClass(index) {
      const classes = {
        0: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/50 dark:text-yellow-300', // อันดับ 1
        1: 'bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-300', // อันดับ 2
        2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' // อันดับ 3
      }
      return classes[index] || ''
    },

    getBorderClass(index) {
      const classes = {
        0: 'border-yellow-500 dark:border-yellow-400', // อันดับ 1
        1: 'border-slate-400 dark:border-slate-500', // อันดับ 2
        2: 'border-amber-600 dark:border-amber-500' // อันดับ 3
      }
      return classes[index] || 'border-transparent'
    },

    getTotalScoreClass(rating) {
      const numRating = Number(rating) || 0
      if (numRating >= 8) return 'text-green-600 dark:text-green-400' // ดีมาก
      if (numRating >= 6) return 'text-yellow-600 dark:text-yellow-400' // ดี
      if (numRating >= 4) return 'text-orange-600 dark:text-orange-400' // พอใช้
      return 'text-red-600 dark:text-red-400' // ต้องปรับปรุง
    }
  }
}
</script>

<style scoped>
[class*='bg-clip-text'] {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
