import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserDashboardStore = defineStore('userDashboard', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_URL,
        stats: {
            averageRating: 0,
            completedJobs: 0,
            monthlyIncome: 0,
            totalWorkHours: 0
        },
        todaySchedule: [],
        recentIncomes: [],
        upcomingDeadlines: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchDashboardData(range = 'monthly') {
            this.loading = true;
            this.error = null;

            try {

                const response = await axios.get(`${this.baseURL}/api/dashboard/user/dashboard`, {
                    params: { range },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const { stats, todaySchedule, recentIncomes, upcomingDeadlines } = response.data;

                // คำนวณรายได้ในเดือนปัจจุบัน
                const currentDate = new Date();
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                // กรองรายการที่เสร็จสิ้นในเดือนนี้
                const thisMonthIncomes = recentIncomes.filter(income => {
                    const incomeDate = new Date(income.date);
                    return incomeDate >= firstDayOfMonth && incomeDate <= currentDate;
                });

                // คำนวณรายได้รวมของเดือน
                const monthlyIncome = thisMonthIncomes.reduce((total, income) => {
                    return total + (Number(income.amount) || 0);
                }, 0);

                // อัพเดท stats
                this.stats = {
                    ...stats,
                    monthlyIncome
                };

                // จัดรูปแบบข้อมูลรายได้
                this.recentIncomes = recentIncomes.map(income => ({
                    ...income,
                    date: income.date,
                    amount: Number(income.amount),
                    formattedAmount: this.formatCurrency(income.amount)
                }));

                // จัดรูปแบบตารางงานวันนี้
                this.todaySchedule = todaySchedule.map(schedule => ({
                    ...schedule,
                    formattedTime: `${schedule.start_time.slice(0, 5)} - ${schedule.end_time.slice(0, 5)} น.`
                }));

                // จัดรูปแบบงานที่ใกล้ถึงกำหนด
                this.upcomingDeadlines = upcomingDeadlines.map(deadline => ({
                    ...deadline,
                    formattedDate: new Date(deadline.workDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    formattedTime: `${deadline.startTime.slice(0, 5)} - ${deadline.endTime.slice(0, 5)} น.`,
                    daysLeftText: this.formatDaysLeft(deadline.daysLeft)
                }));

            } catch (error) {
                console.error('Error fetching user dashboard data:', error);
                this.error = 'ไม่สามารถโหลดข้อมูล Dashboard ได้';
            } finally {
                this.loading = false;
            }
        },

        formatCurrency(amount) {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB',
                minimumFractionDigits: 0
            }).format(amount);
        },

        formatDaysLeft(days) {
            if (days === 0) return 'วันนี้';
            if (days === 1) return 'พรุ่งนี้';
            if (days === 2) return 'มะรืนนี้';
            return `เหลือ ${days} วัน`;
        }
    }
});