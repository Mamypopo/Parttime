import * as jobModel from '../models/jobModel.js';
import { createLog } from '../models/logModel.js';
import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';
import * as notificationModel from '../models/notificationModel.js'
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

// ฟังก์ชันสร้างงานใหม่ (สำหรับแอดมิน)
export const createJob = async (req, res) => {
    const { title, work_date, location, start_time, end_time, details, positions } = req.body;
    const { id: adminId } = req.user;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    try {

        const admin = await adminModel.findAdminById(adminId)
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const job = await jobModel.createJob({
            title, work_date, location, start_time, end_time, details, positions
        }, adminId);

        await createLog(
            null,
            adminId,
            'CREATE',
            req.originalUrl,
            req.method,
            `Job ID: ${job.id} created by ${admin.first_name} ${admin.last_name} (${admin.email})`,
            ip,
            userAgent
        );
        res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        res.status(500).json({ message: "Error creating job", error: error.message });
    }
};


// ฟังก์ชันสำหรับดึงงานทั้งหมด
export const getAllJobs = [
    cacheMiddleware(300), // cache นาน 5 นาที
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 20;

            const jobs = await jobModel.getAllJobs(page, pageSize);

            if (!jobs || jobs.length === 0) {
                return res.status(404).json({ message: 'ไม่พบงานในระบบ' });
            }

            return res.status(200).json({ jobs, page, pageSize, totalJobs: jobs.length });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return res.status(500).json({ message: "Error fetching jobs", error: error.message || 'Unknown error' });
        }
    }
];

// ฟังก์ชันสำหรับดึงงานตาม ID
export const getJobById = async (req, res) => {
    try {
        const id = req.params.id; // สมมติว่า ID อยู่ใน params
        const job = await jobModel.getJobById(id);

        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงาน' }); // ส่ง 404 เมื่อไม่พบงาน
        }

        res.status(200).json(job); // ส่ง 200 พร้อมข้อมูลงานเมื่อพบ
    } catch (error) {
        console.error('Error fetching job by ID:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน', error: error.message });
    }
};

// ฟังก์ชันสำหรับอัปเดตงาน
export const updateJob = async (jobId, jobData) => {
    const { title, work_date, location, start_time, end_time, details, positions } = jobData;
    try {
        // อัปเดตข้อมูลงาน
        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                work_date: new Date(work_date),
                location,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                details
            }
        });

        // ลบตำแหน่งงานเก่าแล้วเพิ่มใหม่
        await prisma.jobPosition.deleteMany({
            where: { job_id: jobId }
        });

        const jobPositions = positions.map(position => ({
            position_name: position.name,
            wage: position.wage,
            details: position.details,
            required_people: position.required_people,
            job_id: job.id
        }));

        await prisma.jobPosition.createMany({
            data: jobPositions
        });

        // ดึงข้อมูลงานที่อัปเดตแล้วพร้อมตำแหน่งงาน
        const updatedJob = await prisma.job.findUnique({
            where: { id: jobId },
            include: { JobPositions: true }
        });

        return updatedJob;
    } catch (error) {
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตงาน: ' + error.message);
    }
};

// ฟังก์ชันสำหรับลบงาน
export const deleteJob = async (req, res) => {
    const { jobId } = req.params;
    const { id: adminId } = req.user;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';
    try {
        const jobIdInt = parseInt(jobId);
        if (isNaN(jobIdInt)) {
            return res.status(400).json({ message: 'Job ID ต้องเป็นตัวเลข' });
        }

        const job = await jobModel.getJobById(jobIdInt);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่ต้องการลบ' });
        }

        await jobModel.deleteJobById(jobIdInt);

        const admin = await adminModel.findAdminById(adminId);

        const { first_name, last_name, email } = admin;

        await createLog(
            null,
            adminId,
            'Delete Job',
            `/api/jobs/${jobIdInt}`,
            'DELETE',
            `Job ID: ${jobIdInt} titled "${job.title}" deleted by Admin ${first_name} ${last_name} (${email})`,
            ip,
            userAgent
        );


        res.status(200).json({ message: 'ลบงานสำเร็จ', job });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบงาน' });
    }
};



