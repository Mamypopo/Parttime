<template>
  <div class="min-h-screen relative flex flex-col bg-gradient-to-br from-[#ece9e6] to-[#ffffff]">
    <!-- Hero Background -->
    <div
      class="absolute ml-5 mr-5 top-0 left-0 right-0 h-[45vh] bg-gradient-to-r from-[#C5B4E3] via-[#EAC6FC] to-[#B7E4E0] rounded-b-[30px] opacity-95"
    >
      <!-- Decorative Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Gradient Orbs -->
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
            <p class="text-gray-500">เข้าสู่ระบบเพื่อจัดการระบบ</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">อีเมล</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="กรอกอีเมลของคุณ"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EAC6FC]/50 transition-all duration-200 placeholder:text-gray-400"
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
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EAC6FC]/50 transition-all duration-200 placeholder:text-gray-400"
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
              class="w-full py-3 bg-gradient-to-r from-[#C5B4E3] via-[#EAC6FC] to-[#B7E4E0] text-white rounded-xl hover:shadow-lg hover:shadow-[#EAC6FC]/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <span v-if="isLoading">กำลังเข้าสู่ระบบ...</span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>

            <!-- Sign Up Link -->
            <p class="text-center text-sm text-gray-600">
              ยังไม่มีบัญชี?
              <router-link
                to="/signup-admin"
                class="text-[#C5B4E3] hover:text-[#EAC6FC] transition-colors duration-200"
              >
                สมัครสมาชิก
              </router-link>
            </p>
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
            <div class="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#C5B4E3]"></div>
            <div class="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-[#EAC6FC]"></div>
            <div class="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-[#B7E4E0]"></div>
          </div>

          <!-- Welcome Text -->
          <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">ยินดีต้อนรับสู่ระบบ Admin</h2>
            <p class="text-gray-600">จัดการระบบได้อย่างมีประสิทธิภาพ</p>
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
            ระบบจัดการข้อมูลบุคลากร <span class="text-[#C5B4E3]">Healthcare</span> &
            <span class="text-[#C5B4E3]">Medical</span> Services
          </div>
          <div class="flex gap-8 text-sm">
            <button
              @click="showPrivacyModal = true"
              class="hover:text-[#c779d0] transition-colors cursor-pointer"
            >
              นโยบายความเป็นส่วนตัว
            </button>
            <router-link to="/contact">
              <span class="hover:text-[#c779d0] transition-colors cursor-pointer">ติดต่อเรา</span>
            </router-link>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="sm:hidden flex flex-col items-center space-y-3 text-gray-600">
          <div class="text-sm text-center">
            ระบบจัดการข้อมูลบุคลากร
            <div class="mt-1">
              <span class="text-[#C5B4E3]">Healthcare</span> &
              <span class="text-[#C5B4E3]">Medical</span> Services
            </div>
          </div>
          <div class="flex gap-4 text-sm">
            <button
              @click="showPrivacyModal = true"
              class="hover:text-[#c779d0] transition-colors cursor-pointer"
            >
              นโยบายความเป็นส่วนตัว
            </button>

            <router-link to="/contact">
              <span class="hover:text-[#c779d0] transition-colors cursor-pointer">ติดต่อเรา</span>
            </router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>

  <!-- Privacy Policy Modal -->
  <TransitionRoot appear :show="showPrivacyModal" as="template">
    <Dialog as="div" @close="showPrivacyModal = false" class="relative z-50">
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
            >
              <DialogTitle as="h3" class="text-xl font-medium text-gray-900 mb-4">
                นโยบายความเป็นส่วนตัว
              </DialogTitle>
              <div class="mt-4 text-sm text-gray-600 space-y-4 max-h-[60vh] overflow-y-auto">
                <!-- เนื้อหานโยบายความเป็นส่วนตัว -->
                <p>1. การเก็บรวบรวมข้อมูล</p>
                <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลที่จำเป็นสำหรับการสมัครงาน เช่น:</p>
                <ul class="list-disc pl-6 space-y-2">
                  <li>ชื่อ-นามสกุล</li>
                  <li>ที่อยู่อีเมล</li>
                  <li>หมายเลขโทรศัพท์</li>
                  <li>ที่อยู่</li>
                  <li>รูปถ่าย</li>
                  <li>วุฒิการศึกษา</li>
                  <li>ประวัติการทำงาน</li>
                  <li>เอกสารประกอบการสมัครงาน</li>
                </ul>

                <p>2. วัตถุประสงค์ในการใช้ข้อมูล</p>
                <p>เราใช้ข้อมูลของคุณเพื่อ:</p>
                <ul class="list-disc pl-6 space-y-2">
                  <li>พิจารณาคุณสมบัติในการสมัครงาน</li>
                  <li>ติดต่อสื่อสารเกี่ยวกับการสมัครงาน</li>
                  <li>จัดเก็บประวัติผู้สมัครงาน</li>
                  <li>บริหารจัดการทรัพยากรบุคคล</li>
                </ul>

                <p>3. การรักษาความปลอดภัย</p>
                <p>
                  เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการสูญหาย การเข้าถึง การใช้
                  หรือการเปิดเผยข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต
                </p>

                <p>4. สิทธิของคุณ</p>
                <p>คุณมีสิทธิที่จะ:</p>
                <ul class="list-disc pl-6 space-y-2">
                  <li>เข้าถึงข้อมูลส่วนบุคคลของคุณ</li>
                  <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                  <li>ลบข้อมูลของคุณ</li>
                  <li>คัดค้านการประมวลผลข้อมูล</li>
                </ul>
              </div>
              <div class="mt-6 flex justify-end">
                <button
                  @click="showPrivacyModal = false"
                  class="px-4 py-2 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  ปิด
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { useAdminStore } from '@/stores/adminStore'
import api from '@/services/axios'
import Swal from 'sweetalert2'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

export default {
  name: 'SignInAdminView',
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      showPrivacyModal: false,
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
        Swal.fire({
          title: 'กำลังเข้าสู่ระบบ...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        const response = await api.post('/api/admin/login-admin', {
          email: this.form.email,
          password: this.form.password
        })

        this.adminStore.setToken(response.data.token)

        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })

        this.$router.push('/admin/dashboard')
      } catch (err) {
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
