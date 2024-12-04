<template>
  <div :class="{ dark: sidebarStore.isDarkMode }">
    <div class="min-h-screen dark:bg-gray-900 transition-colors duration-300">
      <!-- แสดง Navbar เฉพาะเมื่อไม่ได้อยู่ใน route ของ admin หรือ user -->
      <header v-if="!isAuthenticatedRoute">
        <Navbar />
      </header>
      <RouterView />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar/Navbar.vue'
import { useSidebarStore } from '@/stores/sidebarStore'

export default {
  name: 'App',

  components: {
    Navbar
  },

  data() {
    return {
      sidebarStore: useSidebarStore()
    }
  },
  computed: {
    isAuthenticatedRoute() {
      const authenticatedRoutes = ['/admin', '/user']
      return authenticatedRoutes.some((route) => this.$route.path.startsWith(route))
    }
  },
  mounted() {
    // โหลดค่า theme จาก localStorage เมื่อแอพเริ่มทำงาน
    this.sidebarStore.initializeTheme()
  }
}
</script>

<style>
/* global styles สำหรับ dark mode */
.dark {
  color-scheme: dark;
}

/* transition effect เมื่อเปลี่ยน theme */
* {
  transition-property: color, background-color, border-color;
  transition-duration: 300ms;
}

/* ป้องกัน transition ในบาง elements ที่ไม่ต้องการ */
.no-transition {
  transition: none !important;
}

/*  smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* ปรับแต่ง scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
