import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// สร้างรายการจ่ายเงินใหม่
export const createPayment = async (data, adminId, ipAddress, userAgent) => {
    try {
        const payment = await prisma.paymentHistory.create({
            data: {
                job_participation_id: data.job_participation_id,
                amount: data.amount,
                payment_status: data.status,
                payment_method: data.method,
                payment_slip: data.slip,
                payment_note: data.note,
                paid_at: data.status === 'paid' ? new Date() : null,
                admin_id: adminId
            },
            include: {
                job_participation: {
                    include: {
                        user: true,
                        jobPosition: true
                    }
                }
            }
        });

        // บันทึก log
        await prisma.paymentLog.create({
            data: {
                payment_id: payment.id,
                admin_id: adminId,
                action: 'created',
                action_detail: {
                    status: data.status,
                    method: data.method,
                    amount: data.amount,
                    note: data.note
                },
                ip_address: ipAddress,
                user_agent: userAgent
            }
        });

        return payment;
    } catch (error) {
        throw new Error(`ไม่สามารถสร้างรายการจ่ายเงินได้: ${error.message}`);
    }
};

// อัปเดตสถานะการจ่ายเงิน
export const updatePayment = async (id, data, adminId, ipAddress, userAgent) => {
    try {
        const oldPayment = await prisma.paymentHistory.findUnique({
            where: { id: parseInt(id) }
        });

        const payment = await prisma.paymentHistory.update({
            where: { id: parseInt(id) },
            data: {
                payment_status: data.status,
                payment_method: data.method,
                payment_slip: data.slip || oldPayment.payment_slip,
                payment_note: data.note,
                paid_at: data.status === 'paid' ? new Date() : null,
                updated_at: new Date()
            },
            include: {
                job_participation: {
                    include: {
                        user: true,
                        jobPosition: true
                    }
                }
            }
        });

        // บันทึก log การเปลี่ยนแปลง
        await prisma.paymentLog.create({
            data: {
                payment_id: payment.id,
                admin_id: adminId,
                action: 'updated',
                action_detail: {
                    changes: {
                        status: {
                            from: oldPayment.payment_status,
                            to: data.status
                        },
                        method: {
                            from: oldPayment.payment_method,
                            to: data.method
                        },
                        note: {
                            from: oldPayment.payment_note,
                            to: data.note
                        }
                    }
                },
                ip_address: ipAddress,
                user_agent: userAgent
            }
        });

        return payment;
    } catch (error) {
        throw new Error(`ไม่สามารถอัปเดตรายการจ่ายเงินได้: ${error.message}`);
    }
};

// บันทึกการส่งอีเมล
export const updateEmailStatus = async (id, adminId, ipAddress, userAgent) => {
    try {
        const payment = await prisma.paymentHistory.update({
            where: { id: parseInt(id) },
            data: {
                email_sent: true,
                email_sent_at: new Date()
            }
        });

        await prisma.paymentLog.create({
            data: {
                payment_id: payment.id,
                admin_id: adminId,
                action: 'email_sent',
                action_detail: {
                    sent_at: new Date(),
                    recipient: payment.job_participation.user.email
                },
                ip_address: ipAddress,
                user_agent: userAgent
            }
        });

        return payment;
    } catch (error) {
        throw new Error(`ไม่สามารถอัปเดตสถานะการส่งอีเมลได้: ${error.message}`);
    }
};