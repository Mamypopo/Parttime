<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <div class="container mx-auto px-6 pt-8 md:pt-4 lg:pt-0 md:px-6 flex-grow flex items-end justify-center ">
      <div class="flex flex-col md:flex-row items-center justify-between md:space-x-8 lg:space-x-12">
        <!-- Text Content -->
        <div class="max-w-xl mb-4 md:mb-0 text-center md:text-left md:w-1/2">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 pt-5 md:mb-4">
            <span class="text-[#6B7F5E]">SEMed</span>
            <div class="text-gray-700">
              Living
              <br />
              Care Hospital
            </div>
          </h1>
          <p class="text-gray-600 mb-8">ร่วมมาเป็นส่วนหนึ่งกับเรา</p>
          <button class="px-8 py-3 bg-[#C5B4E3] text-white rounded-lg hover:bg-opacity-90  relative z-20">
            งานพาร์ทไทม์
          </button>
        </div>

        <!-- Image -->
        <div class="w-full md:w-3/4 lg:w-2/3 flex justify-center items-end  ">
          <img 
            src="../assets/images/doctor-xray.svg" 
            alt="Doctor examining x-ray" 
            class="w-full max-w-xl md:max-w-2xl lg:max-w-3xl"
          />
        </div>
      </div>
    </div>

    <!-- Statistics Bar -->
<div class="w-full mt-0 relative z-0">
  <div class="relative overflow-visible">
    <!-- Decorative Elements -->
    <div class="absolute -left-10 -top-10 w-32 md:w-40 lg:w-48">
      <img 
        src="../assets/images/Polygon1.svg" 
        alt="Yellow triangle"
        class="w-full h-full object-contain transform -rotate-12"
      />
    </div>
    
    <div class="absolute -right-2 -bottom-0 w-32 md:w-40 lg:w-48">
      <img 
        src="../assets/images/Ellipse48.svg" 
        alt="Pink circle"
        class="w-full h-full object-contain"
      />
    </div>
    
    <!-- Statistics Content -->
    <div class="stats-bg w-full bg-[#9FE7DD]">
      <div class="container mx-auto py-8 md:py-12">
        <div class="grid grid-cols-3 gap-4 text-center text-white">
          <div>
            <div class="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">200</div>
            <div class="text-base md:text-lg lg:text-xl">จำนวนงาน</div>
          </div>
          <div>
            <div class="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">150</div>
            <div class="text-base md:text-lg lg:text-xl">ตำแหน่ง</div>
          </div>
          <div>
            <div class="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">2K+</div>
            <div class="text-base md:text-lg lg:text-xl">จำนวนผู้ใช้งาน</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'HomeView'
}


</script>

<style scoped>
.stats-bg {
  background-image: url('../assets/images/backgroundregister.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}


/* Adjust the padding and spacing in smaller screens */
@media (max-width: 768px) {
  .container {
    padding-top: 4rem; /* เพิ่ม padding ด้านบน */
  }
   img {
    margin-bottom: 0; /* ลดช่องว่างใต้รูป */
  }
}

</style>