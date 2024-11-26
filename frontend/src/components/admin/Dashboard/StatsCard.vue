<template>
  <div
    class="bg-white dark:bg-gray-800/95 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-lg transition-all duration-300 relative overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 relative">
      <h3 class="text-gray-800 dark:text-gray-200 text-sm font-medium flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :class="getBackgroundClass"
        >
          <i :class="[icon, getTextClass, 'text-xl']"></i>
        </div>
        {{ title }}
      </h3>
      <!-- เพิ่มปุ่ม Export สำหรับการ์ดค่าใช้จ่าย -->
      <button
        v-if="title === 'ค่าใช้จ่าย'"
        @click="$emit('export')"
        class="p-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
        title="Export รายงานค่าใช้จ่าย"
      >
        <i class="fas fa-file-export"></i>
      </button>
    </div>

    <!-- Main Value -->
    <div class="flex items-baseline gap-2 relative mb-2">
      <div class="flex flex-col">
        <div class="text-3xl font-semibold" :class="getTextClass">
          {{ value }}
        </div>
        <!-- การแสดงเดือนเมื่อเป็นค่าใช้จ่าย -->
        <div v-if="title === 'ค่าใช้จ่าย'" class="text-sm text-gray-500 dark:text-gray-400">
          เดือน {{ subStats[1].month }}
        </div>
      </div>
      <div v-if="unit" class="text-sm text-gray-700 dark:text-gray-300 font-medium">
        {{ unit }}
      </div>
    </div>

    <!-- Sub Stats -->
    <div
      v-if="subStats"
      class="space-y-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50 relative"
    >
      <div
        v-for="(stat, index) in formattedSubStats"
        :key="index"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-gray-700 dark:text-gray-300">{{ stat.label }}</span>
        <span class="font-medium" :class="getTextClass">
          {{ stat.value }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'StatsCard',
  emits: ['export'],
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
      default: 'blue',
      validator: function (value) {
        return ['blue', 'purple', 'emerald', 'teal', 'orange'].indexOf(value) !== -1
      }
    },
    unit: {
      type: String,
      default: null
    },
    trend: {
      type: Number,
      default: null
    },
    subStats: {
      type: Array,
      default: null
    }
  },
  computed: {
    mainValue() {
      return this.value
    },
    formattedSubStats() {
      return this.subStats
    },
    getBackgroundClass() {
      const classes = {
        blue: 'bg-blue-100 dark:bg-blue-500/20',
        purple: 'bg-purple-100 dark:bg-purple-500/20',
        emerald: 'bg-emerald-100 dark:bg-emerald-500/20',
        teal: 'bg-teal-100 dark:bg-teal-500/20',
        orange: 'bg-orange-100 dark:bg-orange-500/20'
      }
      return classes[this.color]
    },
    getTextClass() {
      const classes = {
        blue: 'text-blue-600 dark:text-blue-300',
        purple: 'text-purple-600 dark:text-purple-300',
        emerald: 'text-emerald-600 dark:text-emerald-300',
        teal: 'text-teal-600 dark:text-teal-300',
        orange: 'text-orange-600 dark:text-orange-300'
      }
      return classes[this.color]
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

/* Subtle hover animation */
.hover\:shadow-md:hover {
  transform: translateY(-1px);
}

/* Pattern overlay in dark mode */
.dark .mix-blend-overlay {
  mix-blend-mode: overlay;
}
</style>
