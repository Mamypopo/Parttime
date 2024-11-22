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
        <option value="rating">คะแนนสูงสุด</option>
        <option value="jobCount">จำนวนงานมากที่สุด</option>
      </select>
    </div>

    <!-- Average Rating -->
    <div
      class="text-center mb-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-inner"
    >
      <div
        class="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-yellow-400 dark:to-amber-300 bg-clip-text text-transparent mb-3"
      >
        {{ averageRating.toFixed(1) || '0.0' }}
      </div>
      <div class="flex items-center justify-center gap-2 my-3">
        <template v-for="i in 5" :key="i">
          <i
            class="fas fa-star text-xl transition-all duration-300"
            :class="[
              i <= Math.round(averageRating)
                ? 'text-yellow-400 dark:text-yellow-300 animate-pulse'
                : 'text-gray-200 dark:text-gray-600'
            ]"
          ></i>
        </template>
      </div>
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนเฉลี่ยทั้งหมด</div>
    </div>

    <!-- Top Users -->
    <div class="space-y-4">
      <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 px-2">
        ผู้ใช้งานคะแนนสูงสุด
      </div>
      <div
        v-for="(user, index) in paginatedUsers"
        :key="user.id"
        class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
      >
        <div class="flex items-center gap-4">
          <div class="relative">
            <!-- Medal for top 3 -->
            <div
              v-if="index < 3"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-lg transform group-hover:scale-110 transition-transform"
              :class="[getMedalClass(index)]"
            >
              <i class="fas fa-medal"></i>
            </div>
            <img
              :src="
                user.profile_image
                  ? `${userHistoryStore.baseURL}/uploads/profiles/${user.profile_image}`
                  : '/default-avatar.png'
              "
              class="w-12 h-12 rounded-xl object-cover border-2 transition-transform duration-300 group-hover:scale-105"
              :class="[getBorderClass(index)]"
              :alt="user.name"
            />
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <i class="fas fa-briefcase"></i>
              {{ user.jobCount || 0 }} งาน
            </div>
          </div>
        </div>
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
          v-tippy="{ content: `คะแนน: ${user.rating}`, placement: 'left' }"
        >
          <span class="font-semibold text-yellow-600 dark:text-yellow-400">{{
            user.rating.toFixed(1)
          }}</span>
          <i class="fas fa-star text-yellow-400 dark:text-yellow-300"></i>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center gap-2 mt-4">
      <button
        @click="previousPage"
        class="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        :disabled="currentPage === 1"
      >
        ก่อนหน้า
      </button>

      <span class="px-3 py-1 text-sm"> หน้า {{ currentPage }} จาก {{ totalPages }} </span>

      <button
        @click="nextPage"
        class="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        :disabled="currentPage === totalPages"
      >
        ถัดไป
      </button>
    </div>
  </div>
</template>

<script>
import { tippy } from 'vue-tippy'
import { useJobStore } from '@/stores/jobStore'
import { useUserHistoryStore } from '@/stores/userHistoryStore'

export default {
  directives: {
    tippy
  },

  data() {
    return {
      sortOption: 'rating',
      currentPage: 1,
      itemsPerPage: 5,
      userHistoryStore: useUserHistoryStore()
    }
  },
  async created() {
    try {
      await this.userHistoryStore.fetchTopUsersRatings()
    } catch (error) {
      console.error('Error loading ratings:', error)
    }
  },
  computed: {
    averageRating() {
      return this.userHistoryStore.averageRating
    },
    topUsers() {
      return this.userHistoryStore.topUsers
    },
    sortedUsers() {
      return [...this.topUsers].sort((a, b) => {
        if (this.sortOption === 'rating') {
          return b.rating - a.rating
        } else if (this.sortOption === 'jobCount') {
          return b.jobCount - a.jobCount
        }
        return 0
      })
    },
    paginatedUsers() {
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
      if (index === 0)
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'
      if (index === 1) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      if (index === 2) return 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
      return ''
    },
    getBorderClass(index) {
      if (index === 0) return 'border-yellow-400 dark:border-yellow-500'
      if (index === 1) return 'border-gray-300 dark:border-gray-500'
      if (index === 2) return 'border-amber-400 dark:border-amber-500'
      return 'border-transparent'
    }
  }
}
</script>

<style scoped>
/* Gradient text fix for Safari */
[class*='bg-clip-text'] {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
