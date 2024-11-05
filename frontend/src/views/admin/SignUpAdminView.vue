<template>
  <div class="min-h-screen relative flex flex-col">
    <!-- Background -->
    <div class="absolute top-2 left-4 right-4 h-[45vh] bg-cover bg-center rounded-lg bg-register"></div>

    <!-- Content -->
    <div class="relative z-10 flex-grow flex flex-col items-center pt-8 px-4">
      <!-- Welcome Section -->
     <div class="text-center pt-24 pb-5">
  <h1 class="text-4xl font-bold text-white mb-4 animate-fade-in">Welcome!</h1>
  <div class="max-w-xl lg:max-w-2xl mx-auto -pt-1 space-y-2 animate-fade-in-up">
  </div>
</div>

      <!-- Register Form -->
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-center  text-[#3A3A49] mb-8">Register Admin</h2>
        
        <form @submit.prevent="register" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Email</label>
                <input 
                  type="email" 
                  v-model="form.email"
                  placeholder="Your email address"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                >
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Password</label>
                <input 
                  type="password" 
                  v-model="form.password"
                  placeholder="Your password"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                >
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Confirm password</label>
                <input 
                  type="password" 
                  v-model="form.confirmPassword"
                  placeholder="Confirm your password"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                >
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Firstname</label>
                <input 
                  type="text" 
                  v-model="form.firstname"
                  placeholder="Your firstname"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                >
              </div>
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Lastname</label>
                <input 
                  type="text" 
                  v-model="form.lastname"
                  placeholder="Your lastname"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                >
              </div>
              
              <div>
                <label class="block text-sm text-[#3A3A49] mb-1">Admin secret key</label>
                <input 
                  type="password" 
                  v-model="form.secretKey"
                  placeholder="Your secret !!!"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B7E4E0]"
                >
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center pt-4">
           <button 
  type="submit"
  :disabled="loading"
  class="w-full md:w-auto px-8 py-2.5 bg-[#C5B3E6] text-white rounded-xl hover:bg-[#B39DDB] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
>
  <span v-if="loading">กำลังดำเนินการ...</span>
  <span v-else>SIGN UP</span>
</button>
            <p class="mt-4 text-[#3A3A49]">
              Already have an account? 
              <router-link to="/signin-admin" class="text-[#CDE45F] hover:underline">Sign in</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
        baseURL: import.meta.env.VITE_API_URL,
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        firstname: '', // ยังใช้ชื่อเดิมใน form
        lastname: '', // ยังใช้ชื่อเดิมใน form
        secretKey: '', // ยังใช้ชื่อเดิมใน form
        profilePic: null
      },
      profileFileName: '',
      loading: false
    }
  },
  methods: {
  async register() {
    try {
      this.loading = true;
      this.error = null;

      // ตรวจสอบรหัสผ่านตรงกัน
      if (this.form.password !== this.form.confirmPassword) {
        throw new Error('รหัสผ่านไม่ตรงกัน');
      }

      // ส่งข้อมูลแบบ JSON แทน FormData
      const payload = {
        email: this.form.email,
        password: this.form.password,
        first_name: this.form.firstname,
        last_name: this.form.lastname,
        admin_secret: this.form.secretKey
      };


      const response = await axios.post(
        `${this.baseURL}/api/admin/register-admin`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // ถ้าสำเร็จ แสดง success message และ redirect
      await Swal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จ',
        text: response.data.message,
        timer: 2000,
        showConfirmButton: false
      });

      this.$router.push('/signin-admin');

    } catch (error) {
      console.error('Registration error:', error.response || error);
      
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || error.message,
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      this.loading = false;
    }
  }
}
}
</script>

<style>
.bg-register {
  background-image: url('../../assets/images/backgroundregister.svg');
}

</style>