// ฟังก์ชันสมัครงานของ user
export const applyForJob = async (req, res) => {
    const { jobId, jobPositionId } = req.body;
    const userId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {

        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'ไม่พบ userId กรุณาเข้าสู่ระบบใหม่' });
        }

        const jobPosition = await jobModel.findJobPositionById(jobPositionId);
        if (!jobPosition) {
            return res.status(404).json({ message: 'ตำแหน่งงานไม่ถูกต้อง' });
        }

        if (jobPosition.required_people <= 0) {
            return res.status(400).json({ message: 'จำนวนผู้เข้าร่วมงานเต็มแล้ว' });
        }

        // ตรวจสอบว่าผู้ใช้สมัครตำแหน่งนี้ในงานนี้แล้วหรือไม่
        const existingApplication = await jobModel.findExistingJobParticipation(userId, jobId, jobPositionId);
        if (existingApplication) {
            return res.status(400).json({ message: 'คุณได้สมัครตำแหน่งนี้ในงานนี้แล้ว' });
        }

        // ตรวจสอบการสมัครงานในวันเดียวกัน
        const existingDayApplication = await jobModel.findExistingDayApplication(userId);
        if (existingDayApplication) {
            return res.status(400).json({ message: 'คุณสามารถสมัครงานได้เพียงหนึ่งงานต่อวันเท่านั้น' });
        }

        if (!user.email_verified || !user.approved) {
            return res.status(400).json({ message: 'กรุณายืนยันอีเมลและรอการอนุมัติจากแอดมิน' });
        }

        // สร้างการสมัครงานใหม่ในตำแหน่งที่เลือก
        const jobParticipation = await jobModel.createJobParticipation(userId, jobId, jobPositionId);
        // ดึงข้อมูลงานเพื่อดูว่าใครเป็นคนสร้างงาน
        const job = await jobModel.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบงานที่ระบุ' });
        }


        await notifyJobOwner(jobPositionId, userId);

        await createLog(userId, null, 'Apply Job', '/api/jobs/apply', 'POST', `User ${user.first_name} ${user.last_name}  (${user.email}) สมัครงาน ID: ${jobId}`, ip, userAgent);
        res.status(200).json({ message: 'สมัครงานสำเร็จ กรุณารอการอนุมัติจากแอดมินผู้สร้างงาน', jobParticipation });
    } catch (error) {
        console.error('Error in applyForJob:', error); // เพิ่ม log นี้
        await createLog(userId, null, 'Apply Job', '/api/jobs/apply', 'POST', `Error applying for job: ${error.message}`, ip, userAgent, 'ERROR');
        res.status(500).json({ message: `เกิดข้อผิดพลด: ${error.message}` });
    }
};


