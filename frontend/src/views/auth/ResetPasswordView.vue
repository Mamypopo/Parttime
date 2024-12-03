<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800">ตั้งรหัสผ่านใหม่</h2>
        <p class="mt-1 text-sm text-gray-500">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="รหัสผ่านใหม่"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="ยืนยันรหัสผ่านใหม่"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !isPasswordValid"
          class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'ResetPasswordView',
  data() {
    return {
      password: '',
      confirmPassword: '',
      loading: false
    }
  },
  computed: {
    isPasswordValid() {
      return this.password && this.password === this.confirmPassword && this.password.length >= 8
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isPasswordValid) {
        Swal.fire({
          icon: 'error',
          title: 'รหัสผ่านไม่ถูกต้อง',
          text: 'กรุณาตรวจสอบว่ารหัสผ่านตรงกันและมีความยาวอย่างน้อย 8 ตัวอักษร',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })
        return
      }

      try {
        this.loading = true

        const token = this.$route.params.token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
          {
            token,
            password: this.password
          }
        )

        await Swal.fire({
          icon: 'success',
          title: 'เปลี่ยนรหัสผ่านสำเร็จ',
          text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3B82F6'
        })

        this.$router.push('/login')
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
