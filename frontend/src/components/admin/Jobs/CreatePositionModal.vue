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
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 flex items-center justify-center modal overflow-y-auto">
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
              class="w-full max-w-none sm:max-w-lg md:max-w-3xl lg:max-w-4xl bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 pb-20 shadow-xl"
            >
              <HeadlessDialogTitle
                class="text-lg sm:text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-4 sm:mb-6"
              >
                {{ editingPosition ? 'แก้ไขตำแหน่งงาน' : 'เพิ่มตำแหน่งงาน' }}
              </HeadlessDialogTitle>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <!-- Position -->
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >ตำแหน่ง</label
                    >
                    <div class="relative">
                      <input
                        type="text"
                        v-model="form.position"
                        @click="showPositionList = true"
                        @blur="handleBlur"
                        readonly
                        class="w-full px-4 py-2.5 border dark:border-gray-600 rounded-xl pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                        placeholder="ตำแหน่งงาน"
                      />
                      <i
                        class="fas fa-user-tie absolute right-3 top-3 text-purple-400 dark:text-purple-300"
                      ></i>
                    </div>

                    <!-- Position List Dropdown -->
                    <div
                      v-if="showPositionList"
                      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-purple-100 dark:border-gray-600"
                    >
                      <div class="p-2 space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                        <button
                          v-for="pos in positions"
                          :key="pos"
                          type="button"
                          class="block w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r from-purple-50 to-blue-50 dark:hover:bg-gradient-to-r dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl text-sm transition-all duration-300"
                          @click="selectPosition(pos)"
                        >
                          {{ pos }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Wage -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >ค่าแรง</label
                    >
                    <div class="relative">
                      <input
                        type="number"
                        v-model="form.wage"
                        class="w-full px-4 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                        placeholder="ค่าแรง"
                      />
                      <i
                        class="fa-solid fa-baht-sign absolute right-3 top-3 text-purple-400 dark:text-purple-300"
                      ></i>
                    </div>
                  </div>

                  <!-- Required people -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >จำนวนคน</label
                    >
                    <div class="relative">
                      <input
                        type="number"
                        v-model="form.requiredPeople"
                        class="w-full px-4 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                        placeholder="จำนวนคนที่ต้องการ"
                      />
                      <i
                        class="fas fa-users absolute right-3 top-3 text-purple-400 dark:text-purple-300"
                      ></i>
                    </div>
                  </div>
                </div>

                <!-- Detail -->
                <div class="mt-4 sm:mt-6">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >รายละเอียด</label
                  >
                  <div class="relative">
                    <textarea
                      v-model="form.detail"
                      rows="4"
                      class="w-full px-4 py-2.5 pl-10 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 resize-none transition-all duration-300"
                      placeholder="รายละเอียด"
                    ></textarea>
                    <i
                      class="fas fa-clipboard-list absolute left-3 top-3 text-purple-400 dark:text-purple-300"
                    ></i>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="w-full py-3 text-white rounded-xl bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg mt-6"
                >
                  {{ editingPosition ? 'อัพเดทตำแหน่ง' : 'เพิ่มตำแหน่ง' }}
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
      positions: [
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
        'ยานพาหนะ',
        'หมอ'
      ],
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
      return this.form.position.trim() !== '' && this.form.wage > 0 && this.form.requiredPeople > 0
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
          text: 'กรุณากรอกตำแหน่ง, ค่าแรง และจำนวนคน ให้ครบถ้วน',
          confirmButtonText: 'ตกลง'
        })
        return
      }
      const formData = {
        ...this.form,
        id: this.editingPosition?.id
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
  -moz-appearance: textfield;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e9d5ff;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #ddd6fe;
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #9899ee;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #7677cc;
  }
}
</style>
