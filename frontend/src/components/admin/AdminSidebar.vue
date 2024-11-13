<template>
  <div class="flex flex-col min-h-screen bg-[#F2F5FF] relative">
    <!-- Desktop/Tablet Sidebar -->
    <TransitionRoot
      :show="!isMobile"
      as="template"
      enter="transition-all duration-300 ease-in-out"
      enter-from="opacity-0 -translate-x-full"
      enter-to="opacity-100 translate-x-0"
      leave="transition-all duration-300 ease-in-out"
      leave-from="opacity-100 translate-x-0"
      leave-to="opacity-0 -translate-x-full"
    >
      <div
        class="sidebar h-screen fixed bg-white border-r drop-shadow-md transition-all duration-500 ease-in-out"
        :class="[isCollapsed ? 'w-16' : 'w-70']"
        :style="{
          transition: 'all 0.3s ease-in-out',
          width: isCollapsed ? '4rem' : '17.5rem' // 4rem = w-16, 17.5rem = w-70
        }"
      >
        <!-- Header -->
        <div
          class="flex items-center p-4 transition-all duration-300 ease-in-out"
          :class="[isCollapsed ? 'justify-center' : 'justify-between']"
        >
          <div class="flex items-center" :class="[isCollapsed ? 'justify-center' : 'gap-2']">
            <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-8 h-8" />
            <h1 v-if="!isCollapsed" class="text-lg font-semibold text-[#4D4D4D]">
              Admin dashboard
            </h1>
          </div>

          <button
            v-if="!isCollapsed && !isTablet"
            @click="toggleSidebar"
            class="hover:bg-gray-100 p-2 rounded-full"
            title="Collapse sidebar"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>

        <!-- Navigation Sidebar -->
        <nav class="px-2 py-2 mt-8 bg-white transition-all duration-300 ease-in-out">
          <!-- Main Menu -->
          <router-link
            v-for="(item, index) in mainMenuItems"
            :key="index"
            :to="item.path"
            class="flex items-center mb-1 px-4 py-2 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-[#4D4D4D]"
            :class="[isCollapsed ? 'justify-center' : 'gap-3']"
            :title="isCollapsed ? item.name : ''"
          >
            <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
            <span v-if="!isCollapsed">{{ item.name }}</span>
          </router-link>

          <NotificationsPanel :is-collapsed="isCollapsed" />

          <!-- Jobs Section -->
          <div class="mt-4 pt-4 border-t">
            <router-link
              v-for="(item, index) in jobMenuItems"
              :key="index"
              :to="item.path"
              class="flex items-center mb-1 px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold text-[#4D4D4D]"
              :class="[isCollapsed ? 'justify-center' : 'gap-3']"
              :title="isCollapsed ? item.name : ''"
            >
              <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
              <span v-if="!isCollapsed">{{ item.name }}</span>
              <span
                v-if="item.name === 'TEST' && jobStore.pendingApplicationsCount > 0"
                class="absolute right-4 bg-[#f76363] text-white rounded-full text-xs px-2 py-0.5 flex items-center justify-center animate-pulse"
              >
                {{ jobStore.pendingApplicationsCount }}
              </span>
            </router-link>
          </div>
        </nav>

        <!-- Admin Profile -->
        <div
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#bbe4e1] to-[#B3E5FC] p-8 transition-all duration-300 ease-in-out h-[200px]"
          :class="[isCollapsed ? 'w-16' : 'w-70']"
          :style="{
            width: isCollapsed ? '4rem' : '17.5rem'
          }"
        >
          <div class="flex flex-col items-center">
            <img
              src="@/assets/images/logosemed.svg"
              alt="Admin"
              class="w-10 h-10 rounded-full mb-3"
            />

            <div v-if="!isCollapsed" class="text-center">
              <div class="font-semibold truncate max-w-[150px]">Lorem ipsum</div>
              <div class="text-semibold text-[#4D4D4D] truncate max-w-[150px]">
                Loremipsum@gmail.com
              </div>
            </div>

            <button
              v-if="!isCollapsed"
              @click="handleLogout"
              class="w-full mt-3 py-2 bg-white rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </TransitionRoot>

    <!-- Toggle Button -->
    <TransitionRoot
      :show="isCollapsed && !isTablet && !isMobile"
      as="template"
      enter="transition-all duration-500 ease-in-out"
      enter-from="opacity-0 translate-x-4"
      enter-to="opacity-100 translate-x-0"
      leave="transition-all duration-500 ease-in-out"
      leave-from="opacity-100 translate-x-0"
      leave-to="opacity-0 translate-x-4"
    >
      <button
        @click="toggleSidebar"
        class="fixed top-4 left-[4.2rem] bg-white hover:bg-gray-100 p-2 rounded-full shadow-md z-50"
        title="Expand sidebar"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </TransitionRoot>

    <!-- Mobile Navigation -->
    <nav
      v-if="isMobile"
      class="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2"
      style="z-index: 800"
    >
      <div class="flex justify-around items-center">
        <button
          class="flex flex-col items-center p-2 text-[#3A3A49]"
          @click="$router.push('/admin/dashboard')"
        >
          <i class="fas fa-home text-xl"></i>
          <span class="text-xs mt-1">หน้าหลัก</span>
        </button>

        <button
          class="flex flex-col items-center p-2 text-[#3A3A49]"
          @click="handleMobileMenuClick({ name: 'ผู้ใช้งาน', hasSubmenu: true })"
        >
          <i class="fas fa-users text-xl"></i>
          <span class="text-xs mt-1">ผู้ใช้งาน</span>
        </button>

        <button
          class="flex flex-col items-center p-2 text-[#3A3A49]"
          @click="handleMobileMenuClick({ name: 'งาน', hasSubmenu: true })"
        >
          <i class="fas fa-briefcase text-xl"></i>
          <span class="text-xs mt-1">งาน</span>
        </button>

        <MobileNotifications v-model="showNotifications" @close="showAllNotifications = false" />

        <button
          class="flex flex-col items-center p-2 text-[#3A3A49]"
          @click="handleMobileMenuClick({ name: 'เพิ่มเติม', hasSubmenu: true })"
        >
          <i class="fas fa-ellipsis-h text-xl"></i>
          <span class="text-xs mt-1">เพิ่มเติม</span>
        </button>
      </div>

      <!-- Users Submenu Dialog -->
      <TransitionRoot :show="showUserSubmenu" as="template">
        <Dialog as="div" class="relative z-50" @close="closeSubmenu">
          <TransitionChild
            as="template"
            enter="transition-opacity ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity ease-in duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto pb-20">
            <div class="flex min-h-full items-end justify-center">
              <TransitionChild
                as="template"
                enter="transition-all ease-out duration-300"
                enter-from="translate-y-full"
                enter-to="translate-y-0"
                leave="transition-all ease-in duration-300"
                leave-from="translate-y-0"
                leave-to="translate-y-full"
              >
                <DialogPanel class="w-full bg-white p-4">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xs font-semibold text-gray-500">จัดการผู้ใช้งาน</h3>
                    <button @click="closeSubmenu" class="text-gray-400">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <router-link
                    v-for="item in mobileMainItems.find((i) => i.name === 'ผู้ใช้งาน')?.submenu
                      .items"
                    :key="item.path"
                    :to="item.path"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-[#4D4D4D]"
                    @click="showUserSubmenu = false"
                  >
                    <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
                    <span>{{ item.name }}</span>
                  </router-link>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

      <!-- Jobs Submenu Dialog -->
      <TransitionRoot :show="showJobSubmenu" as="template">
        <Dialog as="div" class="relative z-50" @close="closeSubmenu">
          <TransitionChild
            as="template"
            enter="transition-opacity ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity ease-in duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto pb-20">
            <div class="flex min-h-full items-end justify-center">
              <TransitionChild
                as="template"
                enter="transition-all ease-out duration-300"
                enter-from="translate-y-full"
                enter-to="translate-y-0"
                leave="transition-all ease-in duration-300"
                leave-from="translate-y-0"
                leave-to="translate-y-full"
              >
                <DialogPanel class="w-full bg-white p-4">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xs font-semibold text-gray-500">จัดการงาน</h3>
                    <button @click="closeSubmenu" class="text-gray-400">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <router-link
                    v-for="item in mobileMainItems.find((i) => i.name === 'งาน')?.submenu.items"
                    :key="item.path"
                    :to="item.path"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-[#4D4D4D]"
                    @click="showJobSubmenu = false"
                  >
                    <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
                    <span>{{ item.name }}</span>
                  </router-link>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
      <!-- 
      More Options Dialog -->
      <TransitionRoot :show="showMoreSubmenu" as="template">
        <Dialog as="div" class="relative z-50" @close="closeSubmenu">
          <TransitionChild
            as="template"
            enter="transition-opacity ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity ease-in duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto pb-20">
            <div class="flex min-h-full items-end justify-center">
              <TransitionChild
                as="template"
                enter="transition-all ease-out duration-300"
                enter-from="translate-y-full"
                enter-to="translate-y-0"
                leave="transition-all ease-in duration-300"
                leave-from="translate-y-0"
                leave-to="translate-y-full"
              >
                <DialogPanel class="w-full bg-white p-4">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xs font-semibold text-gray-500">ตัวเลือกเพิ่มเติม</h3>
                    <button @click="closeSubmenu" class="text-gray-400">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <template
                    v-for="item in mobileMainItems.find((i) => i.name === 'เพิ่มเติม')?.submenu
                      .items"
                    :key="item.name"
                  >
                    <router-link
                      v-if="!item.action"
                      :to="item.path"
                      class="flex items-center gap-3 px-4 py-3 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-[#4D4D4D]"
                      @click="showMoreSubmenu = false"
                    >
                      <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
                      <span>{{ item.name }}</span>
                    </router-link>
                    <button
                      v-else
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-[#4D4D4D]"
                      @click="handleMoreAction(item.action)"
                    >
                      <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
                      <span>{{ item.name }}</span>
                    </button>
                  </template>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </nav>

    <!-- Main Content -->
    <div class="flex-1" :class="[isMobile ? 'mb-16' : isCollapsed ? 'ml-16' : 'ml-64']">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import NotificationsPanel from '@/components/admin/Notifications/NotificationsPanel.vue'
import MobileNotifications from '@/components/admin/MobileNotifications/MobileNotifications.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAdminStore } from '@/stores/adminStore'
import { useJobStore } from '@/stores/jobStore'

import Swal from 'sweetalert2'

export default {
  name: 'AdminLayout',
  components: {
    Dialog,
    DialogPanel,
    TransitionRoot,
    TransitionChild,
    NotificationsPanel,
    MobileNotifications
  },
  data() {
    return {
      adminStore: useAdminStore(),
      isDarkMode: false,
      isCollapsed: false,
      isMobile: false,
      isTablet: false,
      showMobileMenu: false,
      showNotifications: false,
      showUserSubmenu: false,
      showJobSubmenu: false,
      showMoreSubmenu: false,
      showNotificationSubmenu: false,
      showAllNotifications: false,
      mainMenuItems: [
        { name: 'หน้าหลัก', path: '/admin/dashboard', icon: 'fas fa-home' },
        { name: 'ผู้ใช้', path: '/admin/alluser', icon: 'fas fa-users' },
        { name: 'ผู้ใช้งาน รออนุมัติ', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
        { name: 'ผู้ใช้งาน ถูกปฏิเสธ', path: '/admin/reject-user', icon: 'fa-solid fa-user-xmark' },
        { name: 'ผู้ใช้งาน ขอเพิ่มทักษะ', path: '/', icon: 'fas fa-tasks' },
        { name: 'ประวัติผู้ใช้งาน', path: '/', icon: 'fas fa-history' }
      ],
      jobMenuItems: [
        { name: 'งาน', path: '/admin/job-List', icon: 'fas fa-briefcase', indent: false },
        { name: 'สร้างงาน', path: '/admin/create-job', icon: 'fas fa-plus', indent: true },
        {
          name: 'งานของฉัน',
          path: '/admin/job-Management',
          icon: 'fa-solid fa-list-check',
          indent: true,
          badge: true
        }
      ],
      mobileMainItems: [
        { name: 'หน้าหลัก', path: '/admin/dashboard', icon: 'fas fa-home' },
        {
          name: 'ผู้ใช้งาน',
          icon: 'fas fa-users',
          hasSubmenu: true,
          submenu: {
            title: 'User Management',
            items: [
              { name: 'ผู้ใช้งานทั้งหมด', path: '/admin/alluser', icon: 'fas fa-users' },
              {
                name: 'ผู้ใช้งาน รออนุมัติ',
                path: '/admin/pending-users',
                icon: 'fas fa-user-clock'
              },
              {
                name: 'ผู้ใช้งาน ถูกปฏิเสธ',
                path: '/admin/reject-user',
                icon: 'fa-solid fa-user-xmark'
              },
              { name: 'ประวัติผู้ใช้งาน', path: '/admin/work-history', icon: 'fas fa-history' },
              {
                name: 'ผู้ใช้งาน ขอเพิ่มทักษะ',
                path: '/admin/skills-pending',
                icon: 'fas fa-tasks'
              }
            ]
          }
        },
        {
          name: 'งาน',
          icon: 'fas fa-briefcase',
          hasSubmenu: true,
          submenu: {
            title: 'จัดการงาน',
            items: [
              { name: 'งานทั้งหมด', path: '/admin/job-List', icon: 'fas fa-briefcase' },
              { name: 'สร้างงาน', path: '/admin/create-job', icon: 'fas fa-plus' },
              {
                name: 'งานของฉัน',
                path: '/admin/job-Management',
                icon: 'fa-solid fa-list-check',
                badge: true
              }
            ]
          }
        },
        {
          name: 'เพิ่มเติม',
          icon: 'fas fa-ellipsis-h',
          hasSubmenu: true,
          submenu: {
            title: 'ตัวเลือกเพิ่มเติม',
            items: [
              { name: 'ตั้งค่า', path: '/admin/settings', icon: 'fas fa-cog' },
              { name: 'โปรไฟล์', path: '/admin/profile', icon: 'fas fa-user' },
              { name: 'ช่วยเหลือ', path: '/admin/help', icon: 'fas fa-question-circle' },
              { name: 'ออกจากระบบ', icon: 'fas fa-sign-out-alt', action: 'logout' }
            ]
          }
        }
      ]
    }
  },
  setup() {
    const jobStore = useJobStore()
    const notificationStore = useNotificationStore()
    return { jobStore, notificationStore }
  },
  methods: {
    toggleSubmenu(menu) {
      this.closeAllSubmenus()
      if (menu === 'user') this.showUserSubmenu = !this.showUserSubmenu
      if (menu === 'job') this.showJobSubmenu = !this.showJobSubmenu
      if (menu === 'more') this.showMoreSubmenu = !this.showMoreSubmenu
    },
    closeAllSubmenus() {
      this.showUserSubmenu = false
      this.showJobSubmenu = false
      this.showMoreSubmenu = false
      this.showNotifications = false
    },
    closeSubmenu() {
      this.closeAllSubmenus()
    },
    handleResize() {
      const width = window.innerWidth
      this.isMobile = width < 640
      this.isTablet = width >= 640 && width < 1024
      if (this.isTablet) {
        this.isCollapsed = true
      }
    },
    handleMobileMenuClick(item) {
      this.closeAllSubmenus()
      if (!item.hasSubmenu) {
        this.$router.push(item.path)
        return
      }

      switch (item.name) {
        case 'ผู้ใช้งาน':
          this.showUserSubmenu = true
          break
        case 'งาน':
          this.showJobSubmenu = true
          break
        case 'การแจ้งเตือน':
          this.showNotifications = true
          break
        case 'เพิ่มเติม':
          this.showMoreSubmenu = true
          break
      }
    },
    async handleMoreAction(action) {
      switch (action) {
        case 'logout':
          await this.handleLogout()
          break
      }
      this.showMoreSubmenu = false
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
    },
    async handleLogout() {
      try {
        Swal.fire({
          title: 'Logging out...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        await this.adminStore.logout()

        await Swal.fire({
          icon: 'success',
          title: 'Logged out successfully!',
          showConfirmButton: false,
          timer: 1500
        })

        this.$router.push('/signin-admin')
      } catch (error) {
        console.error('Logout error:', error)
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again.'
        })
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  },
  mounted() {
    this.jobStore.fetchJobsAndParticipants()
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
    this.isDarkMode = localStorage.getItem('theme') === 'dark'
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
.router-link-active {
  @apply bg-[#5D5FEF]/10;
}

@keyframes bell-shake {
  0% {
    transform: rotate(0);
  }
  15% {
    transform: rotate(5deg);
  }
  30% {
    transform: rotate(-5deg);
  }
  45% {
    transform: rotate(4deg);
  }
  60% {
    transform: rotate(-4deg);
  }
  75% {
    transform: rotate(2deg);
  }
  85% {
    transform: rotate(-2deg);
  }
  92% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(0);
  }
}

.fa-bell:hover {
  animation: bell-shake 0.5s ease;
}
</style>
