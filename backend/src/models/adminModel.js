import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';


// ฟังก์ชันสำหรับสร้างแอดมินใหม่
export const createAdmin = async (adminData) => {
    const { email, password, first_name, last_name, phone, profile_pic } = adminData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.create({
        data: {
            email,
            password: hashedPassword,
            first_name,
            last_name,
            phone,
            profile_pic
        },
    });
};

// เพิ่มฟังก์ชันอัพเดทรูปโปรไฟล์
export const updateAdminProfilePic = async (adminId, profilePicUrl) => {
    return prisma.admin.update({
        where: { id: adminId },
        data: { profile_pic: profilePicUrl }
    });
};
export const verifyPassword = (password, hashedPassword) => bcrypt.compare(password, hashedPassword);


export const checkExistingAdmin = (email) =>
    prisma.admin.findUnique({ where: { email } });


export const findAdminById = async (adminId) => {
    return prisma.admin.findUnique({
        where: { id: adminId },
    });
};

export const getAdminById = async (id) => {
    if (!id) {
        throw new Error('Admin ID is required');
    }

    const adminId = parseInt(id);
    if (isNaN(adminId)) {
        throw new Error('Invalid admin ID format');
    }

    const admin = await prisma.admin.findUnique({
        where: {
            id: adminId
        }
    });

    // console.log('Found admin:', admin); 
    return admin;
};

export const findAllAdmins = () => prisma.admin.findMany();



export const findAdminByEmail = (email) =>
    prisma.admin.findUnique({ where: { email } });



// ฟังก์ชันพื้นฐานสำหรับดึงข้อมูลผู้ใช้
const baseUserSelect = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    email_verified: true,
    created_at: true,
    updated_at: true,
    skills: true,
    // ข้อมูลพื้นฐาน
    prefix: true,
    gender: true,
    birth_date: true,
    age: true,
    phone_number: true,
    national_id: true,
    line_id: true,
    profile_image: true,
    // เอกสาร
    education_certificate: true,
    user_documents: true,
    approved: true
};


// ดึงผู้ใช้ที่รอการอนุมัติ
export const findPendingUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "pending"
    }

    // เพิ่มเงื่อนไขการค้นหา
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.findMany({
        where: whereClause,
        select: baseUserSelect,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: 'desc' }
    });
}

export const countUsersPending = async (searchParams = {}) => {
    const whereClause = {
        approved: "pending"
    }

    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    const [totalCount, emailStats] = await Promise.all([
        prisma.user.count({
            where: whereClause
        }),
        prisma.user.groupBy({
            by: ['email_verified'],
            where: {
                approved: 'pending'
            },
            _count: true
        })
    ]);

    // แปลงผลลัพธ์จาก groupBy เป็นจำนวนตามสถานะการยืนยันอีเมล
    const verifiedCount = emailStats.find(stat => stat.email_verified)?._count || 0;
    const notVerifiedCount = emailStats.find(stat => !stat.email_verified)?._count || 0;

    return {
        total: totalCount,
        totalVerified: verifiedCount,
        totalNotVerified: notVerifiedCount
    };
}



// ดึงผู้ใช้ที่อนุมัติแล้ว
export const findApprovedUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "approved"
    }

    // เงื่อนไขการค้นหา
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }
    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    // ค้นหาชื่อ-นามสกุล
    if (searchParams.name) {
        // แยกคำค้นหาด้วย space
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            // ถ้ามีการเว้นวรรค จะค้นหาทั้งชื่อและนามสกุล
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            // ถ้ามีคำเดียว จะค้นหาในชื่อหรือนามสกุล
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.findMany({
        where: whereClause,
        select: baseUserSelect,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: 'desc' }
    });
}

export const countUsersApproved = (searchParams = {}) => {
    const whereClause = {
        approved: "approved"
    }
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.count({
        where: whereClause
    });
}

