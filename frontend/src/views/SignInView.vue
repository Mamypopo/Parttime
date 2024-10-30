<template>
  <div class="min-h-screen flex flex-col">


    <!-- Main Content -->
    <div class="flex-1 flex flex-col md:flex-row">
      <!-- Login Form Section -->
      <div class="w-full md:w-1/2 px-4 md:px-12 lg:px-24 flex flex-col justify-center">
        <div class="max-w-md w-full mx-auto">
          <h1 class="text-4xl font-medium text-[#C5B3E6] mb-2">Welcome</h1>
          <p class="text-gray-500 mb-8">Enter your email and password to sign in</p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Email</label>
              <input 
                type="email" 
                v-model="email"
                placeholder="Your email address"
                class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-sm text-gray-600 mb-1">Password</label>
              <input 
                type="password" 
                v-model="password"
                placeholder="Your password"
                class="w-full px-3 py-2 rounded-[15px] bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
            </div>

            <!-- Remember Me -->
            <div class="flex items-center">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="rememberMe"
                  class="rounded border-gray-300 text-[#CDE45F] focus:ring-[#CDE45F]"
                >
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            <!-- Sign In Button -->
            <button 
              type="submit"
              class="w-full py-2.5 bg-[#C5B3E6] text-white rounded-lg hover:bg-[#B39DDB] transition-colors"
            >
              SIGN IN
            </button>

            <!-- Sign Up Link -->
            <p class="text-center text-sm text-gray-600">
              Don't have an account? 
              <router-link to="/signup" class="text-[#CDE45F] hover:underline">Sign up</router-link>
            </p>
          </form>
        </div>
      </div>

      <!-- Image Section -->
     <div class="hidden md:block md:w-1/2">
  <div class="signin-bg h-[75vh] rounded-[22px] relative mx-6 my-8">
    <img 
      src="../assets/images/loginbackground.svg" 
      alt="Medical consultation" 
      class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] max-w-xl"
    />
  </div>
</div>
      
    </div>

    <!-- Footer -->
    <div class="py-4 px-4 md:px-12">
      <div class="flex flex-wrap gap-4 text-sm text-gray-500">
        <span>Lorem ipsum dolor sit <span class="text-[#CDE45F]">Lorem ipsum</span> & <span class="text-[#CDE45F]">Something</span> Lorem ipsum</span>
        <div class="flex gap-8 ml-auto">
          <span>Lorem ipsum</span>
          <span>Lorem ipsum</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
</script>
<style>

.signin-bg{
background-image: url('../assets/images/loginbackground2.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  
}

</style>