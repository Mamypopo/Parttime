<template>
  <TransitionRoot appear :show="showSlip" as="div">
    <Dialog as="div" @close="closeSlipModal" class="relative modal">
      <TransitionChild
        as="div"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="div"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-sm transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg transition-all"
            >
              <DialogTitle as="div" class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">สลิปการจ่ายเงิน</h3>
                <button
                  @click="closeSlipModal"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <i class="fas fa-times"></i>
                </button>
              </DialogTitle>
              <div class="flex justify-center">
                <img
                  :src="slipUrl"
                  class="max-w-xs max-h-80 rounded-md shadow"
                  alt="สลิปการจ่ายเงิน"
                />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<script>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

export default {
  name: 'SlipModal',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot
  },
  props: {
    showSlip: {
      type: Boolean,
      required: true
    },
    slipUrl: {
      type: String,
      required: true
    }
  },
  methods: {
    closeSlipModal() {
      this.$emit('close')
    }
  }
}
</script>
