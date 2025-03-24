<template>
  <div class="min-h-screen relative flex flex-col bg-gradient-to-br from-[#ece9e6] to-[#ffffff]">
    <!-- Hero Background -->
    <div
      class="absolute top-0 left-0 right-0 h-[45vh] bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] rounded-b-[30px] opacity-95"
    >
      <!-- Decorative Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div
          class="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
        ></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="bg-white/90 backdrop-blur-sm rounded-[20px] shadow-xl p-8 animate-fade-in">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-[#c779d0] mb-2">ตั้งรหัสผ่านใหม่</h2>
            <p class="text-gray-500 text-sm">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-4">
              <input
                type="password"
                v-model="password"
                placeholder="รหัสผ่านใหม่"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
              />

              <input
                type="password"
                v-model="confirmPassword"
                placeholder="ยืนยันรหัสผ่านใหม่"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            <!-- Password Requirements -->
            <div class="text-xs text-gray-500 space-y-1">
              <p class="flex items-center gap-1">
                <span class="w-4 h-4 inline-flex items-center justify-center">
                  <i :class="[password.length >= 8 ? 'text-green-500' : 'text-gray-300']">✓</i>
                </span>
                รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
              </p>
              <p class="flex items-center gap-1">
                <span class="w-4 h-4 inline-flex items-center justify-center">
                  <i
                    :class="[
                      password === confirmPassword && password ? 'text-green-500' : 'text-gray-300'
                    ]"
                    >✓</i
                  >
                </span>
                รหัสผ่านตรงกัน
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading || !isPasswordValid"
              class="w-full py-3 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                กำลังบันทึก...
              </span>
              <span v-else>บันทึกรหัสผ่านใหม่</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/axios'
import Swal from 'sweetalert2'

export default {
  name: 'ResetPasswordView',
  data() {
    return {
      password: '',
      confirmPassword: '',
      loading: false,
      token: this.$route.query.token
    }
  },
  computed: {
    isPasswordValid() {
      return this.password && this.password === this.confirmPassword && this.password.length >= 8
    }
  },

  created() {
    // รับ token จาก URL parameters
    this.token = this.$route.query.token
    console.log('Token from URL:', this.token)

    // ตรวจสอบว่ามี token หรือไม่
    if (!this.token) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบ Token',
        text: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        this.$router.push('/signin-user')
      })
    }
  },
  methods: {
    async handleSubmit() {
      try {
        this.loading = true

        const response = await api.post('/api/auth/reset-password', {
          token: this.token,
          password: this.password
        })

        await Swal.fire({
          icon: 'success',
          title: 'เปลี่ยนรหัสผ่านสำเร็จ',
          text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })

        this.$router.push('/signin-user')
      } catch (error) {
        console.error('Reset password error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style scoped>
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
