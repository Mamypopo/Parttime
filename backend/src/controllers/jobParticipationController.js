import * as jobParticipationModel from '../models/jobParticipationModel.js'
import * as jobModel from '../models/jobModel.js';
import * as notificationModel from '../models/notificationModel.js'
import * as notificationController from './notificationController.js'
import * as workHistoryModel from '../models/workHistoryModel.js'
import * as userModel from '../models/userModel.js'
import * as adminModel from '../models/adminModel.js'
import { createLog } from '../models/logModel.js';

// ฟังชั่นอนุมัติเข้าทำงาน
export const approveJobParticipation = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        // ตรวจสอบค่าที่จำเป็น
        if (!id || !['approved', 'rejected'].includes(status)) {
            console.log(id)
            return res.status(400).json({ message: 'กรุณาระบุ Job participation ID และสถานะที่ถูกต้อง' });

        }
        const jobParticipationIdInt = parseInt(id, 10);

        // ดึงข้อมูลการสมัครงาน
        const jobParticipation = await jobParticipationModel.findJobParticipationById(jobParticipationIdInt);

        // ตรวจสอบว่าพบการสมัครงานหรือไม่
        if (!jobParticipation) {
            return res.status(404).json({ message: 'ไม่พบการสมัครงานในระบบ' });
        }

        const job = await jobModel.getJobById(jobParticipation.jobId);
        if (!job || job.created_by !== adminId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์อนุมัติการสมัครงานนี้' });
        }

        // // ตรวจสอบว่าการสมัครงานนี้ได้รับการอนุมัติหรือปฏิเสธไปแล้วหรือไม่
        // if (['approved', 'rejected'].includes(jobParticipation.status)) {
        //     return res.status(400).json({ message: `การสมัครงานนี้ได้รับการ ${jobParticipation.status} ไปแล้ว` });
        // }

        // ค้นหาข้อมูลตำแหน่งงานที่สมัคร
        const { jobPosition, user } = jobParticipation;

        if (!jobPosition) {
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงานในระบบ' });
        }

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้สำหรับการสมัครงานนี้' });
        }

        let remainingSlots;
        // อัปเดตสถานะการสมัครงาน
        const updatedJobParticipation = await jobParticipationModel.updateJobParticipationStatus(jobParticipationIdInt, status);

        // ถ้าอนุมัติสำเร็จ ให้ลดจำนวนผู้เข้าร่วมงานที่เหลือลง
        if (status === 'approved') {
            remainingSlots = jobPosition.required_people - 1;
            await jobModel.decreaseJobPositionSlots(jobPosition.id, remainingSlots);
        } else {
            // ถ้าไม่ได้อนุมัติ ให้ใช้จำนวนที่ต้องการเดิม
            remainingSlots = jobPosition.required_people;
        }

        // สร้างข้อความแจ้งเตือนตามสถานะ
        const notificationMessage = status === 'approved'
            ? `คุณได้รับการอนุมัติให้เข้าร่วมงาน ${job.title} ในตำแหน่ง ${jobPosition.position_name}`
            : `คำขอเข้าร่วมงาน ${job.title} ในตำแหน่ง ${jobPosition.position_name} ของคุณไม่ได้รับการอนุมัติ`;

        // สร้างการแจ้งเตือนสำหรับผู้ใช้
        await notificationModel.createUserNotification(user.id, notificationMessage, 'JOB_APPLICATION_STATUS');

        // บันทึก log การอนุมัติการเข้าร่วมงาน พร้อมชื่อและอีเมลของผู้ใช้
        await createLog(user.id, adminId, 'Approve Job Participation successfully', '/api/jobs/approve', 'PUT',
            `Job participation ID: ${jobParticipationIdInt} approved for User: { Name: ${user.first_name} ${user.last_name} Email: ${user.email} } Status: ${status}.`, ip, userAgent);

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

            }
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอนุมัติการเข้าร่วมงาน:', error);
        try {
            await createLog(
                req.user?.id || null,
                adminId,
                'Approve Job Participation Failed',
                '/api/jobs/approve',
                'PUT',
                `Failed to approve Job participation ID: ${id}. Status: ${status}. Error: ${error.message}`,
                ip,
                userAgent
            );
        } catch (logError) {
            console.error('ไม่สามารถสร้างบันทึกสำหรับการอนุมัติการเข้าร่วมงานที่ล้มเหลวได้:', logError);
        }
        return res.status(500).json({ message: `เกิดข้อผิดพลาดในการอนุมัติการสมัครงาน: ${error.message}` });
    }
};


