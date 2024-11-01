<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
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
        class="transition-all duration-500 ease-in-out h-screen fixed bg-white border-r" 
        :class="[isCollapsed ? 'w-16' : 'w-64']"
      >
        <!-- Header -->
        <div class="flex items-center p-4" :class="[isCollapsed ? 'justify-center' : 'justify-between']">
          <div class="flex items-center" :class="[isCollapsed ? 'justify-center' : 'gap-2']">
            <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-8 h-8" />
            <h1 v-if="!isCollapsed" class="text-lg font-medium">Admin dashboard</h1>
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
        <nav class="px-2 py-2">
          <!-- Main Menu -->
          <router-link 
            v-for="(item, index) in mainMenuItems" 
            :key="index"
            :to="item.path"
            class="flex items-center mb-1 px-4 py-2 hover:bg-gray-100 rounded-lg"
            :class="[isCollapsed ? 'justify-center' : 'gap-3']"
            :title="isCollapsed ? item.name : ''"
          >
            <i :class="['text-gray-400', item.icon]"></i>
            <span v-if="!isCollapsed">{{ item.name }}</span>
          </router-link>
          
          <NotificationsPanel :is-collapsed="isCollapsed" />

          <!-- Jobs Section -->
          <div class="mt-4 pt-4 border-t">
            <router-link 
              v-for="(item, index) in jobMenuItems" 
              :key="index"
              :to="item.path"
              class="flex items-center mb-1 px-4 py-2 hover:bg-gray-100 rounded-lg"
              :class="[
                isCollapsed ? 'justify-center' : 'gap-3',
                !isCollapsed && item.indent ? 'ml-4' : ''
              ]"
              :title="isCollapsed ? item.name : ''"
            >
              <i :class="['text-gray-400', item.icon]"></i>
              <span v-if="!isCollapsed">{{ item.name }}</span>
            </router-link>
          </div>
        </nav>

        <!-- Admin Profile -->
        <div class="absolute bottom-0 left-0 bg-emerald-100 p-4 transition-all duration-300"
          :class="[isCollapsed ? 'w-16' : 'w-64']"
        >
          <div v-if="!isCollapsed" class="flex items-center gap-2 mb-3">
            <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-10 h-10 rounded-full" />
            <div>
              <div class="font-medium">Lorem ipsum</div>
              <div class="text-sm text-gray-600">Loremipsum@gmail.com</div>
            </div>
          </div>
          <div v-else class="flex justify-center">
            <img src="@/assets/images/logosemed.svg" alt="Admin" class="w-10 h-10 rounded-full" />
          </div>
          <button v-if="!isCollapsed" @click="handleLogout" class="w-full mt-3 py-2 bg-white rounded-lg hover:bg-gray-50">
            Logout
          </button>
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
    <nav v-if="isMobile" class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
      <div class="flex justify-around items-center">
        <router-link 
          v-for="item in mobileMainItems" 
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center p-2"
        >
          <i :class="['text-xl text-gray-400', item.icon]"></i>
          <span class="text-xs mt-1">{{ item.name }}</span>
        </router-link>
        
        <!-- Mobile Notifications -->
        <button class="flex flex-col items-center p-2 relative">
          <i class="fas fa-bell text-xl text-gray-400"></i>
          <span v-if="notificationCount" 
            class="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ notificationCount }}
          </span>
          <span class="text-xs mt-1">Alerts</span>
        </button>

        <!-- More Menu Button -->
        <button 
          @click="showMobileMenu = !showMobileMenu" 
          class="flex flex-col items-center p-2"
        >
          <i class="fas fa-ellipsis-h text-xl text-gray-400"></i>
          <span class="text-xs mt-1">More</span>
        </button>
      </div>

      <!-- More Menu Dropdown with Transition -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-y-full"
        enter-to-class="transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform translate-y-0"
        leave-to-class="transform translate-y-full"
      >
        <div 
          v-show="showMobileMenu" 
          class="absolute bottom-full left-0 right-0 bg-white border-t shadow-lg p-4"
        >
          <router-link 
            v-for="item in mobileMoreItems" 
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
            @click="showMobileMenu = false"
          >
            <i :class="['text-gray-400', item.icon]"></i>
            <span>{{ item.name }}</span>
          </router-link>
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

export default {
  name: 'AdminLayout',
  components: {
    NotificationsPanel
  },
  data() {
    return {
      isCollapsed: false,
      isMobile: false,
      isTablet: false,
      showMobileMenu: false,
      notificationCount: 2,
      mainMenuItems: [
        { name: 'Home', path: '/admin/dashboard', icon: 'fas fa-home' },
        { name: 'Users', path: '/admin/users', icon: 'fas fa-users' },
        { name: 'Pending Users', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
        { name: 'User Add Skills Pending', path: '/admin/skills-pending', icon: 'fas fa-tasks' },
        { name: 'User Work History', path: '/admin/work-history', icon: 'fas fa-history' }
      ],
      jobMenuItems: [
        { name: 'Jobs', path: '/admin/jobs', icon: 'fas fa-briefcase', indent: false },
        { name: 'My Jobs', path: '/admin/my-jobs', icon: 'fas fa-list', indent: true },
        { name: 'Create Job', path: '/admin/create-job', icon: 'fas fa-plus', indent: true }
      ],
      mobileMainItems: [
        { name: 'Home', path: '/admin', icon: 'fas fa-home' },
        { name: 'Users', path: '/admin/users', icon: 'fas fa-users' },
        { name: 'Jobs', path: '/admin/jobs', icon: 'fas fa-briefcase' },
        { name: 'Profile', path: '/admin/profile', icon: 'fas fa-user' }
      ],
      mobileMoreItems: [
        { name: 'Pending Users', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
        { name: 'Skills Pending', path: '/admin/skills-pending', icon: 'fas fa-tasks' },
        { name: 'Work History', path: '/admin/work-history', icon: 'fas fa-history' },
        { name: 'My Jobs', path: '/admin/my-jobs', icon: 'fas fa-list' },
        { name: 'Create Job', path: '/admin/create-job', icon: 'fas fa-plus' }
      ]
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

    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
    },

    handleLogout() {
      this.$router.push('/signin-admin')
    }
  },

  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
.router-link-active {
  @apply text-blue-500;
}

.router-link-active i {
  @apply text-blue-500;
}

nav {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
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