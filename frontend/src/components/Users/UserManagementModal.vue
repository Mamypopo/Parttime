<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" @close="closeModal" class="relative modal">
      <!-- Backdrop -->
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" @click="closeModal" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <TransitionChild
          enter="duration-300 ease-out"
          enter-from="opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
          enter-to="opacity-100 sm:scale-100 translate-y-0"
          leave="duration-200 ease-in"
          leave-from="opacity-100 sm:scale-100 translate-y-0"
          leave-to="opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
        >
          <HeadlessDialogPanel
            class="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-[20px] shadow-xl overflow-hidden"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 p-6"
            >
              <div class="flex justify-between items-center">
                <HeadlessDialogTitle class="text-2xl font-semibold text-white">
                  {{ isEditing ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่' }}
                </HeadlessDialogTitle>
                <button
                  @click="closeModal"
                  class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <!-- Form -->
            <div class="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- ข้อมูลพื้นฐาน -->
                <div
                  class="p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">ข้อมูลส่วนตัว</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="grid grid-cols-7 gap-3">
                      <div class="col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">คำนำหน้า</label>
                        <select
                          v-model="formData.prefix"
                          class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                          required
                        >
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                      </div>
                      <div class="col-span-4">
                        <label class="block text-sm text-gray-600 mb-1">ชื่อ</label>
                        <input
                          v-model="formData.first_name"
                          type="text"
                          class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">นามสกุล</label>
                      <input
                        v-model="formData.last_name"
                        type="text"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">เลขบัตรประชาชน</label>
                      <input
                        v-model="formData.national_id"
                        type="text"
                        maxlength="13"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                        required
                      />
                    </div>
                    <div class="grid grid-cols-5 gap-3">
                      <div class="col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">เพศ</label>
                        <select
                          v-model="formData.gender"
                          class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                          required
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                        </select>
                      </div>
                      <div class="col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">วันเกิด</label>
                        <div class="date-input-container">
                          <input
                            v-model="formData.birth_date"
                            type="date"
                            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                      <input
                        v-model="formData.phone_number"
                        type="tel"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">Line ID</label>
                      <input
                        v-model="formData.line_id"
                        type="text"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <!-- รหัสผ่าน (เฉพาะเพิ่มใหม่) -->
                <div
                  v-if="!isEditing"
                  class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">Email และ Password</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">อีเมล</label>
                      <input
                        v-model="formData.email"
                        type="email"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
                      <input
                        v-model="formData.password"
                        type="password"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <!-- ทักษะและการศึกษา -->
                <div
                  class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">ทักษะและการศึกษา</h3>
                  <div class="space-y-4">
                    <!-- ทักษะความสามารถ -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">ทักษะความสามารถ</label>
                      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div class="flex flex-wrap gap-2">
                          <label
                            v-for="skill in availableSkills"
                            :key="skill"
                            class="inline-flex items-center px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-200"
                            :class="
                              formData.skills.includes(skill)
                                ? 'bg-purple-100 border-purple-300 text-purple-800'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            "
                          >
                            <input
                              type="checkbox"
                              :value="skill"
                              v-model="formData.skills"
                              class="hidden"
                            />
                            <span class="text-sm">{{ skill }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- เอกสารและรูปภาพ -->
                <div
                  class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">เอกสารและรูปภาพ</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- รูปโปรไฟล์ -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-2">รูปโปรไฟล์</label>
                      <div class="flex items-center space-x-4">
                        <div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                          <img
                            v-if="profilePreview"
                            :src="profilePreview"
                            class="w-full h-full object-cover"
                          />
                          <img
                            v-else-if="formData.profile_image"
                            :src="`${baseURL}/uploads/profiles/${formData.profile_image}`"
                            class="w-full h-full object-cover"
                          />
                          <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-gray-400"
                          >
                            <i class="fas fa-user text-3xl"></i>
                          </div>
                        </div>
                        <div class="flex-1">
                          <input
                            type="file"
                            ref="profileInput"
                            class="hidden"
                            accept="image/*"
                            @change="handleProfileImage"
                          />
                          <button
                            type="button"
                            @click="$refs.profileInput.click()"
                            class="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm w-full transition-all duration-200"
                          >
                            <i class="fas fa-upload mr-2"></i>
                            เลือกรูปใหม่
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- เอกสาร -->
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-2">วุฒิการศึกษา (PDF)</label>
                        <div class="space-y-2">
                          <div
                            v-if="formData.education_certificate && !educationFileName"
                            class="flex items-center gap-2"
                          >
                            <a
                              :href="`${baseURL}/uploads/certificates/${formData.education_certificate}`"
                              target="_blank"
                              class="text-purple-600 hover:text-purple-700 text-sm flex items-center"
                            >
                              <i class="fas fa-file-pdf mr-2"></i>
                              ดูไฟล์ปัจจุบัน
                            </a>
                          </div>
                          <div>
                            <input
                              type="file"
                              ref="educationInput"
                              class="hidden"
                              accept=".pdf"
                              @change="handleEducationFile"
                            />
                            <button
                              type="button"
                              @click="$refs.educationInput.click()"
                              class="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm w-full transition-all duration-200"
                            >
                              <i class="fas fa-upload mr-2"></i>
                              {{ educationFileName || 'อัปโหลดไฟล์ใหม่' }}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm text-gray-600 mb-2"
                          >เอกสารเพิ่มเติม (PDF)</label
                        >
                        <div class="space-y-2">
                          <div
                            v-if="formData.user_documents && !additionalDocsFileName"
                            class="flex items-center gap-2"
                          >
                            <a
                              :href="`${baseURL}/uploads/documents/${formData.user_documents}`"
                              target="_blank"
                              class="text-purple-600 hover:text-purple-700 text-sm flex items-center"
                            >
                              <i class="fas fa-file-pdf mr-2"></i>
                              ดูไฟล์ปัจจุบัน
                            </a>
                          </div>
                          <div>
                            <input
                              type="file"
                              ref="additionalDocsInput"
                              class="hidden"
                              accept=".pdf"
                              @change="handleAdditionalDocs"
                            />
                            <button
                              type="button"
                              @click="$refs.additionalDocsInput.click()"
                              class="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm w-full transition-all duration-200"
                            >
                              <i class="fas fa-upload mr-2"></i>
                              {{ additionalDocsFileName || 'อัปโหลดไฟล์ใหม่' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    class="px-6 py-2.5 text-white bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 rounded-xl hover:opacity-90 transition-all duration-200"
                  >
                    {{ isEditing ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งาน' }}
                  </button>
                </div>
              </form>
            </div>
          </HeadlessDialogPanel>
        </TransitionChild>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>

<script>
import Swal from 'sweetalert2'

import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  DialogTitle as HeadlessDialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'

export default {
  name: 'UserManagementModal',
  components: {
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild
  },
  props: {
    isOpen: Boolean,
    isEditing: Boolean,
    userData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'submit'],

  data() {
    return {
      formData: {
        prefix: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        national_id: '',
        phone_number: '',
        gender: '',
        birth_date: '',
        line_id: '',
        skills: [],
        profile_image: null,
        education_file: null,
        additional_docs: null
      },
      availableSkills: [
        'เอกซเรย์',
        'พยาบาล',
        'น้ำหนัก ส่วนสูง',
        'ทะเบียน',
        'การได้ยิน',
        'เจาะเลือด',
        'เป่าปอด',
        'ตาอาชีวะ',
        'ตาทั่วไป',
        'มวลกระดูก',
        'เก็บปัสสาวะ',
        'คลื่นไฟฟ้าหัวใจ',
        'กล้ามเนื้อ',
        'มะเร็งปากมดลูก',
        'อัลตร้าซาวด์',
        'ผู้ช่วยแพทย์',
        'วัดความดัน',
        'ยานพาหนะ'
      ],
      profilePreview: null,
      educationFileName: null,
      additionalDocsFileName: null,
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
    }
  },

  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.resetForm()
      }
    },
    userData: {
      handler(newValue) {
        if (this.isEditing && newValue) {
          this.formData = JSON.parse(JSON.stringify(newValue))
          if (this.formData.birth_date) {
            this.formData.birth_date = this.formatDateForDisplay(this.formData.birth_date)
          }

          this.formData = {
            ...newValue,
            skills: Array.isArray(newValue.skills)
              ? [...newValue.skills]
              : typeof newValue.skills === 'string'
                ? JSON.parse(newValue.skills || '[]')
                : [],
            birth_date: newValue.birth_date ? this.formatDateForDisplay(newValue.birth_date) : ''
          }
        }
      },
      immediate: true
    }
  },

  methods: {
    async handleSubmit() {
      try {
        if (this.isEditing) {
          await this.handleUpdate()
        } else {
          await this.handleCreate()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message
        })
      }
    },
    async handleCreate() {
      try {
        if (!this.formData.email || !this.formData.password) {
          Swal.fire({
            icon: 'error',
            title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            text: 'กรุณากรอกอีเมลและรหัสผ่าน'
          })
          return
        }

        if (!this.formData.education_file) {
          Swal.fire({
            icon: 'error',
            title: 'กรุณาอัพโหลดเอกสารที่จำเป็น',
            text: 'เอกสารเป็นข้อมูลที่จำเป็น'
          })
          return
        }

        const result = await Swal.fire({
          title: 'ยืนยันการสร้างผู้ใช้',
          text: 'คุณต้องการสร้างผู้ใช้ใหม่ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยันการสร้าง',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#C5B4E3',
          reverseButtons: true
        })

        if (!result.isConfirmed) {
          return
        }

        const formDataToSend = new FormData()

        formDataToSend.append('prefix', this.formData.prefix)
        formDataToSend.append('first_name', this.formData.first_name)
        formDataToSend.append('last_name', this.formData.last_name)
        formDataToSend.append('email', this.formData.email)
        formDataToSend.append('password', this.formData.password)
        formDataToSend.append('national_id', this.formData.national_id)
        formDataToSend.append('phone_number', this.formData.phone_number)
        formDataToSend.append('gender', this.formData.gender)

        formDataToSend.append('birth_date', this.formData.birth_date)
        formDataToSend.append('line_id', this.formData.line_id || '')
        formDataToSend.append('skills', JSON.stringify(this.formData.skills || []))

        if (this.formData.profile_image instanceof File) {
          formDataToSend.append('profile_image', this.formData.profile_image)
        }

        if (this.formData.education_file instanceof File) {
          formDataToSend.append('education_certificate', this.formData.education_file)
        }

        if (this.formData.additional_docs instanceof File) {
          formDataToSend.append('user_documents', this.formData.additional_docs)
        }
        await Swal.fire({
          icon: 'success',
          title: 'สร้างผู้ใช้สำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
        this.$emit('submit', formDataToSend)
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message
        })
      }
    },

    async handleUpdate() {
      try {
        const result = await Swal.fire({
          title: 'ยืนยันการแก้ไข',
          text: 'คุณต้องการแก้ไขข้อมูลผู้ใช้ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยันการแก้ไข',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#C5B4E3',
          reverseButtons: true
        })

        if (!result.isConfirmed) return

        const formDataToSend = new FormData()

        Object.entries(this.formData).forEach(([key, value]) => {
          if (['id', 'created_at', 'updated_at', 'email'].includes(key)) return

          if (value !== null && value !== undefined && value !== '') {
            if (key === 'birth_date') {
              formDataToSend.append(key, this.formatDateForAPI(value))
            } else if (key === 'skills') {
              formDataToSend.append(key, JSON.stringify(value))
            } else if (!['profile_image', 'education_file', 'additional_docs'].includes(key)) {
              formDataToSend.append(key, value)
            }
          }
        })

        if (this.formData.profile_image instanceof File) {
          formDataToSend.append('profile_image', this.formData.profile_image)
        }
        if (this.formData.education_file instanceof File) {
          formDataToSend.append('education_certificate', this.formData.education_file)
        }
        if (this.formData.additional_docs instanceof File) {
          formDataToSend.append('user_documents', this.formData.additional_docs)
        }

        await Swal.fire({
          icon: 'success',
          title: 'แก้ไขผู้ใช้สำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
        this.$emit('submit', formDataToSend)
      } catch (error) {
        console.error('Error in handleUpdate:', error)
      }
    },

    getInitialFormData() {
      return {
        prefix: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        national_id: '',
        phone_number: '',
        gender: '',
        birth_date: '',
        line_id: '',
        skills: [],
        profile_image: null,
        education_file: null,
        additional_docs: null
      }
    },

    resetForm() {
      this.formData = {
        prefix: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        national_id: '',
        phone_number: '',
        gender: '',
        birth_date: '',
        line_id: '',
        skills: [],
        profile_image: null,
        education_file: null,
        additional_docs: null
      }
      this.profilePreview = null
      this.educationFileName = ''
      this.additionalDocsFileName = ''

      if (this.$refs.profileInput) this.$refs.profileInput.value = ''
      if (this.$refs.educationInput) this.$refs.educationInput.value = ''
      if (this.$refs.additionalDocsInput) this.$refs.additionalDocsInput.value = ''
    },

    closeModal() {
      this.$emit('close')
      this.resetForm()
      this.formData = this.getInitialFormData()
    },

    handleProfileImage(event) {
      const file = event.target.files[0]
      if (file) {
        this.formData.profile_image = file
        this.profilePreview = URL.createObjectURL(file)
      }
    },

    handleEducationFile(event) {
      const file = event.target.files[0]
      if (file) {
        this.formData.education_file = file
        this.educationFileName = file.name
      }
    },
    handleAdditionalDocs(event) {
      const file = event.target.files[0]
      if (file) {
        this.formData.additional_docs = file
        this.additionalDocsFileName = file.name
      }
    },
    formatDateForDisplay(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    },

    formatDateForAPI(dateString) {
      if (!dateString) return null
      return new Date(dateString).toISOString()
    }
  }
}
</script>

<style scoped>
.date-input-container {
  position: relative;
}

.date-input-container::after {
  content: '\f133';
  font-family: 'Font Awesome 5 Free';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
}

input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}
</style>