// ดึงผู้ใช้ที่ถูกปฏิเสธ
export const findRejectedUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "rejected"
    }

    // เพิ่มเงื่อนไขการค้นหา
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    // ค้นหาชื่อ-นามสกุล
    if (searchParams.name) {
        // แยกคำค้นหาด้วย space
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            // ถ้ามีการเว้นวรรค จะค้นหาทั้งชื่อและนามสกุล
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            // ถ้ามีคำเดียว จะค้นหาในชื่อหรือนามสกุล
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.findMany({
        where: whereClause,
        select: {
            ...baseUserSelect,
            JobParticipation: {
                include: {
                    workHistories: {
                        select: {
                            id: true,
                            is_passed_evaluation: true,
                            appearance_score: true,
                            quality_score: true,
                            quantity_score: true,
                            manner_score: true,
                            punctuality_score: true,
                            total_score: true,
                            comment: true,
                            created_at: true
                        }
                    },
                    jobPosition: {
                        include: {
                            job: true
                        }
                    }
                }
            }
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: 'desc' }
    });
}


export const countUsersRejected = async (searchParams = {}) => {
    const whereClause = {
        approved: "rejected"
    }

    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    const [totalCount, emailStats] = await Promise.all([
        prisma.user.count({
            where: whereClause
        }),
        prisma.user.groupBy({
            by: ['email_verified'],
            where: {
                approved: 'rejected'
            },
            _count: true
        })
    ]);

    // แปลงผลลัพธ์
    const verifiedCount = emailStats.find(stat => stat.email_verified)?._count || 0;
    const notVerifiedCount = emailStats.find(stat => !stat.email_verified)?._count || 0;

    return {
        total: totalCount,
        totalVerified: verifiedCount,
        totalNotVerified: notVerifiedCount
    };
}

// นับจำนวนผู้ใช้แต่ละสถานะ
export const countUsersByStatus = () =>
    prisma.user.groupBy({
        by: ['approved'],
        _count: true
    });


// อัพเดทอนุมัติการใช้งาน users
export const updateUserApprovalStatus = (userId, status) =>
    prisma.user.update({
        where: { id: userId },
        data: { approved: status },
    });



//  ดึงข้อมูล pending skills ทั้งหมดพร้อมข้อมูลผู้ใช้
export const getAllPendingSkillsForAdmin = async () => {
    return prisma.pendingSkill.findMany({
        where: {
            status: 'pending'
        },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};



// ดึงข้อมูล pending skill ตาม id
export const getPendingSkillById = async (id) => {

    return prisma.pendingSkill.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            user: true
        }
    });
};

// อัปเดตสถานะ pending skill
export const updatePendingSkillStatus = async (id, status) => {
    return prisma.pendingSkill.update({
        where: {
            id: parseInt(id)
        },
        data: { status },
        include: {
            user: true
        }
    });
};


// อัปเดต user skills
export const updateUserSkills = async (userId, skills) => {
    return prisma.user.update({
        where: {
            id: parseInt(userId)
        },
        data: { skills }
    });
};

// ตรวจว่าเคยอัพเดทกกิลหรือยังภายใน สัปดาห์
export const checkWeeklySkillRequest = async (userId) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentRequest = await prisma.pendingSkill.findFirst({
        where: {
            userId: userId,
            created_at: {
                gte: oneWeekAgo
            }
        },
        select: {
            id: true,
            skill: true,
            status: true,
            created_at: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return recentRequest;
};


export const getOnlineUsersCount = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return await prisma.user.count({
            where: {
                last_active: {
                    gte: fiveMinutesAgo
                }
            }
        });
    } catch (error) {
        console.error('Error counting online users:', error);
        throw new Error('ไม่สามารถนับจำนวนผู้ใช้ออนไลน์ได้');
    }
};


// ฟังก์ชันสำหรับ reject user จากการประเมินงาน
export const rejectUserFromWorkEvaluation = async (userId) => {
    try {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                approved: 'rejected',
                updated_at: new Date()
            }
        });
    } catch (error) {
        console.error('Error rejecting user:', error);
        throw error;
    }
};


