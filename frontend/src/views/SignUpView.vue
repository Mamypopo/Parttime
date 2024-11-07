<template>
  <div class="min-h-screen relative flex flex-col">
    <div
      class="absolute top-2 left-4 right-4 h-[45vh] bg-cover bg-center rounded-lg bg-register"
    ></div>

    <!-- Content Section -->
    <div class="relative z-10">
      <!-- Welcome Section -->
      <div class="text-center pt-24 pb-5">
        <h1 class="text-4xl font-bold text-white mb-4 animate-fade-in">Welcome!</h1>
        <div class="max-w-xl lg:max-w-2xl mx-auto -pt-1 space-y-2 animate-fade-in-up">
          <p class="text-sm lg:text-base text-white/80">
            Find the perfect part-time opportunity that matches your skills and schedule
          </p>
        </div>
      </div>

      <!-- Register Form -->
      <div class="max-w-5xl mx-auto px-4 lg:px-8 bg-white rounded-[15px] shadow-md pt-4 mb-8">
        <h2 class="text-2xl font-semibold text-center mb-8 text-[#3A3A49]">Register</h2>

        <form @submit.prevent="register" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <!-- คอลัมน์ซ้าย:  -->
            <div class="space-y-4">
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="text-base lg:text-lg font-medium text-[#3A3A49] mb-4">
                  Personal information
                </h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-7 gap-3">
                    <div class="col-span-3">
                      <label class="block text-sm text-[#3A3A49] mb-1">Prefix</label>
                      <select
                        v-model="form.prefix"
                        class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="" disabled selected>Select</option>
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                      </select>
                    </div>
                    <div class="col-span-4">
                      <label class="block text-sm text-[#3A3A49] mb-1">Firstname</label>
                      <input
                        type="text"
                        v-model="form.firstname"
                        placeholder="Your firstname"
                        class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Lastname</label>
                    <input
                      type="text"
                      v-model="form.lastname"
                      placeholder="Your lastname"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div class="grid grid-cols-5 gap-3">
                    <div class="col-span-2">
                      <label class="block text-sm text-[#3A3A49] mb-1">Gender</label>
                      <select
                        v-model="form.gender"
                        class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="" disabled selected class="text-gray-300">gender</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                      </select>
                    </div>

                    <div class="col-span-3">
                      <label class="block text-sm text-[#3A3A49] mb-1">Birthdate</label>
                      <div class="relative">
                        <input
                          type="date"
                          v-model="form.birthdate"
                          placeholder="dd/mm/yyyy"
                          class="w-full px-4 py-2 rounded-[15px] text-gray-400 bg-gray-50 border border-gray-200 date-input focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />

                        <i
                          class="fa-regular fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-[#C5B4E3]"
                        ></i>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">National ID</label>
                    <input
                      type="text"
                      v-model="form.nationalId"
                      placeholder="Your national ID"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Line ID</label>
                    <input
                      type="text"
                      v-model="form.lineId"
                      placeholder="Your Line ID"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- คอลัมน์กลาง: -->
            <div class="space-y-4">
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-medium text-[#3A3A49] mb-4">Email Password</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Email</label>
                    <input
                      type="email"
                      v-model="form.email"
                      placeholder="Your email address"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Password</label>
                    <input
                      type="password"
                      v-model="form.password"
                      placeholder="Your password"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Confirm password</label>
                    <input
                      type="password"
                      v-model="form.confirmPassword"
                      placeholder="Confirm your password"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      :class="{ 'border-red-300': !passwordsMatch && form.confirmPassword }"
                    />
                  </div>
                  <!-- <p v-if="form.confirmPassword && !passwordsMatch" 
       class="text-red-500 text-xs mt-1">
      รหัสผ่านไม่ตรงกัน
    </p> -->
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Phone number</label>
                    <input
                      type="tel"
                      v-model="form.phone"
                      placeholder="Your phone number"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- คอลัมน์ขวา:  -->
            <div class="space-y-4">
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-medium text-[#3A3A49] mb-4">Other information</h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm text-[#3A3A49] mb-1">Profile</label>
                      <button
                        type="button"
                        @click="$refs.profileInput.click()"
                        class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 flex items-center gap-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <i class="fa-regular fa-user text-[#C5B4E3]"></i>
                        <span class="truncate">{{ profileFileName || 'Upload' }}</span>
                      </button>
                      <input
                        type="file"
                        ref="profileInput"
                        @change="handleFileChange('profilePic', $event)"
                        class="hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-[#3A3A49] mb-1">Education</label>
                      <button
                        type="button"
                        @click="$refs.educationInput.click()"
                        class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 flex items-center gap-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      >
                        <i class="fa-regular fa-file text-[#C5B4E3]"></i>
                        <span class="truncate">{{ educationFileName || 'Upload' }}</span>
                      </button>
                      <input
                        type="file"
                        ref="educationInput"
                        @change="handleFileChange('educationCertificate', $event)"
                        class="hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Documents</label>
                    <button
                      type="button"
                      @click="$refs.documentsInput.click()"
                      class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 flex items-center gap-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      <i class="fa-regular fa-file text-[#C5B4E3]"></i>
                      <span class="truncate">{{
                        documentsCount ? `${documentsCount} files` : 'Upload'
                      }}</span>
                    </button>
                    <input
                      type="file"
                      multiple
                      ref="documentsInput"
                      @change="handleFileChange('documents', $event)"
                      class="hidden"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-[#3A3A49] mb-1">Skills</label>
                    <div class="bg-gray-50 p-2 rounded-[15px] border border-gray-200">
                      <div class="flex flex-wrap gap-1.5">
                        <label
                          v-for="skill in availableSkills"
                          :key="skill"
                          class="inline-flex items-center px-2.5 py-1 rounded-full border text-sm cursor-pointer hover:bg-gray-100"
                          :class="
                            form.skills.includes(skill)
                              ? 'bg-purple-100 border-purple-300'
                              : 'bg-white border-gray-200'
                          "
                        >
                          <input
                            type="checkbox"
                            :value="skill"
                            v-model="form.skills"
                            class="hidden"
                          />
                          <span class="text-sm">{{ skill }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ฉันยอมรับ ข้อกำหนดการใช้งาน -->
          <div class="text-sm text-[#3A3A49] text-center mt-4">
            <label class="flex items-center gap-3 justify-center">
              <input
                type="checkbox"
                v-model="form.acceptTerms"
                class="w-6 h-6 sm:w-5 sm:h-5 rounded text-purple-500"
              />
              <span>
                ฉันยอมรับ
                <a href="#" class="text-[#CDE45F] hover:underline">ข้อกำหนดการใช้งาน</a> และ
                <a href="#" class="text-[#CDE45F] hover:underline">นโยบายความเป็นส่วนตัว</a>
              </span>
            </label>
            <!-- เพิ่ม error message -->
            <p v-if="showTermsError" class="text-red-500 text-sm mt-2">
              กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว
            </p>
          </div>

          <!-- ปุ่ม Submit -->
          <div class="text-center pb-9">
            <button
              type="submit"
              class="px-8 py-2.5 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:bg-[#B39DDB] transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <span>SIGN UP</span>
            </button>

            <p class="mt-4 text-gray-600">
              Already have an account?
              <router-link to="/signin-user" class="text-[#CDE45F] hover:underline"
                >Sign in</router-link
              >
            </p>
          </div>
        </form>
      </div>
    </div>
    <!-- Footer -->
    <footer class="bg-[#ffffff] py-8 mt-auto">
      <div class="max-w-4xl lg:max-w-5xl mx-auto px-4 lg:px-8 flex justify-between text-gray-600">
        <div>
          Lorem ipsum dolor sit <span class="text-[#CDE45F]">Lorem ipsum</span> &
          <span class="text-[#CDE45F]">Something</span> Lorem ipsum
        </div>
        <div class="flex gap-8">
          <span>Lorem ipsum</span>
          <span>Lorem ipsum</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

const baseURL = import.meta.env.VITE_API_URL

export default {
  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        nationalId: '',
        prefix: '',
        gender: '',
        firstname: '',
        lastname: '',
        birthdate: '',
        phone: '',
        lineId: '',
        skills: [] // array สำหรับเก็บ skills
      },
      // สำหรับแสดงชื่อไฟล์ที่เลือก
      profileFileName: '',
      educationFileName: '',
      documentsCount: 0,

      // รายการ skills ที่เลือกได้
      availableSkills: [
        'X-ray',
        'Nurse',
        'Medic',
        'Register',
        'Ear exam',
        'Blood test',
        'Blowing lungs'
      ],
      loading: false,
      passwordsMatch: true,
      showTermsError: null
    }
  },

  methods: {
    validateForm() {
      // เช็คข้อมูลที่จำเป็น
      const requiredFields = {
        email: 'อีเมล',
        password: 'รหัสผ่าน',
        firstname: 'ชื่อ',
        lastname: 'นามสกุล',
        nationalId: 'เลขบัตรประชาชน',
        phone: 'เบอร์โทรศัพท์',
        birthdate: 'วันเกิด'
      }

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!this.form[field]) {
          Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูลให้ครบ',
            text: `กรุณากรอก${label}`,
            timer: 1500,
            showConfirmButton: false
          })
          return false
        }
      }

      // เช็คไฟล์ที่จำเป็น
      const profileInput = this.$refs.profileInput
      const educationInput = this.$refs.educationInput

      if (!profileInput?.files[0]) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกรูปโปรไฟล์',
          timer: 1500,
          showConfirmButton: false
        })
        return false
      }

      if (!educationInput?.files[0]) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกไฟล์วุฒิการศึกษา',
          timer: 1500,
          showConfirmButton: false
        })
        return false
      }

      return true
    },
    handleFileChange(type, event) {
      if (!event || !event.target || !event.target.files) {
        console.error('Invalid file event')
        return
      }

      const files = event.target.files

      switch (type) {
        case 'profilePic':
          if (files[0]) {
            this.profileFileName = files[0].name
          }
          break

        case 'educationCertificate':
          if (files[0]) {
            this.educationFileName = files[0].name
          }
          break

        case 'documents':
          if (files.length) {
            this.documentsCount = files.length
          }
          break

        default:
          console.error('Unknown file type:', type)
      }
    },
    async register() {
      if (!this.validateForm()) return

      try {
        // แสดง loading
        Swal.fire({
          title: 'กำลังลงทะเบียน...',
          text: 'กรุณารอสักครู่',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        const formData = new FormData()

        // เพิ่มข้อมูลทั่วไป
        formData.append('email', this.form.email)
        formData.append('password', this.form.password)
        formData.append('prefix', this.form.prefix)
        formData.append('first_name', this.form.firstname)
        formData.append('last_name', this.form.lastname)
        formData.append('national_id', this.form.nationalId)
        formData.append('gender', this.form.gender)
        formData.append('birth_date', this.form.birthdate)
        formData.append('phone_number', this.form.phone)
        formData.append('line_id', this.form.lineId)
        formData.append('skills', JSON.stringify(this.form.skills))

        // เพิ่มไฟล์
        const profileInput = this.$refs.profileInput
        const educationInput = this.$refs.educationInput
        const documentsInput = this.$refs.documentsInput

        if (profileInput?.files[0]) {
          formData.append('profile_image', profileInput.files[0])
        }

        if (educationInput?.files[0]) {
          formData.append('education_certificate', educationInput.files[0])
        }

        if (documentsInput?.files) {
          Array.from(documentsInput.files).forEach((file) => {
            formData.append('user_documents', file)
          })
        }

        // ส่งข้อมูลไปยัง API
        const response = await axios.post(`${baseURL}/api/users/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        // แสดง success message
        await Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          text: response.data.message || 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
          showConfirmButton: false,
          timer: 2000
        })

        // redirect ไปหน้า login
        this.$router.push('/signin-user')
      } catch (error) {
        console.error('Registration error:', error)

        // แสดง error message
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง'
        })
      }
    }
  }
}
</script>
<style>
.bg-register {
  background-image: url('../assets/images/backgroundregister.svg');
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
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

.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.date-input::before {
  content: attr(placeholder);
  width: 100%;
  color: #9ca3af;
}

.date-input:focus::before,
.date-input:valid::before {
  display: none;
}
</style>
