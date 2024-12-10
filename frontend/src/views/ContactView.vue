<template>
  <div class="min-h-screen bg-white py-16">
    <div class="max-w-6xl mt-12 mx-auto px-4 sm:px-6 lg:px-8">
      <!-- หัวข้อ -->
      <div class="text-center mb-16">
        <h1
          class="text-4xl font-bold mb-4 bg-gradient-to-r from-[#6B7F5E] to-[#9FE7DD] bg-clip-text text-transparent animate-fade-in-up"
        >
          ติดต่อเรา
        </h1>
        <p class="text-gray-600 animate-fade-in-up">ยินดีให้บริการและตอบคำถามทุกวัน</p>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <!-- ชื่อองค์กร -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-[#2D3748] mb-2">
            ศูนย์วิจัยทางการแพทย์อาชีวเวชศาสตร์ไทย
          </h2>
          <p class="text-[#6B7F5E]">โรงพยาบาลซีเมดลิฟวิ่งแคร์</p>
        </div>

        <!-- ที่อยู่ -->
        <div class="flex items-start gap-3 mb-6">
          <i class="fas fa-map-marker-alt text-[#6B7F5E] text-xl mt-1"></i>
          <div class="text-gray-600">
            <p>111 ซอยรังสิต-นครนายก 42 ถนนรังสิต-นครนายก</p>
            <p>ตำบลประชาธิปัตย์</p>
            <p>อำเภอธัญบุรี</p>
            <p>ปทุมธานี 12130</p>
          </div>
        </div>

        <!-- ข้อมูลติดต่อ -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="flex items-center gap-3">
            <i class="fas fa-phone text-[#6B7F5E]"></i>
            <div>
              <p class="text-sm text-gray-500">โทรศัพท์</p>
              <a href="tel:021992111" class="text-[#2D3748] hover:text-[#6B7F5E]"> 02-199-2111 </a>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <i class="fas fa-fax text-[#6B7F5E]"></i>
            <div>
              <p class="text-sm text-gray-500">แฟกซ์</p>
              <span class="text-[#2D3748]">02-101-1703</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <i class="fas fa-envelope text-[#6B7F5E]"></i>
            <div>
              <p class="text-sm text-gray-500">อีเมล</p>
              <a href="mailto:hr@semed.co.th" class="text-[#2D3748] hover:text-[#6B7F5E]">
                hr@semed.co.th
              </a>
            </div>
          </div>
        </div>

        <!-- เวลาทำการ -->
        <div class="border-t border-gray-200 pt-6 mb-8">
          <h3 class="text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
            <i class="fas fa-clock text-[#6B7F5E]"></i>
            เวลาทำการ
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">วันจันทร์ - ศุกร์</p>
              <p class="text-gray-500">08:00 - 17:00 น.</p>
            </div>
            <div>
              <p class="text-gray-600">วันเสาร์</p>
              <p class="text-gray-500">08:00 - 12:00 น.</p>
            </div>
          </div>
        </div>
        <!-- Social Media -->
        <div class="border-t border-gray-200 pt-6 mb-8">
          <h3 class="text-lg font-semibold text-[#2D3748] mb-4">ติดตามเราได้ที่</h3>
          <div class="flex gap-4">
            <a
              href="https://www.facebook.com/SEMED01"
              target="_blank"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] text-white hover:bg-[#1864D9] transition-colors"
            >
              <i class="fab fa-facebook-f"></i>
              <span>Facebook</span>
            </a>
            <a
              href="https://page.line.me/000kresa?openQrModal=true"
              target="_blank"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00B900] text-white hover:bg-[#009D00] transition-colors"
            >
              <i class="fab fa-line"></i>
              <span>Line Official</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Google Maps -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden h-[400px]">
        <iframe
          src="https://www.google.com/maps?q=13.981456183947063,100.64007707888071&z=15&output=embed"
          class="w-full h-full"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactView'
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
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

.text-primary-600 {
  @apply text-[#6B7F5E];
}
</style>
