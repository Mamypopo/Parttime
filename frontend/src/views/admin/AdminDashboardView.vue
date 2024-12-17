<template>
  <div class="p-6 space-y-6">
    <!-- Section 1: Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="ผู้ใช้งานทั้งหมด"
        :value="totalUsers"
        :sub-stats="[
          {
            label: 'ผู้ใช้ทั่วไป',
            value: normalUsers,
            color: 'text-blue-500'
          },
          {
            label: 'ผู้ดูแลระบบ',
            value: adminUsers,
            color: 'text-purple-500'
          },
          {
            label: 'รอการอนุมัติ',
            value: pendingUsers,
            color: 'text-yellow-500'
          },
          {
            label: 'ไม่อนุมัติ',
            value: rejectedUsers,
            color: 'text-red-500'
          }
        ]"
        icon="fas fa-users"
        color="blue"
      />
      <StatsCard
        title="งานทั้งหมด"
        :value="totalJobs"
        :sub-stats="[
          { label: 'เปิดรับสมัคร', value: openJobs },
          { label: 'กำลังดำเนินการ', value: inProgressJobs },
          { label: 'เสร็จสิ้น', value: completedJobs }
        ]"
        icon="fas fa-briefcase"
        color="purple"
      />
      <StatsCard
        title="ค่าใช้จ่าย"
        :value="dashboardStore.formattedExpenses.monthly.amount"
        :sub-stats="[
          { label: 'รายวัน', value: dashboardStore.formattedExpenses.daily.amount },
          {
            label: 'รายสัปดาห์',
            value: dashboardStore.formattedExpenses.weekly.amount,
            month: dashboardStore.formattedExpenses.monthly.month
          }
        ]"
        icon="fas fa-money-bill-wave"
        color="emerald"
        @export="exportExpenses"
      />

      <StatsCard
        title="การสมัครงานเดือนนี้"
        :value="monthlyApplications"
        :sub-stats="[
          {
            label: 'อนุมัติแล้ว',
            value: monthlyApplicationsApproved,
            color: 'text-green-500'
          },
          {
            label: 'ไม่อนุมัติ',
            value: monthlyApplicationsRejected,
            color: 'text-red-500'
          },
          {
            label: 'รอพิจารณา',
            value: monthlyApplicationsPending,
            color: 'text-yellow-500'
          },
          {
            label: 'เสร็จสิ้น',
            value: monthlyApplicationsCompleted,
            color: 'text-blue-500'
          },
          {
            label: 'ยกเลิก',
            value: monthlyApplicationsCancelled,
            color: 'text-blue-500'
          }
        ]"
        icon="fas fa-file-signature"
        color="orange"
      />
    </div>

    <!-- Section 2: Calendar and User Ratings -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar Section -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div class="p-6">
          <h3
            class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
          >
            ปฏิทินงาน
          </h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">ดูรายละเอียดงานตามวันที่</p>
          <MiniCalendar @date-click="handleDateClick" class="mt-4" />
        </div>
      </div>

      <!-- User Ratings Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div class="p-6">
          <h3
            class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
          >
            คะแนนผู้ใช้งาน
          </h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">ดูผู้ใช้งานที่มีคะแนนสูงสุด</p>
          <UserRatings :topUsers="topUsers" :averageRating="averageRating" class="mt-4" />
        </div>
      </div>
    </div>

    <!-- Section 3: Pending Users -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div class="p-6">
        <h3
          class="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
        >
          ผู้ใช้ที่ลงทะเบียนล่าสุด
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          ดูรายชื่อผู้ใช้งานที่เพิ่งลงทะเบียน
        </p>
        <PendingUsersList :users="recentRegistrations" class="mt-4" />
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from '@/components/admin/Dashboard/StatsCard.vue'
import MiniCalendar from '@/components/admin/Dashboard/MiniCalendar.vue'
import UserRatings from '@/components/admin/Dashboard/UserRatings.vue'
import PendingUsersList from '@/components/admin/Dashboard/PendingUsersList.vue'
import { useDashboardStore } from '@/stores/dashboardStore'

