<template>
  <div class="min-h-screen relative flex flex-col">
    <div
      class="absolute ml-5 mr-5 top-0 left-0 right-0 h-[45vh] bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] rounded-b-[30px] opacity-95"
    ></div>

    <!-- Content Section -->
    <div class="relative z-10">
      <!-- Welcome Section -->
      <div class="text-center pt-24 pb-5">
        <h1 class="text-4xl font-semibold text-white mb-1 animate-fade-in-up">ยินดีต้อนรับ</h1>
        <p class="text-base lg:text-lg text-white/90 animate-fade-in-up max-w-xl mx-auto">
          มาร่วมเป็นส่วนหนึ่งกับทีมผู้เชี่ยวชาญของเรา
        </p>
      </div>

      <!-- Register Form -->
      <div class="max-w-6xl mx-auto px-4 lg:px-8">
        <div class="bg-white rounded-[20px] shadow-xl p-6 lg:p-8 mb-8">
          <h2 class="text-2xl font-semibold text-center mb-8 text-gray-800">สมัครสมาชิก</h2>

          <form @submit.prevent="register" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <!-- คอลัมน์ซ้าย: ข้อมูลส่วนตัว -->
              <div class="space-y-4">
                <div
                  class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">ข้อมูลส่วนตัว</h3>
                  <div class="space-y-4">
                    <div class="grid grid-cols-7 gap-3">
                      <div class="col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">คำนำหน้า</label>
                        <select
                          v-model="form.prefix"
                          class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 text-gray-600"
                        >
                          <option value="" disabled selected>เลือก</option>
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                      </div>
                      <div class="col-span-4">
                        <label class="block text-sm text-gray-600 mb-1">ชื่อ</label>
                        <input
                          type="text"
                          v-model="form.firstname"
                          placeholder="ชื่อจริง"
                          class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">นามสกุล</label>
                      <input
                        type="text"
                        v-model="form.lastname"
                        placeholder="นามสกุล"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>

                    <div class="grid grid-cols-5 gap-3">
                      <div class="col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">เพศ</label>
                        <select
                          v-model="form.gender"
                          class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 text-gray-600"
                        >
                          <option value="" disabled selected>เลือก</option>
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                        </select>
                      </div>

                      <div class="col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">
                          วันเกิด
                          <span class="text-xs text-gray-400 ml-1">(ระบุเป็น ค.ศ.)</span>
                        </label>
                        <div class="date-input-container">
                          <input
                            type="date"
                            v-model="form.birthdate"
                            class="w-full px-2.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">เลขบัตรประชาชน</label>
                      <input
                        type="text"
                        v-model="form.nationalId"
                        @input="validateNationalId"
                        maxlength="13"
                        placeholder="เลขบัตรประชาชน 13 หลัก"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">ไลน์ไอดี</label>
                      <input
                        type="text"
                        v-model="form.lineId"
                        placeholder="ไลน์ไอดีของคุณ"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- คอลัมน์กลาง: อีเมลและรหัสผ่าน -->
              <div class="space-y-4">
                <div
                  class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">อีเมลและรหัสผ่าน</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">อีเมล</label>
                      <input
                        type="email"
                        v-model="form.email"
                        placeholder="อีเมลของคุณ"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
                      <input
                        type="password"
                        v-model="form.password"
                        placeholder="รหัสผ่าน"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">ยืนยันรหัสผ่าน</label>
                      <input
                        type="password"
                        v-model="form.confirmPassword"
                        placeholder="ยืนยันรหัสผ่าน"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        v-model="form.phone"
                        @input="formatPhoneNumber"
                        maxlength="12"
                        placeholder="0xx-xxx-xxxx"
                        class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c779d0]/30 transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- คอลัมน์ขวา: ข้อมูลเพิ่มเติม -->
              <div class="space-y-4">
                <div
                  class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <h3 class="text-lg font-medium text-gray-700 mb-4">ข้อมูลเพิ่มเติม</h3>
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">รูปโปรไฟล์</label>
                        <button
                          type="button"
                          @click="$refs.profileInput.click()"
                          class="w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-[#c779d0] hover:bg-gray-50/50 transition-all duration-200 text-gray-600 flex items-center justify-center gap-2"
                        >
                          <i class="fa-regular fa-user text-[#c779d0]"></i>
                          <span class="truncate">{{ profileFileName || 'อัพโหลด' }}</span>
                        </button>
                        <input
                          type="file"
                          ref="profileInput"
                          @change="handleFileChange('profilePic', $event)"
                          class="hidden"
                        />
                      </div>

                      <div>
                        <label class="block text-sm text-gray-600 mb-1">วุฒิการศึกษา</label>
                        <button
                          type="button"
                          @click="$refs.educationInput.click()"
                          class="w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-[#c779d0] hover:bg-gray-50/50 transition-all duration-200 text-gray-600 flex items-center justify-center gap-2"
                        >
                          <i class="fa-regular fa-file text-[#c779d0]"></i>
                          <span class="truncate">{{ educationFileName || 'อัพโหลด' }}</span>
                        </button>
                        <input
                          type="file"
                          ref="educationInput"
                          @change="handleFileChange('educationCertificate', $event)"
                          class="hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm text-gray-600 mb-1">เอกสารเพิ่มเติม</label>
                      <button
                        type="button"
                        @click="$refs.documentsInput.click()"
                        class="w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-[#c779d0] hover:bg-gray-50/50 transition-all duration-200 text-gray-600 flex items-center justify-center gap-2"
                      >
                        <i class="fa-regular fa-file text-[#c779d0]"></i>
                        <span class="truncate">{{
                          documentsCount ? `${documentsCount} ไฟล์` : 'อัพโหลด'
                        }}</span>
                      </button>
                      <input
                        type="file"
                        multiple
                        ref="documentsInput"
                        @change="handleFileChange('documents', $event)"
                        class="hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-[#3A3A49] mb-1">ทักษะความสามารถ</label>
                      <div class="bg-gray-50 p-2 rounded-[15px] border border-gray-200">
                        <div class="flex flex-wrap gap-1.5">
                          <label
                            v-for="skill in availableSkills"
                            :key="skill"
                            class="inline-flex items-center px-2.5 py-1 rounded-full border text-sm cursor-pointer hover:bg-gray-100"
                            :class="
                              form.skills.includes(skill)
                                ? 'bg-purple-100 border-purple-300'
                                : 'bg-white border-gray-200'
                            "
                          >
                            <input
                              type="checkbox"
                              :value="skill"
                              v-model="form.skills"
                              class="hidden"
                            />
                            <span class="text-sm">{{ skill }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Terms and Privacy Policy Section -->
            <div class="text-sm text-[#3A3A49] text-center mt-4">
              <label class="flex items-center gap-3 justify-center group cursor-pointer">
                <input
                  type="checkbox"
                  v-model="acceptTerms"
                  class="w-6 h-6 sm:w-5 sm:h-5 rounded border-gray-300 text-[#c779d0] focus:ring-[#c779d0] transition-all duration-200 cursor-pointer"
                />
                <span class="select-none">
                  ฉันยอมรับ
                  <button
                    @click.prevent="showTermsModal = true"
                    class="text-[#c779d0] hover:text-[#feac5e] transition-colors duration-200 hover:underline"
                  >
                    ข้อกำหนดการใช้งาน
                  </button>
                  และ
                  <button
                    @click.prevent="showPrivacyModal = true"
                    class="text-[#c779d0] hover:text-[#feac5e] transition-colors duration-200 hover:underline"
                  >
                    นโยบายความเป็นส่วนตัว
                  </button>
                </span>
              </label>
              <!-- Error Message -->
              <p v-if="showTermsError" class="text-red-500 text-sm mt-2 animate-fade-in">
                กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว
              </p>
            </div>

            <!-- Terms Modal -->
            <TransitionRoot appear :show="showTermsModal" as="template">
              <Dialog as="div" @close="showTermsModal = false" class="relative z-50">
                <TransitionChild
                  enter="duration-300 ease-out"
                  enter-from="opacity-0"
                  enter-to="opacity-100"
                  leave="duration-200 ease-in"
                  leave-from="opacity-100"
                  leave-to="opacity-0"
                >
                  <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                  <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                      enter="duration-300 ease-out"
                      enter-from="opacity-0 scale-95"
                      enter-to="opacity-100 scale-100"
                      leave="duration-200 ease-in"
                      leave-from="opacity-100 scale-100"
                      leave-to="opacity-0 scale-95"
                    >
                      <DialogPanel
                        class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
                      >
                        <DialogTitle as="h3" class="text-xl font-medium text-gray-900 mb-4">
                          ข้อกำหนดการใช้งาน
                        </DialogTitle>
                        <div
                          class="mt-4 text-sm text-gray-600 space-y-4 max-h-[60vh] overflow-y-auto"
                        >
                          <!-- เนื้อหาข้อกำหนดการใช้งาน -->
                          <h4 class="font-medium text-gray-800">1. การยอมรับข้อกำหนด</h4>
                          <p>
                            การใช้บริการเว็บไซต์นี้ถือว่าท่านได้อ่านและยอมรับข้อกำหนดและเงื่อนไขทั้งหมด
                            หากไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณางดใช้บริการ
                          </p>

                          <h4 class="font-medium text-gray-800">2. คุณสมบัติผู้สมัคร</h4>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>ต้องมีอายุ 18 ปีขึ้นไป</li>
                            <li>มีเอกสารแสดงตัวตนที่ถูกต้องตามกฎหมาย</li>
                            <li>สามารถทำงานในประเทศไทยได้อย่างถูกต้องตามกฎหมาย</li>
                          </ul>

                          <h4 class="font-medium text-gray-800">3. ความถูกต้องของข้อมูล</h4>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>ข้อมูลที่ให้ต้องเป็นความจริงและถูกต้อง</li>
                            <li>เอกสารประกอบการสมัครต้องเป็นเอกสารจริง ไม่ปลอมแปลง</li>
                            <li>การให้ข้อมูลเท็จอาจส่งผลให้ถูกปฏิเสธการสมัครหรือเลิกจ้าง</li>
                          </ul>

                          <h4 class="font-medium text-gray-800">4. การใช้งานเว็บไซต์</h4>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>ห้ามใช้โปรแกรมอัตโนมัติในการสมัครงาน</li>
                            <li>ห้ามส่งไฟล์ที่มีไวรัสหรือมัลแวร์</li>
                            <li>ห้ามพยายามเข้าถึงส่วนที่ไม่ได้รับอนุญาต</li>
                          </ul>

                          <h4 class="font-medium text-gray-800">5. การจัดการข้อมูล</h4>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>ข้อมูลของท่านจะถูกเก็บไว้ในระบบตามนโยบายความเป็นส่วนตัว</li>
                            <li>ท่านสามารถขอลบข้อมูลได้หากไม่ประสงค์ให้เก็บไว้</li>
                            <li>เราอาจติดต่อท่านผ่านช่องทางที่ให้ไว้เกี่ยวกับการสมัครงาน</li>
                          </ul>

                          <h4 class="font-medium text-gray-800">6. การปฏิเสธการสมัคร</h4>
                          <p>
                            เราขอสงวนสิทธิ์ในการปฏิเสธการสมัครโดยไม่จำเป็นต้องชี้แจงเหตุผล
                            ในกรณีที่พบว่าผู้สมัครไม่เหมาะสมหรือให้ข้อมูลอันเป็นเท็จ
                          </p>

                          <h4 class="font-medium text-gray-800">7. การเปลี่ยนแปลงข้อกำหนด</h4>
                          <p>
                            เราอาจปรับปรุงข้อกำหนดการใช้งานได้ตามความเหมาะสม
                            โดยจะแจ้งให้ทราบผ่านทางเว็บไซต์
                          </p>

                          <h4 class="font-medium text-gray-800">8. กฎหมายที่ใช้บังคับ</h4>
                          <p>
                            ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย หากมีข้อพิพาทใดๆ
                            ให้อยู่ภายใต้เขตอำนาจของศาลไทย
                          </p>
                        </div>
                        <div class="mt-6 flex justify-end">
                          <button
                            @click="showTermsModal = false"
                            class="px-4 py-2 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-xl hover:shadow-lg transition-all duration-200"
                          >
                            ปิด
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </TransitionRoot>

            <!-- Privacy Policy Modal -->
            <TransitionRoot appear :show="showPrivacyModal" as="template">
              <Dialog as="div" @close="showPrivacyModal = false" class="relative z-50">
                <TransitionChild
                  enter="duration-300 ease-out"
                  enter-from="opacity-0"
                  enter-to="opacity-100"
                  leave="duration-200 ease-in"
                  leave-from="opacity-100"
                  leave-to="opacity-0"
                >
                  <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                  <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild
                      enter="duration-300 ease-out"
                      enter-from="opacity-0 scale-95"
                      enter-to="opacity-100 scale-100"
                      leave="duration-200 ease-in"
                      leave-from="opacity-100 scale-100"
                      leave-to="opacity-0 scale-95"
                    >
                      <DialogPanel
                        class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
                      >
                        <DialogTitle as="h3" class="text-xl font-medium text-gray-900 mb-4">
                          นโยบายความเป็นส่วนตัว
                        </DialogTitle>
                        <div
                          class="mt-4 text-sm text-gray-600 space-y-4 max-h-[60vh] overflow-y-auto"
                        >
                          <!-- เนื้อหานโยบายความเป็นส่วนตัว -->
                          <p>1. การเก็บรวบรวมข้อมูล</p>
                          <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลที่คุณให้กับเราโดยตรง เช่น:</p>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>ชื่อ-นามสกุล</li>
                            <li>ที่อยู่อีเมล</li>
                            <li>หมายเลขโทรศัพท์</li>
                            <li>ที่อยู่</li>
                            <li>ข้อมูลทางการแพทย์</li>
                          </ul>

                          <p>2. วัตถุประสงค์ในการใช้ข้อมูล</p>
                          <p>เราใช้ข้อมูลของคุณเพื่อ:</p>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>ให้บริการทางการแพทย์</li>
                            <li>ติดต่อสื่อสารกับคุณ</li>
                            <li>ปรับปรุงการให้บริการ</li>
                            <li>วิเคราะห์และพัฒนาระบบ</li>
                          </ul>

                          <p>3. การรักษาความปลอดภัย</p>
                          <p>
                            เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการสูญหาย การเข้าถึง
                            การใช้ หรือการเปิดเผยข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต
                          </p>

                          <p>4. สิทธิของคุณ</p>
                          <p>คุณมีสิทธิที่จะ:</p>
                          <ul class="list-disc pl-6 space-y-2">
                            <li>เข้าถึงข้อมูลส่วนบุคคลของคุณ</li>
                            <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                            <li>ลบข้อมูลของคุณ</li>
                            <li>คัดค้านการประมวลผลข้อมูล</li>
                          </ul>
                        </div>
                        <div class="mt-6 flex justify-end">
                          <button
                            @click="showPrivacyModal = false"
                            class="px-4 py-2 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-xl hover:shadow-lg transition-all duration-200"
                          >
                            ปิด
                          </button>
                        </div>
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </TransitionRoot>
            <!-- ปุ่ม Submit -->
            <div class="text-center pb-4">
              <button
                type="submit"
                class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white rounded-xl hover:shadow-lg hover:shadow-[#c779d0]/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                สมัครสมาชิก
              </button>

              <p class="mt-4 text-gray-600">
                มีบัญชีอยู่แล้ว?
                <router-link to="/signin-user" class="text-[#c779d0] transition-colors">
                  เข้าสู่ระบบ
                </router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white/80 backdrop-blur-sm py-4 sm:py-6 mt-auto">
      <div class="max-w-5xl mx-auto px-4 lg:px-8">
        <!-- Desktop & Tablet Layout -->
        <div class="hidden sm:flex justify-between items-center text-gray-600">
          <div class="text-sm">
            ระบบจัดการข้อมูลบุคลากร <span class="text-[#c779d0]">Healthcare</span> &
            <span class="text-[#c779d0]">Medical</span> Services
          </div>
          <div class="flex gap-8 text-sm">
            <button @click.prevent="showPrivacyModal = true">
              <span class="hover:text-[#c779d0] transition-colors cursor-pointer"
                >นโยบายความเป็นส่วนตัว</span
              >
            </button>
            <router-link to="/contact">
              <span class="hover:text-[#c779d0] transition-colors cursor-pointer">ติดต่อเรา</span>
            </router-link>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="sm:hidden flex flex-col items-center space-y-3 text-gray-600">
          <div class="text-sm text-center">
            ระบบจัดการข้อมูลบุคลากร
            <div class="mt-1">
              <span class="text-[#c779d0]">Healthcare</span> &
              <span class="text-[#c779d0]">Medical</span> Services
            </div>
          </div>
          <div class="flex gap-4 text-sm">
            <button @click.prevent="showPrivacyModal = true">
              <span class="hover:text-[#c779d0] transition-colors cursor-pointer"
                >นโยบายความเป็นส่วนตัว</span
              >
            </button>
            <router-link to="/contact">
              <span class="hover:text-[#c779d0] transition-colors cursor-pointer">ติดต่อเรา</span>
            </router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const baseURL = import.meta.env.VITE_API_URL

export default {
  name: 'SignUpView',
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle
  },

  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        nationalId: '',
        prefix: '',
        gender: '',
        firstname: '',
        lastname: '',
        birthdate: '',
        phone: '',
        lineId: '',
        skills: [],
        nationalIdError: ''
      },
      acceptTerms: false,
      // สำหรับแสดงชื่อไฟล์ที่เลือก
      profileFileName: '',
      educationFileName: '',
      documentsCount: 0,

      // รายการ skills ที่เลือกได้
      availableSkills: [
        'เอกซเรย์',
        'พยาบาล',
        'น้ำหนัก ส่วนสูง',
        'ทะเบียน',
        'การได้ยิน',
        'เจาะเลือด',
        'เป่าปอด',
        'ตาอาชีวะ',
        'ตาทั่วไป',
        'มวลกระดูก',
        'เก็บปัสสาวะ',
        'คลื่นไฟฟ้าหัวใจ',
        'กล้ามเนื้อ',
        'มะเร็งปากมดลูก',
        'อัลตร้าซาวด์',
        'ผู้ช่วยแพทย์',
        'วัดความดัน'
      ],
      loading: false,
      passwordsMatch: true,
      showTermsModal: false,
      showPrivacyModal: false,
      showTermsError: false
    }
  },

  methods: {
    validateNationalId() {
      // ลบตัวอักษรที่ไม่ใช่ตัวเลข
      this.form.nationalId = this.form.nationalId.replace(/[^0-9]/g, '')

      if (this.form.nationalId.length > 0 && this.form.nationalId.length !== 13) {
        this.nationalIdError = 'เลขบัตรประชาชนต้องมี 13 หลัก'
      } else {
        this.nationalIdError = ''
      }
    },
    formatPhoneNumber() {
      // ลบทุกอย่างที่ไม่ใช่ตัวเลข
      let cleaned = this.form.phone.replace(/\D/g, '')
      // จำกัดให้ไม่เกิน 10 ตัว
      cleaned = cleaned.slice(0, 10)

      // จัดรูปแบบ xxx-xxx-xxxx
      if (cleaned.length >= 3) {
        cleaned = cleaned.slice(0, 3) + (cleaned.length > 3 ? '-' : '') + cleaned.slice(3)
      }
      if (cleaned.length >= 7) {
        cleaned = cleaned.slice(0, 7) + (cleaned.length > 7 ? '-' : '') + cleaned.slice(7)
      }

      this.form.phone = cleaned
    },
    validateForm() {
      // เช็คการยอมรับข้อกำหนด
      if (!this.acceptTerms) {
        this.showTermsError = true
        Swal.fire({
          icon: 'warning',
          title: 'กรุณายอมรับข้อกำหนด',
          text: 'คุณต้องยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวก่อนลงทะเบียน',
          timer: 2000,
          showConfirmButton: false
        })
        return false
      }
      this.showTermsError = false
      // เช็คข้อมูลที่จำเป็น
      const requiredFields = {
        email: 'อีเมล',
        password: 'รหัสผ่าน',
        firstname: 'ชื่อ',
        lastname: 'นามสกุล',
        nationalId: 'เลขบัตรประชาชน',
        phone: 'เบอร์โทรศัพท์',
        birthdate: 'วันเกิด',
        skills: 'ทักษะความสามารถ'
      }
      for (const [field, label] of Object.entries(requiredFields)) {
        if (field === 'skills') {
          if (!this.form[field] || this.form[field].length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'กรุณาเลือกทักษะ',
              text: 'กรุณาเลือกทักษะอย่างน้อย 1 อย่าง',
              timer: 1500,
              showConfirmButton: false
            })
            return false
          }
        } else if (!this.form[field]) {
          Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูลให้ครบ',
            text: `กรุณากรอก${label}`,
            timer: 1500,
            showConfirmButton: false
          })
          return false
        }
      }
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!this.form[field]) {
          Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูลให้ครบ',
            text: `กรุณากรอก${label}`,
            timer: 1500,
            showConfirmButton: false
          })
          return false
        }
      }
      if (this.form.nationalId.length !== 13) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกเลขบัตรประชาชนให้ถูกต้อง',
          text: 'เลขบัตรประชาชนต้องมี 13 หลัก',
          timer: 1500,
          showConfirmButton: false
        })
        return false
      }
      // เช็คไฟล์ที่จำเป็น
      const profileInput = this.$refs.profileInput
      const educationInput = this.$refs.educationInput

      if (!profileInput?.files[0]) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกรูปโปรไฟล์',
          timer: 1500,
          showConfirmButton: false
        })
        return false
      }

      if (!educationInput?.files[0]) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกไฟล์วุฒิการศึกษา',
          timer: 1500,
          showConfirmButton: false
        })
        return false
      }

      return true
    },
    handleFileChange(type, event) {
      if (!event || !event.target || !event.target.files) {
        console.error('Invalid file event')
        return
      }

      const files = event.target.files

      switch (type) {
        case 'profilePic':
          if (files[0]) {
            this.profileFileName = files[0].name
          }
          break

        case 'educationCertificate':
          if (files[0]) {
            this.educationFileName = files[0].name
          }
          break

        case 'documents':
          if (files.length) {
            this.documentsCount = files.length
          }
          break

        default:
          console.error('Unknown file type:', type)
      }
    },
    async register() {
      if (!this.validateForm()) return

      try {
        // การยืนยันก่อนลงทะเบียน
        const confirmResult = await Swal.fire({
          title: 'ยืนยันการลงทะเบียน',
          text: 'คุณต้องการลงทะเบียนใช่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ใช่, ลงทะเบียน',
          cancelButtonText: 'ยกเลิก'
        })

        if (!confirmResult.isConfirmed) return

        // แสดง loading
        Swal.fire({
          title: 'กำลังลงทะเบียน...',
          text: 'กรุณารอสักครู่',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        const formData = new FormData()
        const cleanPhone = this.form.phone.replace(/-/g, '')

        // เพิ่มข้อมูลทั่วไป
        formData.append('email', this.form.email)
        formData.append('password', this.form.password)
        formData.append('prefix', this.form.prefix)
        formData.append('first_name', this.form.firstname)
        formData.append('last_name', this.form.lastname)
        formData.append('national_id', this.form.nationalId)
        formData.append('gender', this.form.gender)
        formData.append('birth_date', this.form.birthdate)
        formData.append('phone_number', cleanPhone)
        formData.append('line_id', this.form.lineId)
        formData.append('skills', JSON.stringify(this.form.skills))

        // เพิ่มไฟล์
        const profileInput = this.$refs.profileInput
        const educationInput = this.$refs.educationInput
        const documentsInput = this.$refs.documentsInput

        if (profileInput?.files[0]) {
          formData.append('profile_image', profileInput.files[0])
        }

        if (educationInput?.files[0]) {
          formData.append('education_certificate', educationInput.files[0])
        }

        if (documentsInput?.files) {
          Array.from(documentsInput.files).forEach((file) => {
            formData.append('user_documents', file)
          })
        }

        await axios.post(`${baseURL}/api/users/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // แสดง success message
        await Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          html: `
          <div class="text-center">
            <p class="mb-2">ระบบได้ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว</p>
            <p class="text-sm text-gray-600">กรุณาตรวจสอบอีเมลและคลิกลิงก์เพื่อยืนยันตัวตน<br>ก่อนเข้าสู่ระบบ</p>
          </div>
        `,
          confirmButtonText: 'ตกลง',
          allowOutsideClick: false,
          customClass: {
            confirmButton:
              'swal2-confirm bg-gradient-to-r from-[#feac5e] via-[#c779d0] to-[#4bc0c8] text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200'
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.$router.push('/signin-user')
          }
        })
      } catch (error) {
        console.error('Registration error:', error)

        // แสดง error message
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง'
        })
      }
    },

    openTermsModal() {
      this.showTermsModal = true
    },

    closeTermsModal() {
      this.showTermsModal = false
    },

    openPrivacyModal() {
      this.showPrivacyModal = true
    },

    closePrivacyModal() {
      this.showPrivacyModal = false
    }
  }
}
</script>
<style>
.bg-register {
  background-image: url('../assets/images/backgroundregister.svg');
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ปรับ animation ให้นุ่มนวลขึ้น */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ซ่อนไอคอน calendar ของ input type date */
input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

/* สร้าง custom calendar icon */
.date-input-container {
  position: relative;
}

.date-input-container::after {
  content: '\f133'; /* Font Awesome calendar icon */
  font-family: 'Font Awesome 5 Free';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af; /* gray-400 */
}

/* ซ่อน icon เมื่อมีการกรอกข้อมูล */
input[type='date']:not(:placeholder-shown) + .date-input-container::after {
  display: none;
}
</style>
