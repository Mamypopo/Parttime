import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import workHistoryRoutes from './routes/workHistoryRoutes.js';

import { startNotificationCleanup, runCleanupNow } from './cron/notificationCleanup.js';
import { startLogCleanup, runlogCleanupNow } from './cron/logCleanup.js';
import cors from 'cors';
import { initJobStatusCron } from './cron/jobStatusCron.js';

const app = express();
app.use(cors());

dotenv.config();


app.use('/uploads', express.static('uploads'))
app.use(express.json());
app.use(cors());
//  routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/work-history', workHistoryRoutes);

// เริ่ม cron jobs
// ลบ การแจ้งเตือน อัตโนมัติ
startNotificationCleanup();
// await runCleanupNow();

// อัพเดทสถานะ อัตโนมัติ
initJobStatusCron();

// ลบ Log อัตโนมัติ
startLogCleanup();
// runlogCleanupNow();




const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

