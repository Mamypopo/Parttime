import { defineStore } from 'pinia'
import { useAdminStore } from './adminStore'
import { useNotificationStore } from './notificationStore'

import { useJobStore } from './jobStore'

import Swal from 'sweetalert2'
export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        isCollapsed: false,
        isMobile: false,
        isTablet: false,
        isDarkMode: false,
        showMobileMenu: false,
        showNotifications: false,
        showUserSubmenu: false,
        showJobSubmenu: false,
        showMoreSubmenu: false,
        showNotificationSubmenu: false,
        showAllNotifications: false,

        // เมนูสำหรับแอดมิน
        mainMenuItems: [
            { name: 'หน้าหลัก', path: '/admin/dashboard', icon: 'fas fa-home' },
            { name: 'ผู้ใช้', path: '/admin/alluser', icon: 'fas fa-users' },
            { name: 'ผู้ใช้งาน รออนุมัติ', path: '/admin/pending-users', icon: 'fas fa-user-clock' },
            { name: 'ผู้ใช้งาน ถูกปฏิเสธ', path: '/admin/reject-user', icon: 'fa-solid fa-user-xmark' },
            // { name: 'ผู้ใช้งาน ขอเพิ่มทักษะ', path: '/', icon: 'fas fa-tasks' }
        ],

        jobMenuItems: [
            { name: 'งาน', path: '/admin/job-List', icon: 'fas fa-briefcase' },
            { name: 'สร้างงาน', path: '/admin/create-job', icon: 'fas fa-plus' },
            {
                name: 'งานของฉัน',
                path: '/admin/job-Management',
                icon: 'fa-solid fa-list-check',
                badge: true
            },
            { name: 'การเงิน', path: '/admin/PaymentManagement-view', icon: 'fas fa-money-bill-wave' },
        ],

        mobileMainItems: [
            { name: 'หน้าหลัก', icon: 'fas fa-home', path: '/admin/dashboard' },
            { name: 'ผู้ใช้งาน', icon: 'fas fa-users', hasSubmenu: true },
            { name: 'งาน', icon: 'fas fa-briefcase', hasSubmenu: true },
            { name: 'การแจ้งเตือน', icon: 'fas fa-bell', hasSubmenu: true },
            { name: 'เพิ่มเติม', icon: 'fas fa-ellipsis-h', hasSubmenu: true }
        ],


        // เมนูสำหรับ User
        userMenuItems: [
            {
                path: '/user/dashboard',
                name: 'หน้าหลัก',
                icon: 'fa-solid fa-house'
            },
            {
                path: '/user/jobs-view',
                name: 'งาน',
                icon: 'fas fa-briefcase'
            },
            {
                path: '/user/my-jobs',
                name: 'งานของฉัน',
                icon: 'fas fa-tasks',
                badge: true,
                badgeCount: 0  // จะอัพเดทจาก API
            },
        ],


        // เมนูมือถือสำหรับ User
        userMobileItems: [
            {
                path: '/user/dashboard',
                name: 'หน้าหลัก',
                icon: 'fa-solid fa-house'
            },
            {
                path: '/user/jobs-view',
                name: 'งาน',
                icon: 'fas fa-briefcase'
            },
            {
                path: '/user/my-jobs',
                name: 'งานของฉัน',
                icon: 'fas fa-tasks',
                badge: true,
                badgeCount: 0
            },
            {
                name: 'แจ้งเตือน',
                icon: 'fas fa-bell',
                isComponent: true,
                hasNotification: true
            },
            {
                name: 'โปรไฟล์',
                icon: 'fas fa-user',
                isComponent: true
            }
        ]

    }),

    actions: {
        updateMyJobsBadge(count) {
            const myJobsMenu = this.userMenuItems.find(item => item.path === '/user/my-jobs')
            const myJobsMobile = this.userMobileItems.find(item => item.path === '/user/my-jobs')
            if (myJobsMenu) myJobsMenu.badgeCount = count
            if (myJobsMobile) myJobsMobile.badgeCount = count
        },
        closeAllSubmenus() {
            this.showUserSubmenu = false
            this.showJobSubmenu = false
            this.showMoreSubmenu = false
            this.showNotifications = false
        },

        toggleSubmenu(menu) {
            this.closeAllSubmenus()
            switch (menu) {
                case 'user':
                    this.showUserSubmenu = !this.showUserSubmenu
                    break
                case 'job':
                    this.showJobSubmenu = !this.showJobSubmenu
                    break
                case 'more':
                    this.showMoreSubmenu = !this.showMoreSubmenu
                    break
            }
        },

        handleMobileMenuClick(item) {
            this.closeAllSubmenus()
            if (!item.hasSubmenu) {
                return item.path
            }

            switch (item.name) {
                case 'ผู้ใช้งาน':
                    this.showUserSubmenu = true
                    break
                case 'งาน':
                    this.showJobSubmenu = true
                    break
                case 'การแจ้งเตือน':
                    this.showNotifications = true
                    break
                case 'เพิ่มเติม':
                    this.showMoreSubmenu = true
                    break
            }
        },

        toggleUserSubmenu() {
            this.showUserSubmenu = !this.showUserSubmenu
        },



        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            if (this.isDarkMode) {
                document.documentElement.classList.add('dark')
                localStorage.setItem('theme', 'dark')
            } else {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('theme', 'light')
            }
        },

        initializeTheme() {
            this.isDarkMode = localStorage.getItem('theme') === 'dark'
            if (this.isDarkMode) {
                document.documentElement.classList.add('dark')
            }
        },
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed
        },

        handleResize() {
            const width = window.innerWidth
            this.isMobile = width < 640
            this.isTablet = width >= 640 && width < 1024

            // ปิด mobile submenu เมื่อไม่ได้อยู่ในโหมด mobile
            if (!this.isMobile) {
                this.showUserSubmenu = false
                this.showJobSubmenu = false
                this.showMoreSubmenu = false
                this.showNotifications = false
                this.showMobileMenu = false
            }

            // Auto collapse on tablet
            if (this.isTablet) {
                this.isCollapsed = true
            }
        },

        initializeResponsive() {
            this.handleResize()
            window.addEventListener('resize', this.handleResize)
        },

        cleanup() {
            window.removeEventListener('resize', this.handleResize)
        },
        resetDarkMode() {
            this.isDarkMode = false
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }
})