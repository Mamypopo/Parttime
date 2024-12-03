<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800">ลืมรหัสผ่าน</h2>
        <p class="mt-1 text-sm text-gray-500">
          กรุณากรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณ
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="อีเมล"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }}
        </button>

        <div class="text-center">
          <router-link to="/signin-user" class="text-sm text-blue-600 hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: '',
      loading: false
    }
  },
  methods: {
    async handleSubmit() {
      try {
        this.loading = true

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
          { email: this.email }
        )

        await Swal.fire({
          icon: 'success',
          title: 'ส่งลิงก์สำเร็จ',
          text: 'กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })

        this.$router.push('/login')
      } catch (error) {
        console.error('Forgot password error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text:
            error.response?.data?.message ||
            'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
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
