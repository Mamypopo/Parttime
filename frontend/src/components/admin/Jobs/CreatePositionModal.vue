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
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <!-- Modal Container -->
      <div
        class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center modal overflow-y-auto"
      >
        <div class="flex min-h-full items-center justify-center p-3 sm:p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <HeadlessDialogPanel
              class="w-full max-w-none sm:max-w-lg md:max-w-3xl lg:max-w-4xl bg-white rounded-lg p-4 sm:p-6 pb-20"
            >
              <HeadlessDialogTitle
                class="text-lg sm:text-xl text-center text-[#4FD1C5] mb-4 sm:mb-6"
              >
                {{ editingPosition ? 'Edit Job Position' : 'เพิ่มตำแหน่งงาน' }}
              </HeadlessDialogTitle>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <!-- Position -->
                  <div class="relative">
                    <label class="block text-sm mb-1">ตำแหน่ง</label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="form.position"
                        @click="showPositionList = true"
                        @blur="handleBlur"
                        readonly
                        class="w-full px-3 py-2 border rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="ตำแหน่งงาน"
                      />
                      <i class="fas fa-user-tie absolute right-3 top-3 text-[#81E2C4]"></i>
                    </div>

                    <!-- Position List Dropdown -->
                    <div
                      v-if="showPositionList"
                      class="absolute z-10 w-full mt-1 bg-gray-100 rounded-lg shadow-lg border border-purple-100"
                    >
                      <div
                        class="p-2 space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-gray-100"
                      >
                        <button
                          v-for="pos in positions"
                          :key="pos"
                          type="button"
                          class="block w-full text-left px-3 py-2 hover:bg-[#C5B4E3] hover:bg-opacity-40 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                          @click="selectPosition(pos)"
                        >
                          {{ pos }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Wage -->
                  <div>
                    <label class="block text-sm mb-1">ค่าแรง</label>
                    <div class="relative">
                      <input
                        type="number"
                        v-model="form.wage"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="ค่าแรง"
                      />
                      <i class="fa-solid fa-baht-sign absolute right-3 top-3 text-[#81E2C4]"></i>
                    </div>
                  </div>

                  <!-- Required people -->
                  <div>
                    <label class="block text-sm mb-1">จำนวนคน</label>
                    <div class="relative">
                      <input
                        type="number"
                        v-model="form.requiredPeople"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="จำนวนคนที่ต้องการ"
                      />
                      <i class="fas fa-users absolute right-3 top-3 text-[#81E2C4]"></i>
                    </div>
                  </div>
                </div>

                <!-- Detail -->
                <div class="mt-4 sm:mt-6">
                  <label class="block text-sm mb-1">รายละเอียด</label>
                  <div class="relative">
                    <textarea
                      v-model="form.detail"
                      rows="4"
                      class="w-full px-3 py-2 pl-10 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="รายละเอียด"
                    ></textarea>
                    <i class="fas fa-clipboard-list absolute left-3 top-3 text-[#81E2C4]"></i>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="w-full py-2 sm:py-3 text-white rounded-lg bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] hover:bg-[#b399e0] transition-colors mt-6"
                >
                  {{ editingPosition ? 'Update' : 'Add!' }}
                </button>
              </form>
            </HeadlessDialogPanel>
          </TransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>

<script>
import {
  Dialog as HeadlessDialog,
  DialogPanel as HeadlessDialogPanel,
  DialogTitle as HeadlessDialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'

import Swal from 'sweetalert2'
export default {
  name: 'CreatePositionModal',

  components: {
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    editingPosition: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'add-position'],

  data() {
    return {
      form: {
        position: '',
        wage: '',
        requiredPeople: '',
        detail: ''
      },
      positions: ['X-ray', 'Nurse', 'Medic', 'Register', 'Ear exam', 'Blood test', 'Blowing lungs'],
      showPositionList: false
    }
  },
  watch: {
    editingPosition: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // ดึงข้อมูลเก่ามาใส่ในฟอร์ม
          this.form = {
            position: newVal.name,
            wage: newVal.wage,
            requiredPeople: newVal.requiredPeople,
            detail: newVal.details
          }
        } else {
          // reset form เมื่อไม่ได้อยู่ในโหมดแก้ไข
          this.form = {
            position: '',
            wage: '',
            requiredPeople: '',
            detail: ''
          }
        }
      }
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.position.trim() !== '' &&
        this.form.wage > 0 &&
        this.form.requiredPeople > 0 &&
        this.form.detail.trim() !== ''
      )
    }
  },
  methods: {
    togglePositionList() {
      this.showPositionList = !this.showPositionList
    },

    selectPosition(position) {
      this.form.position = position
      this.showPositionList = false
    },

    closeModal() {
      this.$emit('close')
      this.form = {
        position: '',
        wage: '',
        requiredPeople: '',
        detail: ''
      }
    },
    handleBlur() {
      window.setTimeout(() => {
        this.showPositionList = false
      }, 200)
    },
    handleSubmit() {
      if (!this.isFormValid) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          text: 'กรุณากรอกตำแหน่ง, ค่าแรง, จำนวนคน และรายละเอียดให้ครบถ้วน',
          confirmButtonText: 'ตกลง'
        })
        return
      }
      const formData = {
        ...this.form,
        id: this.editingPosition?.id // ส่ง id ไปด้วยถ้าเป็นการแก้ไข
      }
      this.$emit('add-position', formData)
      this.closeModal()
    }
  }
}
</script>

<style scoped>
/* ซ่อน spinner arrows จาก input type number */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e9d5ff; /* purple-200 */
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #ddd6fe; /* purple-300 */
}
</style>
