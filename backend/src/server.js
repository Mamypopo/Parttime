import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import excelRoutes from './routes/excel.routes.js';

import evaluationRoutes from './routes/evaluationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { startNotificationCleanup, runCleanupNow } from './cron/notificationCleanup.js';
import { startLogCleanup, runlogCleanupNow } from './cron/logCleanup.js';
import cors from 'cors';
import { initJobStatusCron } from './cron/jobStatusCron.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
    'https://parttime.semedcheckup.com',
    'http://localhost:3002',
    'http://192.168.1.74:3002'
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

dotenv.config();

app.use('/uploads', express.static('uploads'))
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//  routes
app.use('/api/users', userRoutes);

app.use('/api/jobs', jobRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api', evaluationRoutes);

app.use('/api/excel', excelRoutes);

app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// เริ่ม cron jobs
// ลบ การแจ้งเตือน อัตโนมัติ
startNotificationCleanup();
// await runCleanupNow();

// อัพเดทสถานะ อัตโนมัติ
initJobStatusCron();

// ลบ Log อัตโนมัติ
startLogCleanup();
// runlogCleanupNow();




const port = process.env.PORT || 8002;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

