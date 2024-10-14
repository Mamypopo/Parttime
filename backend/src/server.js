import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';  // นำเข้า routes ของผู้ใช้
import jobRoutes from './routes/jobRoutes.js'; // นำเข้า jobRoutes
import adminRoutes from './routes/adminRoutes.js';  // นำเข้า adminRoutes

dotenv.config();

const app = express();
// ใช้ express.json() เพื่ออ่านข้อมูล JSON จาก request body
app.use(express.json());


// ใช้งาน routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);  // เชื่อมต่อเส้นทาง adminRoutes ที่ /api/admin




const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
