<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="fixed inset-0 z-50 overflow-y-auto" v-if="show">
      <TransitionChild
        enter="transition-opacity duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" @click="closeModal" />
      </TransitionChild>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 rounded-t-2xl border-b bg-gradient-to-r from-[#6ED7D1] to-[#9899ee]"
          >
            <h3 class="text-xl font-semibold text-white flex items-center">
              <i class="fas fa-edit text-white mr-2"></i>

              แก้ไขงาน
            </h3>
            <button
              @click="closeModal"
              class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            >
              <i class="fas fa-xmark text-xl"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-4 md:p-5 space-y-4">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- ข้อมูลพื้นฐาน -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heading text-[#81E2C4] mr-1"></i>
                    ชื่องาน
                  </label>
                  <input
                    v-model="formData.title"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-location-dot text-[#81E2C4] mr-1"></i>
                    สถานที่
                  </label>
                  <input
                    v-model="formData.location"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-day text-[#81E2C4] mr-1"></i>
                    วันที่ทำงาน
                  </label>
                  <input
                    v-model="formData.work_date"
                    type="date"
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock text-[#81E2C4] mr-1"></i>
                    เวลาทำงาน
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="formData.start_time"
                      type="time"
                      class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                    <span class="text-gray-500">-</span>
                    <input
                      v-model="formData.end_time"
                      type="time"
                      class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- รายละเอียดงาน -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-align-left text-[#81E2C4] mr-1"></i>
                  รายละเอียดงาน
                </label>
                <textarea
                  v-model="formData.details"
                  rows="3"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                ></textarea>
              </div>

              <!-- ตำแหน่งงาน -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="text-lg font-medium flex items-center">
                    <i class="fas fa-users text-[#81E2C4] mr-2"></i>
                    ตำแหน่งงาน
                  </h4>
                  <button
                    type="button"
                    @click="addPosition"
                    class="px-3 py-1.5 text-sm bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 flex items-center"
                  >
                    <i class="fas fa-plus mr-1"></i>
                    เพิ่มตำแหน่ง
                  </button>
                </div>

                <!-- รายการตำแหน่งงาน -->
                <div
                  v-for="(position, index) in formData.positions"
                  :key="index"
                  class="border rounded-lg bg-gray-50"
                >
                  <!-- หัวข้อตำแหน่ง -->
                  <div
                    class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    @click="togglePosition(index)"
                  >
                    <h5 class="font-medium flex items-center">
                      <i class="fas fa-user-tie text-[#81E2C4] mr-2"></i>
                      ตำแหน่งที่ {{ index + 1 }}: {{ position.name || 'ตำแหน่งใหม่' }}
                    </h5>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        @click.stop="removePosition(index)"
                        class="text-[#EA6B6B] hover:text-[#e95757] p-1 hover:bg-red-50 rounded"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                      <i
                        :class="[
                          'fas transition-transform duration-300',
                          expandedPositions[index]
                            ? 'fa-chevron-up rotate-0'
                            : 'fa-chevron-down -rotate-180'
                        ]"
                      ></i>
                    </div>
                  </div>

                  <!-- รายละเอียดตำแหน่ง -->
                  <transition name="expand" @enter="startTransition" @leave="startTransition">
                    <div v-show="expandedPositions[index]" class="overflow-hidden">
                      <div class="p-4 border-t">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              <i class="fas fa-tag text-[#81E2C4] mr-1"></i>
                              ชื่อตำแหน่ง
                            </label>
                            <div class="relative">
                              <span
                                class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
                              >
                                <i class="fas fa-user-tie text-sm"></i>
                              </span>
                              <input
                                type="text"
                                v-model="position.name"
                                @click="position.showList = true"
                                @blur="handlePositionBlur(index)"
                                readonly
                                class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                                placeholder="เลือกตำแหน่ง"
                                required
                              />
                              <span
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                              >
                                <i class="fas fa-chevron-down text-sm"></i>
                              </span>

                              <!-- Position List Dropdown -->
                              <div
                                v-if="position.showList"
                                class="absolute z-50 w-full bg-gray-100 rounded-lg shadow-lg border border-purple-100 max-h-48 overflow-y-auto"
                              >
                                <div class="p-2 space-y-1">
                                  <button
                                    v-for="option in positionOptions"
                                    :key="option.value"
                                    type="button"
                                    class="block w-full text-left px-3 py-2 hover:bg-[#C5B4E3] hover:bg-opacity-40 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                                    @click="selectPosition(index, option)"
                                  >
                                    {{ option.label }}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              <i class="fas fa-coins text-[#81E2C4] mr-1"></i>
                              ค่าจ้าง (บาท)
                            </label>
                            <input
                              v-model.number="position.wage"
                              type="number"
                              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                              required
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              <i class="fas fa-users text-[#81E2C4] mr-1"></i>
                              จำนวนที่ต้องการ
                            </label>
                            <input
                              v-model.number="position.required_people"
                              type="number"
                              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                              required
                            />
                          </div>
                        </div>

                        <div class="mt-4">
                          <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-circle-info text-[#81E2C4] mr-1"></i>
                            รายละเอียดตำแหน่ง
                          </label>
                          <textarea
                            v-model="position.details"
                            rows="2"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-3 p-4 md:p-5 border-t">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center"
            >
              <i class="fas fa-xmark mr-1"></i>
              ยกเลิก
            </button>
            <button
              @click="handleSubmit"
              class="px-4 py-2 text-sm bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-lg hover:opacity-90 flex items-center"
            >
              <i class="fas fa-save mr-1"></i>
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import Swal from 'sweetalert2'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

export default {
  name: 'EditJobModal',
  emits: ['close', 'submit', 'update:show'],
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    job: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      formData: {
        title: '',
        location: '',
        work_date: '',
        start_time: '',
        end_time: '',
        details: '',
        positions: []
      },
      expandedPositions: [],
      positionOptions: [
        { value: 'X-ray', label: 'X-ray' },
        { value: 'Nurse', label: 'Nurse' },
        { value: 'Medic', label: 'Medic' },
        { value: 'Register', label: 'Register' },
        { value: 'Ear exam', label: 'Ear exam' },
        { value: 'Blood test', label: 'Blood test' },
        { value: 'Blowing lungs', label: 'Blowing lungs' },
        { value: 'gardener', label: 'gardener' }
      ]
    }
  },

  watch: {
    job: {
      immediate: true,
      handler(newJob) {
        if (newJob) {
          this.initializeFormData()
        }
      }
    }
  },

  methods: {
    initializeFormData() {
      const workDate = new Date(this.job.work_date).toISOString().split('T')[0]
      const startTime = new Date(this.job.start_time).toTimeString().slice(0, 5)
      const endTime = new Date(this.job.end_time).toTimeString().slice(0, 5)

      this.formData = {
        title: this.job.title,
        location: this.job.location,
        work_date: workDate,
        start_time: startTime,
        end_time: endTime,
        details: this.job.details,
        positions: this.job.JobPositions.map((pos) => ({
          id: pos.id,
          name: pos.position_name,
          wage: pos.wage,
          required_people: pos.required_people,
          details: pos.details
        }))
      }

      // เริ่มต้นให้ทุกตำแหน่งถูกย่อไว้
      this.expandedPositions = new Array(this.formData.positions.length).fill(false)
    },

    addPosition() {
      // ย่อทุกตำแหน่งที่มีอยู่
      this.expandedPositions = this.expandedPositions.map(() => false)
      // เพิ่มตำแหน่งใหม่และกำหนดให้ขยาย
      this.formData.positions.push({
        name: '',
        wage: 0,
        required_people: 1,
        details: '',
        showList: false
      })
      this.expandedPositions.push(true)
    },

    removePosition(index) {
      if (this.formData.positions.length > 1) {
        Swal.fire({
          title: 'คุณแน่ใจหรือไม่?',
          text: 'คุณต้องการลบตำแหน่งนี้หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#CDE45F',
          cancelButtonColor: '#EA6B6B',
          confirmButtonText: 'ใช่, ลบตำแหน่งนี้',
          cancelButtonText: 'ยกเลิก'
        }).then((result) => {
          if (result.isConfirmed) {
            // ดำเนินการลบถ้าผู้ใช้ยืนยัน
            this.formData.positions.splice(index, 1)
            this.expandedPositions.splice(index, 1)
            Swal.fire({
              icon: 'success',
              title: 'ลบสำเร็จ!',
              text: 'ตำแหน่งถูกลบเรียบร้อยแล้ว',
              confirmButtonText: 'ตกลง'
            })
          }
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'ไม่สามารถลบได้',
          text: 'ต้องมีอย่างน้อย 1 ตำแหน่ง',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    handlePositionBlur(index) {
      setTimeout(() => {
        this.formData.positions[index].showList = false
      }, 200)
    },

    selectPosition(index, option) {
      this.formData.positions[index].name = option.label
      this.formData.positions[index].showList = false
    },

    startTransition(el) {
      const height = el.scrollHeight
      el.style.height = '0'
      // Force repaint
      el.offsetHeight
      el.style.height = `${height}px`
    },

    closeModal() {
      this.$emit('update:show', false)
      this.$emit('close')
    },

    togglePosition(index) {
      const newExpandedPositions = [...this.expandedPositions]
      newExpandedPositions[index] = !newExpandedPositions[index]
      this.expandedPositions = newExpandedPositions
    },

    validateForm() {
      if (
        !this.formData.title ||
        !this.formData.location ||
        !this.formData.work_date ||
        !this.formData.start_time ||
        !this.formData.end_time
      ) {
        return false
      }

      return this.formData.positions.every(
        (position) => position.name && position.wage > 0 && position.required_people > 0
      )
    },

    async handleSubmit() {
      // แสดงการยืนยันก่อนส่งข้อมูล
      const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'คุณต้องการบันทึกการเปลี่ยนแปลงนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#CDE45F',
        cancelButtonColor: '#EA6B6B',
        confirmButtonText: 'ใช่, บันทึก',
        cancelButtonText: 'ยกเลิก'
      })

      if (!result.isConfirmed) {
        // ถ้าผู้ใช้ยกเลิกการยืนยัน จะไม่ดำเนินการส่งข้อมูลต่อ
        return
      }

      // ตรวจสอบข้อมูลฟอร์ม
      if (!this.validateForm()) {
        Swal.fire({
          icon: 'error',
          title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          text: 'โปรดตรวจสอบข้อมูลทุกช่อง',
          confirmButtonText: 'ตกลง'
        })
        return
      }

      try {
        const jobData = {
          ...this.formData,
          id: this.job.id,
          work_date: new Date(this.formData.work_date).toISOString(),
          start_time: `${this.formData.work_date}T${this.formData.start_time}:00.000Z`,
          end_time: `${this.formData.work_date}T${this.formData.end_time}:00.000Z`
        }

        // ส่งข้อมูลฟอร์ม
        this.$emit('submit', jobData)
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการแก้ไขงาน:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถแก้ไขงานได้',
          confirmButtonText: 'ตกลง'
        })
      }
    }
  }
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}

/* ... styles อื่นๆ เหมือนเดิม ... */

/* เพิ่ม transition สำหรับ dropdown */
.absolute {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

/* ปรับแต่ง dropdown */
.border-purple-100 {
  border-color: #ede9f5;
}

/* ปรับแต่ง hover effect */
.hover\:bg-opacity-40:hover {
  background-opacity: 0.4;
}

.absolute.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #c5b4e3 #f3f4f6;
}

.absolute.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.absolute.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.absolute.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #c5b4e3;
  border-radius: 20px;
}

/* Disable arrow buttons on number inputs */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
