import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist", //โฟลเดอร์ที่เก็บผลลัพท์การ build
    emptyOutDir: true, //ล้างโฟลเดอร์ dist ก่อนที่จะ build ใหม่
    rollupOptions: {
      input: {
        main: './index.html'
      } //ระบุไฟล์เริ่มต้นถ้ามีหลาย entry points 
    }
  },
  server: {
    port: 3000,
    open: true, // เปิด browser อัตโนมัติเมื่อรัน
    host: true, // เปิดให้เข้าถึงจากภายนอกได้
    strictPort: true, // จะ error ถ้า port ถูกใช้งานอยู่
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  optimizeDeps: {
    include: ["vue", "axios", "pinia"], // เพิ่ม libraries ที่ต้องการ pre-bundle
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),

    }
  }
})