export const approveJobParticipation = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        // ตรวจสอบค่าที่จำเป็น
        if (!id || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });
        }

        const jobParticipationIdInt = parseInt(id, 10);

        // ดึงข้อมูลการสมัครงาน
        const jobParticipation = await jobModel.findJobParticipationById(jobParticipationIdInt);

        // ตรวจสอบว่าพบการสมัครงานหรือไม่
        if (!jobParticipation) {
            return res.status(404).json({ message: 'ไม่พบการสมัครงานในระบบ' });
        }

        const job = await jobModel.getJobById(jobParticipation.jobId);
        if (!job || job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์อนุมัติการสมัครงานนี้' });
        }

        // ตรวจสอบว่าการสมัครงานนี้ได้รับการอนุมัติหรือปฏิเสธไปแล้วหรือไม่
        if (['approved', 'rejected'].includes(jobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการ ${jobParticipation.status} ไปแล้ว` });
        }

        // ค้นหาข้อมูลตำแหน่งงานที่สมัคร
        const { jobPosition, user } = jobParticipation;

        if (!jobPosition) {
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงานในระบบ' });
        }

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้สำหรับการสมัครงานนี้' });
        }

        // อัปเดตสถานะการสมัครงาน
        const updatedJobParticipation = await jobModel.updateJobParticipationStatus(jobParticipationIdInt, status);

        // ถ้าอนุมัติสำเร็จ ให้ลดจำนวนผู้เข้าร่วมงานที่เหลือลง
        if (status === 'approved') {
            const remainingSlots = jobPosition.required_people - 1;
            await jobModel.decreaseJobPositionSlots(jobPosition.id, remainingSlots);
        }
        // สร้างข้อความแจ้งเตือนตามสถานะ
        const notificationMessage = status === 'approved'
            ? `คุณได้รับการอนุมัติให้เข้าร่วมงาน ${job.title} ในตำแหน่ง ${jobPosition.position_name}`
            : `คำขอเข้าร่วมงาน ${job.title} ในตำแหน่ง ${jobPosition.position_name} ของคุณไม่ได้รับการอนุมัติ`;

        // สร้างการแจ้งเตือนสำหรับผู้ใช้
        await notificationModel.createUserNotification(user.id, notificationMessage, 'JOB_APPLICATION_STATUS');

        // บันทึก log การอนุมัติการเข้าร่วมงาน พร้อมชื่อและอีเมลของผู้ใช้
        await createLog(user.id, adminId, 'Approve Job Participation', '/api/jobs/approve', 'PUT',
            `Job participation ID: ${jobParticipationIdInt} approved for ${user.first_name} ${user.last_name} (${user.email}). Status: ${status}.`, ip, userAgent);

        // ส่ง response กลับไปเมื่ออนุมัติสำเร็จ
        return res.status(200).json({
            message: `อัปเดตสถานะการสมัครงานสำเร็จ: ${status}`,
            details: {
                jobParticipation: {
                    id: updatedJobParticipation.id,
                    status: updatedJobParticipation.status
                },
                jobPosition: {
                    position_name: jobPosition.position_name,
                    remaining_slots: remainingSlots
                },
                notification: {
                    message: notificationMessage,
                    userId: user.id
                }
            }
        });
    } catch (error) {
        // ตรวจสอบข้อผิดพลาดก่อนทำการอัปเดตสถานะ
        console.error('Error approving job participation:', error);
        return res.status(500).json({ message: `เกิดข้อผิดพลาดในการอนุมัติการสมัครงาน: ${error.message}` });
    }
};






// ฟังก์ชันอัปเดตสถานะการสมัครงานเมื่อเสร็จสิ้น
export const markJobAsCompleted = async (req, res) => {
    const { jobParticipationId, status } = req.body;
    const adminId = req.user && req.user.role === 'admin' ? req.user.id : null;

    if (!jobParticipationId || !['successful', 'needs improvement', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });
    }

    try {
        // ดึงข้อมูลการสมัครงานปัจจุบัน
        const currentJobParticipation = await jobModel.findJobParticipationById(jobParticipationId);
        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }


        const userId = currentJobParticipation.user_id; // ใช้ user_id แทน user.id

        // ตรวจสอบว่ามีการอัปเดตสถานะเป็น successful, needs improvement, หรือ failed ไปแล้วหรือไม่
        if (['successful', 'needs improvement', 'failed'].includes(currentJobParticipation.status)) {
            return res.status(400).json({ message: `การสมัครงานนี้ได้รับการอัปเดตสถานะเป็น ${currentJobParticipation.status} แล้ว` });
        }

        // อัปเดตสถานะการสมัครงานเป็น 'successful'
        const updatedJobParticipation = await jobModel.updateJobParticipationStatus(jobParticipationId, status);
        const { job, user } = updatedJobParticipation.jobPosition;
        const notificationMessages = {
            successful: `ยินดีด้วย! คุณได้ทำงาน ${job.title} เสร็จสมบูรณ์แล้ว`,
            'needs improvement': `งาน ${job.title} ของคุณต้องการการปรับปรุง`,
            failed: `ขออภัย งาน ${job.title} ของคุณไม่ผ่านการประเมิน`
        };

        const notificationMessage = notificationMessages[status] || `สถานะงาน ${job.title} ของคุณได้รับการอัปเดตเป็น ${status}`;
        // สร้างการแจ้งเตือนสำหรับผู้ใช้ และ บันทึก log
        await Promise.all([
            notificationModel.createUserNotification(user.id, notificationMessage, 'JOB_COMPLETION_STATUS'),
            createLog(
                user.id,
                adminId,
                'Update Job Status',
                '/api/jobs/update-status',
                'PUT',
                `Job ID: ${job.id} status updated to ${status} for user ${user.first_name} ${user.last_name} (${user.email})`,
                req.ip || 'Unknown IP',
                req.headers['user-agent'] || 'Unknown User Agent'
            )
        ]);
        res.status(200).json({
            message: `อัปเดตสถานะการสมัครงานสำเร็จ: ${status}`,
            jobParticipation: updatedJobParticipation
        });
    } catch (error) {
        console.error('Error in markJobAsCompleted:', error);
        res.status(500).json({ message: `เกิดข้อผิดพลาดในการอัปเดตสถานะงาน: ${error.message}` });
    }
};




// export const notifyJobOwner = async (jobPositionId, applicantId) => {
//     try {
//         const jobPosition = await jobModel.findJobPositionById(jobPositionId);

//         if (!jobPosition) {
//             throw new Error('ไม่พบตำแหน่งงานที่ระบุ');
//         }
//         const message = `มีผู้สมัครใหม่สำหรับตำแหน่ง: ${jobPosition.position_name} โดยผู้ใช้รหัส: ${applicantId}`;

//         await notificationModel.createAdminNotification(
//             applicantId,
//             message,
//             jobPosition.job.created_by,
//             jobPosition.job.id
//         );
//     } catch (error) {
//         console.error('เกิดข้อผิดพลาดในการแจ้งเตือนเจ้าของงาน:', error);
//         throw error;
//     }
// };
export const notifyJobOwner = async (jobPositionId, applicantId) => {
    try {
        const jobPosition = await jobModel.findJobPositionById(jobPositionId);

        if (!jobPosition) {
            throw new Error("ไม่พบตำแหน่งงานที่ระบุ");
        }

        const content = `มีผู้สมัครใหม่สำหรับตำแหน่ง: ${jobPosition.position_name} โดยผู้ใช้รหัส: ${applicantId}`;

        await notificationModel.createAdminNotification({
            userId: applicantId,
            content: content,
            jobId: jobPosition.jobId
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการแจ้งเตือนเจ้าของงาน:', error);
        throw error;
    }
};