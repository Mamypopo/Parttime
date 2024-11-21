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
            tabindex="0"
            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-[#6ED7D1] to-[#9899ee] dark:from-[#4B9592] dark:to-[#6667AA] p-4 flex justify-between items-center"
            >
              <h3 class="text-lg font-medium text-white">ผู้ใช้งาน</h3>
              <button
                @click="$emit('close')"
                class="text-white/70 hover:text-white transition-colors"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- Menu Items -->
            <div class="p-4 space-y-3">
              <router-link
                v-for="item in userMenuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center p-3 rounded-lg hover:bg-[#F2F5FF] dark:hover:bg-gray-700 transition-all duration-200"
                @click="$emit('close')"
              >
                <i :class="[item.icon, 'text-[#6366F1] dark:text-[#818CF8] text-xl mr-3']"></i>
                <span class="text-[#3A3A49] dark:text-gray-200">{{ item.name }}</span>
              </router-link>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<script>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

export default {
  name: 'MobileUserSubmenu',

  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot
  },

  data() {
    return {
      userMenuItems: [
        { name: 'ผู้ใช้ทั้งหมด', path: '/admin/alluser', icon: 'fas fa-users' },
        { name: 'รออนุมัติ', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
        { name: 'ถูกปฏิเสธ', path: '/admin/reject-user', icon: 'fa-solid fa-user-xmark' }
      ]
    }
  },

  emits: ['close']
}
</script>
<style scoped>
.router-link-active {
  @apply bg-[#F2F5FF] dark:bg-gray-700 text-[#6366F1] dark:text-[#818CF8];
}

.router-link-active i {
  @apply text-[#6366F1] dark:text-[#818CF8];
}
</style>
