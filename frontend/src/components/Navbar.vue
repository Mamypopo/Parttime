<template>
  <nav v-if="!isAdminRoute"  class="absolute w-full z-50 py-4">
    <div class="container mx-auto px-4 sm:px-6">
      <!-- Desktop & Mobile Navbar -->
      <div class="max-w-6xl mx-auto flex items-center justify-between rounded-lg px-4 sm:px-8 py-3 bg-white shadow-lg">
        <!-- Logo -->
        <div class="flex items-center">
          <img src="@/assets/logo.svg" alt="Logo" class="h-6 w-6 sm:h-8 sm:w-8" />
          <span class="ml-2 font-medium text-gray-800 text-sm sm:text-base">
            Parttime by semad
          </span>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <router-link to="/" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fas fa-home text-sm mr-2"></i>
            <span>Home page</span>
          </router-link>
          
          <router-link to="/" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fas fa-briefcase text-sm"></i>
            <span>Parttime</span>
          </router-link>

      
          
          <router-link to="/" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fa-solid fa-user-group"></i>      
            <span>Work with us</span>
          </router-link>

            <!-- My Work เพิ่มเมื่อ login แล้ว -->
          <router-link 
            v-if="userStore.isAuthenticated"
            to="/" 
            class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm"
          >
        <i class="fa-solid fa-rocket"></i>
            <span>My Work</span>
          </router-link>
          
          <router-link to="/" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fa-solid fa-paper-plane"></i>
            <span>Contact</span>
          </router-link>
        </div>

        <!-- Desktop Auth Buttons / User Profile -->
        <div class="hidden lg:flex items-center space-x-3">
          <!-- ถ้ายังไม่ได้ login -->
          <template v-if="!userStore.isAuthenticated">
            <router-link 
              to="/signin-user" 
              class="px-4 py-1.5 bg-[#A8E6E2] text-gray-800 rounded-full hover:bg-opacity-90 text-sm shadow-sm"
            >
              <i class="fa-solid fa-key"></i>
              SIGN IN
            </router-link>
            
            <router-link 
              to="/signup-user" 
              class="px-4 py-1.5 bg-[#C5B4E3] text-gray-800 rounded-full hover:bg-opacity-90 text-sm shadow-sm"
            >
              <i class="fa-solid fa-circle-user"></i>
              SIGN UP
            </router-link>
          </template>

          <!-- ถ้า login แล้ว -->
          <template v-else>
            <!-- Notification Bell -->
            <button class="p-2 rounded-full hover:bg-gray-100 relative">
              <i class="fas fa-bell text-gray-600"></i>
              <span 
                v-if="notificationCount > 0"
                class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ notificationCount }}
              </span>
            </button>

            <!-- Profile Dropdown -->
            <div class="relative">
              <button 
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex items-center space-x-2 focus:outline-none"
              >
                <img 
        :src="profileImageUrl" 
                  class="h-8 w-8 rounded-full object-cover"
        :alt="userStore.getUser.fullName"
                >
                <i class="fas fa-chevron-down text-gray-500 text-sm"></i>
              </button>

              <!-- Dropdown Menu -->
              <div 
                v-if="isProfileMenuOpen"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1"
              >
                <router-link 
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </router-link>
                <router-link 
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </router-link>
                <button 
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="isMenuOpen = !isMenuOpen" 
          class="lg:hidden text-gray-600 focus:outline-none"
        >
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isMenuOpen" class="lg:hidden mt-4 max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-4">
          <router-link to="/" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-home text-sm mr-2"></i>
            Home page
          </router-link>
          <router-link to="/" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-briefcase text-sm"></i>
            Parttime
          </router-link>

         
          <router-link to="/" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fa-solid fa-user-group"></i>      
            Work with us
          </router-link>

           <!-- My Work ในเมนูมือถือ -->
          <router-link 
            v-if="userStore.isAuthenticated"
            to="/my-work" 
            class="block py-2 text-gray-600 hover:text-gray-800"
          >
         <i class="fa-solid fa-rocket"></i>
            My Work
          </router-link>

          <router-link to="/" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fa-solid fa-paper-plane"></i>
            Contact
          </router-link>
          
          <!-- Mobile Auth Buttons / Profile -->
          <div class="mt-4 space-y-2">
            <template v-if="!userStore.isAuthenticated">
              <router-link 
                to="/signin-user" 
                class="block w-full px-4 py-2 text-center bg-[#A8E6E2] text-teal-700 rounded-full hover:bg-gray-50 text-sm shadow-sm"
              >
                <i class="fa-solid fa-key"></i>
                SIGN IN
              </router-link>
              
              <router-link 
                to="/signup-user" 
                class="block w-full px-4 py-2 text-center bg-[#C5B4E3] text-purple-700 rounded-full hover:bg-gray-50 text-sm shadow-sm"
              >
                <i class="fa-solid fa-circle-user"></i>
                SIGN UP
              </router-link>
            </template>

            <!-- Mobile Profile Menu -->
            <template v-else>
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <img 
        :src="profileImageUrl"
                    class="h-8 w-8 rounded-full object-cover"
                    :alt="userStore.getUser.first_name"
                  >
                  <span class="text-sm text-gray-700">{{ userStore.user?.first_name }}</span>
                </div>
                <button 
                  @click="handleLogout"
                  class="text-sm text-red-500 hover:text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import Swal from 'sweetalert2' 


export default {
  name: 'NavBar',
  
  data() {
    return {
      isProfileMenuOpen: false,
      isMenuOpen: false,
      userStore: useUserStore(),
      defaultImage: 'https://ui-avatars.com/api/?name=User&background=random',
      notificationCount: 0
    }
  },

  computed: {
    profileImageUrl() {
      return this.userStore.getUser.profile_image || this.defaultImage
    },
      isAdminRoute() {
      return this.$route.path.includes('/admin') || this.$route.meta.requiresAdmin
    }
  },

  methods: {
    handleImageError(e) {
      console.log('Image load error - falling back to default')
      e.target.src = this.defaultImage
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

        await this.userStore.logout()
        
        // แสดง success
        await Swal.fire({
          icon: 'success',
          title: 'Logged out successfully!',
          showConfirmButton: false,
          timer: 1500
        })

        this.$router.push('/signin-user')
      } catch (error) {
        console.error('Logout error:', error)
        
        // แสดง error
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again.'
        })
      }
    }
  }
}
</script>