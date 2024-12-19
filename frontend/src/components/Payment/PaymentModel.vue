<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        enter="transition-opacity ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-in duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 p-4"
            >
              <h3 class="text-lg font-medium text-white">
                {{ mode === 'create' ? 'สร้างรายการใหม่' : 'แก้ไขรายการ' }}
              </h3>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <!-- ผู้รับเงิน -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ผู้รับเงิน
                </label>
                <select
                  v-model="formData.user_id"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="">เลือกผู้รับเงิน</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.first_name }} {{ user.last_name }}
                  </option>
                </select>
              </div>

              <!-- งาน -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  งาน
                </label>
                <select
                  v-model="formData.job_id"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="">เลือกงาน</option>
                  <option v-for="job in jobs" :key="job.id" :value="job.id">
                    {{ job.title }}
                  </option>
                </select>
              </div>

              <!-- จำนวนเงิน -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  จำนวนเงิน
                </label>
                <input
                  type="number"
                  v-model="formData.amount"
                  required
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <!-- วิธีการจ่าย -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  วิธีการจ่าย
                </label>
                <select
                  v-model="formData.payment_method"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="cash">เงินสด</option>
                  <option value="transfer">โอนเงิน</option>
                </select>
              </div>

              <!-- สถานะ -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  สถานะ
                </label>
                <select
                  v-model="formData.payment_status"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="paid">จ่ายแล้ว</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>

              <!-- Buttons -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {{ mode === 'create' ? 'สร้าง' : 'บันทึก' }}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

export default {
  name: 'PaymentModal',

  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot
  },

  props: {
    payment: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'create'
    }
  },

  data() {
    return {
      formData: {
        user_id: '',
        job_id: '',
        amount: '',
        payment_method: 'cash',
        payment_status: 'pending'
      },
      users: [],
      jobs: []
    }
  },

  methods: {
    async fetchUsers() {
      try {
        const response = await this.$axios.get('/api/users')
        this.users = response.data
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    },

    async fetchJobs() {
      try {
        const response = await this.$axios.get('/api/jobs')
        this.jobs = response.data
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      }
    },

    handleSubmit() {
      this.$emit('save', this.formData)
    }
  },

  created() {
    if (this.payment) {
      this.formData = { ...this.payment }
    }
    this.fetchUsers()
    this.fetchJobs()
  }
}
</script>
