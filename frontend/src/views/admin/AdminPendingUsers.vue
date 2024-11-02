<template>
  <div class="rounded-3xl p-4 md:p-8 min-h-screen bg-white transition-all duration-500 ease-in-out ">
    <h1 class="text-xl md:text-2xl text-purple-400 mb-4 md:mb-6">Pending Users</h1>

    <!-- Search Section -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 transition-all duration-500 ease-in-out">
        
      <div class="relative">
        <input 
          v-model="searchFilters.name"
          type="text" 
          placeholder="Search by first-last name"
          class="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200"
        >
        <span class="absolute left-2 top-2.5"><i class=" text-[#64748B] fa-solid fa-magnifying-glass"></i></span>
      </div>
      <div class="relative">
        <input 
          v-model="searchFilters.position"
          type="text" 
          placeholder="Search by position"
          class="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200"
        >
        <span class="absolute left-2 top-2.5"><i class=" text-[#64748B] fa-solid fa-magnifying-glass"></i></span>
      </div>
      <div class="relative">
        <input 
          v-model="searchFilters.idCard"
          type="text" 
          placeholder="Search by ID card number"
          class="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200"
        >
        <span class="absolute left-2 top-2.5"><i class=" text-[#64748B] fa-solid fa-magnifying-glass"></i></span>
      </div>
      <div class="flex gap-2">
        <button @click="searchUsers" class="flex-1 md:flex-none bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 text-sm">
          Search
        </button>
        <button @click="clearSearch" class="flex-1 md:flex-none bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 text-sm">
          Clear
        </button>
      </div>
    </div>

<!-- Desktop: Table View -->
<div class="hidden md:block overflow-x-auto transition-all duration-500 ease-in-out">
  <table class="w-full min-w-[800px]  transition-all duration-500 ease-in-out"> <!-- กำหนดความกว้างขั้นต่ำ -->
    <thead>
      <tr class="text-left border-b">
        <th class="pb-4 px-6 font-medium w-32  ">วันที่สมัคร</th>
        <th class="pb-4 px-6 font-medium w-40">ชื่อ-นามสกุล</th>
        <th class="pb-4 px-6 font-medium w-48" >ทักษะ</th>
        <th class="pb-4 px-6 font-medium w-48 text-center" >อีเมล</th>
        <th class="pb-4 px-6 font-medium w-24 text-center">ยืนยันอีเมล</th>
        
        <th class="pb-4 px-6 font-medium w-24 text-center">จัดการ</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in formattedUsers" :key="user.id" class="border-b hover:bg-gray-50">
        <td class="py-4 px-4 whitespace-nowrap">{{ user.registeredDate }}</td>
        <td class="py-4 px-4 whitespace-nowrap">{{ user.fullName }}</td>
        <td class="py-4 px-4" colspan="2">
          <div class="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
            <div class="flex-1 flex flex-wrap gap-1.5">
              <span v-for="skill in JSON.parse(user.skills)" 
                    :key="skill"
                    class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600 ">
                {{ skill }}
              </span>
            </div>
            <div class="py-4 px-4">{{ user.email }}</div>
          </div>
        </td>
        <td class="py-4 px-4">
          <div class="flex justify-center">
            <span :class="[
              'flex items-center justify-center w-8 h-8 rounded-full',
              user.isVerified ? 'bg-green-100' : 'bg-red-100'
            ]">
              <i :class="[
                user.isVerified ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark',
                user.isVerified ? 'text-green-600' : 'text-red-600'
              ]">
              </i>
            </span>
          </div>
        </td>
        <td class="py-4 px-6">
          <div class="flex flex-col sm:flex-row justify-center gap-2">
            <button @click="showUserDetails(user)" 
                    class="bg-blue-400 text-white px-3 py-1 rounded-full hover:bg-blue-500 text-sm">
              รายละเอียด
            </button>
            <button @click="handleApprove(user.id)" 
                    class="bg-green-400 text-white px-3 py-1 rounded-full hover:bg-green-500 text-sm">
              อนุมัติ
            </button>
            <button @click="handleReject(user.id)"
                    class="bg-red-400 text-white px-3 py-1 rounded-full hover:bg-red-500 text-sm">
              ไม่อนุมัติ
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<!-- Mobile: Card View -->
<div class="md:hidden space-y-4  p-1  transition-all duration-500 ease-in-out">
  <div v-for="user in formattedUsers" 
       :key="user.id" 
       class="bg-white rounded-lg p-4 shadow-sm space-y-3 transition-all duration-500 ease-in-out">
    <div class="flex justify-between items-center">
      <span class="text-sm text-gray-500">วันที่ลงทะเบียน : {{ user.registeredDate }}</span>
      <span :class="[
        'flex items-center justify-center w-8 h-8 rounded-full',
        user.isVerified ? 'bg-green-100' : 'bg-red-100'
      ]">
        <i :class="[
          user.isVerified ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark',
          user.isVerified ? 'text-green-600' : 'text-red-600'
        ]"></i>
      </span>
    </div>
    
    <div class="space-y-1">
      <h3 class="font-medium">ชื่อ : {{ user.fullName }}</h3>
      <p class="text-sm text-gray-600  ">อีเมล : {{ user.email }}</p>
    </div>
    
    <div class="flex flex-wrap gap-1.5">
