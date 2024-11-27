<template>
  <div class="min-h-screen relative flex flex-col">
    <!-- Background -->
    <div
      class="absolute top-2 left-4 right-4 h-[45vh] bg-cover bg-center rounded-lg bg-register"
    ></div>

    <!-- Content -->
    <div class="relative z-10 flex-grow flex flex-col items-center pt-8 px-4">
      <!-- Welcome Section -->
      <div class="text-center pt-24 pb-5">
        <h1 class="text-3xl font-bold text-white mb-4 animate-fade-in">ยินดีต้อนรับ!</h1>
        <div class="max-w-xl lg:max-w-2xl mx-auto -pt-1 space-y-2 animate-fade-in-up"></div>
      </div>

      <!-- Register Form -->
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-center text-[#3A3A49] mb-8">Register Admin</h2>

        <form @submit.prevent="register" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <!-- Profile Picture -->
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">รูปโปรไฟล์</label>
                <div class="flex items-center space-x-4">
                  <div class="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                    <img
                      v-if="previewImage"
                      :src="previewImage"
                      class="w-full h-full object-cover"
                      alt="Profile Preview"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-gray-400"
                    >
                      <i class="fas fa-user text-2xl"></i>
                    </div>
                  </div>
                  <div class="flex-1">
                    <input
                      type="file"
                      ref="fileInput"
                      accept="image/*"
                      class="hidden"
                      @change="handleFileChange"
                    />
                    <button
                      type="button"
                      @click="$refs.fileInput.click()"
                      class="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <i class="fas fa-upload mr-2"></i>
                      อัพโหลดรูป
                    </button>
                    <p class="mt-1 text-xs text-gray-500">รองรับไฟล์: JPG, PNG ขนาดไม่เกิน 2MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">อีเมล</label>
                <input
                  type="email"
                  v-model="form.email"
                  placeholder="อีเมล"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  v-model="form.password"
                  placeholder="รหัสผ่าน"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  v-model="form.confirmPassword"
                  placeholder="ยืนยันรหัสผ่าน"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">ชื่อ</label>
                <input
                  type="text"
                  v-model="form.first_name"
                  placeholder="ชื่อ"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">นามสกุล</label>
                <input
                  type="text"
                  v-model="form.last_name"
                  placeholder="นามสกุล"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>

              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Admin secret key</label>
                <input
                  type="password"
                  v-model="form.admin_secret"
                  placeholder="Your secret !!!"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  v-model="form.phone"
                  placeholder="เบอร์โทรศัพท์"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="w-full md:w-auto px-8 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-xl hover:bg-[#B39DDB] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="loading">กำลังดำเนินการ...</span>
              <span v-else>SIGN UP</span>
            </button>
            <p class="mt-4 text-[#3A3A49]">
              Already have an account?
              <router-link to="/signin-admin" class="text-[#CDE45F] hover:underline"
                >Sign in</router-link
              >
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone: '',
        admin_secret: '',
        profilePic: null
      },
      previewImage: null,
      loading: false
    }
  },
  methods: {
    async register() {
      try {
        this.loading = true
        this.error = null

        // ตรวจสอบรหัสผ่านตรงกัน
        if (this.form.password !== this.form.confirmPassword) {
          throw new Error('รหัสผ่านไม่ตรงกัน')
        }

        if (!this.form.first_name?.trim()) {
          throw new Error('กรุณากรอกชื่อ')
        }
        if (!this.form.last_name?.trim()) {
          throw new Error('กรุณากรอกนามสกุล')
        }
        if (!this.form.email?.trim()) {
          throw new Error('กรุณากรอกอีเมล')
        }
        if (!this.form.password) {
          throw new Error('กรุณากรอกรหัสผ่าน')
        }
        if (!this.form.admin_secret) {
          throw new Error('กรุณากรอกรหัสลับแอดมิน')
        }

        const formData = new FormData()
        formData.append('email', this.form.email)
        formData.append('password', this.form.password)
        formData.append('first_name', this.form.first_name)
        formData.append('last_name', this.form.last_name)
        formData.append('admin_secret', this.form.admin_secret)

        if (this.form.phone) {
          formData.append('phone', this.form.phone)
        }

        if (this.form.profilePic) {
          formData.append('profile_pic', this.form.profilePic)
        }

        const response = await axios.post(`${this.baseURL}/api/admin/register-admin`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        await Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          text: response.data.message,
          timer: 2000,
          showConfirmButton: false
        })

        this.$router.push('/signin-admin')
      } catch (error) {
        console.error('Registration error:', error.response || error)

        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || error.message,
          timer: 2000,
          showConfirmButton: false
        })
      } finally {
        this.loading = false
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      // ตรวจสอบขนาดไฟล์ (2MB)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'ไฟล์มีขนาดใหญ่เกินไป',
          text: 'กรุณาเลือกไฟล์ขนาดไม่เกิน 2MB'
        })
        return
      }

      // ตรวจสอบประเภทไฟล์
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'ประเภทไฟล์ไม่ถูกต้อง',
          text: 'กรุณาเลือกไฟล์ภาพ JPG หรือ PNG เท่านั้น'
        })
        return
      }

      this.form.profilePic = file
      this.previewImage = URL.createObjectURL(file)
    }
  }
}
</script>

<style>
.bg-register {
  background-image: url('../../assets/images/backgroundregister.svg');
}
</style>
