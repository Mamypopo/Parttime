<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" @close="closeModal" class="relative z-50">
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
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-3 sm:p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <HeadlessDialogPanel class="w-full max-w-md bg-white rounded-lg p-4 sm:p-6">
              <HeadlessDialogTitle class="text-lg sm:text-xl text-center text-cyan-400 mb-4 sm:mb-6">
                {{ editingPosition ? 'Edit Job Position' : 'Create Job Position' }}
              </HeadlessDialogTitle>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <!-- Position -->
                  <div class="relative">
                    <label class="block text-sm mb-1">Position</label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="form.position"
                        class="w-full px-3 py-2 border rounded-lg pr-8"
                        readonly
                        @click="togglePositionList"
                      />
                      <i class="fas fa-chevron-down absolute right-3 top-3 text-gray-400"></i>
                    </div>
                    
                    <!-- Position List Dropdown -->
                    <div v-if="showPositionList" 
                         class="absolute z-10 w-full mt-1 bg-gray-100 rounded-lg shadow-lg">
                      <div class="p-2 space-y-1 max-h-48 overflow-y-auto">
                        <button
                          v-for="pos in positions"
                          :key="pos"
                          type="button"
                          class="block w-full text-left px-3 py-2 hover:bg-gray-200 rounded text-sm"
                          @click="selectPosition(pos)"
                        >
                          {{ pos }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Wage -->
                  <div>
                    <label class="block text-sm mb-1">Wage</label>
                    <input
                      type="number"
                      v-model="form.wage"
                      class="w-full px-3 py-2 border rounded-lg"
                      placeholder="wage"
                    />
                  </div>

                  <!-- Required people -->
                  <div>
                    <label class="block text-sm mb-1">Required people</label>
                    <input
                      type="number"
                      v-model="form.requiredPeople"
                      class="w-full px-3 py-2 border rounded-lg"
                      placeholder="required people"
                    />
                  </div>
                </div>

                <!-- Detail -->
                <div class="mt-4 sm:mt-6">
                  <label class="block text-sm mb-1">Detail</label>
                  <textarea
                    v-model="form.detail"
                    rows="4"
                    class="w-full px-3 py-2 border rounded-lg resize-none"
                    placeholder="detail"
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="w-full py-2 sm:py-3 bg-purple-300 text-white rounded-lg hover:bg-purple-400 transition-colors mt-6"
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
  TransitionChild,
} from '@headlessui/vue'

export default {
  name: 'CreatePositionModal',

  components: {
    HeadlessDialog,
    HeadlessDialogPanel,
    HeadlessDialogTitle,
    TransitionRoot,
    TransitionChild,
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
        'X-ray',
        'Nurse',
        'Medic',
        'Register',
        'Ear exam',
        'Blood test',
        'Blowing lungs'
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

      handleSubmit() {
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