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
        loading: false,
        error: null
    }),

    actions: {
        async fetchDashboardData() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`${this.baseURL}/api/dashboard/user/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const { stats, todaySchedule, recentIncomes } = response.data;

                // คำนวณรายได้และชั่วโมงทำงานในเดือนปัจจุบัน
                const currentDate = new Date();
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                // กรองรายการที่เสร็จสิ้นในเดือนนี้
                const thisMonthIncomes = recentIncomes.filter(income => {

                    const incomeDate = new Date(income.date);
                    return incomeDate >= firstDayOfMonth &&
                        incomeDate <= currentDate;
                });

                // คำนวณรายได้รวมของเดือน
                const monthlyIncome = thisMonthIncomes.reduce((total, income) => {
                    return total + (Number(income.amount) || 0);
                }, 0);

                // คำนวณชั่วโมงทำงานรวม
                const totalWorkHours = thisMonthIncomes.reduce((total, income) => {
                    if (income.start_time && income.end_time) {
                        const start = new Date(`1970-01-01T${income.start_time}`);
                        const end = new Date(`1970-01-01T${income.end_time}`);
                        const hours = (end - start) / (1000 * 60 * 60);
                        return total + hours;
                    }
                    return total;
                }, 0);

                // อัพเดท stats
                this.stats = {
                    ...stats,
                    monthlyIncome,
                    totalWorkHours: Math.round(totalWorkHours)
                };
                // จัดรูปแบบข้อมูลก่อนเก็บ
                this.recentIncomes = recentIncomes.map(income => ({
                    ...income,
                    date: income.date,
                    amount: Number(income.amount)
                }));

                this.todaySchedule = todaySchedule;

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
        }
    }
});