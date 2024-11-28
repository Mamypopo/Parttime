import * as userJobModel from '../models/userJobModel.js';

// ดึงงานที่ user สมัครไว้
export const getMyJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const myJobs = await userJobModel.getMyJobs(userId);

        // จัดรูปแบบข้อมูลให้ใช้งานง่าย
        const formattedJobs = myJobs.map(participation => ({
            id: participation.jobPosition.job.id,
            participation_id: participation.id,
            title: participation.jobPosition.job.title,
            location: participation.jobPosition.job.location,
            work_date: participation.jobPosition.job.work_date,
            position: participation.jobPosition.position_name,
            wage: participation.jobPosition.wage,
            status: participation.status,
            job_status: participation.jobPosition.job.status,
            evaluation: participation.workHistories[0] || null,
            applied_at: participation.created_at
        }));

        res.json({
            success: true,
            jobs: formattedJobs
        });

    } catch (error) {
        console.error('Error in getMyJobs controller:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน'
        });
    }
};