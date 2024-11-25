import cron from 'node-cron';
import * as jobModel from '../models/jobModel.js';
import { createLog } from '../models/logModel.js';
import * as notificationModel from '../models/notificationModel.js';

// ฟังก์ชันอัพเดทสถานะงานอัตโนมัติ
export const updateJobStatuses = async () => {
    try {

        console.log('=== Job Status Update Started ===');
        console.log(`Time: ${new Date().toLocaleString()}`);

        const jobs = await jobModel.getAllJobsForStatusUpdate();
        console.log(`Found ${jobs.length} jobs to check`);


        let updatedCount = 0;

        for (const job of jobs) {
            if (job.status === 'completed') {
                continue; // ข้ามงานนี้ไป
            }
            console.log(`Processing job ID: ${job.id}`);

            const workDate = new Date(job.work_date);
            workDate.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเป็น 00:00:00

            const today = new Date();
            today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเป็น 00:00:00

            let newStatus = job.status;

            // กำหนดสถานะตามวันที่
            if (workDate.getTime() > today.getTime()) {
                newStatus = 'published'; // งานที่ยังไม่ถึงวันทำงาน
            } else if (workDate.getTime() === today.getTime()) {
                newStatus = 'in_progress';  // งานที่กำลังดำเนินการในวันนี้
            } else {
                newStatus = 'completed'; // งานที่ผ่านวันทำงานไปแล้ว
            }

            // อัพเดทเฉพาะงานที่สถานะเปลี่ยน
            if (newStatus !== job.status) {
                updatedCount++;
                console.log(`
                    Job ID: ${job.id}
                    Title: ${job.title}
                    Old Status: ${job.status}
                    New Status: ${newStatus}
                    Work Date: ${job.work_date}
                `);
                // อัปเดตสถานะงานและรับข้อมูล job ที่อัปเดตแล้ว
                const updatedJob = await jobModel.updateJobStatus(job.id, newStatus);

                // สร้าง log
                await createLog(
                    null,
                    null,
                    'Auto Update Job Status',
                    'CRON',
                    'AUTO',
                    `Job ID: ${job.id} status automatically updated from ${job.status} to ${newStatus}`,
                    'SYSTEM',
                    'CRON Job'
                );

                let adminMessage = '';
                let userMessage = '';

                switch (newStatus) {
                    case 'in_progress':
                        adminMessage = `ระบบเปลี่ยนสถานะงาน "${job.title}" เป็นกำลังดำเนินการ`;
                        userMessage = `งาน "${job.title}" เริ่มดำเนินการแล้ว`;
                        break;
                    case 'completed':
                        adminMessage = `ระบบเปลี่ยนสถานะงาน "${job.title}" เป็นเสร็จสิ้น`;
                        userMessage = `งาน "${job.title}" เสร็จสิ้นแล้ว`;
                        break;
                }
                // แจ้งเตือนแอดมิน
                if (job.created_by && adminMessage) {
                    try {
                        await notificationModel.createAdminNotification({
                            adminId: job.created_by,
                            content: adminMessage,
                            type: 'JOB_STATUS_AUTO_UPDATED',
                            jobId: job.id,
                            userId: null
                        });
                    } catch (notifyError) {
                        console.error(`Failed to notify admin for job ${job.id}:`, notifyError.message);
                    }
                }
                // รวบรวมผู้เข้าร่วมงานจากทุกตำแหน่ง
                // const participants = updatedJob.JobPositions.flatMap(position =>
                //     position.JobParticipation.map(participation => participation.user)
                // );
                // // แจ้งเตือนผู้สมัครงาน
                // if (participants.length > 0 && userMessage) {
                //     const notificationPromises = participants.map(participant =>
                //         notificationModel.createUserNotification({
                //             userId: participant.user_id,
                //             content: userMessage,
                //             type: 'job_status_update',
                //             jobId: job.id
                //         })
                //     );
                //     await Promise.all(notificationPromises);
                // }

            }
        }

        console.log(`=== Update Complete ===`);
        console.log(`Total jobs updated: ${updatedCount}`);
    } catch (error) {
        console.error('Error in job status cron:', error);

        // สร้าง log กรณีเกิดข้อผิดพลาด
        await createLog(
            null,
            null,
            'Auto Update Job Status Failed',
            'CRON',
            'AUTO',
            `Cron job failed: ${error.message}`,
            'SYSTEM',
            'CRON Job'
        );
    }
};



// ตั้งเวลารันทุกชั่วโมง
export const initJobStatusCron = () => {
    // ตั้งเวลาให้ทำงานทุกชั่วโมง (0 * * * *)
    cron.schedule('0 * * * *', updateJobStatuses);
    console.log('Job status cron initialized');
};


// เทส cron
// export const checkJobStatuses = async () => {
//     try {
//         const jobs = await jobModel.getAllJobsForStatusUpdate();
//         console.log('Current Job Statuses:');
//         jobs.forEach(job => {
//             console.log(`Job: ${job.title}`);
//             console.log(`Work Date: ${job.work_date}`);
//             console.log(`Status: ${job.status}`);
//             console.log('------------------------');
//         });
//     } catch (error) {
//         console.error('Error checking job statuses:', error);
//     }
// };

// // ทดสอบรันทุกนาที
// export const initJobStatusCron = () => {
//     // ทำงานทุกนาที
//     cron.schedule('* * * * *', updateJobStatuses);
//     console.log('Job status cron initialized (test mode)');
// };