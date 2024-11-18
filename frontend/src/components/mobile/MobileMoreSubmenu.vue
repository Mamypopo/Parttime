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
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] p-4 flex justify-between items-center"
            >
              <h3 class="text-lg font-medium text-white">เพิ่มเติม</h3>
              <button
                @click="$emit('close')"
                class="text-white/70 hover:text-white transition-colors"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- Menu Items -->
            <div class="p-4 space-y-4">
              <button
                @click="handleLogout"
                class="w-full flex items-center text-[#EA6B6B] hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <i class="fas fa-sign-out-alt text-xl"></i>
                <span class="ml-3">ออกจากระบบ</span>
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useSidebarStore } from '@/stores/sidebarStore'

export default {
  name: 'MobileMoreSubmenu',

  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot
  },

  data() {
    return {
      sidebarStore: useSidebarStore()
    }
  },

  methods: {
    async handleLogout() {
      const success = await this.sidebarStore.handleLogout()
      if (success) {
        this.$router.push('/signin-admin')
      }
    }
  },

  emits: ['close']
}
</script>

<style scoped>
.router-link-active {
  background-color: #f2f5ff;
  color: #6366f1;
}

.router-link-active i {
  color: #6366f1;
}
</style>
