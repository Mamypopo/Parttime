import * as jobParticipationModel from '../models/jobParticipationModel.js'
import * as jobModel from '../models/jobModel.js';
import * as notificationModel from '../models/notificationModel.js'
import * as notificationController from './notificationController.js'
import * as workHistoryModel from '../models/workHistoryModel.js'
import * as userModel from '../models/userModel.js'
import * as adminModel from '../models/adminModel.js'
import * as paymentModel from '../models/paymentModel.js'
import { NOTIFICATIONADMIN_TYPES } from '../models/notificationModel.js';
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

        // ตรวจสอบว่าเป็นผู้สร้างงานหรือแอดมินที่ได้รับมอบหมาย
        const job = await jobModel.getJobById(jobParticipation.jobId);
        if (!job) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน' });
        }

        // ตรวจสอบว่าเป็นผู้สร้างงานหรือแอดมินที่ได้รับมอบหมาย
        const isCreator = job.created_by === adminId;
        const isAssignedAdmin = job.JobAdmins?.some(admin => admin.admin_id === adminId);

        if (!isCreator && !isAssignedAdmin) {
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
            ? `คุณได้รับการอนุมัติให้เข้าร่วมงาน ${job.location} ในตำแหน่ง ${jobPosition.position_name}`
            : `คำขอเข้าร่วมงาน ${job.location} ในตำแหน่ง ${jobPosition.position_name} ของคุณไม่ได้รับการอนุมัติ`;

        // สร้างการแจ้งเตือนสำหรับผู้ใช้
        await notificationModel.createUserNotification(
            user.id,
            notificationMessage,
            notificationModel.NOTIFICATION_TYPES.JOB_APPLICATION_STATUS
        );

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
    const { comment, ratings, isPassedEvaluation } = req.body;
    const jobParticipationId = parseInt(req.params.jobParticipationId);
    const adminId = req.user?.role === 'admin' ? req.user.id : null;

    if (!adminId) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้' });
    }

    try {


        // ตรวจสอบว่ามี jobParticipation อยู่จริง
        const currentJobParticipation = await jobParticipationModel.findJobParticipationById(jobParticipationId);
        if (!currentJobParticipation) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการสมัครงาน' });
        }

        // ตรวจสอบว่ามี WorkHistory อยู่แล้วหรือไม่
        const existingWorkHistory = await workHistoryModel.findByJobParticipationId(jobParticipationId);
        if (existingWorkHistory) {
            return res.status(400).json({
                message: 'งานนี้ได้รับการประเมินแล้ว ไม่สามารถแก้ไขได้'
            });
        }

        // ดึงข้อมูล jobPosition และ job
        const jobPosition = await jobModel.findJobPositionById(currentJobParticipation.job_position_id);
        const positionName = jobPosition?.position_name || 'ไม่ระบุตำแหน่ง';
        const jobTitle = jobPosition?.job?.title || 'ไม่ระบุชื่องาน';
        const location = jobPosition?.job?.location || 'ไม่ระบุสถานที่';

        // เตรียมข้อมูลสำหรับสร้าง WorkHistory
        let workHistoryData = {
            jobParticipationId,
            comment: comment || null,
            is_passed_evaluation: isPassedEvaluation
        };

        // ถ้าผ่านการประเมิน ต้องมีคะแนน
        if (isPassedEvaluation) {
            if (!ratings) {
                return res.status(400).json({ message: 'กรุณาระบุคะแนนการประเมิน' });
            }

            // ตรวจสอบคะแนนแต่ละด้าน
            const requiredCategories = ['appearance', 'quality', 'quantity', 'manner', 'punctuality'];
            const isValidRatings = requiredCategories.every(category => {
                const score = ratings[category];
                return score === null || score === 0 || score === 1 || score === 2;
            });


            if (!isValidRatings) {
                return res.status(400).json({
                    message: 'กรุณาให้คะแนนทุกด้านด้วยคะแนน 1 หรือ 2 เท่านั้น'
                });
            }

            // คำนวณคะแนนรวมและเพิ่มข้อมูลคะแนน
            const totalScore = Object.values(ratings).reduce((sum, score) => sum + score, 0);
            workHistoryData = {
                ...workHistoryData,
                appearance_score: ratings.appearance,
                quality_score: ratings.quality,
                quantity_score: ratings.quantity,
                manner_score: ratings.manner,
                punctuality_score: ratings.punctuality,
                total_score: totalScore
            };
        }


        // สร้าง WorkHistory
        const workHistory = await workHistoryModel.createWorkHistory(workHistoryData);

        // อัพเดทสถานะ JobParticipation เป็น completed เสมอ
        await jobParticipationModel.updateJobParticipationStatus(jobParticipationId, 'completed');

        // สร้าง Payment Record ทันทีหลังจากสร้าง WorkHistory
        try {
            const paymentAmount = jobPosition.wage;

            const paymentRecord = await paymentModel.createPaymentRecord({
                job_participation_id: jobParticipationId,
                amount: paymentAmount,
                payment_status: 'pending',
                created_at: new Date()
            });
            // await jobModel.updateJobPaymentAmount(jobPosition.job.id, paymentAmount);
            await createLog(
                currentJobParticipation.user.id,
                adminId,
                'Payment Record Created',
                req.originalUrl,
                req.method,
                `Payment record created for job: ${jobTitle} (${positionName}). Amount: ${paymentAmount}. Evaluation: ${isPassedEvaluation ? 'Passed' : 'Failed'}`,
                req.ip,
                req.headers['user-agent']
            );
            await notificationModel.createAdminNotification({
                adminId: adminId,
                content: `มีรายการรอจ่ายเงินใหม่สำหรับ ${currentJobParticipation.user.first_name} ${currentJobParticipation.user.last_name} - ${jobTitle}`,
                type: NOTIFICATIONADMIN_TYPES.PAYMENT_PENDING,
                jobId: jobPosition.job.id,
                userId: currentJobParticipation.user.id
            });
        } catch (paymentError) {
            console.error('Error creating payment record:', paymentError);
        }

        // ถ้าไม่ผ่านการประเมิน ให้อัพเดทสถานะ user
        if (!isPassedEvaluation && currentJobParticipation.user) {
            try {
                await adminModel.rejectUserFromWorkEvaluation(currentJobParticipation.user.id);
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        }


        // สร้างการแจ้งเตือน
        const notificationMessage = !isPassedEvaluation
            ? `คุณไม่ผ่านการประเมินงาน "${location}" ตำแหน่ง "${positionName}" และไม่สามารถใช้งานระบบได้ชั่วคราว`
            : `งาน "${location}" ตำแหน่ง "${positionName}" ได้รับการประเมินแล้ว คุณได้ ${workHistoryData.total_score || 0}/10 คะแนน`;

        if (currentJobParticipation.user) {
            await notificationModel.createUserNotification(
                currentJobParticipation.user.id,
                notificationMessage,
                !isPassedEvaluation
                    ? notificationModel.NOTIFICATION_TYPES.WORK_EVALUATION_REJECTED
                    : notificationModel.NOTIFICATION_TYPES.WORK_EVALUATION
            );
        }


        if (currentJobParticipation?.user?.id) {
            await createLog(
                currentJobParticipation.user.id,
                adminId,
                !isPassedEvaluation ? 'Work Evaluation Rejected' : 'Work Evaluation Completed',
                req.originalUrl,
                req.method,
                `User ${currentJobParticipation.user.email || 'Unknown'} was ${isPassedEvaluation ? 'rejected' : 'evaluated'} for job: ${jobTitle} (${positionName})${!isPassedEvaluation ? `. Score: ${workHistoryData.total_score}/10` : ''}`, // details
                req.ip || 'Unknown IP',
                req.headers['user-agent'] || 'Unknown User Agent'
            );
        }


        res.status(200).json({
            message: !isPassedEvaluation ? 'บันทึกการไม่ผ่านงานเรียบร้อยแล้ว' : 'บันทึกการประเมินเรียบร้อยแล้ว',
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


// ฟังก์ชันยกเลิกคำขอสมัครงานโดยแอดมิน
export const adminCancelJobApplication = async (req, res) => {
    const { jobId, jobPositionId, userId } = req.body;
    const adminId = req.user.id; // รับ ID แอดมินจาก middleware
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    try {
        // ตรวจสอบคำขอสมัครงาน
        const application = await jobModel.findExistingJobParticipation(userId, jobId, jobPositionId);
        if (!application) {
            return res.status(404).json({ success: false, message: 'ไม่พบคำขอสมัครงานที่ระบุ' });
        }

        // อัปเดตสถานะเป็น 'cancelled'
        await jobModel.updateJobParticipationStatus(application.id, 'cancelled');

        // บันทึก Log
        await createLog(
            null, adminId, 'Admin Cancel Job Application',
            '/api/admin/jobs/cancel', 'POST',
            `Admin ID: ${adminId} cancelled job participation for User ID: ${userId}`,
            ip, userAgent
        );

        // ส่งการแจ้งเตือนไปยังผู้ใช้
        await notificationModel.createUserNotification(
            userId,
            `คำขอสมัครงานของคุณสำหรับงาน "${application.jobPosition.job.location}" ถูกยกเลิกโดยแอดมิน`,
            notificationModel.NOTIFICATION_TYPES.JOB_APPLICATION_CANCELLED
        );

        // ตอบกลับสำเร็จ
        res.status(200).json({ success: true, message: 'ยกเลิกคำขอสมัครงานสำเร็จ' });
    } catch (error) {
        console.error('Error cancelling job application:', error);

        // บันทึก Log ความผิดพลาด
        await createLog(
            adminId, null, 'Admin Cancel Job Application Failed',
            '/api/admin/jobs/cancel', 'POST',
            `Failed to cancel job participation. Admin ID: ${adminId}. Error: ${error.message}`,
            ip, userAgent
        );

        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
};




