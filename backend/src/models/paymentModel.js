import prisma from '../config/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';


export const getAllPayments = async (filters, page, limit) => {
    try {
        const where = {};
        const conditions = [];

        if (filters.status) {
            conditions.push({ payment_status: filters.status });
        }

        if (filters.method) {
            conditions.push({ payment_method: filters.method });
        }

        if (filters.dateFrom) {
            conditions.push({
                created_at: {
                    gte: new Date(filters.dateFrom)
                }
            });
        }

        if (filters.dateTo) {
            conditions.push({
                created_at: {
                    lte: new Date(filters.dateTo)
                }
            });
        }

        if (conditions.length > 0) {
            where.AND = conditions;
        }

        const [payments, total] = await Promise.all([
            prisma.paymentHistory.findMany({
                where,
                include: {
                    job_participation: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true
                                }
                            },
                            jobPosition: {
                                include: {
                                    job: {
                                        select: {
                                            id: true,
                                            title: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    paid_by: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.paymentHistory.count({ where })
        ]);

        return {
            data: {
                payments,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };

    } catch (error) {
        console.error('Error in getAllPayments:', error);
        throw new Error('ไม่สามารถดึงข้อมูลการจ่ายเงินได้: ' + error.message);
    }
};


export const getPaymentById = async (id) => {
    if (!id) {
        throw new Error('ID is required');
    }

    try {
        const payment = await prisma.paymentHistory.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                jobParticipation: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email: true,
                                phone_number: true
                            }
                        },
                        jobPosition: {
                            include: {
                                job: true
                            }
                        }
                    }
                }
            }
        });

        if (!payment) {
            throw new Error('ไม่พบรายการจ่ายเงินที่ต้องการ');
        }

        return payment;
    } catch (error) {
        console.error('Error in getPaymentById:', error);
        throw error;
    }
};


export const createPayment = async (paymentData, adminId) => {
    try {
        const {
            job_participation_id,
            amount,
            payment_method,
            payment_note,
            payment_slip,
            payment_status,
        } = paymentData;

        return await prisma.paymentHistory.create({
            data: {
                job_participation_id: parseInt(job_participation_id),
                amount: new Decimal(amount),
                payment_status: payment_status || 'pending',  // ถ้าไม่มีค่ามาให้เป็น pending
                payment_method: payment_method || null,
                payment_note: payment_note || null,
                payment_slip: payment_slip || null,
                admin_id: adminId,
                paid_at: payment_status === 'paid' ? new Date() : null,  // ถ้าจ่ายแล้วให้เก็บเวลา
            },
            include: {
                job_participation: {
                    include: {
                        user: true,
                        jobPosition: {
                            include: {
                                job: true
                            }
                        }
                    }
                },
                paid_by: true
            }
        });
    } catch (error) {
        console.error('Error in createPayment:', error);
        throw error;
    }
};


export const createBulkPayments = async (job_id, participant_ids, payment_method, adminId) => {
    // ดึงข้อมูล wage จาก job_participation
    const participations = await prisma.jobParticipation.findMany({
        where: {
            id: { in: participant_ids.map(id => parseInt(id)) }
        },
        include: {
            jobPosition: true
        }
    })

    if (participations.length !== participant_ids.length) {
        throw new Error('ไม่พบข้อมูลผู้เข้าร่วมงานบางรายการ')
    }

    // สร้างรายการจ่ายเงิน
    const payments = await prisma.$transaction(
        participations.map(p =>
            prisma.paymentHistory.create({
                data: {
                    job_participation_id: p.id,
                    amount: p.jobPosition.wage,
                    payment_status: 'paid',
                    payment_method: payment_method || 'cash',
                    paid_at: new Date(),
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
            })
        )
    )

    return payments
}


export const updatePayment = async (id, paymentData, adminId, ip, userAgent) => {
    try {
        const payment = await prisma.paymentHistory.update({
            where: { id: parseInt(id) },
            data: {
                payment_status: paymentData.payment_status,
                payment_method: paymentData.payment_method,
                payment_note: paymentData.payment_note,
                payment_slip: paymentData.payment_slip || undefined,
                admin_id: adminId,
                paid_at: paymentData.payment_status === 'paid' ? new Date() : null,
                updated_at: new Date()
            },
            include: {
                job_participation: {
                    include: {
                        user: true,
                        jobPosition: {
                            include: {
                                job: true
                            }
                        }
                    }
                },
                paid_by: true
            }
        });

        return payment;
    } catch (error) {
        console.error('Error in updatePayment:', error);
        throw new Error('ไม่สามารถอัพเดทรายการจ่ายเงินได้');
    }
};


export const getUnpaidParticipantsByJob = async (jobId) => {
    try {
        const participants = await prisma.jobParticipation.findMany({
            where: {
                jobPosition: {
                    job_id: jobId
                },
                status: 'completed',
                // ตรวจสอบว่ายังไม่มีการจ่ายเงิน
                PaymentHistory: {
                    none: {}  // ยังไม่มีประวัติการจ่ายเงิน
                },

            },
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true,
                    }
                },
                jobPosition: {
                    select: {
                        id: true,
                        position_name: true,
                        wage: true,
                        job: {
                            select: {
                                id: true,
                                title: true,
                                details: true
                            }
                        }
                    }
                },
                workHistories: true,
                PaymentHistory: true
            }
        });

        const participantsWithAmount = participants.map(participant => {
            const workDays = participant.workHistories.length;
            const amountPerDay = participant.jobPosition.wage;
            const totalAmount = workDays * amountPerDay;

            return {
                id: participant.id,
                job_participation_id: participant.id,
                user: participant.user,
                job: {
                    ...participant.jobPosition.job,
                    position_name: participant.jobPosition.position_name,
                    wage: participant.jobPosition.wage
                },
                work_days: workDays,
                amount: totalAmount,
                payment_status: 'pending',
                payment_method: null,
                payment_slip: null,
                payment_note: null,
                paid_at: null,
                admin_id: null,
                email_sent: false,
                email_sent_at: null,
                evaluation: participant.workHistories[0]
            };
        });

        return participantsWithAmount;

    } catch (error) {
        console.error('Error in getUnpaidParticipantsByJob:', error);
        throw new Error('ไม่สามารถดึงข้อมูลผู้เข้าร่วมงานที่รอรับเงินได้');
    }
};


// ดึงงานที่ admin สร้างและเสร็จแล้วใช้ในการเงิน
export const getCompletedJobs = async (adminId) => {
    try {
        return await prisma.job.findMany({
            where: {
                created_by: adminId,
                status: 'completed'
            },
            include: {
                JobPositions: {
                    select: {
                        id: true,
                        position_name: true,
                        wage: true,
                        required_people: true,
                        details: true,
                        status: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    } catch (error) {
        console.error('Error in getCompletedJobs:', error);
        throw new Error('ไม่สามารถดึงข้อมูลงานที่เสร็จสิ้นแล้วได้');
    }
};


export const updateEmailStatus = async (id, adminId, ip, userAgent) => {
    try {
        return await prisma.paymentHistory.update({
            where: { id: parseInt(id) },
            data: {
                email_sent: true,
                email_sent_at: new Date(),
            }
        });
    } catch (error) {
        console.error('Error in updateEmailStatus:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะการส่งอีเมลได้');
    }
};