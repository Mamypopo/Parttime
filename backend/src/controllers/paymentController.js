import * as paymentModel from '../models/paymentModel.js';
import { sendPaymentNotificationEmail } from '../utils/email.js';

export const createPayment = async (req, res) => {
    try {
        const adminId = req.user.id;
        const paymentData = {
            job_participation_id: parseInt(req.body.job_participation_id),
            amount: parseFloat(req.body.amount),
            status: req.body.status,
            method: req.body.method,
            note: req.body.note,
            slip: req.file?.path // ถ้ามีการอัพโหลดไฟล์
        };

        // สร้างรายการจ่ายเงิน
        const payment = await paymentModel.createPayment(
            paymentData,
            adminId,
            req.ip,
            req.headers['user-agent']
        );

        // ถ้าสถานะเป็น paid ให้ส่งอีเมลแจ้งเตือน
        if (payment.payment_status === 'paid') {
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
                // ไม่ return error เพราะการจ่ายเงินสำเร็จแล้ว แค่ส่งเมลไม่สำเร็จ
            }
        }

        res.status(201).json({
            message: 'สร้างรายการจ่ายเงินสำเร็จ',
            payment
        });
    } catch (error) {
        res.status(500).json({
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { id } = req.params;
        const paymentData = {
            status: req.body.status,
            method: req.body.method,
            note: req.body.note,
            slip: req.file?.path // ถ้ามีการอัพโหลดไฟล์ใหม่
        };

        const payment = await paymentModel.updatePayment(
            id,
            paymentData,
            adminId,
            req.ip,
            req.headers['user-agent']
        );

        // ถ้าอัพเดทสถานะเป็น paid และยังไม่เคยส่งอีเมล
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

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentModel.getPaymentById(id);

        if (!payment) {
            return res.status(404).json({
                message: 'ไม่พบรายการจ่ายเงิน'
            });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            method,
            dateFrom,
            dateTo
        } = req.query;

        const filters = {
            status,
            method,
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