<template>
  <div class="p-6">
    <div
      class="rounded-lg p-4 md:p-8 min-h-screen bg-white transition-all duration-500 ease-in-out"
    >
      <div class="p-5">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">รายการผู้ใช้ที่ผ่านการอนุมัติ</h2>
        </div>
      </div>
      <SearchUsersBar :filters="searchFilters" @search="handleSearch" @clear="handleClear" />
      <!-- เพิ่ม loading indicator -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
      <!-- แสดงข้อความเมื่อไม่มีข้อมูล -->
      <div v-else-if="formattedUsers.length === 0" class="text-center py-8 text-gray-500">
        ไม่พบข้อมูลผู้ใช้
      </div>

      <div v-else>
        <!-- Desktop: Table View -->
        <div class="hidden md:block overflow-x-auto transition-all duration-500 ease-in-out">
          <table class="w-full min-w-[800px] transition-all duration-500 ease-in-out">
            <!-- กำหนดความกว้างขั้นต่ำ -->
            <thead>
              <tr class="text-left border-b bg-gray-50">
                <th class="px-4 py-2 text-center text-sm font-medium text-gray-500">ID</th>
                <th class="px-4 py-2 text-center w-48 text-sm font-medium text-gray-500">
                  วันที่ลงทะเบียน
                </th>
                <th class="px-4 py-2 text-center text-sm font-medium text-gray-500">
                  ชื่อ-นามสกุล
                </th>
                <th class="px-4 py-2 text-center text-sm font-medium text-gray-500">ทักษะ</th>
                <th class="px-4 py-2 text-center text-sm font-medium text-gray-500">อีเมล</th>
                <th class="px-4 py-2 text-center w-48 text-sm font-medium text-gray-500">
                  ยืนยันอีเมล
                </th>
                <th class="px-4 py-2 text-center text-sm font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in formattedUsers"
                :key="user.id"
                class="border-b hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-2 text-gray-600">{{ user.id }}</td>
                <td class="px-4 py-2">{{ user.registeredDate }}</td>
                <td class="px-4 py-2">{{ user.fullName }}</td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="skill in JSON.parse(user.skills)"
                      :key="skill"
                      class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600 whitespace-nowrap"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-2 text-gray-600 break-all">{{ user.email }}</td>
                <td class="px-4 py-2">
                  <div class="flex justify-center">
                    <span
                      :class="[
                        'flex items-center justify-center w-8 h-8 rounded-full',
                        user.isVerified ? 'bg-green-100' : 'bg-red-100'
                      ]"
                    >
                      <i
                        :class="[
                          user.isVerified ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark',
                          user.isVerified ? 'text-green-600' : 'text-red-600'
                        ]"
                      ></i>
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex justify-center gap-2">
                    <button
                      @click="showUserDetails(user)"
                      class="bg-blue-400 text-white px-3 py-1 rounded-full hover:bg-blue-500 text-sm whitespace-nowrap"
                    >
                      รายละเอียด
                    </button>
                    <button
                      @click="handleApprove(user.id)"
                      class="bg-green-400 text-white px-3 py-1 rounded-full hover:bg-green-500 text-sm whitespace-nowrap"
                    >
                      ดูประวัติ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: Card View -->
        <div class="md:hidden space-y-4 p-1 transition-all duration-500 ease-in-out">
          <div
            v-for="user in formattedUsers"
            :key="user.id"
            class="bg-white rounded-lg p-4 shadow-sm space-y-3 transition-all duration-500 ease-in-out"
          >
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">ID: {{ user.id }}</span>
              <span class="text-sm text-gray-500">วันที่ลงทะเบียน : {{ user.registeredDate }}</span>
              <span
                :class="[
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  user.isVerified ? 'bg-green-100' : 'bg-red-100'
                ]"
              >
                <i
                  :class="[
                    user.isVerified ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark',
                    user.isVerified ? 'text-green-600' : 'text-red-600'
                  ]"
                ></i>
              </span>
            </div>

            <div class="space-y-1">
              <h3 class="font-medium">ชื่อ : {{ user.fullName }}</h3>
              <p class="text-sm text-gray-600 break-words">อีเมล : {{ user.email }}</p>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <p class="text-sm">ทักษะ</p>
              <span
                v-for="skill in JSON.parse(user.skills)"
                :key="skill"
                class="px-2.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600"
              >
                {{ skill }}
              </span>
            </div>

            <div class="flex flex-col gap-2 pt-2">
              <button
                @click="showUserDetails(user)"
                class="w-full bg-blue-400 text-white px-3 py-1.5 rounded-full hover:bg-blue-500 text-sm"
              >
                รายละเอียด
              </button>
              <button
                @click="handleApprove(user.id)"
                class="w-full bg-green-400 text-white px-3 py-1.5 rounded-full hover:bg-green-500 text-sm"
              >
                ดูประวัติการทำงาน
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Pagination controls -->
      <div v-if="!loading && formattedUsers.length > 0" class="flex justify-center mt-6 space-x-2">
        <button
          @click="handlePrevPage"
          :disabled="currentPage <= 1"
          class="px-3 py-1 rounded-lg transition-colors"
          :class="[
            currentPage <= 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 text-[#C5B4E3] hover:bg-purple-200'
          ]"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button class="px-3 py-1 rounded-lg bg-[#C5B4E3] text-white">
          {{ currentPage }}
        </button>

        <span class="px-3 py-1 rounded-lg bg-purple-100 text-[#C5B4E3]"> of {{ totalPages }} </span>

        <button
          @click="handleNextPage"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 rounded-lg transition-colors"
          :class="[
            currentPage >= totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
          ]"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- User Details Modal -->
      <div
        v-if="selectedUser && showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1"
      >
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
              <img
                :src="`${baseURL}/uploads/profiles/${selectedUser.profileImage}`"
                alt="Profile"
                class="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
              />
            </div>

            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">ชื่อ-นามสกุล</p>
                <p class="font-medium">{{ selectedUser.fullName }}</p>
              </div>
              <div>
                <p class="text-gray-600">อีเมล</p>
                <p class="font-medium break-words">{{ selectedUser.email }}</p>
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
                <p class="font-medium break-words">{{ selectedUser.lineId }}</p>
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
                <span
                  v-for="skill in JSON.parse(selectedUser.skills)"
                  :key="skill"
                  class="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <!-- Education Certificate -->
            <div class="border-t pt-4">
              <h3 class="font-semibold mb-2">วุฒิการศึกษา</h3>
              <div v-if="selectedUser.educationCertificate" class="flex items-center gap-2">
                <a
                  :href="`${baseURL}/uploads/certificates/${selectedUser.educationCertificate}`"
                  target="_blank"
                  class="text-blue-500 hover:underline inline-flex items-center"
                >
                  <i class="fas fa-file-pdf mr-2"></i>
                  ดูไฟล์วุฒิการศึกษา
                </a>
              </div>
              <p v-else class="text-gray-500">ไม่มีไฟล์วุฒิการศึกษา</p>
            </div>

            <!-- Documents -->
            <div class="border-t pt-4">
              <h3 class="font-semibold mb-2">เอกสารประกอบ</h3>
              <div
                v-if="selectedUser.documents && selectedUser.documents !== '-'"
                class="flex items-center gap-2"
              >
                <a
                  :href="getDocumentUrl(selectedUser.documents)"
                  target="_blank"
                  class="text-blue-500 hover:underline inline-flex items-center"
                >
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
  </div>
