<template>
  <div class="min-h-screen flex flex-col">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col md:flex-row">
      <!-- Login Form Section -->
      <div class="w-full md:w-1/2 px-4 md:px-12 lg:px-24 flex flex-col justify-center">
        <div class="max-w-md w-full mx-auto">
          <h1 class="text-4xl font-medium text-[#C5B3E6] mt-24 mb-2">Welcome Admin</h1>
          <p class="text-gray-500 mb-8">Enter your email and password to sign in</p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="Your email address"
                class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                :class="{ 'border-red-500': hasError }"
                required
              />
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                v-model="form.password"
                placeholder="Your password"
                class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                :class="{ 'border-red-500': hasError }"
                required
              />
            </div>
            <!-- Error Message -->
            <div v-if="error" class="text-red-500 text-sm text-center">
              {{ error }}
            </div>

            <!-- Sign In Button -->
            <button
              type="submit"
              class="w-full py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:bg-[#B39DDB] transition-colors"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="isLoading">กำลังเข้าสู่ระบบ...</span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>

            <!-- Sign Up Link -->
            <p class="text-center text-sm text-gray-600">
              Don't have an account?
              <router-link to="/signup-admin" class="text-[#CDE45F] hover:underline"
                >Sign up</router-link
              >
            </p>
          </form>
        </div>
      </div>

      <!-- Image Section -->
      <div class="hidden md:block md:w-1/2">
        <div class="signin-bg h-[75vh] rounded-[22px] relative mx-6 my-8">
          <img
            src="../../assets/images/loginbackground.svg"
            alt="Medical consultation"
            class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] max-w-xl"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="py-4 px-4 md:px-12">
      <div class="flex flex-wrap gap-4 text-sm text-gray-500">
        <span
          >Lorem ipsum dolor sit <span class="text-[#CDE45F]">Lorem ipsum</span> &
          <span class="text-[#CDE45F]">Something</span> Lorem ipsum</span
        >
        <div class="flex gap-8 ml-auto">
          <span>Lorem ipsum</span>
          <span>Lorem ipsum</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/stores/adminStore'
import axios from 'axios'
import Swal from 'sweetalert2'

const baseURL = import.meta.env.VITE_API_URL

export default {
  name: 'SignInAdminView',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: '',
      isLoading: false
    }
  },

  computed: {
    hasError() {
      return !!this.error
    },
    isFormValid() {
      return this.form.email && this.form.password
    },
    adminStore() {
      return useAdminStore()
    }
  },

  methods: {
    validateForm() {
      if (!this.form.email) {
        this.error = 'กรุณากรอกอีเมล'
        return false
      }
      if (!this.form.password) {
        this.error = 'กรุณากรอกรหัสผ่าน'
        return false
      }
      return true
    },

    async handleSubmit() {
      if (!this.validateForm()) return

      try {
        // แสดง loading
        Swal.fire({
          title: 'กำลังเข้าสู่ระบบ...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        // 1. Login request
        const response = await axios.post(`${baseURL}/api/admin/login-admin`, {
          email: this.form.email,
          password: this.form.password
        })

        // 2. เก็บ token
        this.adminStore.setToken(response.data.token)

        // แสดง success
        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })

        // 3. Redirect
        this.$router.push('/admin/dashboard')
      } catch (err) {
        // แสดง error
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        })
        this.adminStore.logout()
      }
    },

    resetForm() {
      this.form.email = ''
      this.form.password = ''
      this.error = ''
    }
  },

  beforeUnmount() {
    this.resetForm()
  }
}
</script>
<style>
.signin-bg {
  background-image: url('../../assets/images/loginbackground2.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
