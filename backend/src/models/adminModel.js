import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
// ฟังก์ชันสำหรับสร้างแอดมินใหม่
export const createAdmin = async (adminData) => {
    const { email, password, first_name, last_name } = adminData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.create({
        data: {
            email,
            password: hashedPassword,
            first_name,
            last_name,
        },
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
    approved: true // เพิ่ม field approved
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

export const countUsersPending = (searchParams = {}) => {
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

    return prisma.user.count({
        where: whereClause
    });
}

// ดึงผู้ใช้ที่อนุมัติแล้ว
export const findApprovedUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "approved"
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
            mode: 'insensitive'  // เพิ่ม mode insensitive
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


export const countUsersRejected = (searchParams = {}) => {
    const whereClause = {
        approved: "rejected"
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


// นับจำนวนผู้ใช้แต่ละสถานะ
export const countUsersByStatus = () =>
    prisma.user.groupBy({
        by: ['approved'],
        _count: true
    });



export const updateUserApprovalStatus = (userId, status) =>
    prisma.user.update({
        where: { id: userId },
        data: { approved: status },
    });



// สำหรับแอดมิน - ดึงข้อมูล pending skills ทั้งหมดพร้อมข้อมูลผู้ใช้
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
            created_at: true  // ต้องแน่ใจว่ามีการเลือก createdAt
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return recentRequest;
};