<p class="text-sm">
    ทักษะ
</p>
    <span v-for="skill in user.skills" 
            :key="skill"
            class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600">
        {{ skill }}
      </span>
    </div>
    
    <div class="flex flex-col gap-2 pt-2">
      <button @click="showUserDetails(user)" 
              class="w-full bg-blue-400 text-white px-3 py-1.5 rounded-full hover:bg-blue-500 text-sm">
        รายละเอียด
      </button>
      <button @click="handleApprove(user.id)" 
              class="w-full bg-green-400 text-white px-3 py-1.5 rounded-full hover:bg-green-500 text-sm">
        อนุมัติ
      </button>
      <button @click="handleReject(user.id)"
              class="w-full bg-red-400 text-white px-3 py-1.5 rounded-full hover:bg-red-500 text-sm">
        ไม่อนุมัติ
      </button>
    </div>
  </div>
</div>

    <!-- Pagination -->
    <div v-if="!loading && formattedUsers.length > 0" class="flex justify-center mt-6 space-x-2">
      <button @click="prevPage" 
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-1 rounded-lg',
                currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'
              ]">
        &lt;
      </button>
      <button class="px-3 py-1 rounded-lg bg-purple-400 text-white">
        {{ currentPage }}
      </button>
      <button @click="nextPage"
              :disabled="!hasMorePages"
              :class="[
                'px-3 py-1 rounded-lg',
                !hasMorePages ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-600'
              ]">
        &gt;
      </button>
    </div>



    
     <!-- User Details Modal -->
  <div v-if="selectedUser && showModal" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">รายละเอียดผู้ใช้</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <div class="space-y-6">
        <!-- Profile Image -->
        <div class="flex justify-center">
  <img :src="`${baseURL}/uploads/profiles/${selectedUser.profileImage}`"
       alt="Profile"
       class="w-32 h-32 rounded-full object-cover border-4 border-purple-100">
</div>

        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600">ชื่อ-นามสกุล</p>
            <p class="font-medium">{{ selectedUser.fullName }}</p>
          </div>
          <div>
            <p class="text-gray-600">อีเมล</p>
            <p class="font-medium">{{ selectedUser.email }}</p>
          </div>
          <div>
            <p class="text-gray-600">เบอร์โทรศัพท์</p>
            <p class="font-medium">{{ selectedUser.phoneNumber }}</p>
          </div>
          <div>
            <p class="text-gray-600">เลขบัตรประชาชน</p>
            <p class="font-medium">{{ selectedUser.idCardNumber }}</p>
          </div>
          <div>
            <p class="text-gray-600">Line ID</p>
            <p class="font-medium">{{ selectedUser.lineId }}</p>
          </div>
          <div>
            <p class="text-gray-600">เพศ</p>
            <p class="font-medium">{{ selectedUser.gender }}</p>
          </div>
          <div>
            <p class="text-gray-600">วันเกิด</p>
            <p class="font-medium">{{ selectedUser.birthDate }}</p>
          </div>
          <div>
            <p class="text-gray-600">อายุ</p>
            <p class="font-medium">{{ selectedUser.age }} ปี</p>
          </div>
        </div>

        <!-- Skills -->
        <div class="border-t pt-4">
          <h3 class="font-semibold mb-2">ทักษะความสามารถ</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="skill in JSON.parse(selectedUser.skills)" 
                  :key="skill"
                  class="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600">
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Education Certificate -->
 <div class="border-t pt-4">
  <h3 class="font-semibold mb-2">วุฒิการศึกษา</h3>
  <div v-if="selectedUser.educationCertificate" class="flex items-center gap-2">
    <a :href="`${baseURL}/uploads/certificates/${selectedUser.educationCertificate}`" 
       target="_blank"
       class="text-blue-500 hover:underline inline-flex items-center">
      <i class="fas fa-file-pdf mr-2"></i>
      ดูไฟล์วุฒิการศึกษา
    </a>
  </div>
  <p v-else class="text-gray-500">ไม่มีไฟล์วุฒิการศึกษา</p>
