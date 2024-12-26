import * as paymentModel from '../models/paymentModel.js';
import * as logModel from '../models/logModel.js'
import * as jobModel from '../models/jobModel.js'
import * as notificationModel from '../models/notificationModel.js'
import ExcelJS from 'exceljs';
import { NOTIFICATION_TYPES } from '../models/notificationModel.js';
import { sendPaymentNotificationEmail } from '../utils/email.js';


export const updatePaymentStatus = async (req, res) => {
    const { id } = req.params; // ดึง ID ของการจ่ายเงินจากพารามิเตอร์
    const { payment_method, payment_slip, payment_note, checklist_items } = req.body; // ดึงข้อมูลที่ต้องการอัพเดทจาก body
    const adminId = req.user?.id; // ดึงข้อมูลผู้ดูแลระบบจาก JWT


    try {
        // ตรวจสอบสิทธิ์ของผู้ดูแลระบบ
        if (!adminId) {
            return res.status(403).json({ message: 'ไม่มีสิทธิ์ดำเนินการ' });
        }

        // ตรวจสอบว่ามีข้อมูลการจ่ายเงินอยู่ในระบบหรือไม่
        const payment = await paymentModel.getPaymentById(id);
        if (!payment) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการจ่ายเงิน' });
        }

        // เตรียมข้อมูลสำหรับการอัพเดท
        const updateData = {
            payment_status: 'paid',
            payment_method,
            payment_note,
            paid_at: new Date(),
            admin_id: adminId,
            checklist_completed: true,
            checklist_items: {
                payment_method: true,
                slip_uploaded: req.file ? true : false,
                amount_verified: true,
                notes: payment_note || ''
            }
        };
        // ถ้ามีไฟล์สลิป
        if (req.file) {
            updateData.payment_slip = req.file.filename;
        }
        // อัพเดทสถานะการจ่ายเงินในฐานข้อมูล
        const updatedPayment = await paymentModel.updatePaymentStatus(id, updateData, adminId);

        // ส่งผลลัพธ์กลับก่อน
        res.status(200).json({
            message: 'อัพเดทสถานะการจ่ายเงินเรียบร้อย',
            data: updatedPayment
        });
        // ทำงานที่ใช้เวลานานแบบ async
        Promise.all([
            // ส่งอีเมล
            sendPaymentNotificationEmail(updatedPayment)
                .then(() => paymentModel.updateEmailStatus(id, adminId, req.ip, req.headers['user-agent']))
                .catch(error => console.error('Email error:', error)),
            // สร้าง Log
            logModel.createPaymentLog({
                payment_id: parseInt(id),
                admin_id: adminId,
                action: 'payment_completed',
                action_detail: updateData,
                checklist_status: updateData.checklist_items,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }).catch(error => console.error('Log error:', error)),
            // สร้างการแจ้งเตือน
            notificationModel.createUserNotification(
                updatedPayment.job_participation.user.id,
                `การจ่ายเงินสำหรับงาน ${updatedPayment.job_participation.jobPosition.job.title} เสร็จสมบูรณ์`,
                NOTIFICATION_TYPES.PAYMENT_COMPLETED
            ).catch(error => console.error('Notification error:', error))
        ]).catch(error => console.error('Background tasks error:', error));
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
    }
};

// ดึงงานที่เสร็จและมีการประเมิน
export const getJobsWithEvaluation = async (req, res) => {
    try {
        const jobs = await paymentModel.getJobsWithEvaluation();
        return res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Error getting jobs with evaluation:', error);
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน'
        });
    }
};

// ดึงรายการที่รอจ่ายเงิน
export const getPendingPayments = async (req, res) => {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({ message: 'Invalid jobId parameter' });
    }

    if (!['pending', 'paid'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status parameter' });
    }
    try {
        // ดึงรายการรอจ่ายเงินพร้อมข้อมูล Pagination
        const { data, totalRecords } = await paymentModel.getParticipantsByJob(
            jobId,
            status,
            parseInt(page),
            parseInt(limit)
        );

        // ส่งข้อมูลกลับไปยังผู้เรียก API
        res.status(200).json({
            data,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงประวัติทั้งงาน
export const getPaymentHistory = async (req, res) => {
    const { jobId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({ message: 'Invalid jobId parameter' });
    }

    try {
        const { data, totalRecords } = await paymentModel.getPaymentHistory(
            jobId,
            parseInt(page),
            parseInt(limit)
        );

        res.status(200).json({
            data,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Error fetching payment history' });
    }
};

// ดึงประวัติเฉพาะคน
export const getPaymentHistoryByParticipant = async (req, res) => {
    const { participationId } = req.params;

    if (!participationId || isNaN(participationId)) {
        return res.status(400).json({ message: 'Invalid participationId parameter' });
    }

    try {
        const paymentHistories = await paymentModel.getPaymentHistoryByParticipantModel(participationId);
        res.status(200).json({ data: paymentHistories });
    } catch (error) {
        console.error('Error fetching payment history by participant:', error);
        res.status(500).json({ message: 'Error fetching payment history' });
    }
};



export const getJobPaymentSummary = async (req, res) => {
    try {
        const { jobId } = req.params;
        // ดึงข้อมูลงานและการจ่ายเงิน
        const job = await paymentModel.getJobWithPaymentDetails(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลงาน'
            });
        }
        // คำนวณสรุปข้อมูล
        const paymentSummary = paymentModel.calculatePaymentSummary(job);
        res.json({
            success: true,
            data: paymentSummary
        });
    } catch (error) {
        console.error('Error getting job payment summary:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: error.message
        });
    }
};




