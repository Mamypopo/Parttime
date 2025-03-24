import { defineStore } from 'pinia';
import api from '@/services/axios'

export const useUserDashboardStore = defineStore('userDashboard', {
    state: () => ({
        stats: {
            averageRating: 0,
            completedJobs: 0,
            monthlyIncome: 0,
            totalWorkHours: 0
        },
        todaySchedule: [],
        paidIncomes: [],
        pendingIncomes: [],
        upcomingDeadlines: [],
        loading: false,
        error: null
    }),

    getters: {
        baseApiUrl: () => import.meta.env.VITE_API_URL,
    },
    actions: {
        async fetchDashboardData(range = 'monthly') {
            this.loading = true;
            this.error = null;

            try {

                const response = await api.get('/api/dashboard/user/dashboard', {
                    params: { range },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const { stats, todaySchedule, paidIncomes, pendingIncomes, upcomingDeadlines } = response.data;
                console.log(upcomingDeadlines)

                // จัดการข้อมูลรายได้
                this.paidIncomes = Array.isArray(paidIncomes) ? paidIncomes.map(income => ({
                    id: income?.id || '',
                    jobTitle: income?.jobTitle || '',
                    workplace: income?.workplace || '',
                    location: income?.location || '',
                    date: income?.date || '',
                    amount: Number(income?.amount || 0)
                })) : []

                this.pendingIncomes = Array.isArray(pendingIncomes) ? pendingIncomes.map(income => ({
                    id: income?.id || '',
                    jobTitle: income?.jobTitle || '',
                    workplace: income?.workplace || '',
                    location: income?.location || '',
                    date: income?.date || '',
                    amount: Number(income?.amount || 0)
                })) : []




                // อัพเดท stats
                this.stats = {
                    ...this.stats,
                    ...(stats || {}),
                    monthlyIncome: this.calculateMonthlyIncome()
                }


                // จัดการข้อมูลอื่นๆ
                this.todaySchedule = Array.isArray(todaySchedule) ? todaySchedule : []
                this.upcomingDeadlines = Array.isArray(upcomingDeadlines) ? upcomingDeadlines : []
            } catch (error) {
                console.error('Error fetching user dashboard data:', error);
                this.error = 'ไม่สามารถโหลดข้อมูล Dashboard ได้';
                // กำหนดค่าเริ่มต้นเมื่อเกิด error
                this.paidIncomes = [];
                this.pendingIncomes = [];
            } finally {
                this.loading = false;
            }
        },
        calculateMonthlyIncome() {
            const currentDate = new Date()
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

            return this.paidIncomes
                .filter(income => {
                    const incomeDate = new Date(income.date)
                    return incomeDate >= firstDayOfMonth && incomeDate <= currentDate
                })
                .reduce((total, income) => total + (Number(income.amount) || 0), 0)
        },

        resetState() {
            this.paidIncomes = []
            this.pendingIncomes = []
            this.todaySchedule = []
            this.upcomingDeadlines = []
            this.stats = {
                averageRating: 0,
                completedJobs: 0,
                monthlyIncome: 0,
                totalWorkHours: 0
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