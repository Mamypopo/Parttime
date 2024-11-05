<template>
  <!-- พื้นทีหน้าหลัก -->
  <div class="flex flex-col min-h-screen bg-[#F2F5FF]" >
   
    <!-- Desktop/Tablet Sidebar with Transition -->
    <Transition
       enter-active-class="transition-all duration-500 ease-in-out"
  enter-from-class="opacity-0 transform -translate-x-full"
  enter-to-class="opacity-100 transform translate-x-0"
  leave-active-class="transition-all duration-500 ease-in-out"
  leave-from-class="opacity-100 transform translate-x-0"
  leave-to-class="opacity-0 transform -translate-x-full"
    >
      <div v-show="!isMobile" 
        class="transition-all duration-500 ease-in-out h-screen fixed  bg-white border-r drop-shadow-md " 
        :class="[isCollapsed ? 'w-16' : 'w-70']"
      >
        <!-- Header -->
        <div class="flex items-center p-4 " :class="[isCollapsed ? 'justify-center' : 'justify-between']">
          <div class="flex items-center" :class="[isCollapsed ? 'justify-center' : 'gap-2']">
            <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-8 h-8" />
            <h1 v-if="!isCollapsed" class="text-lg font-semibold text-[#4D4D4D]">Admin dashboard</h1>
          </div>
          
          <!-- Toggle Sidebar Button -->
          <button v-if="!isCollapsed && !isTablet" 
            @click="toggleSidebar"
            class="hover:bg-gray-100 p-2 rounded-full"
            title="Collapse sidebar"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>

        <!-- Navigation Sidebar -->
        <nav class="px-2 py-2 mt-8 bg-white">
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

          <NotificationsPanel :is-collapsed="isCollapsed " />
        

          <!-- Jobs Section -->
          <div class="mt-4 pt-4 border-t">
            <router-link 
              v-for="(item, index) in jobMenuItems" 
              :key="index"
              :to="item.path"
              class="flex items-center mb-1 px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold text-[#4D4D4D]"
              :class="[
                isCollapsed ? 'justify-center' : 'gap-3',
                !isCollapsed && item.indent ? '' : ''
              ]"
              :title="isCollapsed ? item.name : ''"
            >
              <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
              <span v-if="!isCollapsed">{{ item.name }}</span>
            </router-link>
          </div>
        </nav>

        <!-- Admin Profile -->
       <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#bbe4e1] to-[#B3E5FC] p-8 transition-all duration-300 h-[200px]" 
  :class="[isCollapsed ? 'w-16' : 'w-70']"
>
  <div class="flex flex-col items-center">
    <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-10 h-10 rounded-full mb-3" />
    
    <div v-if="!isCollapsed" class="text-center">
      <div class="font-semibold truncate max-w-[150px]">Lorem ipsum</div>
      <div class="text-semibold text-[#4D4D4D] truncate max-w-[150px]">Loremipsum@gmail.com</div>
    </div>
    
    <button v-if="!isCollapsed" @click="handleLogout" 
      class="w-full mt-3 py-2  bg-white rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
    >
      <i class="fa-solid fa-arrow-right-from-bracket"></i>
      Logout
    </button>
  </div>
</div>
      </div>
    </Transition>

    <!-- Toggle Button with Transition -->
   <Transition
  enter-active-class="transition-all duration-500 ease-in-out"
  enter-from-class="opacity-0 transform translate-x-4"
  enter-to-class="opacity-100 transform translate-x-0"
  leave-active-class="transition-all duration-500 ease-in-out"
  leave-from-class="opacity-100 transform translate-x-0"
  leave-to-class="opacity-0 transform translate-x-4"
>
  <button v-show="isCollapsed && !isTablet && !isMobile" 
    @click="toggleSidebar"
    class="fixed top-4 left-[4.2rem] bg-white hover:bg-gray-100 p-2 rounded-full shadow-md z-50"
    title="Expand sidebar"
  >
    <i class="fas fa-chevron-right"></i>
  </button>
</Transition>

 <!-- Mobile Bottom Navigation -->
