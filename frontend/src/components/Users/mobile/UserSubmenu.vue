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
            <div class="bg-gradient-to-r from-[#A8E6E2] to-[#C3E8D5] p-4">
              <div class="flex items-center gap-3">
                <img
                  :src="userStore.getUser?.profile_image || defaultAvatar"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 class="font-medium text-gray-800 dark:text-gray-200">
                    {{ userStore.getUser?.first_name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ userStore.getUser?.email }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Menu Items -->
            <div class="p-4 space-y-4">
              <!-- Edit Profile -->
              <router-link
                to="/user/profile-view"
                class="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="$emit('close')"
              >
                <i class="fas fa-user-edit text-cyan-600 text-xl mr-3"></i>
                <span
                  class="text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out"
                  >แก้ไขข้อมูลส่วนตัว</span
                >
              </router-link>

              <!-- Dark Mode Toggle -->
              <div class="flex items-center justify-between p-3">
                <span class="text-gray-700 dark:text-gray-300">โหมดมืด/สว่าง</span>
                <button
                  @click="toggleDarkMode"
                  class="relative inline-flex items-center cursor-pointer"
                >
                  <div
                    class="w-12 h-7 rounded-full transition-colors duration-300 ease-in-out overflow-hidden"
                    :class="[
                      isDarkMode
                        ? 'bg-purple-600 dark:bg-purple-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    ]"
                  >
                    <div
                      class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center"
                      :class="{ 'translate-x-5': isDarkMode }"
                    >
                      <i
                        class="text-xs transition-colors duration-300"
                        :class="[
                          isDarkMode ? 'fas fa-moon text-purple-600' : 'fas fa-sun text-amber-500'
                        ]"
                      ></i>
                    </div>
                  </div>
                </button>
              </div>

              <!-- Logout -->
              <button
                @click="handleLogout"
                class="w-full flex items-center p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <i class="fas fa-sign-out-alt text-red-500 text-xl mr-3"></i>
                <span class="text-red-500">ออกจากระบบ</span>
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useUserStore } from '@/stores/userStore'
import { useSidebarStore } from '@/stores/sidebarStore'

export default {
  components: {
    Dialog,
    DialogPanel,
    TransitionRoot,
    TransitionChild
  },

  setup() {
    const userStore = useUserStore()
    const sidebarStore = useSidebarStore()
    return { userStore, sidebarStore }
  },

  computed: {
    isDarkMode() {
      return this.sidebarStore.isDarkMode
    }
  },

  methods: {
    toggleDarkMode() {
      this.sidebarStore.toggleDarkMode()
    },
    async handleLogout() {
      await this.userStore.logout()
      this.$router.push('/signin-user')
      this.$emit('close')
    }
  },

  emits: ['close']
}
</script>
