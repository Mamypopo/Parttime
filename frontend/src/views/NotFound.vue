<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3494e6] to-[#ec6ead] text-white p-6"
  >
    <div class="text-center space-y-6">
      <!-- 404 Icon -->
      <div class="relative">
        <!-- Shadow Layer -->
        <div class="text-[12rem] font-extrabold opacity-30 blur-md select-none">404</div>
        <!-- Front Layer -->
        <div
          class="absolute top-0 left-0 w-full text-[10rem] font-extrabold text-white drop-shadow-lg animate-bounce"
        >
          404
        </div>
      </div>

      <!-- Main Title -->
      <h1 class="text-3xl md:text-4xl font-bold drop-shadow-sm">
        อุ๊บส์! ไม่พบหน้าที่คุณกำลังค้นหา
      </h1>

      <!-- Subtitle -->
      <p class="text-lg text-white/80">หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือไม่มีอยู่จริง</p>

      <!-- Actions -->
      <div class="flex justify-center space-x-4">
        <button
          @click="$router.go(-1)"
          class="flex items-center px-6 py-3 rounded-lg bg-white text-purple-700 font-medium shadow-md hover:bg-gray-100 hover:shadow-lg transition duration-200"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          ย้อนกลับ
        </button>
        <button
          @click="clearAndGoHome"
          class="flex items-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-medium shadow-md text-white transition duration-200"
        >
          <i class="fas fa-home mr-2"></i>
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAdminStore } from '@/stores/adminStore'
import api from '@/services/axios'

const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()

const clearAndGoHome = () => {
  // เคลียร์ข้อมูลทั้งหมด
  localStorage.clear()
  userStore.logout()
  adminStore.logout()
  delete api.defaults.headers.common['Authorization']

  // กลับหน้าหลัก
  router.push('/')
}
</script>

<style scoped>
.bounce-error {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
</style>
