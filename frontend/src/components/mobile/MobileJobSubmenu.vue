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
            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
          >
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">งาน</h3>
            <div class="space-y-2">
              <router-link
                v-for="item in jobMenuItems"
                :key="item.path"
                :to="item.path"
                class="block px-4 py-2 rounded-lg hover:bg-gray-50"
                @click="$emit('close')"
              >
                <i :class="[item.icon, 'mr-3 text-gray-400']"></i>
                {{ item.name }}
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
