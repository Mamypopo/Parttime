<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default {
  name: 'IncomeChart',
  components: { Line },
  props: {
    incomes: {
      type: Array,
      required: true
    },
    range: {
      type: String,
      default: 'monthly'
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.getLabels(),
        datasets: [
          {
            label: 'รายได้',
            data: this.getIncomeData(),
            borderColor: '#0ea5e9',
            backgroundColor: (context) => {
              const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, context.chart.height)
              gradient.addColorStop(0, 'rgba(14, 165, 233, 0.5)')
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
              return gradient
            },
            fill: true,
            tension: 0.4,
            pointBorderColor: '#0ea5e9',
            pointBackgroundColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutBounce'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => `วันที่: ${tooltipItems[0].label}`,
              label: (tooltipItem) => `รายได้: ฿${tooltipItem.raw.toLocaleString()}`
            }
          },
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                yMin: 300,
                yMax: 300,
                borderColor: 'red',
                borderWidth: 2,
                label: {
                  content: 'เป้าหมาย',
                  enabled: true,
                  position: 'start'
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'ช่วงเวลา'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `฿${value.toLocaleString()}`
            },
            title: {
              display: true,
              text: 'รายได้ (บาท)'
            }
          }
        }
      }
    }
  },
  methods: {
    getLabels() {
      const today = new Date()
      const labels = []

      switch (this.range) {
        case 'daily':
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            labels.push(date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }))
          }
          break

        case 'weekly':
          for (let i = 3; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i * 7)
            labels.push(`สัปดาห์ที่ ${4 - i}`)
          }
          break

        case 'monthly':
          for (let i = 5; i >= 0; i--) {
            const date = new Date(today)
            date.setMonth(date.getMonth() - i)
            labels.push(date.toLocaleDateString('th-TH', { month: 'short' }))
          }
          break

        case 'yearly':
          for (let i = 4; i >= 0; i--) {
            const date = new Date(today)
            date.setFullYear(date.getFullYear() - i)
            labels.push(date.getFullYear() + 543)
          }
          break
      }

      return labels
    },

    getIncomeData() {
      const data = []
      const labels = this.getLabels()

      labels.forEach((label) => {
        const amount = this.calculateIncomeForLabel(label)
        data.push(amount)
      })

      return data
    },

    calculateIncomeForLabel(label) {
      return this.incomes.reduce((total, income) => {
        const incomeDate = new Date(income.date)
        const matchesLabel = this.dateMatchesLabel(incomeDate, label)
        return total + (matchesLabel ? income.amount : 0)
      }, 0)
    },

    dateMatchesLabel(date, label) {
      switch (this.range) {
        case 'daily':
          return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) === label

        case 'weekly': {
          let weekNumber = parseInt(label.split(' ')[1])
          let today = new Date()
          let weekStart = new Date(today.setDate(today.getDate() - (4 - weekNumber) * 7))
          let weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)
          return date >= weekStart && date <= weekEnd
        }

        case 'monthly':
          return date.toLocaleDateString('th-TH', { month: 'short' }) === label

        case 'yearly':
          return (date.getFullYear() + 543).toString() === label.toString()

        default:
          return false
      }
    }
  }
}
</script>

<style scoped>
/* เพิ่ม Animation ของกราฟ */
.chartjs-render-monitor {
  animation: fadeIn 0.8s ease-out;
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
</style>
