<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="pt-40 pb-20 animated-bg bg-gradient-to-b from-purple-50 via-white to-transparent">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#6B7F5E] to-[#9FE7DD] bg-clip-text text-transparent"
          >
            SEMed Living Care Hospital
          </h1>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">
            ร่วมเป็นส่วนหนึ่งกับทีมผู้เชี่ยวชาญของเรา
            พร้อมโอกาสการทำงานที่ยืดหยุ่นและค่าตอบแทนที่เหมาะสม
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/signup-user"
              class="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:bg-gradient-to-r hover:from-[#FF8E53] hover:to-[#FF6B6B] text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 pulse-btn"
            >
              สมัครงานเลย
            </router-link>
            <a
              href="#features"
              class="px-8 py-3 text-gray-700 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50 hover:shadow-lg transition-all"
            >
              ดูรายละเอียด
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="py-20 bg-gradient-to-br from-white via-purple-50/30 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-[#6B7F5E] to-[#9FE7DD] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#9FE7DD]/20"
            >
              <i class="fas fa-clock text-white text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">เวลาทำงานยืดหยุ่น</h3>
            <p class="text-gray-600">
              จัดการเวลาทำงานได้ตามต้องการ เหมาะกับผู้ที่ต้องการรายได้เสริม
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-[#6B7F5E] to-[#9FE7DD] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#9FE7DD]/20"
            >
              <i class="fas fa-hand-holding-medical text-white text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">สภาพแวดล้อมที่ดี</h3>
            <p class="text-gray-600">ทำงานในหน่วยงานที่มีมาตรฐาน พร้อมทีมงานมืออาชีพ</p>
          </div>

          <!-- Feature 3 -->
          <div
            class="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-[#6B7F5E] to-[#9FE7DD] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#9FE7DD]/20"
            >
              <i class="fas fa-chart-line text-white text-xl"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">โอกาสก้าวหน้า</h3>
            <p class="text-gray-600">พัฒนาทักษะและประสบการณ์ในการทำงานจริง</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="py-20 bg-gradient-to-br from-[#6B7F5E]/5 via-[#9FE7DD]/5 to-transparent">
      <div class="max-w-4xl mx-auto text-center px-4">
        <h2 class="text-3xl font-bold mb-6">พร้อมที่จะเริ่มต้นกับเราหรือยัง?</h2>
        <p class="text-gray-600 mb-8">สมัครสมาชิกวันนี้ เพื่อค้นหาโอกาสการทำงานที่เหมาะกับคุณ</p>
        <router-link
          to="/signup-user"
          class="px-8 py-3 bg-gradient-to-r from-[#C5B4E3] to-[#EAC6FC] text-white rounded-xl hover:shadow-lg transition-all inline-block"
        >
          สมัครสมาชิก
        </router-link>
      </div>
    </div>

    <!-- Simple Footer -->
    <footer class="bg-gradient-to-b from-transparent to-gray-50/50 border-t border-purple-100/30">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="text-center text-sm text-gray-500">
          <p>&copy; 2024 SEMed Living Care Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
/* Adjust the padding and spacing in smaller screens */
@media (max-width: 768px) {
  .container {
    padding-top: 4rem;
  }
  img {
    margin-bottom: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.max-w-3xl,
.grid,
.max-w-4xl {
  animation: fadeIn 0.8s ease-out;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.animated-bg {
  background: linear-gradient(-45deg, #6b8e23, #7cc576, #8ee58b, #4caf50);
  background-size: 300% 300%;
  animation: gradientBackground 15s ease infinite;
}

@keyframes pulseEffect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.pulse-btn {
  animation: pulseEffect 2s infinite;
}
</style>