import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'
export default {
  name: 'AdminDashboard',
  components: {
    StatsCard,
    MiniCalendar,
    UserRatings,
    PendingUsersList
  },

  data() {
    return {
      selectedDate: null,
      dashboardStore: useDashboardStore()
    }
  },

  computed: {
    // ดึงข้อมูลจาก store
    totalUsers() {
      return this.dashboardStore.stats.totalUsers
    },
    normalUsers() {
      return this.dashboardStore.stats.userDetails?.normal || 0
    },
    adminUsers() {
      return this.dashboardStore.stats.userDetails?.admin || 0
    },
    pendingUsers() {
      return this.dashboardStore.stats.userDetails?.pending || 0
    },
    rejectedUsers() {
      return this.dashboardStore.stats.userDetails?.rejected || 0
    },
    totalJobs() {
      return this.dashboardStore.stats.jobs?.total || 0
    },
    openJobs() {
      return this.dashboardStore.stats.jobs?.open || 0
    },
    inProgressJobs() {
      return this.dashboardStore.stats.jobs?.inProgress || 0
    },
    completedJobs() {
      return this.dashboardStore.stats.jobs?.completed || 0
    },

    monthlyApplications() {
      return this.dashboardStore.stats.monthlyApplications || 0
    },
    monthlyApplicationsApproved() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.approved || 0
    },
    monthlyApplicationsRejected() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.rejected || 0
    },
    monthlyApplicationsPending() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.pending || 0
    },
    monthlyApplicationsCompleted() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.completed || 0
    },
    monthlyApplicationsCancelled() {
      return this.dashboardStore.stats.monthlyApplicationsDetails?.cancelled || 0
    },
    topUsers() {
      return this.dashboardStore.topUsers
    },
    averageRating() {
      return this.dashboardStore.averageRating
    },

    recentRegistrations() {
      return this.dashboardStore.stats.recentRegistrations || []
    }
  },
  async created() {
    await this.dashboardStore.fetchDashboardData()
  },
  methods: {
    handleDateClick(date) {
      try {
        const events = this.dashboardStore.eventsByDate[date.toDateString()] || []

        if (events.length === 0) {
          Swal.fire({
            title: 'ไม่พบข้อมูล',
            text: 'ไม่มีงานในวันที่เลือก',
            icon: 'info',
            confirmButtonText: 'ตกลง'
          })
          return
        }

        // แสดงรายการงานในวันที่เลือก
        const eventList = events.map((event) => `- ${event.title}`).join('\n')
        Swal.fire({
          title: `งานวันที่ ${date.toLocaleDateString('th-TH')}`,
          text: eventList,
          icon: 'info',
          confirmButtonText: 'ตกลง'
        })
      } catch (error) {
        console.error('Error handling date click:', error)
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      }
    },

    async exportExpenses() {
      try {
        const expenses = this.dashboardStore.formattedExpenses.raw
        const jobExpenses = this.dashboardStore.stats.jobExpenses || []

        const workbook = XLSX.utils.book_new()

        // 1. ส่วนหัวรายงาน
        const data = [
          ['รายงานสรุปค่าใช้จ่ายการจ้างงาน', ''],
          ['ประจำเดือน', expenses.monthYear],
          [
            'วันที่ออกรายงาน',
            new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          ],
          ['', ''],
          ['1. สรุปค่าใช้จ่ายรวม', ''],
          ['ค่าใช้จ่ายรายวัน', this.dashboardStore.formattedExpenses.daily.amount],
          ['ค่าใช้จ่ายรายสัปดาห์', this.dashboardStore.formattedExpenses.weekly.amount],
          ['ค่าใช้จ่ายรายเดือน', this.dashboardStore.formattedExpenses.monthly.amount],
          ['', ''],
          ['2. รายละเอียดค่าใช้จ่ายแต่ละงาน', ''],
          // หัวตารางรายละเอียด
          [
            'ลำดับ',
            'ชื่องาน',
            'สถานที่',
            'วันที่',
            'เวลา',
            'ตำแหน่งงาน',
            'ค่าจ้าง/คน',
            'จำนวนที่ต้องการ',
            'จำนวนที่อนุมัติ',
            'ค่าใช้จ่าย (บาท)'
          ]
        ]

        let totalRequiredAll = 0
        let totalApprovedAll = 0
        let totalExpenseAll = 0

        // 2. ข้อมูลแต่ละงาน
        if (jobExpenses.length > 0) {
          jobExpenses.forEach((job, index) => {
            const jobDate = new Date(job.work_date)
            const startTime = new Date(job.start_time)
            const endTime = new Date(job.end_time)

            job.positions.forEach((position, posIndex) => {
              data.push([
                posIndex === 0 ? index + 1 : '',
                posIndex === 0 ? job.title : '',
                posIndex === 0 ? job.location : '',
                posIndex === 0
                  ? jobDate.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '',
                posIndex === 0
                  ? `${startTime.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - ${endTime.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : '',
                position.position_name || '-',
                new Intl.NumberFormat('th-TH').format(position.wage),
                position.required_people,
                position.approved_workers,
                new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(position.subtotal)
              ])

              totalRequiredAll += position.required_people
              totalApprovedAll += position.approved_workers
              totalExpenseAll += position.subtotal
            })

            // บรรทัดว่างระหว่างงาน
            if (index < jobExpenses.length - 1) {
              data.push(['', '', '', '', '', '', '', '', '', ''])
            }
          })

          // 3. แถวสรุปผลรวม
          data.push(
            ['', '', '', '', '', '', '', '', '', ''],
            [
              'รวมทั้งหมด',
              '',
              '',
              '',
              '',
              '',
              '',
              totalRequiredAll,
              totalApprovedAll,
              new Intl.NumberFormat('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(totalExpenseAll)
            ]
          )
        } else {
          data.push(['ไม่พบข้อมูลงานในเดือนนี้'])
        }

        // 4. หมายเหตุและข้อมูลเพิ่มเติม
        data.push(
          ['', ''],
          ['หมายเหตุ:', ''],
          ['- รายงานนี้แสดงค่าใช้จ่ายทั้งหมดจากการจ้างงาน', ''],
          ['- ค่าใช้จ่ายคำนวณจากค่าแรง × จำนวนคนที่ได้รับอนุมัติ', ''],
          ['- แสดงเฉพาะงานที่กำลังดำเนินการและเสร็จสิ้นแล้ว', ''],
          ['', ''],
          ['ออกรายงานโดย:', 'ระบบจัดการงาน Part-time'],
          [
            'วันที่:',
            new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          ]
        )

        // 5. สร้าง worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data)

        // 6. จัดรูปแบบ worksheet
        const range = XLSX.utils.decode_range(worksheet['!ref'])

        // กำหนดความกว้างคอลัมน์
        worksheet['!cols'] = [
          { wch: 8 }, // ลำดับ
          { wch: 35 }, // ชื่องาน
          { wch: 25 }, // สถานที่
          { wch: 20 }, // วันที่
          { wch: 20 }, // เวลา
          { wch: 25 }, // ตำแหน่งงาน
          { wch: 15 }, // ค่าจ้าง/คน
          { wch: 15 }, // จำนวนที่ต้องการ
          { wch: 15 }, // จำนวนที่อนุมัติ
          { wch: 20 } // ค่าใช้จ่าย
        ]

        // จัดรูปแบบเซลล์
        for (let row = 0; row <= range.e.r; row++) {
          for (let col = 0; col <= range.e.c; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
            if (!worksheet[cellRef]) continue

            // สร้าง style object สำหรับแต่ละเซลล์
            const cell = {
              font: { name: 'TH Sarabun New', sz: 14 },
              alignment: { vertical: 'center', horizontal: 'left' },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            }

            // จัดรูปแบบพิเศษสำหรับส่วนหัว
            if (row === 0) {
              cell.font.bold = true
              cell.font.sz = 16
              cell.alignment.horizontal = 'center'
            }

            // จัดรูปแบบหัวตาราง
            if (row === 10) {
              cell.font.bold = true
              cell.fill = { fgColor: { rgb: 'EFEFEF' } }
              cell.alignment.horizontal = 'center'
            }

            // จัดรูปแบบแถวผลรวม
            if (worksheet[cellRef].v === 'รวมทั้งหมด') {
              cell.font.bold = true
              cell.fill = { fgColor: { rgb: 'E6E6E6' } }
            }

            worksheet[cellRef].s = cell
          }
        }

        // 7.  worksheet ลงใน workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานค่าใช้จ่าย')

        // 8. แสดง Dialog ยืนยันการ export
        const result = await Swal.fire({
          title: 'ต้องการ Export รายงานค่าใช้จ่าย?',
          html: `
                <div class="text-left">
                    <p>รายงานประจำเดือน ${expenses.monthYear}</p>
                    <p class="text-sm text-gray-600 mt-2">
                        - จำนวนงานทั้งหมด: ${jobExpenses.length} งาน<br>
                        - ค่าใช้จ่ายรวม: ${this.dashboardStore.formattedExpenses.monthly.amount}
                    </p>
                </div>
            `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Export',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        })

        // 9. บันทึกไฟล์
        if (result.isConfirmed) {
          const fileName = `รายงานค่าใช้จ่าย_${expenses.monthYear.replace(/ /g, '_')}.xlsx`
          XLSX.writeFile(workbook, fileName)

          await Swal.fire({
            title: 'Export สำเร็จ!',
            text: 'รายงานค่าใช้จ่ายถูกบันทึกแล้ว',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('Error exporting expenses:', error)
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถ export รายงานได้',
          icon: 'error',
          confirmButtonColor: '#d33'
        })
      }
    }
  }
}
</script>
