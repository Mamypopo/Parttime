<template>
  <nav class="absolute w-full z-50 py-4">
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
            <i class="fas fa-home text-sm"></i>
            <span>Home page</span>
          </router-link>
          
          <router-link to="/parttime" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fas fa-briefcase text-sm"></i>
            <span>Parttime</span>
          </router-link>
          
          <router-link to="/work-with-us" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fas fa-users text-sm"></i>
            <span>Work with us</span>
          </router-link>
          
          <router-link to="/contact" class="flex items-center space-x-1 text-gray-800 hover:text-gray-500 text-sm">
            <i class="fas fa-envelope text-sm"></i>
            <span>Contact</span>
          </router-link>
        </div>

        <!-- Desktop Auth Buttons -->
        <div class="hidden lg:flex items-center space-x-3">
          <router-link 
            to="/signin-user" 
            class="px-4 py-1.5 bg-[#A8E6E2] text-gray-800 rounded-full hover:bg-opacity-90 text-sm shadow-sm"
          >
            SIGN IN
          </router-link>
          
          <router-link 
            to="/register-user" 
            class="px-4 py-1.5 bg-[#C5B4E3] text-gray-800 rounded-full hover:bg-opacity-90 text-sm shadow-sm"
          >
            SIGN UP
          </router-link>
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
          <router-link to="/parttime" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-briefcase text-sm mr-2"></i>
            Parttime
          </router-link>
          <router-link to="/work-with-us" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-users text-sm mr-2"></i>
            Work with us
          </router-link>
          <router-link to="/contact" class="block py-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-envelope text-sm mr-2"></i>
            Contact
          </router-link>
          
          <!-- Mobile Auth Buttons -->
          <div class="mt-4 space-y-2">
            <router-link 
              to="/signin-user" 
              class="block w-full px-4 py-2 text-center bg-[#A8E6E2] text-teal-700 rounded-full hover:bg-gray-50 text-sm shadow-sm"
            >
              SIGN IN
            </router-link>
            
            <router-link 
              to="/register-user" 
              class="block w-full px-4 py-2 text-center bg-[#C5B4E3] text-purple-700 rounded-full hover:bg-gray-50 text-sm shadow-sm"
            >
              SIGN UP
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isMenuOpen: false
    }
  },
  watch: {
    '$route'() {
      this.isMenuOpen = false
    }
  }
}
</script>

<style>
.router-link-active {
  font-weight: 500;
}
</style>