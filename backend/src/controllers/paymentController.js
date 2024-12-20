import * as paymentModel from '../models/paymentModel.js';
import { sendPaymentNotificationEmail } from '../utils/email.js';

export const createPayment = async (req, res) => {
    try {

        console.log('Received payment data:', req.body);
        const adminId = req.user.id;
        const paymentData = {
            job_participation_id: parseInt(req.body.job_participation_id),
            amount: parseFloat(req.body.amount),
            payment_status: 'paid',  // เปลี่ยนเป็น paid เลย
            payment_method: req.body.payment_method || 'cash', // default เป็น cash
            payment_note: req.body.payment_note || null,
            payment_slip: req.file?.path || null,
            paid_at: new Date(),  // เซ็ตวันที่จ่ายเงินเป็นวันที่สร้างรายการ
        };
        console.log('Processed payment data:', paymentData);
        // ตรวจสอบว่าถ้าเป็น transfer ต้องมีไฟล์สลิป
        if (paymentData.payment_method === 'transfer' && !req.file) {
            return res.status(400).json({
                message: 'กรุณาอัพโหลดสลิปการโอนเงิน'
            });
        }

        const payment = await paymentModel.createPayment(
            paymentData,
            adminId
        );


        // ส่งอีเมลและอัพเดทสถานะพร้อมข้อมูลเพิ่มเติม
        try {
            await sendPaymentNotificationEmail(payment);
            await paymentModel.updateEmailStatus(payment.id);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        res.status(201).json({
            message: 'สร้างรายการจ่ายเงินสำเร็จ',
            payment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'ไม่สามารถสร้างรายการจ่ายเงินได้' });
    }
};


export const createBulkPayments = async (req, res) => {
    try {
        console.log('Received data:', req.body)
        const { job_id, participant_ids, payment_method } = req.body
        const adminId = req.user.id

        // Validation
        if (!job_id || !participant_ids?.length) {
            return res.status(400).json({
                error: 'กรุณาระบุข้อมูลให้ครบถ้วน'
            })
        }

        // เรียกใช้ model
        const payments = await paymentModel.createBulkPayments(
            job_id,
            participant_ids,
            payment_method,
            adminId
        )

        res.status(201).json({
            message: `สร้างรายการจ่ายเงินสำเร็จ ${payments.length} รายการ`,
            payments
        })

    } catch (error) {
        console.error('Error creating bulk payments:', error)
        res.status(500).json({
            error: 'ไม่สามารถสร้างรายการจ่ายเงินได้',
            details: error.message
        })
    }
}

// ดึงรายชื่อคนที่รอรับเงินในงานนั้นๆ
export const getUnpaidParticipantsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const participants = await paymentModel.getUnpaidParticipantsByJob(parseInt(jobId));

        res.json(participants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePayment = async (req, res) => {
    try {

        const adminId = req.user.id;
        const { id } = req.params;
        const paymentData = {
            payment_status: req.body.status,   // เปลี่ยนชื่อฟิลด์
            payment_method: req.body.method,   // เปลี่ยนชื่อฟิลด์
            payment_note: req.body.note,       // เปลี่ยนชื่อฟิลด์
            payment_slip: req.file?.path       // เปลี่ยนชื่อฟิลด์
        };

        // ตรวจสอบว่าถ้าเปลี่ยนเป็น transfer ต้องมีไฟล์สลิป
        if (paymentData.payment_method === 'transfer' && !req.file && !req.body.existing_slip) {
            return res.status(400).json({
                message: 'กรุณาอัพโหลดสลิปการโอนเงิน'
            });
        }

        const payment = await paymentModel.updatePayment(
            id,
            paymentData,
            adminId,
            req.ip,
            req.headers['user-agent']
        );

        // อัพเดทการส่งอีเมล
        if (payment.payment_status === 'paid' && !payment.email_sent) {
            try {
                await sendPaymentNotificationEmail(payment);
                await paymentModel.updateEmailStatus(
                    payment.id,
                    adminId,
                    req.ip,
                    req.headers['user-agent']
                );
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
            }
        }

        res.json({
            message: 'อัพเดทรายการจ่ายเงินสำเร็จ',
            payment
        });
    } catch (error) {
        res.status(500).json({
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
    }
};


// ดึงงานที่ admin สร้างและเสร็จแล้ว
export const getCompletedJobs = async (req, res) => {
    try {
        const adminId = req.user.id;
        if (!adminId) {
            return res.status(400).json({
                error: 'ไม่พบข้อมูลผู้ดูแลระบบ'
            });
        }
        const jobs = await paymentModel.getCompletedJobs(adminId);
        res.json(jobs);
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            message: error.message
        });
    }
};


// ดึงข้อมูล payment ตาม ID
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'กรุณาระบุ ID ของรายการจ่ายเงิน'
            });
        }

        const payment = await paymentModel.getPaymentById(parseInt(id));

        if (!payment) {
            return res.status(404).json({
                error: 'ไม่พบรายการจ่ายเงินที่ต้องการ'
            });
        }

        res.json(payment);
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            message: error.message
        });
    }
};


export const getAllPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            payment_status,  // เปลี่ยนจาก status
            payment_method, // เปลี่ยนจาก method
            dateFrom,
            dateTo
        } = req.query;

        const filters = {
            payment_status,  // เปลี่ยนชื่อฟิลด์
            payment_method, // เปลี่ยนชื่อฟิลด์
            dateFrom,
            dateTo
        };

        const result = await paymentModel.getAllPayments(
            filters,
            parseInt(page),
            parseInt(limit)
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
    }
};


