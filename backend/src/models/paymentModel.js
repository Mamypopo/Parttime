import prisma from '../config/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';


// สร้าง Payment Record อัตโนมัติหลังประเมิน
export const createPaymentRecord = async (data) => {
    return await prisma.paymentHistory.create({
        data: {
            job_participation_id: data.job_participation_id, // ID ของการเข้าร่วมงาน
            amount: new Decimal(data.amount), // จำนวนเงิน (ใช้ Decimal เพื่อความแม่นยำ)
            payment_status: 'pending', // สถานะเริ่มต้นเป็น pending
            created_at: new Date(), // วันที่สร้าง
        },
        include: {
            job_participation: {
                include: {
                    user: true, // ดึงข้อมูลผู้ใช้
                    jobPosition: {
                        include: {
                            job: true, // ดึงข้อมูลงาน
                        },
                    },
                },
            },
        },
    });
};


// ดึงข้อมูลการจ่ายเงินตาม ID
export const getPaymentById = async (id) => {
    return await prisma.paymentHistory.findFirst({
        where: { id: parseInt(id) },
        include: {
            job_participation: {
                include: {
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                        },
                    },
                    jobPosition: {
                        include: {
                            job: true,
                        },
                    },
                },
            },
            payment_logs: true,
        },
    });
};

// อัปเดตสถานะการจ่ายเงิน
export const updatePaymentStatus = async (id, updateData, adminId) => {
    return await prisma.paymentHistory.update({
        where: { id: parseInt(id) },
        data: {
            ...updateData,
            admin_id: adminId, // ผู้ดูแลระบบที่อัปเดต
            paid_at: updateData.payment_status === 'paid' ? new Date() : null, // เวลาที่จ่ายเงิน
            updated_at: new Date(), // เวลาที่อัปเดตล่าสุด
        },
        include: {
            job_participation: {
                include: {
                    user: true,
                    jobPosition: {
                        include: {
                            job: true,
                        },
                    },
                },
            },
        },
    });
};


// ดึงรายการที่รอจ่ายเงินตามงาน
export const getParticipantsByJob = async (jobId, status, page = 1, limit = 10) => {
    const offset = (page - 1) * limit; // คำนวณตำแหน่งเริ่มต้น

    const unpaidParticipants = await prisma.paymentHistory.findMany({
        where: {
            payment_status: status,
            job_participation: {
                jobPosition: {
                    job_id: parseInt(jobId),
                },
                status: 'completed',
                workHistories: {
                    some: {}, // มี WorkHistory (มีการประเมิน)
                },
            },
        },
        include: {
            job_participation: {
                include: {
                    user: true,
                    jobPosition: {
                        include: {
                            job: {
                                select: {
                                    id: true,
                                    title: true,

                                }
                            }
                        },
                    },
                    workHistories: true,
                },
            },
        },
        orderBy: { created_at: 'asc' },
        skip: offset, // เริ่มต้นจาก offset
        take: limit, // ดึงจำนวนรายการเท่ากับ limit
    });

    // ดึงจำนวนรายการทั้งหมดเพื่อคำนวณหน้าทั้งหมด
    const totalRecords = await prisma.paymentHistory.count({
        where: {
            payment_status: 'pending',
            job_participation: {
                jobPosition: {
                    job_id: parseInt(jobId),
                },
                status: 'completed',
                workHistories: {
                    some: {}, // มี WorkHistory
                },
            },
        },
    });

    return {
        data: unpaidParticipants,
        totalRecords,
    };
};


// ดึงงานที่เสร็จสิ้นและมีการประเมินแล้ว
export const getJobsWithEvaluation = async () => {
    return await prisma.job.findMany({
        where: {
            status: 'completed',  // งานเสร็จแล้ว
            JobParticipation: {
                some: {
                    workHistories: {
                        some: {}  // มีการประเมินแล้ว
                    }
                }
            }
        },
        select: {
            id: true,
            title: true,
            location: true,
            work_date: true,
            start_time: true,
            end_time: true,
            created_by: true,
            _count: {
                select: {
                    JobParticipation: true  // นับจำนวนคนที่เข้าร่วม
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};

// ดึงประวัติการจ่ายเงินของงาน
export const getPaymentHistory = async (jobId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const paymentHistories = await prisma.paymentHistory.findMany({
        where: {
            payment_status: 'paid',
            job_participation: {
                jobPosition: {
                    job_id: parseInt(jobId),
                },
            },
        },
        include: {
            job_participation: {
                include: {
                    user: true,
                    jobPosition: {
                        include: {
                            job: true,
                        },
                    },
                },
            },
            paid_by: true, // ข้อมูลแอดมินที่จ่ายเงิน
        },
        skip: offset,
        take: limit,
        orderBy: { paid_at: 'desc' },
    });

    const totalRecords = await prisma.paymentHistory.count({
        where: {
            payment_status: 'paid',
            job_participation: {
                jobPosition: {
                    job_id: parseInt(jobId),
                },
            },
        },
    });

    return { data: paymentHistories, totalRecords };
};

// ดึงประวัติการจ่ายเงินของคน
export const getPaymentHistoryByParticipantModel = async (participationId) => {
    try {
        const paymentHistories = await prisma.paymentHistory.findMany({
            where: {
                job_participation_id: parseInt(participationId),
            },
            include: {
                job_participation: {
                    include: {
                        user: true,
                        jobPosition: true,
                    },
                },
                paid_by: true,
            },
            orderBy: { paid_at: 'desc' },
        });

        return paymentHistories;
    } catch (error) {
        console.error('Error fetching payment history by participant in model:', error);
        throw error; // ส่ง error กลับไปที่ Controller
    }
};

export const getJobWithPaymentDetails = async (jobId) => {
    return await prisma.job.findUnique({
        where: { id: parseInt(jobId) },
        include: {
            JobPositions: {
                include: {
                    JobParticipation: {
                        include: {
                            user: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                    phone_number: true,
                                    email: true
                                }
                            },
                            PaymentHistory: {
                                orderBy: {
                                    created_at: 'desc'
                                },
                                take: 1
                            }
                        }
                    }
                }
            }
        }
    });
};
export const calculatePaymentSummary = (job) => {
    const summary = {
        jobInfo: {
            id: job.id,
            title: job.title,
            work_date: job.work_date,
            location: job.location
        },
        participants: [],
        summary: {
            totalParticipants: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            paidCount: 0,
            pendingCount: 0
        }
    };
    // รวบรวมข้อมูลผู้เข้าร่วมและการจ่ายเงิน
    job.JobPositions.forEach(position => {
        position.JobParticipation.forEach(participation => {
            const payment = participation.PaymentHistory[0];
            const amount = position.wage || 0;

            const paymentStatus = payment?.payment_status || 'pending';
            summary.participants.push({
                participationId: participation.id,
                userId: participation.user_id,
                firstName: participation.user.first_name,
                lastName: participation.user.last_name,
                phone_number: participation.user.phone_number,
                email: participation.user.email,
                position: position.position_name,
                positionId: position.id,
                amount: amount,
                status: paymentStatus,
                paidAt: payment?.paid_at || null,
                paymentMethod: payment?.payment_method || null,
                payment_note: payment?.payment_note || null
            });
            // คำนวณสรุปตามสถานะใหม่
            summary.summary.totalParticipants++;
            summary.summary.totalAmount += amount;

            if (paymentStatus === 'paid') {
                summary.summary.paidAmount += amount;
                summary.summary.paidCount++;
            } else {
                summary.summary.pendingAmount += amount;
                summary.summary.pendingCount++;
            }
        });
    });
    return summary;
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