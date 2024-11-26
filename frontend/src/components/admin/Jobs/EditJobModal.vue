<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="fixed inset-0 modal overflow-y-auto" v-if="show">
      <!-- Backdrop -->
      <TransitionChild
        enter="transition-opacity duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" @click="closeModal" />
      </TransitionChild>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 rounded-t-2xl border-b dark:border-gray-700 bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4B9592] dark:to-[#6667AA]"
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
          <div class="p-4 md:p-5 space-y-4 bg-white dark:bg-gray-800">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- ข้อมูลพื้นฐาน -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <i class="fas fa-heading text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                    ชื่องาน
                  </label>
                  <input
                    v-model="formData.title"
                    type="text"
                    class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <i class="fas fa-location-dot text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                    สถานที่
                  </label>
                  <input
                    v-model="formData.location"
                    type="text"
                    class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <i class="fas fa-calendar-day text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                    วันที่ทำงาน
                  </label>
                  <input
                    v-model="formData.work_date"
                    type="date"
                    class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <i class="fas fa-clock text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                    เวลาทำงาน
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="formData.start_time"
                      type="time"
                      class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                      required
                    />
                    <span class="text-gray-500 dark:text-gray-300">-</span>
                    <input
                      v-model="formData.end_time"
                      type="time"
                      class="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- รายละเอียดงาน -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <i class="fas fa-align-left text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                  รายละเอียดงาน
                </label>
                <textarea
                  v-model="formData.details"
                  rows="3"
                  class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                ></textarea>
              </div>

              <!-- ตำแหน่งงาน -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4
                    class="text-lg font-medium flex items-center text-gray-800 dark:text-gray-200"
                  >
                    <i class="fas fa-users text-[#81E2C4] dark:text-[#4B9592] mr-2"></i>
                    ตำแหน่งงาน
                  </h4>
                  <button
                    type="button"
                    @click="addPosition"
                    class="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 flex items-center"
                  >
                    <i class="fas fa-plus mr-1"></i>
                    เพิ่มตำแหน่ง
                  </button>
                </div>

                <!-- รายการตำแหน่งงาน -->
                <div
                  v-for="(position, index) in formData.positions"
                  :key="index"
                  class="border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <!-- หัวข้อตำแหน่ง -->
                  <div
                    class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    @click="togglePosition(index)"
                  >
                    <h5 class="font-medium flex items-center text-gray-800 dark:text-gray-200">
                      <i class="fas fa-user-tie text-[#81E2C4] dark:text-[#4B9592] mr-2"></i>
                      ตำแหน่งที่ {{ index + 1 }}: {{ position.name || 'ตำแหน่งใหม่' }}
                    </h5>
                    <!-- แถบแสดงสถานะ "ใหม่" -->
                    <span
                      v-if="position.isNew"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-blue-400 dark:from-green-500 dark:to-blue-500 text-white animate-bounce shadow-sm"
                    >
                      <i class="fas fa-star-of-life mr-1 text-xs"></i>
                      ใหม่
                    </span>
                    <div class="flex items-center gap-4">
                      <!-- ปุ่มลบ -->
                      <button
                        type="button"
                        @click.stop="removePosition(index)"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800"
                      >
                        <i
                          class="fas fa-trash-alt text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors"
                        ></i>
                        <span class="hidden sm:inline">ลบตำแหน่ง</span>
                      </button>

                      <!-- ปุ่มขยาย/ย่อ -->
                      <button
                        type="button"
                        class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                      >
                        <i
                          :class="[
                            'fas text-gray-500 dark:text-gray-400 transition-all duration-300',
                            expandedPositions[index] ? 'fa-chevron-up' : 'fa-chevron-down',
                            'transform hover:text-gray-700 dark:hover:text-gray-300',
                            expandedPositions[index] ? 'rotate-0' : 'rotate-180'
                          ]"
                        ></i>
                      </button>
                    </div>
                  </div>

                  <!-- รายละเอียดตำแหน่ง -->
                  <transition name="expand" @enter="startTransition" @leave="startTransition">
                    <div v-show="expandedPositions[index]">
                      <div class="p-4 border-t">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label
                              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              <i class="fas fa-tag text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                              ชื่อตำแหน่ง
                            </label>
                            <div class="relative">
                              <span
                                class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500"
                              >
                                <i class="fas fa-user-tie text-sm"></i>
                              </span>
                              <input
                                type="text"
                                v-model="position.name"
                                @click="position.showList = true"
                                @blur="handlePositionBlur(index)"
                                readonly
                                class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 cursor-pointer"
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
                                class="absolute z-50 w-full bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg border border-purple-100 dark:border-gray-600 max-h-48 overflow-y-auto"
                              >
                                <div class="p-2 space-y-1">
                                  <button
                                    v-for="option in positionOptions"
                                    :key="option.value"
                                    type="button"
                                    class="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-[#C5B4E3] hover:bg-opacity-40 dark:hover:bg-purple-600 dark:hover:bg-opacity-20 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                                    @click="selectPosition(index, option)"
                                  >
                                    {{ option.label }}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label
                              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              <i class="fas fa-coins text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                              ค่าจ้าง (บาท)
                            </label>
                            <input
                              v-model.number="position.wage"
                              type="number"
                              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 cursor-pointer"
                              required
                            />
                          </div>
                          <div>
                            <label
                              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              <i class="fas fa-users text-[#81E2C4] dark:text-[#4B9592] mr-1"></i>
                              จำนวนที่ต้องการ
                            </label>
                            <input
                              v-model.number="position.required_people"
                              type="number"
                              class="w-full pl-9 pr-3 py-1.5 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 cursor-pointer"
                              required
                            />
                          </div>
                        </div>

                        <div class="mt-4">
                          <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            <i
                              class="fas fa-circle-info text-[#81E2C4] dark:text-[#4B9592] mr-1"
                            ></i>
                            รายละเอียดตำแหน่ง
                          </label>
                          <textarea
                            v-model="position.details"
                            rows="2"
                            class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
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
          <div class="flex items-center justify-end gap-3 p-4 md:p-5 border-t dark:border-gray-700">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm border dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center"
            >
              <i class="fas fa-xmark mr-1"></i>
              ยกเลิก
            </button>
            <button
              @click="handleSubmit"
              class="px-4 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-purple-500 hover:opacity-90 flex items-center"
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
import { useJobStore } from '@/stores/jobStore'
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
        { value: 'เอกซเรย์', label: 'เอกซเรย์' },
        { value: 'พยาบาล', label: 'พยาบาล' },
        { value: 'น้ำหนัก ส่วนสูง', label: 'น้ำหนัก ส่วนสูง' },
        { value: 'ทะเบียน', label: 'ทะเบียน' },
        { value: 'การได้ยิน', label: 'การได้ยิน' },
        { value: 'เจาะเลือด', label: 'เจาะเลือด' },
        { value: 'เป่าปอด', label: 'เป่าปอด' },
        { value: 'ตาอาชีวะ', label: 'ตาอาชีวะ' },
        { value: 'ตาทั่วไป', label: 'ตาทั่วไป' },
        { value: 'มวลกระดูก', label: 'มวลกระดูก' },
        { value: 'เก็บปัสสาวะ', label: 'เก็บปัสสาวะ' },
        { value: 'คลื่นไฟฟ้าหัวใจ', label: 'คลื่นไฟฟ้าหัวใจ' },
        { value: 'กล้ามเนื้อ', label: 'กล้ามเนื้อ' },
        { value: 'มะเร็งปากมดลูก', label: 'มะเร็งปากมดลูก' },
        { value: 'อัลตร้าซาวด์', label: 'อัลตร้าซาวด์' },
        { value: 'ผู้ช่วยแพทย์', label: 'ผู้ช่วยแพทย์' },
        { value: 'วัดความดัน', label: 'วัดความดัน' }
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
        showList: false,
        isNew: true
      })
      this.expandedPositions.push(true)
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
      try {
        const jobStore = useJobStore()

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

        if (!result.isConfirmed) return

        // ลบสถานะ isNew ทั้งหมดก่อนส่งข้อมูล
        this.formData.positions = this.formData.positions.map((pos) => ({
          ...pos,
          isNew: false
        }))
        // จัดรูปแบบข้อมูลก่อนส่ง
        const jobData = {
          id: this.job.id,
          title: this.formData.title,
          location: this.formData.location,
          work_date: this.formData.work_date,
          start_time: jobStore.formatDateTime(this.formData.work_date, this.formData.start_time),
          end_time: jobStore.formatDateTime(this.formData.work_date, this.formData.end_time),
          details: this.formData.details,
          positions: this.formData.positions.map((pos) => ({
            id: pos.id,
            name: pos.name,
            wage: Number(pos.wage),
            required_people: Number(pos.required_people),
            details: pos.details
          }))
        }

        // ส่งข้อมูลไปยัง parent component
        this.$emit('submit', jobData)

        // ปิด modal
        this.closeModal()
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการแก้ไขงาน:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถแก้ไขงานได้',
          confirmButtonText: 'ตกลง'
        })
      }
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