</div>


<!-- Documents -->
<div class="border-t pt-4">
  <h3 class="font-semibold mb-2">เอกสารประกอบ</h3>
  <div v-if="selectedUser.documents && selectedUser.documents !== '-'" class="flex items-center gap-2">
    <a :href="getDocumentUrl(selectedUser.documents)" 
       target="_blank"
       class="text-blue-500 hover:underline inline-flex items-center">
      <i class="fas fa-folder-open mr-2"></i>
      ดูเอกสารประกอบ
    </a>
  </div>
  <p v-else class="text-gray-500">ไม่มีเอกสารแนบ</p>
</div>

      </div>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'


export default {
  name: 'AdminPendingUsers',
  
  data() {
    return {
    baseURL: import.meta.env.VITE_API_URL , // หรือ URL ของ API ของคุณ
      rawUsers: [], // เก็บข้อมูลดิบจาก API
      formattedUsers: [], // เก็บข้อมูลที่จัดรูปแบบแล้ว
      loading: false,
        selectedUser: null,
      currentPage: 1,
      totalPages: 1,
      searchFilters: {
        name: '',
        position: '',
        idCard: ''
      }
    }
  },

  computed: {
    hasMorePages() {
      return this.currentPage < this.totalPages
    }
  },

  methods: {
 formatUserData(user) {
      return {
        id: user.id,
        fullName: `${user.prefix || ''} ${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phoneNumber: user.phone_number || '-',
        idCardNumber: user.national_id || '-',
        lineId: user.line_id || '-',
        isVerified: user.email_verified,
        registeredDate: this.formatDate(user.created_at),
        skills: user.skills ? user.skills.split(',') : [],
        // ข้อมูลส่วนตัว
        gender: user.gender || '-',
        birthDate: user.birth_date ? this.formatDate(user.birth_date) : '-',
        age: user.age || '0',
        profileImage: user.profile_image,
        // เอกสาร
        educationCertificate: user.education_certificate,
        documents: user.user_documents || '-'
      }
    },

    async fetchPendingUsers() {
      this.loading = true
      try {
        const response = await axios.get(`${this.baseURL}/api/admin/pending`, {
          params: {
            page: this.currentPage,
            ...this.searchFilters
          }
        })
        this.rawUsers = response.data.users
        this.formattedUsers = this.rawUsers.map(this.formatUserData)
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('Error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้'
        })
      } finally {
        this.loading = false
      }
    },
   async handleApprove(userId) {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการอนุมัติ',
      text: 'คุณต้องการอนุมัติผู้ใช้นี้ใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await axios.post(`${this.baseURL}/api/admin/approve-reject-user/${userId}`, {
       status: 'approved'   // เปลี่ยนจาก approved: true เป็น status: "approved"
      });

      await this.fetchPendingUsers();
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'อนุมัติผู้ใช้เรียบร้อยแล้ว'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอนุมัติผู้ใช้ได้'
    });
  }
},

async handleReject(userId) {
  try {
    const result = await Swal.fire({
      title: 'ยืนยันการไม่อนุมัติ',
      text: 'คุณต้องการไม่อนุมัติผู้ใช้นี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      await axios.post(`${this.baseURL}/api/admin/approve-reject-user/${userId}`, {
       status: 'rejected' // เปลี่ยนเป็นใช้ endpoint เดียวกับ approve และใช้ status: "rejected"
      });

      await this.fetchPendingUsers();
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ไม่อนุมัติผู้ใช้เรียบร้อยแล้ว'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถดำเนินการได้'
    });
  }
},
   

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    async searchUsers() {
      this.currentPage = 1
      await this.fetchPendingUsers()
    },

    clearSearch() {
      this.searchFilters = {
        name: '',
        position: '',
        idCard: ''
      }
      this.searchUsers()
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.fetchPendingUsers()
      }
    },

    nextPage() {
      if (this.hasMorePages) {
        this.currentPage++
        this.fetchPendingUsers()
      }
    },
  showUserDetails(user) {
      if (user) { 
        this.selectedUser = { ...user }; 
        this.showModal = true;
      }
    },

     getDocumentUrl(documentPath) {
    const cleanPath = documentPath.replace(/[[\]"]/g, '');
    return `${this.baseURL}/uploads/documents/${cleanPath}`;
    },

    closeModal() {
      this.showModal = false;
      this.selectedUser = null; // reset ค่ากลับเป็น null
    },
  },

  mounted() {
    this.fetchPendingUsers()
  },
   beforeUnmount() {
    this.selectedUser = null;
    this.showModal = false;
  }
}
</script>