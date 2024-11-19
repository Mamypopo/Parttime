<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <!-- Average Rating -->
    <div class="text-center mb-4">
      <div class="text-3xl font-bold">{{ averageRating || 0 }}/5</div>
      <div class="text-sm text-gray-500">คะแนนเฉลี่ยทั้งหมด</div>
    </div>

    <!-- Top Users -->
    <div class="space-y-2">
      <div v-for="user in topUsers" :key="user.id" class="flex items-center justify-between p-2">
        <div class="flex items-center gap-2">
          <img
            :src="user.avatar || '/default-avatar.png'"
            class="w-8 h-8 rounded-full object-cover"
            alt="User avatar"
          />
          <span>{{ user.name }}</span>
        </div>
        <div class="flex items-center">
          <span class="text-yellow-500">★</span>
          <span>{{ user.rating }}/5</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserRatings',

  props: {
    // กำหนด props ที่จะรับค่าจาก parent
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
