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
              class="flex justify-between items-center p-4 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 rounded-t-2xl mb-4"
            >
              <h3 class="text-lg font-medium text-white">งาน</h3>
              <button
                @click="$emit('close')"
                class="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg w-8 h-8 inline-flex justify-center items-center transition-colors"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Menu Items -->
            <div class="p-3 space-y-4">
              <router-link
                v-for="item in jobMenuItems"
                :key="item.path"
                :to="item.path"
                class="px-4 py-3 rounded-lg hover:bg-[#F2F5FF] dark:hover:bg-gray-700 transition-colors flex items-center"
                @click="$emit('close')"
              >
                <i :class="[item.icon, 'mr-3 text-[#6366F1] dark:text-[#818CF8]']"></i>
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
import { useSidebarStore } from '@/stores/sidebarStore'

export default {
  name: 'MobileJobSubmenu',

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

  computed: {
    jobMenuItems() {
      return this.sidebarStore.jobMenuItems
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
