<template>
  <Dialog as="div" class="relative z-50" @close="$emit('close')">
    <TransitionChild
      enter="ease-out duration-300"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="ease-in duration-200"
      leave-from="opacity-100"
      leave-to="opacity-0"
    >
      <div class="fixed inset-0 bg-black/30" />
    </TransitionChild>

    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <DialogPanel
          class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
        >
          <div class="space-y-4">
            <!-- User Profile -->
            <div class="flex items-center space-x-4 p-4">
              <img
                :src="userStore.profileImage"
                alt="Profile"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 class="text-lg font-semibold dark:text-white">
                  {{ userStore.user?.first_name }} {{ userStore.user?.last_name }}
                </h3>
                <p class="text-gray-500 dark:text-gray-400">{{ userStore.user?.email }}</p>
              </div>
            </div>

            <!-- Menu Items -->
            <div class="space-y-2">
              <router-link
                to="/user/profile"
                class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="$emit('close')"
              >
                <i class="fas fa-user-circle text-purple-500"></i>
                <span class="dark:text-white">แก้ไขโปรไฟล์</span>
              </router-link>

              <button
                @click="handleLogout"
                class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i class="fas fa-sign-out-alt text-red-500"></i>
                <span class="dark:text-white">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { Dialog, DialogPanel, TransitionChild } from '@headlessui/vue'
import { useUserStore } from '@/stores/userStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import Swal from 'sweetalert2'

export default {
  name: 'MobileUserSubmenu',
  components: {
    Dialog,
    DialogPanel,
    TransitionChild
  },
  data() {
    return {
      userStore: useUserStore(),
      sidebarStore: useSidebarStore()
    }
  },
  methods: {
    async handleLogout() {
      // ใช้ logic เดียวกับที่มีอยู่ในระบบ
      try {
        const result = await Swal.fire({
          title: 'ต้องการออกจากระบบ?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ออกจากระบบ',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#EA6B6B'
        })

        if (!result.isConfirmed) return

        await this.userStore.logout()
        this.$router.push('/signin')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }
}
</script>
