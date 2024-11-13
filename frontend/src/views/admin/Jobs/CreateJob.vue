<template>
  <div class="p-6 ml-6">
    <!-- เพิ่ม padding เพื่อให้มีระยะห่างจาก sidebar -->
    <div class="mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b">
        <h1 class="text-xl sm:text-2xl font-semibold text-[#3A3A49]">สร้างงานใหม่</h1>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <!-- Left Column -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ชื่องาน <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="ระบุชื่องาน"
              />
            </div>

            <!-- Start time / End time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                เวลาเริ่ม/สิ้นสุด <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-4">
                <input
                  v-model="form.startDate"
                  type="time"
                  class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
                <input
                  v-model="form.endDate"
                  type="time"
                  class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
                <input
                  v-model="form.date"
                  type="date"
                  class="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                สถานที่ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.location"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="ระบุสถานที่"
              />
            </div>

            <!-- Details -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
              <textarea
                v-model="form.details"
                rows="4"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="รายละเอียดเพิ่มเติม"
              ></textarea>
            </div>
          </div>

          <!-- Right Column -->
          <div class="lg:col-span-7">
            <!-- Positions Header -->
            <div class="flex items-center justify-between mb-4">
              <label class="text-sm font-medium text-gray-700"
                >ตำแหน่งงาน <span class="text-red-500">*</span></label
              >
              <button
                @click="showPositionModal = true"
                type="button"
                class="px-4 py-2 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <i class="fas fa-plus mr-2"></i>เพิ่มตำแหน่ง
              </button>
            </div>

            <!-- Position Cards -->
            <div class="space-y-4">
              <div
                v-for="position in positions"
                :key="position.id"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="inline-block px-3 py-1 bg-purple-200 rounded-lg mb-2">
                      {{ position.name }}
                    </div>
                    <div class="space-y-1 text-sm text-gray-600">
                      <div>ค่าแรง: {{ position.wage }} บาท</div>
                      <div>จำนวนที่ต้องการ: {{ position.requiredPeople }} คน</div>
                      <div>รายละเอียด: {{ position.details || '-' }}</div>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <button
                      @click.prevent="editPosition(position)"
                      type="button"
                      class="text-[#6DB5DE] hover:text-[#5D9CEC] transition-colors"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click.prevent="deletePosition(position.id)"
                      type="button"
                      class="text-[#E98585] hover:text-[#da7171] transition-colors"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Position State -->
            <div
              v-if="positions.length === 0"
              class="text-center py-8 bg-gray-50 rounded-lg text-gray-500"
            >
              <i class="fas fa-users text-3xl mb-2 text-[#F3C998]"></i>
              <p>ยังไม่มีตำแหน่งงาน</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-8 text-center">
          <button
            type="submit"
            :disabled="positions.length === 0"
            class="px-6 py-3 text-white rounded-lg transition-colors"
            :class="[
              positions.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] hover:opacity-90'
            ]"
          >
            {{ positions.length === 0 ? 'กรุณาเพิ่มตำแหน่งงานอย่างน้อย 1 ตำแหน่ง' : 'สร้างงาน' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Position Modal -->
    <CreatePositionModal
      :is-open="showPositionModal"
      :editing-position="editingPosition"
      @close="closeModal"
      @add-position="addPosition"
    />
  </div>
</template>

<script>
import CreatePositionModal from '@/components/admin/Jobs/CreatePositionModal.vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useJobStore } from '@/stores/jobStore'
import { useAdminStore } from '@/stores/adminStore'
import router from '@/router'
export default {
  name: 'CreateJob',
  components: {
    CreatePositionModal
  },
  data() {
    return {
      jobStore: useJobStore(),

      baseURL: import.meta.env.VITE_API_URL,
      form: {
        title: '',
        startDate: '',
        date: '',
        endDate: '',
        details: '',
        location: ''
      },
      positions: [],
      editingPosition: null,
      selectedSkills: [],
      showPositionModal: false
    }
  },
  created() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    this.form.date = `${year}-${month}-${day}`
  },
  methods: {
    addPosition(position) {
      if (this.editingPosition) {
        const index = this.positions.findIndex((p) => p.id === position.id)
        if (index !== -1) {
          this.positions[index] = {
            id: position.id,
            name: position.position,
            wage: position.wage,
            details: position.detail,
            requiredPeople: position.requiredPeople
          }
        }
      } else {
        this.positions.push({
          id: Date.now(),
          name: position.position,
          wage: position.wage,
          details: position.detail,
          requiredPeople: position.requiredPeople
        })
      }
      this.closeModal()
    },
    async deletePosition(id) {
      const result = await Swal.fire({
        title: 'ยืนยันการลบตำแหน่ง',
        text: 'คุณแน่ใจหรือไม่ที่จะลบตำแหน่งงานนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#d33'
      })

      if (result.isConfirmed) {
        this.positions = this.positions.filter((p) => p.id !== id)
        Swal.fire({
          icon: 'success',
          title: 'ลบตำแหน่งสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
      }
    },
    editPosition(position) {
      this.editingPosition = {
        id: position.id,
        name: position.name,
        wage: position.wage,
        requiredPeople: position.requiredPeople,
        details: position.details
      }
      this.showPositionModal = true
    },

    async handleSubmit() {
      try {
        // ตรวจสอบข้อมูล
        this.jobStore.validateJobData(this.form, this.positions)

        const result = await Swal.fire({
          title: 'ยืนยันการสร้างงาน',
          text: 'คุณต้องการสร้างงานนี้ใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก'
        })

        if (!result.isConfirmed) return

        const jobData = {
          title: this.form.title,
          work_date: this.form.date,
          location: this.form.location,
          start_time: this.jobStore.formatDateTime(this.form.date, this.form.startDate),
          end_time: this.jobStore.formatDateTime(this.form.date, this.form.endDate),
          details: this.form.details,
          positions: this.positions.map((pos) => ({
            name: pos.name,
            wage: Number(pos.wage),
            details: pos.details,
            required_people: Number(pos.requiredPeople)
          }))
        }

        await this.jobStore.createJob(jobData)

        await Swal.fire({
          icon: 'success',
          title: 'สร้างงานสำเร็จ',
          text: 'งานถูกสร้างเรียบร้อยแล้ว'
        })

        // รีเซ็ตฟอร์มและข้อมูล
        this.resetForm()
        this.positions = []

        // นำทางไปยังหน้างานทั้งหมด
        this.$router.push({
          name: 'JobManagement',
          query: {
            refresh: 'true'
          }
        })
      } catch (error) {
        console.error('Error creating job:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'เกิดข้อผิดพลาดในการสร้างงาน'
        })
      }
    },
    formatDateTime(date, time) {
      if (!date || !time) return null
      const [hours, minutes] = time.split(':')
      const dateObj = new Date(date)
      dateObj.setHours(hours)
      dateObj.setMinutes(minutes)
      return dateObj.toISOString()
    },

    resetForm() {
      this.form = {
        title: '',
        date: '',
        startDate: '',
        endDate: '',
        details: '',
        location: ''
      }
      this.editingPosition = null
    },
    closeModal() {
      this.showPositionModal = false
      this.editingPosition = null
    }
  }
}
</script>
