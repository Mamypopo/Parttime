import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { logCleanup } from './utils/logCleanup.js'; // นำเข้า log cleanup

dotenv.config();

const app = express();

app.use(express.json());

//  routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// ตั้งเวลาให้ลบ log ทุกๆ 7 วัน (604800000 มิลลิวินาที)
setInterval(logCleanup, 604800000);






const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