// ฟังก์ชันให้คะแนนการทำงาน
export const updateWorkHistory = async (req, res) => {
    const { comment, ratings, isRejected } = req.body;
    const jobParticipationId = parseInt(req.params.jobParticipationId);
    const adminId = req.user?.role === 'admin' ? req.user.id : null;

    if (!adminId) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้' });
    }
    // Validation
    if (!jobParticipationId || !ratings || !adminId) {
        return res.status(400).json({
            message: 'กรุณาระบุข้อมูลให้ครบถ้วน',
            details: {
                jobParticipationId: !jobParticipationId ? 'ไม่พบรหัสการสมัครงาน' : null,
                ratings: !ratings ? 'ไม่พบคะแนนการประเมิน' : null,
                adminId: !adminId ? 'ไม่พบข้อมูลผู้ประเมิน' : null
            }
        });
    }

    // ตรวจสอบคะแนนแต่ละด้าน
    const requiredCategories = ['appearance', 'quality', 'quantity', 'manner', 'punctuality'];
    const isValidRatings = requiredCategories.every(category => {
        const score = ratings[category];
        return score !== undefined && (score === 1 || score === 2);
    });
    if (!isValidRatings) {
        return res.status(400).json({ message: 'กรุณาให้คะแนนทุกด้านด้วยคะแนน 1 หรือ 2 เท่านั้น' });
    }
    try {
        // ตรวจสอบว่ามี WorkHistory อยู่แล้วหรือไม่
        const existingWorkHistory = await workHistoryModel.findByJobParticipationId(jobParticipationId);
        if (existingWorkHistory) {
            return res.status(400).json({
                message: 'งานนี้ได้รับการประเมินแล้ว ไม่สามารถแก้ไขได้'
            });
        }

        const currentJobParticipation = await jobParticipationModel.findJobParticipationById(jobParticipationId);
        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }

        // const job = await jobModel.getJobById(currentJobParticipation.jobId);
        // if (!job || job.created_by !== adminId) {
        //     return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการประเมินงานนี้' });
        // }

        // ดึงข้อมูล jobPosition
        const jobPosition = await jobModel.findJobPositionById(currentJobParticipation.job_position_id);
        const positionName = jobPosition?.position_name || 'ไม่ระบุตำแหน่ง';
        const jobTitle = jobPosition?.job?.title || 'ไม่ระบุชื่องาน';
        // คำนวณคะแนนรวม
        const totalScore = Object.values(ratings).reduce((sum, score) => sum + score, 0);



        // สร้าง WorkHistory
        const workHistory = await workHistoryModel.createWorkHistory({
            jobParticipationId,
            appearance_score: ratings.appearance,
            quality_score: ratings.quality,
            quantity_score: ratings.quantity,
            manner_score: ratings.manner,
            punctuality_score: ratings.punctuality,
            total_score: totalScore,
            comment: comment || null,
            is_rejected: isRejected || false
        });

        // สร้าง log สำหรับทุกการประเมิน ไม่ว่าจะ reject หรือไม่
        await createLog(
            currentJobParticipation.user.id,
            adminId,
            'Work Evaluation',
            req.originalUrl,
            req.method,
            `User ${currentJobParticipation.user.email} was evaluated for job: ${jobTitle} (${positionName}). Score: ${totalScore}/10 ${isRejected ? '(Rejected)' : ''}`,
            req.ip || 'Unknown IP',
            req.headers['user-agent'] || 'Unknown User Agent'
        );

        // ถ้า reject จะทำการ approve user เพิ่มเติม
        if (isRejected && currentJobParticipation.user) {
            try {
                await adminModel.approveUser(
                    currentJobParticipation.user.id,
                    'rejected',
                    {
                        reason: 'ไม่ผ่านการประเมินการทำงาน',
                        rejectedFrom: 'work_evaluation',
                        workHistoryId: workHistory.id
                    }
                );
            } catch (error) {
                console.error('Error in reject process:', error);
            }
        }

        // สร้างการแจ้งเตือน
        const notificationMessage = isRejected
            ? `คุณไม่ผ่านการประเมินงาน "${jobTitle}" ตำแหน่ง "${positionName}" และไม่สามารถสมัครงานได้อีก`
            : `งาน "${jobTitle}" ตำแหน่ง "${positionName}" ได้รับการประเมินแล้ว คุณได้ ${totalScore}/10 คะแนน`;

        try {
            if (currentJobParticipation.user) {
                await notificationModel.createUserNotification(
                    currentJobParticipation.user.id,
                    notificationMessage
                );
            }
        } catch (error) {
            console.error('Error creating notification:', error);
        }

        res.status(200).json({
            message: 'บันทึกการประเมินสำเร็จ',
            data: {
                ...workHistory,
                jobTitle,
                positionName
            }
        });


    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการประเมินงาน:', error);

        await createLog(
            req.user?.id || null,
            adminId,
            'Job Evaluation Failed',
            req.originalUrl,
            req.method,
            `Error evaluating job: ${error.message}`,
            req.ip || 'Unknown IP',
            req.headers['user-agent'] || 'Unknown User Agent'
        );


        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการบันทึกการประเมิน',
            error: error.message
        });
    }
};


// ฟังก์ชันดึงงานที่มีผู้ใช้งานสมัครเข้ามาเพื่อรออนุมัติ
export const getJobsWithParticipants = async (req, res) => {
    try {
        const adminId = req.user.id;

        const jobs = await jobParticipationModel.getJobsWithParticipants(adminId);


        return res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching jobs with participants:', error);
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: error.message
        });
    }
};