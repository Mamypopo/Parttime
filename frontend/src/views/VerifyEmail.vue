<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4"
  >
    <div class="max-w-md w-full">
      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-lg p-8 text-center">
        <template>
          <div
            v-if="status === 'verifying'"
            class="text-center space-y-6 transition-opacity duration-300"
          >
            <!-- Loading Animation -->
            <div class="relative w-20 h-20 mx-auto">
              <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div
                class="absolute inset-0 border-4 border-[#c779d0] rounded-full border-t-transparent animate-spin"
              ></div>
            </div>

            <!-- Loading Text -->
            <h2 class="text-2xl font-semibold text-blue-600">กำลังตรวจสอบ</h2>
            <p class="text-gray-500">กรุณารอสักครู่ ระบบกำลังยืนยันข้อมูลของคุณ</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/service/axios'
import Swal from 'sweetalert2'

export default {
  name: 'VerifyEmail',
  data() {
    return {
      status: 'verifying'
    }
  },
  computed: {
    token() {
      return this.$route.query.token
    }
  },
  async created() {
    if (!this.token) {
      this.showError('ไม่พบ Token สำหรับยืนยันอีเมล')
      return
    }

    try {
      await api.get('/api/users/verify-email', {
        params: { token: this.token }
      })
      await this.showSuccess()
    } catch (error) {
      this.showError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล')
    }
  },
  methods: {
    async showSuccess() {
      const result = await Swal.fire({
        html: `
        <div class="space-y-6 py-3">
          <!-- Icon Container -->
          <div class="relative">
            <!-- Gradient Background Circle -->
            <div class="absolute -inset-4 bg-gradient-to-r from-[#b993d6] to-[#8ca6db] rounded-full opacity-20 blur-lg"></div>
            <!-- Icon Circle -->
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-gradient-to-r from-[#b993d6] to-[#8ca6db]">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <!-- Text Content -->
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-gray-800">ยืนยันอีเมลสำเร็จ</h3>
            <p class="text-gray-500">บัญชีของคุณพร้อมใช้งานแล้ว สามารถเข้าสู่ระบบได้ทันที</p>
          </div>
        </div>
      `,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'เข้าสู่ระบบ',
        cancelButtonText: 'กลับหน้าหลัก',
        customClass: {
          popup: 'rounded-[20px] p-6',
          confirmButton:
            'bg-gradient-to-r from-[#b993d6] to-[#8ca6db] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#c779d0]/20 transition-all duration-300 focus:outline-none transform hover:-translate-y-0.5',
          cancelButton:
            'bg-gray-50 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 focus:outline-none',
          actions: 'space-x-3 mt-6',
          htmlContainer: 'my-4'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        showCloseButton: false
      })

      if (result.isConfirmed) {
        this.$router.push('/signin-user')
      } else {
        this.$router.push('/')
      }
    },

    async showError(message) {
      const result = await Swal.fire({
        html: `
        <div class="space-y-6 py-3">
          <!-- Icon Container -->
          <div class="relative">
            <!-- Red Glow Effect -->
            <div class="absolute -inset-4 bg-red-500/20 rounded-full opacity-20 blur-lg"></div>
            <!-- Icon Circle -->
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-red-50">
              <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
          <!-- Text Content -->
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-gray-800">เกิดข้อผิดพลาด</h3>
            <p class="text-gray-500">${message}</p>
          </div>
        </div>
      `,
        showConfirmButton: true,
        confirmButtonText: 'กลับหน้าหลัก',
        customClass: {
          popup: 'rounded-[20px] p-6',
          confirmButton:
            'bg-gradient-to-r from-[#b993d6] to-[#8ca6db] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#c779d0]/20 transition-all focus:outline-none duration-300 transform hover:-translate-y-0.5',
          htmlContainer: 'my-4'
        },

        buttonsStyling: false,
        allowOutsideClick: false,
        showCloseButton: false
      })

      if (result.isConfirmed) {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style>
/* Animation for smooth appearance */
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.swal2-popup {
  @apply font-sans;
}

.swal2-title {
  @apply !p-0 !m-0;
}

.swal2-html-container {
  @apply !p-0 !m-0 !overflow-visible;
}

.swal2-actions {
  @apply !mt-0 !w-full;
}

/* Animation */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