</template>

<script>
import axios from 'axios'
import SearchUsersBar from '@/components/Search/SearchUsersBar.vue'

export default {
  name: 'AdminAllUsers',
  components: {
    SearchUsersBar
  },
  data() {
    return {
      formattedUsers: [],
      loading: false,
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      selectedUser: null,
      showModal: false,
      baseURL: import.meta.env.VITE_API_URL,
      searchFilters: {
        userId: '',
        idCard: '',
        name: ''
      }
    }
  },

  created() {
    this.fetchUsers()
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.totalItems / this.perPage))
    },
    hasMorePages() {
      return this.currentPage < this.totalPages
    }
  },
  methods: {
    formatUserData(user) {
      if (!user) return null

      return {
        id: user.id || '',
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        isVerified: user.email_verified || false,
        registeredDate: user.created_at ? this.formatDate(user.created_at) : '-',
        skills: user.skills || '[]',
        profileImage: user.profile_image || '',
        educationCertificate: user.education_certificate || '',
        documents: user.user_documents || '-'
      }
    },

    async fetchUsers() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.perPage,
          offset: (this.currentPage - 1) * this.perPage
        }

        if (this.searchFilters.userId.trim()) {
          params.userId = this.searchFilters.userId.trim()
        }
        if (this.searchFilters.name.trim()) {
          params.name = this.searchFilters.name.trim()
        }
        if (this.searchFilters.idCard.trim()) {
          params.idCard = this.searchFilters.idCard.trim()
        }

        const response = await axios.get(`${this.baseURL}/api/admin/approved`, {
          params: params
        })

        if (response.data) {
          this.formattedUsers = response.data.users
            .map(this.formatUserData)
            .filter((user) => user !== null)

          this.totalItems = response.data.pagination?.total || 0
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        this.formattedUsers = []
        this.totalItems = 0
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    showUserDetails(user) {
      this.selectedUser = user
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedUser = null
    },

    getDocumentUrl(documentPath) {
      return `${this.baseURL}/uploads/documents/${documentPath}`
    },

    handleSearch(filters) {
      this.searchFilters = { ...filters }
      this.currentPage = 1
      this.fetchUsers()
    },

    handleClear() {
      this.searchFilters = {
        userId: '',
        name: '',
        idCard: ''
      }
      this.currentPage = 1
      this.fetchUsers()
    }, // เพิ่ม comma ตรงนี้
    handlePrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.fetchUsers()
        window.scrollTo(0, 0)
      }
    },

    handleNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.fetchUsers()
        window.scrollTo(0, 0)
      }
    }
  }
}
</script>
