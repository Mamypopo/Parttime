<template>
  <div class="space-y-6">
    <!-- Calendar Section -->
    <JobCalendar @select-job="handleSelectJob" />

    <!-- Job Detail Modal -->
    <JobDetailModal :is-open="showJobDetail" :job="selectedJob" @close="closeJobDetail" />
  </div>
</template>

<script>
import JobCalendar from '@/components/admin/Dashboard/JobCalendar.vue'
import JobDetailModal from '@/components/admin/Jobs/JobDetailModal.vue'

export default {
  name: 'AdminDashboard',

  components: {
    JobCalendar,
    JobDetailModal
  },

  data() {
    return {
      showJobDetail: false,
      selectedJob: null
    }
  },

  methods: {
    handleSelectJob(job) {
      this.selectedJob = job
      this.showJobDetail = true
    },

    closeJobDetail() {
      this.showJobDetail = false
      this.selectedJob = null
    }
  }
}
</script>
