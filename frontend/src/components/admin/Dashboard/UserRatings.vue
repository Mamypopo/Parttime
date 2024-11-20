<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"
        >
          <i class="fas fa-star text-yellow-500 dark:text-yellow-400"></i>
        </div>
        คะแนนการทำงาน
      </h3>
    </div>

    <!-- Average Rating -->
    <div class="text-center mb-6 relative">
      <div
        class="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-500 dark:from-yellow-400 dark:to-amber-300 bg-clip-text text-transparent"
      >
        {{ averageRating.toFixed(1) || '0.0' }}
      </div>
      <div class="flex items-center justify-center gap-1 my-2">
        <template v-for="i in 5" :key="i">
          <i
            class="fas fa-star text-lg"
            :class="
              i <= Math.round(averageRating)
                ? 'text-yellow-400 dark:text-yellow-300'
                : 'text-gray-300 dark:text-gray-600'
            "
          ></i>
        </template>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">คะแนนเฉลี่ยทั้งหมด</div>
    </div>

    <!-- Top Users -->
    <div class="space-y-3">
      <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        ผู้ใช้งานคะแนนสูงสุด
      </div>
      <div
        v-for="(user, index) in topUsers"
        :key="user.id"
        class="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      >
        <div class="flex items-center gap-3">
          <div class="relative">
            <!-- Medal for top 3 -->
            <div
              v-if="index < 3"
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
              :class="[
                index === 0
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'
                  : index === 1
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
              ]"
            >
              <i class="fas fa-medal"></i>
            </div>
            <img
              :src="user.avatar || '/default-avatar.png'"
              class="w-10 h-10 rounded-full object-cover border-2"
              :class="[
                index === 0
                  ? 'border-yellow-400 dark:border-yellow-500'
                  : index === 1
                    ? 'border-gray-300 dark:border-gray-500'
                    : index === 2
                      ? 'border-amber-400 dark:border-amber-500'
                      : 'border-transparent'
              ]"
              :alt="user.name"
            />
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.jobCount || 0 }} งาน</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-yellow-400 dark:text-yellow-300">{{ user.rating.toFixed(1) }}</span>
          <div class="flex">
            <i class="fas fa-star text-yellow-400 dark:text-yellow-300 text-sm"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserRatings',
  props: {
    averageRating: {
      type: Number,
      default: 0
    },
    topUsers: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
/* Ensure gradient text works in Safari */
[class*='bg-clip-text'] {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
