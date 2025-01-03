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
              class="bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] dark:from-purple-600 dark:to-blue-600 p-4 flex justify-between items-center"
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
              <!-- <router-link
                to="/admin/PaymentManagement-view"
                @click="$emit('close')"
                class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <i class="fas fa-money-bill-wave text-gray-600 dark:text-gray-300"></i>
                  <span class="text-gray-600 dark:text-gray-300 text-sm">การเงิน</span>
                </div>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </router-link> -->

              <!-- Dark Mode Toggle -->
              <div
                class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div class="flex items-center gap-3">
                  <span class="text-gray-600 dark:text-gray-300 text-sm">
                    {{ isDarkMode ? 'โหมดมืด' : 'โหมดสว่าง' }}
                  </span>
                </div>
                <!-- Toggle Switch -->
                <button
                  @click="toggleDarkMode"
                  class="relative inline-flex items-center cursor-pointer"
                >
                  <div
                    class="w-11 h-6 rounded-full transition-colors duration-200 ease-in-out"
                    :class="[
                      isDarkMode ? 'bg-[#4B9592] dark:bg-[#4B9592]' : 'bg-gray-200 dark:bg-gray-600'
                    ]"
                  >
                    <div
                      class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out"
                      :class="{ 'translate-x-full': isDarkMode }"
                    ></div>
                    <!-- Icons -->
                    <span
                      class="absolute left-[4px] top-[4px] text-[10px] transition-opacity duration-200"
                      :class="{ 'opacity-0': isDarkMode }"
                    >
                      🌞
                    </span>
                    <span
                      class="absolute right-[4px] top-[4px] text-[10px] transition-opacity duration-200"
                      :class="{ 'opacity-0': !isDarkMode }"
                    >
                      🌙
                    </span>
                  </div>
                </button>
              </div>

              <!-- Logout Button -->
              <button
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-3 text-[#EA6B6B] dark:text-[#FF8F8F] hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-lg transition-colors"
              >
                <i class="fas fa-sign-out-alt text-xl"></i>
                <span>ออกจากระบบ</span>
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
import { useAdminStore } from '@/stores/adminStore'

import Swal from 'sweetalert2'
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
      sidebarStore: useSidebarStore(),
      adminStore: useAdminStore()
    }
  },

  computed: {
    isDarkMode() {
      return this.sidebarStore.isDarkMode
    }
  },

  methods: {
    async handleLogout() {
      try {
        // ปิด mobile menu (ถ้ามี)
        if (this.$emit) {
          this.$emit('close')
        }

        // ถามยืนยันก่อน logout
        const result = await Swal.fire({
          title: 'ต้องการออกจากระบบ?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ออกจากระบบ',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#EA6B6B'
        })

        if (!result.isConfirmed) return

        //  Loader ระหว่าง Logout
        Swal.fire({
          title: 'กำลังออกจากระบบ...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        // ทำการ logout และ clear stores
        this.adminStore.logout()

        if (this.sidebarStore?.$reset) {
          this.sidebarStore.$reset()
        } else {
          // หากไม่มี $reset, ให้เคลียร์ค่าเริ่มต้นเอง
          this.sidebarStore.$patch({ isCollapsed: false, isMobile: false })
        }

        // แสดงข้อความสำเร็จ
        await Swal.fire({
          icon: 'success',
          title: 'ออกจากระบบสำเร็จ!',
          showConfirmButton: false,
          timer: 1500
        })

        // Redirect ไปหน้า login
        await this.$router.push('/signin-admin')
      } catch (error) {
        console.error('Logout error:', error)

        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณาลองใหม่อีกครั้ง'
        })
      }
    },
    toggleDarkMode() {
      this.sidebarStore.toggleDarkMode()
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
