<template>
  <div class="p-6 ml-6">
    <div
      class="rounded-lg p-4 md:p-8 min-h-screen bg-white transition-all duration-500 ease-in-out"
    >
      <JobCalendar />
    </div>
  </div>
</template>

<script>
import JobCalendar from '@/components/admin/Dashboard/JobCalendar.vue'

export default {
  name: 'AdminDashboard',

  components: {
    JobCalendar
  }
}
</script>
