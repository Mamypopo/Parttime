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
    <div
      class="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:px-12 lg:px-24"
    >
      <!-- Login Form Section -->
      <div class="w-full max-w-md">
        <div class="bg-white/90 rounded-[20px] shadow-xl p-8 animate-fade-in">
          <!-- Welcome Text -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-semibold text-[#c779d0] mb-2">ยินดีต้อนรับกลับมา</h1>
            <p class="text-gray-500">เข้าสู่ระบบเพื่อใช้งาน</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">อีเมล</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="กรอกอีเมลของคุณ"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                :class="{ 'border-red-500': hasError }"
                required
              />
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                v-model="form.password"
                placeholder="กรอกรหัสผ่านของคุณ"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                :class="{ 'border-red-500': hasError }"
                required
              />
            </div>

            <!-- Error Message -->
            <div v-if="error" class="text-red-500 text-sm text-center animate-fade-in">
              {{ error }}
            </div>

            <!-- Sign In Button -->
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full py-3 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-xl hover:shadow-lg hover:shadow-[#c779d0]/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">กำลังเข้าสู่ระบบ...</span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>

            <!-- Links -->
            <div class="space-y-2">
              <p class="text-center text-sm text-gray-600">
                <router-link
                  to="/forgot-password"
                  class="text-[#c779d0] hover:text-[#feac5e] transition-colors duration-200"
                >
                  ลืมรหัสผ่าน?
                </router-link>
              </p>
              <p class="text-center text-sm text-gray-600">
                ยังไม่มีบัญชี?
                <router-link
                  to="/signup-user"
                  class="text-[#c779d0] hover:text-[#feac5e] transition-colors duration-200"
                >
                  สมัครสมาชิก
                </router-link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Decorative Right Section -->
      <div class="hidden md:block md:w-1/2 mt-20 animate-fade-in-up">
        <div
          class="h-[75vh] rounded-[30px] relative mx-6 my-8 bg-white/30 backdrop-blur-sm shadow-xl overflow-hidden"
        >
          <!-- Decorative Patterns -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#feac5e]"></div>
            <div class="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-[#c779d0]"></div>
            <div class="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-[#4bc0c8]"></div>
          </div>

          <!-- Welcome Text -->
          <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">ยินดีต้อนรับกลับมา</h2>
            <p class="text-gray-600">เข้าสู่ระบบเพื่อใช้งาน</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white/80 backdrop-blur-sm py-4 sm:py-6 mt-auto">
      <div class="max-w-5xl mx-auto px-4 lg:px-8">
        <!-- Desktop & Tablet Layout -->
        <div class="hidden sm:flex justify-between items-center text-gray-600">
          <div class="text-sm">
            ระบบจัดการข้อมูลบุคลากร <span class="text-[#c779d0]">Healthcare</span> &
            <span class="text-[#c779d0]">Medical</span> Services
          </div>
          <div class="flex gap-8 text-sm">
            <span class="hover:text-[#c779d0] transition-colors cursor-pointer"
              >นโยบายความเป็นส่วนตัว</span
            >
            <span class="hover:text-[#c779d0] transition-colors cursor-pointer">ติดต่อเรา</span>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="sm:hidden flex flex-col items-center space-y-3 text-gray-600">
          <div class="text-sm text-center">
            ระบบจัดการข้อมูลบุคลากร
            <div class="mt-1">
              <span class="text-[#c779d0]">Healthcare</span> &
              <span class="text-[#c779d0]">Medical</span> Services
            </div>
          </div>
          <div class="flex gap-4 text-sm">
            <span class="hover:text-[#c779d0] transition-colors cursor-pointer"
              >นโยบายความเป็นส่วนตัว</span
            >
            <span class="hover:text-[#c779d0] transition-colors cursor-pointer">ติดต่อเรา</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import axios from 'axios'
import Swal from 'sweetalert2'

const baseURL = import.meta.env.VITE_API_URL

export default {
  name: 'SignInView',

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
    userStore() {
      return useUserStore()
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
        Swal.fire({
          title: 'กำลังเข้าสู่ระบบ...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        const response = await axios.post(`${baseURL}/api/users/login`, {
          email: this.form.email,
          password: this.form.password
        })

        this.userStore.setToken(response.data.token)

        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          text: 'ยินดีต้อนรับกลับมา',
          showConfirmButton: false,
          timer: 1500
        })

        this.$router.push('/user/dashboard')
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        })
        this.userStore.logout()
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
/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover Effects */
input:hover {
  @apply border-[#CDE45F]/50;
}
</style>
