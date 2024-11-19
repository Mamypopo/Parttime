<template>
  <div class="bg-white p-4 rounded-xl shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-gray-500 text-sm">{{ title }}</h3>
      <i :class="[icon, `text-${color}-500`]"></i>
    </div>

    <!-- Main Value -->
    <div class="text-2xl font-bold mb-2">
      {{ value }}
    </div>

    <!-- Sub Stats (ถ้ามี) -->
    <div v-if="subStats" class="space-y-1">
      <div
        v-for="(stat, index) in subStats"
        :key="index"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-gray-500">{{ stat.label }}</span>
        <span class="font-medium">{{ stat.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'blue'
    },
    subStats: {
      type: Array,
      default: null
    }
  }
}
</script>
