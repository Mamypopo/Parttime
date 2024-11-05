<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
     <form @submit.prevent="handleSubmit">
    <h1 class="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-6 sm:mb-8">Create Job</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <!-- Left Column -->
      <div class="lg:col-span-5 space-y-4 sm:space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input 
            v-model="form.title"
            type="text"
  class="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"           
   placeholder="title job"
          />
        </div>
  <!-- Start time / End time -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Start time / End time</label>
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <input 
        v-model="form.startDate"
        type="time"
        class="flex-1 px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <input 
        v-model="form.endDate"
        type="time"
        class="flex-1 px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <div class="relative">
        <input 
          v-model="form.date"
          type="date"
          class="w-full sm:w-[140px] px-3 sm:px-4 py-2 border rounded-lg text-gray-400 border-gray-200 bg-purple-50 
          focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>
    </div>
  </div>
  

        <!-- Details -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Details</label>
          <textarea
            v-model="form.details"
            rows="4"
            class="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="details"
          ></textarea>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input 
            v-model="form.location"
            type="text"
            class="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="location"
          />
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-span-7">
        <!-- Positions Header -->
        <div class="flex items-center gap-2 mb-4">
          <label class="text-sm font-medium text-gray-700">ตำแหน่งงาน :</label>
           <button 
             @click="showPositionModal = true"
             type="button"  
             class="px-3 py-1 bg-purple-200 rounded-lg text-sm flex items-center gap-1"
  >
    เพิ่มตำแหน่ง <i class="fas fa-plus"></i>
  </button>
   <!-- Position Modal -->
  <CreatePositionModal
    :is-open="showPositionModal"
    :editing-position="editingPosition"
    @close="closeModal"
    @add-position="addPosition"
  />
        </div>

        <!-- Position Cards -->
     <!-- Position Cards -->
        <div class="space-y-3 sm:space-y-4">
          <div v-for="position in positions" :key="position.id" 
               class="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
              <div>
                <div class="inline-block px-3 py-1 bg-purple-200 rounded-lg mb-2">
                  {{ position.name }}
                </div>
                <div class="space-y-0.5 text-sm text-gray-500">
                  <div>Wage: {{ position.wage }}</div>
                  <div>Details: {{ position.details }}</div>
                  <div>Required people: {{ position.requiredPeople }}</div>
                </div>
              </div>
              <div class="flex gap-3 text-xs">
                <button 
                    @click.prevent="deletePosition(position.id)"
                   type="button" 
                  class="text-red-400 hover:text-red-500 flex items-center gap-1"
                >
                  <i class="fas fa-trash"></i> DELETE
                </button>
                <button 
                 @click.prevent="editPosition(position)"
                   type="button" 
                  class="text-gray-400 hover:text-gray-500 flex items-center gap-1"
                >
                  <i class="fas fa-edit"></i> EDIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Button -->
    <div class="mt-6 sm:mt-8">
      <button
        type="submit"
         :disabled="positions.length === 0"
        class="w-full py-2 sm:py-3 bg-purple-300 text-white rounded-lg hover:bg-purple-400 transition-colors"
        :class="[
      positions.length === 0 
        ? 'bg-gray-300 cursor-not-allowed' 
        : 'bg-purple-300 hover:bg-purple-400'
    ]"
      >
         {{ positions.length === 0 ? 'กรุณาเพิ่มตำแหน่งงานอย่างน้อย 1 ตำแหน่ง' : 'สร้างงาน' }}
     
      </button>
    </div>
    </form>
  </div>
</template>

<script>
import CreatePositionModal from '@/components/admin/Jobs/CreatePositionModal.vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useAdminStore } from '@/stores/adminStore';
export default {
  name: 'CreateJob',
components: {
    CreatePositionModal,

  },
  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL , 
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
      showPositionModal: false,
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
      
        const index = this.positions.findIndex(p => p.id === position.id)
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
    confirmButtonColor: '#d33',
  });

  if (result.isConfirmed) {
    this.positions = this.positions.filter(p => p.id !== id);
    Swal.fire({
      icon: 'success',
      title: 'ลบตำแหน่งสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    });
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

            if (this.positions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถสร้างงานได้',
        text: 'กรุณาเพิ่มตำแหน่งงานอย่างน้อย 1 ตำแหน่ง'
      });
      return;
    }

    if (!this.form.title || !this.form.date || !this.form.startDate || 
        !this.form.endDate || !this.form.location) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
      });
      return;
    }
        const adminStore = useAdminStore();
        const token = adminStore.token; 

  
    const result = await Swal.fire({
      title: 'ยืนยันการสร้างงาน',
      text: 'คุณต้องการสร้างงานนี้ใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) {
      return;
    }
        const jobData = {
          title: this.form.title,
          work_date: this.form.date,
          location: this.form.location,
          start_time: this.formatDateTime(this.form.date, this.form.startDate),
          end_time: this.formatDateTime(this.form.date, this.form.endDate),
          details: this.form.details,
          positions: this.positions.map(pos => ({
            name: pos.name,
            wage: Number(pos.wage),
            details: pos.details,
            required_people: Number(pos.requiredPeople)
          }))
        }
        const response = await axios.post(`${this.baseURL}/api/jobs/create`, jobData, {
          headers: {
            'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}` 
          }
        })

    if (response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'สร้างงานสำเร็จ',
        text: 'งานถูกสร้างเรียบร้อยแล้ว'
      });
        
        this.resetForm()
        this.positions = []
      }
      } catch (error) {
        console.error('Error creating job:', error)
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงาน'
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
    },
  }
}
</script>