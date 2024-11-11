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
                      @click="handleViewHistory(user.id)"
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
                @click="handleViewHistory(user.id)"
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
      <UserDetailsModal
        v-if="showModal"
        :is-open="showModal"
        :user="selectedUser"
        @close="closeModal"
      />

      <JobHistoryModal
        v-if="showHistoryModal"
        :show="showHistoryModal"
        :user="selectedUser"
        @close="closeHistoryModal"
        :jobs="jobHistory.data || []"
        :total-jobs="jobHistory.totalJobs || 0"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import SearchUsersBar from '@/components/Search/SearchUsersBar.vue'
import UserDetailsModal from '@/components/Users/UserDetailsModal.vue'
import JobHistoryModal from '@/components/Users/JobHistoryModal.vue'
export default {
  name: 'AdminAllUsers',
  components: {
    SearchUsersBar,
    UserDetailsModal,
    JobHistoryModal
  },
  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL,
      formattedUsers: [],
      showHistoryModal: false,
      selectedUser: null,
      loading: false,
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      showModal: false,
      searchFilters: {
        userId: '',
        idCard: '',
        name: ''
      },
      jobHistory: {
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0
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

          this.totalItems = parseInt(response.data.pagination.total)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้'
        })
        this.formattedUsers = []
        this.totalItems = 0
      } finally {
        this.loading = false
      }
    },
    async handleViewHistory(userId) {
      try {
        this.selectedUser = this.formattedUsers.find((u) => u.id === userId)

        const response = await axios.get(`${this.baseURL}/api/users/history/${userId}`)

        if (response.data) {
          const formattedJobs =
            response.data.jobHistory.map((job) => ({
              id: job.id || undefined,
              title: job.jobPosition?.job?.title || 'ไม่ระบุชื่องาน',
              position_name: job.jobPosition?.position_name || 'ไม่ระบุตำแหน่ง',
              location: job.jobPosition?.job?.location || 'ไม่ระบุสถานที่',
              status: job.status || 'pending',
              created_at: job.created_at,
              updated_at: job.updated_at,
              wage: job.jobPosition?.wage || 0,
              work_date: job.jobPosition?.job?.work_date || null
            })) || []

          this.jobHistory = {
            data: formattedJobs,
            totalJobs: response.data.totalJobs || 0,
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1
          }

          this.showHistoryModal = true
        }
      } catch (error) {
        console.error('Error fetching job history:', error)
        Swal.fire({
          title: 'ไม่พบประวัติการทำงาน',
          text: 'ผู้ใช้งานนี้ยังไม่มีประวัติการทำงาน',
          icon: 'info',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6366f1'
        })
      }
    },
    closeHistoryModal() {
      this.showHistoryModal = false
      this.selectedUser = null
      this.jobHistory = {
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0
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
      if (user) {
        this.selectedUser = { ...user }
        this.showModal = true
      }
    },

    closeModal() {
      this.showModal = false
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