<nav v-if="isMobile" class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 ">
  <div class="flex justify-around items-center">
    <template v-for="item in mobileMainItems" :key="item.name">
      <button
        class="flex flex-col items-center p-2  text-[#3A3A49]"
        @click="handleMobileMenuClick(item)"
      >
        <i :class="['text-xl text-[#3A3A49]', item.icon]"></i>
        <span class="text-xs mt-1">{{ item.name }}</span>
      </button>
    </template>
  </div>

  <!-- Users Submenu -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-y-full"
    enter-to-class="transform translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-y-0"
    leave-to-class="transform translate-y-full"
  >
    <div 
      v-show="showUserSubmenu" 
      class="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg p-4"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xs font-semibold text-gray-500">User Management</h3>
        <button @click="showUserSubmenu = false" class="text-gray-400">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <router-link 
        v-for="item in mobileMainItems.find(i => i.name === 'Users')?.submenu.items"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg  font-semibold text-[#4D4D4D]"
        @click="showUserSubmenu = false"
      >
        <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
        <span>{{ item.name }}</span>
      </router-link>
    </div>
  </Transition>

  <!-- Jobs Submenu -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-y-full"
    enter-to-class="transform translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="transform translate-y-0"
    leave-to-class="transform translate-y-full"
  >
    <div 
      v-show="showJobSubmenu" 
      class="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg p-4 "
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xs font-semibold text-gray-500">Job Management</h3>
        <button @click="showJobSubmenu = false" class="text-gray-400">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <router-link 
        v-for="item in mobileMainItems.find(i => i.name === 'Jobs')?.submenu.items"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 hover:bg-[#5D5FEF] hover:bg-opacity-5 rounded-lg font-semibold text-[#4D4D4D]"
        @click="showJobSubmenu = false"
      >
        <i :class="['text-[#A8E6E2] text-xl', item.icon]"></i>
        <span>{{ item.name }}</span>
      </router-link>
    </div>
  </Transition>

  <!-- Notifications Submenu -->
<MobileNotifications
  v-model="showNotificationSubmenu"
  @close="showAllNotifications = false"
/>

<!-- More Submenu -->
<Transition
  enter-active-class="transition-all duration-300 ease-out"
  enter-from-class="transform translate-y-full"
  enter-to-class="transform translate-y-0"
  leave-active-class="transition-all duration-300 ease-in"
  leave-from-class="transform translate-y-0"
  leave-to-class="transform translate-y-full"
>
  <div 
    v-show="showMoreSubmenu" 
    class="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg p-4"
  >
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xs font-semibold text-gray-500">More Options</h3>
      <button @click="showMoreSubmenu = false" class="text-gray-400">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <template v-for="item in mobileMainItems.find(i => i.name === 'More')?.submenu.items" :key="item.name">
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
  </div>
</Transition>
</nav>

    <!-- Main Content -->
    <div class="flex-1" :class="[
      isMobile ? 'mb-16' : isCollapsed ? 'ml-16' : 'ml-64'
    ]">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import NotificationsPanel from '@/components/admin/NotificationsPanel.vue'
import MobileNotifications from '@/components/admin/MobileNotifications.vue'

import { useAdminStore } from '@/stores/adminStore';
import Swal from 'sweetalert2';
export default {
  name: 'AdminLayout',
  components: {
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
      notificationCount: 2,
      showUserSubmenu: false,
      showJobSubmenu: false,
      showNotificationSubmenu: false,
      showAllNotifications: false,
      showMoreSubmenu: false,
      mainMenuItems: [
        { name: 'หน้าหลัก', path: '/admin/dashboard', icon: 'fas fa-home' },
        { name: 'ผู้ใช้', path: '/admin/alluser', icon: 'fas fa-users' },
        { name: 'ผู้ใช้งาน รออนุมัติ', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
        { name: 'ผู้ใช้งาน ถูกปฏิเสธ', path: '/admin/reject-user', icon: 'fa-solid fa-user-xmark' },
        { name: 'ผู้ใช้งาน ขอเพิ่มทักษะ', path: '/', icon: 'fas fa-tasks' },
        { name: 'ประวัติผู้ใช้งาน', path: '/', icon: 'fas fa-history' }
      ],
      
      jobMenuItems: [
        { name: 'งาน', path: '/', icon: 'fas fa-briefcase', indent: false },
        { name: 'สร้างงาน', path: '/admin/create-job', icon: 'fas fa-plus', indent: true },
        { name: 'งานของฉัน', path: '/', icon: 'fas fa-list', indent: true }
      ],

      mobileMainItems: [
        { name: 'หน้าหลัก', path: '/admin', icon: 'fas fa-home' },
        { 
          name: 'ผู้ใช้งาน', 
          icon: 'fas fa-users',
          hasSubmenu: true, 
          submenu: {
            title: 'User Management',
            items: [
              { name: 'ผู้ใช้งานทั้งหมด', path: '/admin/alluser', icon: 'fas fa-users' },
              { name: 'ผู้ใช้งาน รออนุมัติ', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
              { name: 'ผู้ใช้งาน ถูกปฏิเสธ', path: '/admin/reject-user', icon: 'fa-solid fa-user-xmark' },
              { name: 'ประวัติผู้ใช้งาน', path: '/admin/work-history', icon: 'fas fa-history' },
              { name: 'ผู้ใช้งาน ขอเพิ่มทักษะ', path: '/admin/skills-pending', icon: 'fas fa-tasks' },
            ]
          }
        },
        { 
          name: 'Jobs', 
          icon: 'fas fa-briefcase',
          hasSubmenu: true,
          submenu: {
            title: 'Job Management',
            items: [
              { name: 'All Jobs', path: '/admin/jobs', icon: 'fas fa-briefcase' },
              { name: 'My Jobs', path: '/admin/my-jobs', icon: 'fas fa-list' },
              { name: 'Create Job', path: '/admin/create-job', icon: 'fas fa-plus' }
            ]
          }
        },
         { 
          name: 'Notifications', 
          icon: 'fas fa-bell',
          hasSubmenu: true,
          submenu: {
            title: 'Notifications',
            items: [
              { name: 'All Notifications', path: '/admin/notifications', icon: 'fas fa-bell' },
              { name: 'Unread', path: '/admin/notifications/unread', icon: 'fas fa-envelope' },
            ]
          }
        },
          { 
          name: 'More', 
          icon: 'fas fa-ellipsis-h',
          hasSubmenu: true,
          submenu: {
            title: 'More Options',
            items: [
              { name: 'Settings', path: '/admin/settings', icon: 'fas fa-cog' },
              { name: 'Profile', path: '/admin/profile', icon: 'fas fa-user' },
              { name: 'Help', path: '/admin/help', icon: 'fas fa-question-circle' },
              { name: 'Logout', icon: 'fas fa-sign-out-alt', action: 'logout' }
            ]
          }
        },
      ],   
    }
  },
 computed: {
    notifications() {
      return this.adminStore.notifications
    }
  },
  methods: {
    handleResize() {
      const width = window.innerWidth
      this.isMobile = width < 640
      this.isTablet = width >= 640 && width < 1024
      
      // Auto collapse on tablet
      if (this.isTablet) {
        this.isCollapsed = true
      }
    },
  handleMobileMenuClick(item) {
    if (!item.hasSubmenu) {
      this.$router.push(item.path)
      return
    }

    // ปิดเมนูทั้งหมด
    this.showUserSubmenu = false
    this.showJobSubmenu = false
    this.showNotificationSubmenu = false
    this.showMoreSubmenu = false

    // เปิดเมนูที่เลือก
    switch(item.name) {
      case 'Users':
        this.showUserSubmenu = true
        break
      case 'Jobs':
        this.showJobSubmenu = true
        break
      case 'Notifications':
        this.showNotificationSubmenu = true
        break
      case 'More':
        this.showMoreSubmenu = true
        break
    }
  },
    async handleMoreAction(action) {
    switch(action) {
      case 'logout':
        await this.handleLogout()
        break
      // เพิ่ม actions อื่นๆ ในอนาคต
    }
    this.showMoreSubmenu = false
  },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
    },
   async handleLogout() {
    try {
      // แสดง loading
      Swal.fire({
        title: 'Logging out...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      await this.adminStore.logout()
      
      // แสดง success
      await Swal.fire({
        icon: 'success',
        title: 'Logged out successfully!',
        showConfirmButton: false,
        timer: 1500
      })

      this.$router.push('/signin-admin')
    } catch (error) {
      console.error('Logout error:', error)
      
      // แสดง error
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong! Please try again.'
      })
    }
  },
  toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark'); // บันทึกโหมดกลางคืน
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light'); // บันทึกโหมดกลางวัน
      }
    },
  },

  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()

     this.isDarkMode = localStorage.getItem('theme') === 'dark';
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  
  
}
</script>

<style scoped>
.router-link-active {
  @apply bg-[#5D5FEF]/10;
}

@keyframes bell-shake {
  0% { transform: rotate(0); }
  15% { transform: rotate(5deg); }
  30% { transform: rotate(-5deg); }
  45% { transform: rotate(4deg); }
  60% { transform: rotate(-4deg); }
  75% { transform: rotate(2deg); }
  85% { transform: rotate(-2deg); }
  92% { transform: rotate(1deg); }
  100% { transform: rotate(0); }
}

.fa-bell:hover {
  animation: bell-shake 0.5s ease;
}
</style>